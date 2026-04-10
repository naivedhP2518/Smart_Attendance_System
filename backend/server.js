require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { connectDB } = require("./db");
const { router: authRouter } = require("./auth");
const studentRouter = require("./student");
const { router: facultyRouter, activeSessions } = require("./faculty");
const adminRouter = require("./admin");

const app = express();
const PORT = process.env.PORT || 5000;

// ── Middleware ────────────────────────────────────────────────
app.use(cors({ origin: process.env.CLIENT_URL || "http://localhost:3000" }));
app.use(express.json());

// ── Unsecured functional route for QR ───────────────────────────
app.post("/api/student/mark-attendance", (req, res) => {
  const { studentId, sessionId } = req.body;
  if (!studentId || !sessionId) {
    return res.status(400).json({ success: false, message: "Missing studentId or sessionId" });
  }

  if (!activeSessions.has(sessionId)) {
    return res.status(404).json({ success: false, message: "Invalid or expired session." });
  }

  activeSessions.get(sessionId).attendees.add(studentId.toUpperCase());
  return res.status(200).json({ success: true, message: "Attendance marked successfully." });
});

// ── Routes ────────────────────────────────────────────────────
app.use("/api/auth",    authRouter);
app.use("/api/student", studentRouter);
app.use("/api/faculty", facultyRouter);
app.use("/api/admin",   adminRouter);

// Health check
app.get("/api/health", (req, res) => {
  res.json({ success: true, message: "Campus Connect API is running." });
});

// 404
app.use((req, res) => {
  res.status(404).json({ success: false, message: "Route not found." });
});

// ── Start ─────────────────────────────────────────────────────
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
  });
}).catch((err) => {
  console.error("MongoDB connection failed:", err);
  process.exit(1);
});