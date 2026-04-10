const express = require("express");
const { getDB } = require("./db");
const { verifyToken, requireRole } = require("./auth");
const { ObjectId } = require("mongodb");

const router = express.Router();

// All routes here require login + student role
router.use(verifyToken, requireRole("student"));

// ─────────────────────────────────────────────────────────────
// HELPER: Get day name from today's date
// ─────────────────────────────────────────────────────────────
const getTodayName = () => {
  const days = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
  return days[new Date().getDay()];
};

// ─────────────────────────────────────────────────────────────
// GET /api/student/dashboard
// Returns all dashboard data in one single API call
// ─────────────────────────────────────────────────────────────
router.get("/dashboard", async (req, res) => {
  try {
    const db = getDB();
    const studentId = req.user.uniqueId;
    const today = getTodayName();

    // 1. Student profile
    const student = await db.collection("students").findOne(
      { uniqueId: studentId },
      { projection: { password: 0 } }
    );

    if (!student) {
      return res.status(404).json({ success: false, message: "Student not found." });
    }

    // 2. Today's timetable
    const timetable = await db.collection("timetable").findOne({
      branch: student.branch,
      semester: student.semester,
    });

    const todayLectures = timetable?.schedule?.[today] || [];

    // 3. Attendance — subject-wise + overall %
    const attendanceRecords = await db.collection("attendance")
      .find({ studentId, semester: student.semester })
      .toArray();

    let totalHeld = 0;
    let totalAttended = 0;
    const subjectAttendance = attendanceRecords.map((rec) => {
      totalHeld += rec.totalHeld || 0;
      totalAttended += rec.totalAttended || 0;
      const pct = rec.totalHeld > 0
        ? Math.round((rec.totalAttended / rec.totalHeld) * 100)
        : 0;
      return {
        subject: rec.subject,
        subjectCode: rec.subjectCode,
        totalHeld: rec.totalHeld,
        totalAttended: rec.totalAttended,
        percentage: pct,
        status: pct >= 75 ? "safe" : pct >= 65 ? "warning" : "danger",
      };
    });

    const overallAttendance = totalHeld > 0
      ? Math.round((totalAttended / totalHeld) * 100)
      : 0;

    // 4. Results (SPI/CPI)
    const results = await db.collection("results")
      .find({ studentId })
      .sort({ semester: -1 })
      .toArray();

    const latestResult = results[0] || null;
    const cpi = results.length > 0
      ? (results.reduce((sum, r) => sum + r.spi, 0) / results.length).toFixed(2)
      : null;

    // 5. Recent notices (latest 3)
    const notices = await db.collection("notices")
      .find({
        $or: [
          { target: "all" },
          { target: "students" },
          { branch: student.branch },
        ],
      })
      .sort({ createdAt: -1 })
      .limit(3)
      .toArray();

    // 6. Upcoming exams
    const now = new Date();
    const upcomingExams = await db.collection("exams")
      .find({
        branch: student.branch,
        semester: student.semester,
        examDate: { $gte: now },
      })
      .sort({ examDate: 1 })
      .limit(3)
      .toArray();

    // 7. Next lecture today
    const currentTime = new Date();
    const currentMinutes = currentTime.getHours() * 60 + currentTime.getMinutes();

    const nextLecture = todayLectures.find((lec) => {
      const [h, m] = lec.startTime.split(":").map(Number);
      return h * 60 + m > currentMinutes;
    }) || null;

    return res.status(200).json({
      success: true,
      data: {
        student: {
          name: student.name,
          uniqueId: student.uniqueId,
          branch: student.branch,
          semester: student.semester,
        },
        todayDay: today,
        todayLectures,
        nextLecture,
        attendance: {
          overall: overallAttendance,
          subjects: subjectAttendance,
          isLow: overallAttendance < 75,
        },
        results: {
          latest: latestResult,
          cpi,
          history: results,
        },
        notices,
        upcomingExams,
      },
    });
  } catch (err) {
    console.error("Dashboard error:", err);
    return res.status(500).json({ success: false, message: "Internal server error." });
  }
});

