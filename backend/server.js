require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { connectDB } = require("./db");
const { router: authRouter } = require("./auth");
const studentRouter = require("./student");
const { router: facultyRouter, activeSessions, validateRotatingToken } = require("./faculty");
const adminRouter = require("./admin");

const app = express();
const PORT = process.env.PORT || 5000;

// ── Middleware ────────────────────────────────────────────────
app.use(cors({ origin: "*" }));
app.use(express.json());

// ── Root Route ──────────────────────────────
app.get("/", (req, res) => {
  res.json({ success: true, message: "Campus Connect API is ALIVE!" });
});

// ── SECURED QR Attendance Route ───────────────────────────────
// Security layers:
//   1. JWT required      — only logged-in students can mark
//   2. studentId from JWT — student cannot fake someone else's ID
//   3. Rotating token    — QR changes every 30s, screenshots useless
//   4. Session age check — session can't be >5 min old
//   5. Duplicate guard   — one mark per student per session
const jwt = require("jsonwebtoken");
const JWT_SECRET = process.env.JWT_SECRET || "campusconnect_secret_key_change_in_production";
const QR_SESSION_DURATION_MS = 5 * 60 * 1000;

app.post("/api/student/mark-attendance", async (req, res) => {
  try {
    // ── 1. Verify JWT ───────────────────────────────────────────
    const authHeader = req.headers["authorization"];
    const bearerToken = authHeader && authHeader.split(" ")[1];
    if (!bearerToken) {
      return res.status(401).json({ success: false, message: "Login required to mark attendance." });
    }
    let decoded;
    try {
      decoded = jwt.verify(bearerToken, JWT_SECRET);
    } catch {
      return res.status(401).json({ success: false, message: "Session expired. Please log in again." });
    }
    if (decoded.role !== "student") {
      return res.status(403).json({ success: false, message: "Only students can mark QR attendance." });
    }

    const studentId = decoded.uniqueId;

    console.log(`[${new Date().toISOString()}] Mark Attendance Attempt:`, {
      method: req.method,
      url: req.url,
      body: req.body,
      query: req.query,
      student: studentId
    });

    // ── 2. Inputs (Support both body and query for robustness) ─────
    const sessionId = req.body.sessionId || req.query.sessionId;
    const receivedToken = req.body.token || req.query.token;

    if (!sessionId || !receivedToken) {
      return res.status(400).json({ 
        success: false, 
        message: "Invalid QR code. Scan directly from faculty screen.",
        debug: { hasSessionId: !!sessionId, hasToken: !!receivedToken }
      });
    }

    // studentId already declared above by decoded.uniqueId
    const db = await connectDB();

    // ── 4. Session must be active (Persistent Check) ─────────────
    let session = activeSessions.get(sessionId);
    if (!session) {
      // Try to reload from DB if server restarted
      const stored = await db.collection("qr_attendance_sessions").findOne({ sessionId });
      if (!stored || stored.status !== "active") {
        return res.status(404).json({ success: false, message: "Session expired or invalid. Ask faculty to regenerate QR." });
      }
      
      // Found in DB - Restore to RAM for subsequent scans
      session = {
        ...stored,
        attendees: new Set(stored.attendeeIds || []),
        attendanceLog: stored.attendanceLog || []
      };
      activeSessions.set(sessionId, session);
    }

    // ── 5. Session age ≤ 5 min ─────────────────────────────────
    const sessionExpiresAt = session.expiresAt
      ? new Date(session.expiresAt).getTime()
      : new Date(session.createdAt).getTime() + QR_SESSION_DURATION_MS;

    if (Date.now() > sessionExpiresAt) {
      return res.status(410).json({ success: false, message: "Session expired. Ask faculty to start a new QR session." });
    }

    // ── 6. Rotating token validation (core anti-photo-proxy) ────
    // Using the same validation logic as faculty.js
    const isTokenValid = validateRotatingToken(sessionId, session.sessionSecret, receivedToken);
    if (!isTokenValid) {
      return res.status(403).json({ success: false, message: "QR code has expired. Please scan the latest QR shown on faculty's screen." });
    }

    // ── 7. Duplicate scan check ─────────────────────────────────
    if (session.attendees.has(studentId)) {
      return res.status(200).json({ success: true, message: "Attendance already marked." });
    }

    // ── 8. Permanent DB update (Real-time Progress) ─────────────
    try {
      const db = await connectDB();
      const subjectCode = session.subjectCode;

      // Update student's specific subject attendance
      await db.collection("attendance").updateOne(
        { studentId: studentId, subjectCode: subjectCode },
        { 
          $inc: { totalAttended: 1 },
          $set: { lastMarkedAt: new Date(), lastSessionId: sessionId }
        },
        { upsert: true }
      );

      // Add to session log
      session.attendees.add(studentId);
      session.attendanceLog = [
        { studentId, markedAt: new Date().toISOString() },
        ...(session.attendanceLog || []),
      ];

      await db.collection("qr_attendance_sessions").updateOne(
        { sessionId },
        {
          $set: {
            attendeeIds: Array.from(session.attendees),
            attendanceLog: session.attendanceLog,
            status: "active",
            updatedAt: new Date(),
          },
        }
      );

      console.log(`✅ Permanently marked attendance for student ${studentId} in ${subjectCode}`);
    } catch (dbErr) {
      console.error("Database update error during marking:", dbErr);
    }

    return res.status(200).json({ 
      success: true, 
      message: "Attendance marked successfully! ✅",
      studentId,
      presentCount: session.attendees.size 
    });
  } catch (error) {
    console.error("QR mark-attendance error:", error);
    return res.status(500).json({ success: false, message: "Unable to mark attendance. Try again." });
  }
});

