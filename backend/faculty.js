const express = require("express");
const router = express.Router();
const qrcode = require("qrcode");
const { exec } = require("child_process");
const fs = require("fs");
const path = require("path");

const { connectDB } = require("./db");

// In-memory store for active sessions: sessionId -> { subjectCode, attendees: Set(studentId) }
const activeSessions = new Map();

// Helper to get today's day name
const getDayName = () => new Date().toLocaleDateString('en-US', { weekday: 'long' });

// ── NEW: Faculty Dashboard Stats ──────────────────────────────
router.get("/dashboard", async (req, res) => {
  try {
    const db = await connectDB();
    const studentsCount = await db.collection("students").countDocuments();
    const examsCount = await db.collection("exams").countDocuments();
    
    // Mocking some stats for the premium look
    res.json({
      success: true,
      data: {
        todayLecturesCount: 4,
        totalStudents: studentsCount,
        averageAttendance: 84,
        upcomingExamsCount: examsCount
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error fetching dashboard" });
  }
});

// ── NEW: Today's Lectures for Faculty ─────────────────────────
router.get("/today-lectures", async (req, res) => {
  try {
    const db = await connectDB();
    const day = getDayName();
    
    // Find all timetable entries that have a schedule for today
    const timetables = await db.collection("timetable").find({}).toArray();
    
    let todayLecs = [];
    timetables.forEach(tt => {
      const daySchedule = tt.schedule[day] || [];
      daySchedule.forEach(lec => {
        todayLecs.push({
          ...lec,
          semester: tt.semester,
          className: tt.className
        });
      });
    });

    res.json({ success: true, data: todayLecs });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error fetching lectures" });
  }
});

// Generate QR Code session
router.post("/generate-qr", async (req, res) => {
  try {
    const { subjectCode, lectureTime, room } = req.body;
    
    // Generate simple random sessionId
    const sessionId = Math.random().toString(36).substring(2, 10).toUpperCase();

    // Store new active session
    activeSessions.set(sessionId, {
      subjectCode: subjectCode || "Unknown",
      lectureTime: lectureTime || "Unknown",
      room: room || "Unknown",
      className: req.body.className || "General",
      attendees: new Set()
    });

    // Create the tracking URL for students
    const clientUrl = process.env.CLIENT_URL || "http://localhost:3000";
    const scanUrl = `${clientUrl}/scan?sessionId=${sessionId}`;

    // Generate base64 QR Code image
    const qrCodeImage = await qrcode.toDataURL(scanUrl);

    res.json({
      success: true,
      sessionId,
      qrCode: qrCodeImage
    });

  } catch (error) {
    console.error("QR Generation Info:", error);
    res.status(500).json({ success: false, message: "Server Error generating QR" });
  }
});

// End session and trigger python script
router.post("/end-qr-session", (req, res) => {
  const { subjectCode } = req.body;
  
  // Find the exact session or randomly pick last if missing
  let targetSessionId = null;
  for (const [sId, sData] of activeSessions.entries()) {
    if (!subjectCode || sData.subjectCode === subjectCode) {
      targetSessionId = sId;
      break;
    }
  }

  if (!targetSessionId) {
    return res.status(404).json({ success: false, message: "Active session not found." });
  }

  const sessionData = activeSessions.get(targetSessionId);
  const presentStudents = Array.from(sessionData.attendees);

  // Clear session
  activeSessions.delete(targetSessionId);

  // Write temporary present list to a file for Python script to read
  const payloadPath = path.join(__dirname, "temp_attendance.json");
  fs.writeFileSync(payloadPath, JSON.stringify({
    subjectCode: sessionData.subjectCode,
    className: sessionData.className,
    present: presentStudents,
    date: new Date().toISOString()
  }));

  // Trigger python agent to create excel sheet
  const scriptPath = path.join(__dirname, "attendance_agent.py");
  exec(`python "${scriptPath}"`, (error, stdout, stderr) => {
      if (error) {
        console.error(`Python script error: ${error.message}`);
        // Optionally clean up tmp file on error or just let it overwrite next time
        return res.status(500).json({ success: false, message: "Error running attendance generation." });
      }
      
      console.log(`Python Script output: ${stdout}`);
      
      // Check if temporary file generated exists
      if(fs.existsSync(payloadPath)){
         try { fs.unlinkSync(payloadPath); }catch(e){} // Cleanup
      }

      res.json({ success: true, message: "Attendance session ended. Excel file generated." });
  });

});

// We need a way for the student router to add attendance to the `activeSessions` map.
// Exporting map allowing other routes to interact with it
module.exports = { router, activeSessions };