// ─────────────────────────────────────────────────────────────
// GET /api/student/timetable
// Full weekly timetable for the student
// ─────────────────────────────────────────────────────────────
router.get("/timetable", async (req, res) => {
  try {
    const db = getDB();
    const student = await db.collection("students").findOne(
      { uniqueId: req.user.uniqueId },
      { projection: { branch: 1, semester: 1 } }
    );

    const timetable = await db.collection("timetable").findOne({
      branch: student.branch,
      semester: student.semester,
    });

    return res.status(200).json({
      success: true,
      data: timetable?.schedule || {},
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Internal server error." });
  }
});

// ─────────────────────────────────────────────────────────────
// GET /api/student/attendance
// Detailed attendance per subject
// ─────────────────────────────────────────────────────────────
router.get("/attendance", async (req, res) => {
  try {
    const db = getDB();
    const student = await db.collection("students").findOne(
      { uniqueId: req.user.uniqueId },
      { projection: { branch: 1, semester: 1 } }
    );

    const records = await db.collection("attendance")
      .find({ studentId: req.user.uniqueId, semester: student.semester })
      .toArray();

    const subjects = records.map((rec) => {
      const pct = rec.totalHeld > 0
        ? Math.round((rec.totalAttended / rec.totalHeld) * 100)
        : 0;
      // How many more lectures needed to reach 75%
      const lecturesNeeded = pct < 75
        ? Math.ceil((0.75 * rec.totalHeld - rec.totalAttended) / 0.25)
        : 0;

      return {
        subject: rec.subject,
        subjectCode: rec.subjectCode,
        totalHeld: rec.totalHeld,
        totalAttended: rec.totalAttended,
        percentage: pct,
        status: pct >= 75 ? "safe" : pct >= 65 ? "warning" : "danger",
        lecturesNeeded,
      };
    });

    return res.status(200).json({ success: true, data: subjects });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Internal server error." });
  }
});

// ─────────────────────────────────────────────────────────────
// GET /api/student/results
// All semester results with SPI and CPI
// ─────────────────────────────────────────────────────────────
router.get("/results", async (req, res) => {
  try {
    const db = getDB();
    const results = await db.collection("results")
      .find({ studentId: req.user.uniqueId })
      .sort({ semester: 1 })
      .toArray();

    const cpi = results.length > 0
      ? (results.reduce((sum, r) => sum + r.spi, 0) / results.length).toFixed(2)
      : null;

    return res.status(200).json({ success: true, data: { results, cpi } });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Internal server error." });
  }
});

// ─────────────────────────────────────────────────────────────
// GET /api/student/notices
// All notices for this student
// ─────────────────────────────────────────────────────────────
router.get("/notices", async (req, res) => {
  try {
    const db = getDB();
    const student = await db.collection("students").findOne(
      { uniqueId: req.user.uniqueId },
      { projection: { branch: 1 } }
    );

    const notices = await db.collection("notices")
      .find({
        $or: [
          { target: "all" },
          { target: "students" },
          { branch: student.branch },
        ],
      })
      .sort({ createdAt: -1 })
      .toArray();

    return res.status(200).json({ success: true, data: notices });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Internal server error." });
  }
});

// ─────────────────────────────────────────────────────────────
// GET /api/student/exams
// Upcoming exams
// ─────────────────────────────────────────────────────────────
router.get("/exams", async (req, res) => {
  try {
    const db = getDB();
    const student = await db.collection("students").findOne(
      { uniqueId: req.user.uniqueId },
      { projection: { branch: 1, semester: 1 } }
    );

    const exams = await db.collection("exams")
      .find({
        branch: student.branch,
        semester: student.semester,
        examDate: { $gte: new Date() },
      })
      .sort({ examDate: 1 })
      .toArray();

    return res.status(200).json({ success: true, data: exams });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Internal server error." });
  }
});

module.exports = router;