// ── Routes ────────────────────────────────────────────────────
app.use("/api/auth", authRouter);
app.use("/api/student", studentRouter);
app.use("/api/faculty", facultyRouter);
app.use("/api/admin", adminRouter);

// Health check
app.get("/api/health", (req, res) => {
  res.json({ success: true, message: "Campus Connect API is running." });
});

// 404
app.use((req, res) => {
  res.status(404).json({ success: false, message: "Route not found." });
});

const os = require("os");
const getLocalIP = () => {
  const interfaces = os.networkInterfaces();
  const candidates = [];

  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      if (iface.family === "IPv4" && !iface.internal) {
        const lowerName = name.toLowerCase();
        // Ignore VirtualBox, VMware, and other virtual interfaces
        if (lowerName.includes("virtualbox") || lowerName.includes("vbox") || lowerName.includes("vmware") || lowerName.includes("virtual")) {
          continue;
        }
        
        // Prioritize Wi-Fi and Wireless
        if (lowerName.includes("wi-fi") || lowerName.includes("wireless") || lowerName.includes("wlan")) {
          return iface.address;
        }
        
        candidates.push({ name, address: iface.address });
      }
    }
  }
  
  // Secondary priority: Ethernet
  const ethernet = candidates.find(c => c.name.toLowerCase().includes("eth") || c.name.toLowerCase().includes("ethernet"));
  if (ethernet) return ethernet.address;

  // Fallback to first candidate or localhost
  return candidates.length > 0 ? candidates[0].address : "localhost";
};

// ── Start ─────────────────────────────────────────────────────
connectDB().then(() => {
  const LOCAL_IP = getLocalIP();
  
  app.listen(PORT, "0.0.0.0", () => {
    console.log("\n" + "=".repeat(50));
    console.log(`🚀 BACKEND: http://${LOCAL_IP}:${PORT}`);
    console.log(`📱 FRONTEND: http://${LOCAL_IP}:3000`);
    console.log("=".repeat(50) + "\n");
    console.log(`✅ MongoDB connected → campus_connect`);
  });
}).catch((err) => {
  console.error("MongoDB connection failed:", err);
  process.exit(1);
});
