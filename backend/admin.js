const express = require("express");
const router = express.Router();
const { connectDB } = require("./db");

// ── GET ADMIN STATS ───────────────────────────────────────────
router.get("/stats", async (req, res) => {
  try {
    const db = await connectDB();
    const studentCount = await db.collection("students").countDocuments();
    const facultyCount = await db.collection("faculty").countDocuments({ role: "faculty" });
    // Analytics
    const attendanceRecords = await db.collection("attendance").find({}).toArray();
    const totalRecords = attendanceRecords.length;
    
    // Calculate global average attendance
    const students = await db.collection("students").find({}).toArray();
    let globalAvg = 0;
    if (students.length > 0) {
      const totalLectures = [...new Set(attendanceRecords.map(a => `${a.subjectCode}_${a.date}`))].length;
      if (totalLectures > 0) {
        const totalPresents = attendanceRecords.filter(a => a.status === "Present").length;
        globalAvg = ((totalPresents / (students.length * totalLectures)) * 100).toFixed(1);
      }
    }

    res.json({
      success: true,
      stats: { 
        studentCount, 
        facultyCount, 
        timetableCount, 
        noticeCount,
        totalAttendanceRecords: totalRecords,
        campusAverageAttendance: globalAvg
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: "Error fetching stats" });
  }
});

// ── GET ALL USERS (Detailed Analytics) ───────────────────────
router.get("/users", async (req, res) => {
  try {
    const db = await connectDB();
    
    // 1. Fetch Students with Attendance Stats
    const studentsData = await db.collection("students").find({}).toArray();
    const attendanceRecords = await db.collection("attendance").find({}).toArray();
    
    const students = studentsData.map(s => {
      const studentAttendance = attendanceRecords.filter(a => a.studentId === s.uniqueId && a.status === "Present");
      const totalLectures = [...new Set(attendanceRecords.map(a => `${a.subjectCode}_${a.date}`))].length;
      const percentage = totalLectures > 0 ? ((studentAttendance.length / totalLectures) * 100).toFixed(1) : 0;
      
      return {
        ...s,
        attendancePercentage: percentage,
        totalPresent: studentAttendance.length
      };
    });

    // 2. Fetch Faculty with Class Stats
    const facultyData = await db.collection("faculty").find({ role: "faculty" }).toArray();
    const timetables = await db.collection("timetable").find({}).toArray();
    
    const faculty = facultyData.map(f => {
      // Find classes where this faculty is teaching
      const taughtClasses = timetables.filter(t => {
        const schedule = t.schedule || {};
        const allLectures = Object.values(schedule).flat();
        return allLectures.some(l => l.faculty === f.name);
      });

      return {
        ...f,
        classesCount: taughtClasses.length,
        managedClasses: taughtClasses.map(t => t.className).join(", ")
      };
    });

    res.json({ success: true, students, faculty });
  } catch (err) {
    res.status(500).json({ success: false, message: "Error fetching detailed users" });
  }
});

// ── UPDATE USER ───────────────────────────────────────────────
router.post("/users/update", async (req, res) => {
  try {
    const { uniqueId, updates, role } = req.body;
    const db = await connectDB();
    const collection = role === "student" ? "students" : "faculty";
    
    await db.collection(collection).updateOne(
      { uniqueId },
      { $set: updates }
    );
    res.json({ success: true, message: "User updated successfully" });
  } catch (err) {
    res.status(500).json({ success: false, message: "Error updating user" });
  }
});

// ── DELETE USER ───────────────────────────────────────────────
router.delete("/users/:role/:id", async (req, res) => {
  try {
    const { role, id } = req.params;
    const db = await connectDB();
    const collection = role === "student" ? "students" : "faculty";
    
    await db.collection(collection).deleteOne({ uniqueId: id });
    res.json({ success: true, message: "User deleted successfully" });
  } catch (err) {
    res.status(500).json({ success: false, message: "Error deleting user" });
  }
});

// ── GET ALL TIMETABLES ────────────────────────────────────────
router.get("/timetable", async (req, res) => {
  try {
    const db = await connectDB();
    const timetables = await db.collection("timetable").find({}).toArray();
    res.json({ success: true, timetables });
  } catch (err) {
    res.status(500).json({ success: false, message: "Error fetching timetables" });
  }
});

module.exports = router;
