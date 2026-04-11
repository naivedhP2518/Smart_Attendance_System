const express = require("express");
const router = express.Router();
const qrcode = require("qrcode");
const { exec } = require("child_process");
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const { connectDB } = require("./db");

// In-memory store for active sessions: sessionId -> { subjectCode, attendees, sessionSecret, ... }
const activeSessions = new Map();

const QR_WINDOW_SECONDS = 30;
const SESSION_DURATION_SECONDS = 5 * 60;

const getCurrentTimeSlot = () => Math.floor(Date.now() / (QR_WINDOW_SECONDS * 1000));

const generateRotatingToken = (sessionId, sessionSecret, timeSlot) =>
  crypto
    .createHmac("sha256", sessionSecret)
    .update(`${sessionId}:${timeSlot}`)
    .digest("hex")
    .substring(0, 16);

const validateRotatingToken = (sessionId, sessionSecret, receivedToken) => {
  if (!receivedToken || !sessionSecret) return false;
  const currentSlot = getCurrentTimeSlot();
  
  // Check current slot, previous slot, and next slot to allow for clock skew
  for (let slot = currentSlot - 1; slot <= currentSlot + 1; slot++) {
    const validToken = generateRotatingToken(sessionId, sessionSecret, slot);
    if (validToken === receivedToken) return true;
  }
  return false;
};

const createSessionId = () => crypto.randomBytes(4).toString("hex").toUpperCase();
const getDayName = () => new Date().toLocaleDateString("en-US", { weekday: "long" });

const getTodayBounds = () => {
  const start = new Date();
  start.setHours(0, 0, 0, 0);

  const end = new Date(start);
  end.setDate(end.getDate() + 1);

  return { start, end };
};

const getTokenExpiresInSeconds = () =>
  QR_WINDOW_SECONDS - (Math.floor(Date.now() / 1000) % QR_WINDOW_SECONDS);

const getSessionExpiresAt = (createdAt) =>
  new Date(new Date(createdAt).getTime() + SESSION_DURATION_SECONDS * 1000);

const getSessionExpiresInSeconds = (sessionData = {}) => {
  const expiresAt = new Date(sessionData.expiresAt || getSessionExpiresAt(sessionData.createdAt || new Date()));
  return Math.max(Math.ceil((expiresAt.getTime() - Date.now()) / 1000), 0);
};

const isSessionExpired = (sessionData = {}) => getSessionExpiresInSeconds(sessionData) === 0;

const normalizeBaseUrl = (value = "") => String(value).trim().replace(/\/+$/, "");

const normalizeStudentId = (studentId = "") => String(studentId).trim().toUpperCase();

const dedupeAttendanceLog = (attendanceLog = []) => {
  const seenStudentIds = new Set();

  return attendanceLog.reduce((entries, entry) => {
    const normalizedStudentId = normalizeStudentId(entry.studentId);
    if (!normalizedStudentId || seenStudentIds.has(normalizedStudentId)) {
      return entries;
    }

    seenStudentIds.add(normalizedStudentId);
    entries.push({
      studentId: normalizedStudentId,
      markedAt: entry.markedAt || new Date().toISOString(),
    });

    return entries;
  }, []);
};

const getLectureTime = ({ lectureTime, startTime, endTime }) =>
  lectureTime || [startTime, endTime].filter(Boolean).join(" - ");

const getLectureKey = (data = {}) =>
  [
    data.subjectCode || "",
    data.className || "",
    getLectureTime(data),
    data.room || "",
  ]
    .map((value) => String(value).trim().toUpperCase())
    .join("::");

const serializeSession = (sessionId, sessionData) => ({
  sessionId,
  subjectCode: sessionData.subjectCode,
  lectureTime: sessionData.lectureTime,
  room: sessionData.room,
  className: sessionData.className,
  lectureKey: sessionData.lectureKey || getLectureKey(sessionData),
  createdAt: sessionData.createdAt,
  expiresAt: sessionData.expiresAt || getSessionExpiresAt(sessionData.createdAt),
  updatedAt: sessionData.updatedAt || sessionData.createdAt,
  attendeeIds: Array.from(sessionData.attendees || []),
  attendanceLog: sessionData.attendanceLog || [],
  presentCount: sessionData.attendees?.size || 0,
  status: "active",
  clientUrl: sessionData.clientUrl || null,
  sourceSessionId: sessionData.sourceSessionId || null,
  resumedFromPrevious: Boolean(sessionData.resumedFromPrevious),
  restartMode: sessionData.restartMode || "new",
  restartReason: sessionData.restartReason || "",
});

const mapStoredSession = (sessionData = {}) => ({
  sessionId: sessionData.sessionId,
  subjectCode: sessionData.subjectCode,
  lectureTime: sessionData.lectureTime,
  room: sessionData.room,
  className: sessionData.className,
  lectureKey: sessionData.lectureKey || getLectureKey(sessionData),
  createdAt: sessionData.createdAt,
  expiresAt: sessionData.expiresAt || getSessionExpiresAt(sessionData.createdAt),
  updatedAt: sessionData.updatedAt || sessionData.createdAt,
  attendeeIds: sessionData.attendeeIds || [],
  attendanceLog: sessionData.attendanceLog || [],
  presentCount: (sessionData.attendeeIds || []).length,
  status: sessionData.status || "ended",
  clientUrl: sessionData.clientUrl || null,
  sourceSessionId: sessionData.sourceSessionId || null,
  resumedFromPrevious: Boolean(sessionData.resumedFromPrevious),
  restartMode: sessionData.restartMode || "new",
  restartReason: sessionData.restartReason || "",
});

const resolveSessionSource = async (sessionId, db) => {
  if (!sessionId) return null;

  const activeSession = activeSessions.get(sessionId);
  if (activeSession) {
    return serializeSession(sessionId, activeSession);
  }

  const storedSession = await db.collection("qr_attendance_sessions").findOne({ sessionId });
  return storedSession ? mapStoredSession(storedSession) : null;
};

const pickLatestSession = (currentSession, nextSession) => {
  if (!currentSession) return nextSession;

  const currentTime = new Date(
    currentSession.updatedAt || currentSession.endedAt || currentSession.createdAt || 0
  ).getTime();
  const nextTime = new Date(
    nextSession.updatedAt || nextSession.endedAt || nextSession.createdAt || 0
  ).getTime();

  return nextTime >= currentTime ? nextSession : currentSession;
};

const buildScanUrl = (sessionId, sessionSecret, host = null) => {
  const clientUrl = normalizeBaseUrl(host || process.env.CLIENT_URL || "http://localhost:3000");
  const token = generateRotatingToken(sessionId, sessionSecret, getCurrentTimeSlot());
  return `${clientUrl}/scan?sessionId=${sessionId}&token=${token}`;
};

const syncSessionToDb = async (db, sessionId, sessionData, extraFields = {}) => {
  await db.collection("qr_attendance_sessions").updateOne(
    { sessionId },
    {
      $set: {
        sessionId,
        subjectCode: sessionData.subjectCode,
        lectureTime: sessionData.lectureTime,
        room: sessionData.room,
        className: sessionData.className,
        lectureKey: sessionData.lectureKey || getLectureKey(sessionData),
        createdAt: sessionData.createdAt || new Date(),
        expiresAt: sessionData.expiresAt || getSessionExpiresAt(sessionData.createdAt || new Date()),
        attendeeIds: Array.from(sessionData.attendees || []),
        attendanceLog: sessionData.attendanceLog || [],
        clientUrl: sessionData.clientUrl || null,
        sourceSessionId: sessionData.sourceSessionId || null,
        resumedFromPrevious: Boolean(sessionData.resumedFromPrevious),
        restartMode: sessionData.restartMode || "new",
        restartReason: sessionData.restartReason || "",
        updatedAt: new Date(),
        ...extraFields,
      },
    },
    { upsert: true }
  );
};

router.get("/dashboard", async (req, res) => {
  try {
    const db = await connectDB();
    const studentsCount = await db.collection("students").countDocuments();
    const examsCount = await db.collection("exams").countDocuments();
    const day = getDayName();
    const timetables = await db.collection("timetable").find({}).toArray();
    const todayLecturesCount = timetables.reduce(
      (count, timetable) => count + ((timetable.schedule?.[day] || []).length),
      0
    );

    res.json({
      success: true,
      data: {
        todayLecturesCount,
        totalStudents: studentsCount,
        averageAttendance: 84,
        upcomingExamsCount: examsCount,
      },
    });
  } catch (error) {
    console.error("Faculty dashboard error:", error);
    res.status(500).json({ success: false, message: "Error fetching dashboard." });
  }
});

router.get("/today-lectures", async (req, res) => {
  try {
    const db = await connectDB();
    const day = getDayName();
    const { start, end } = getTodayBounds();

    const timetables = await db.collection("timetable").find({}).toArray();
    const storedSessions = await db.collection("qr_attendance_sessions")
      .find({ createdAt: { $gte: start, $lt: end } })
      .sort({ updatedAt: -1, createdAt: -1 })
      .toArray();

    const latestSessionsByLecture = new Map();

    storedSessions.forEach((sessionDoc) => {
      const mappedSession = mapStoredSession(sessionDoc);
      const lectureKey = mappedSession.lectureKey;
      latestSessionsByLecture.set(
        lectureKey,
        pickLatestSession(latestSessionsByLecture.get(lectureKey), mappedSession)
      );
    });

    Array.from(activeSessions.entries()).forEach(([sessionId, sessionData]) => {
      const mappedSession = serializeSession(sessionId, sessionData);
      const lectureKey = mappedSession.lectureKey;
      latestSessionsByLecture.set(
        lectureKey,
        pickLatestSession(latestSessionsByLecture.get(lectureKey), mappedSession)
      );
    });

    const todayLectures = [];
    timetables.forEach((timetable) => {
      const daySchedule = timetable.schedule?.[day] || [];
      daySchedule.forEach((lecture) => {
        const className = timetable.className;
        const lectureTime = `${lecture.startTime} - ${lecture.endTime}`;
        const lectureKey = getLectureKey({
          subjectCode: lecture.subjectCode,
          className,
          lectureTime,
          room: lecture.room,
        });
        const latestSession = latestSessionsByLecture.get(lectureKey);

        todayLectures.push({
          ...lecture,
          semester: timetable.semester,
          className,
          lectureKey,
          sessionStatus: latestSession?.status || "idle",
          latestSessionId: latestSession?.sessionId || null,
          latestPresentCount: latestSession?.presentCount || 0,
          latestRestartReason: latestSession?.restartReason || "",
          latestRestartMode: latestSession?.restartMode || "",
          attendanceTaken: Boolean(latestSession),
        });
      });
    });

    res.json({ success: true, data: todayLectures });
  } catch (error) {
    console.error("Today lectures error:", error);
    res.status(500).json({ success: false, message: "Error fetching lectures." });
  }
});

router.get("/students", async (req, res) => {
  try {
    const db = await connectDB();
    const students = await db.collection("students")
      .find({}, { projection: { password: 0 } })
      .sort({ uniqueId: 1 })
      .toArray();

    const attendanceRecords = await db.collection("attendance").find({}).toArray();
    const { start, end } = getTodayBounds();

    const todaySessions = await db.collection("qr_attendance_sessions")
      .find({ createdAt: { $gte: start, $lt: end } })
      .sort({ createdAt: -1 })
      .toArray();

    const todayPresentIds = new Set(
      todaySessions
        .flatMap((session) => session.attendeeIds || [])
        .map((studentId) => normalizeStudentId(studentId))
    );

    const activeSessionEntries = Array.from(activeSessions.entries());
    const activeSession = activeSessionEntries.length > 0
      ? serializeSession(...activeSessionEntries[activeSessionEntries.length - 1])
      : null;

    activeSessionEntries.forEach(([, sessionData]) => {
      Array.from(sessionData.attendees || []).forEach((studentId) => {
        todayPresentIds.add(normalizeStudentId(studentId));
      });
    });

    const studentsWithStats = students.map((student) => {
      const records = attendanceRecords.filter((record) => record.studentId === student.uniqueId);
      const totalHeld = records.reduce((sum, record) => sum + (record.totalHeld || 0), 0);
      const totalAttended = records.reduce((sum, record) => sum + (record.totalAttended || 0), 0);
      const attendance = totalHeld > 0 ? Math.round((totalAttended / totalHeld) * 100) : 0;

      return {
        id: student.uniqueId,
        name: student.name,
        branch: student.branch,
        semester: student.semester,
        attendance,
        isPresentToday: todayPresentIds.has(normalizeStudentId(student.uniqueId)),
      };
    });

    const latestStoredSession = todaySessions[0] ? mapStoredSession(todaySessions[0]) : null;
    const latestSession = activeSession || latestStoredSession;

    res.json({
      success: true,
      data: {
        students: studentsWithStats,
        summary: {
          totalStudents: students.length,
          todayPresentCount: todayPresentIds.size,
          latestSessionCount: latestSession?.presentCount || 0,
          latestSessionLabel: latestSession
            ? `${latestSession.subjectCode} - ${latestSession.className}`
            : "No QR session today",
          latestSessionStatus: latestSession?.status || "idle",
        },
      },
    });
  } catch (error) {
    console.error("Faculty students error:", error);
    res.status(500).json({ success: false, message: "Error fetching students." });
  }
});

router.get("/live-session/:sessionId", async (req, res) => {
  try {
    const { sessionId } = req.params;
    const db = await connectDB();

    const activeSession = activeSessions.get(sessionId);
    const storedSession = !activeSession
      ? await db.collection("qr_attendance_sessions").findOne({ sessionId })
      : null;

    const sessionData = activeSession
      ? serializeSession(sessionId, activeSession)
      : storedSession
        ? mapStoredSession(storedSession)
        : null;

    if (!sessionData) {
      return res.status(404).json({ success: false, message: "Session not found." });
    }

    if (isSessionExpired(sessionData)) {
      if (activeSession) {
        activeSessions.delete(sessionId);
        await syncSessionToDb(
          db,
          sessionId,
          {
            ...activeSession,
            attendees: new Set(activeSession.attendees || []),
          },
          {
            status: "expired",
            endedAt: new Date(sessionData.expiresAt || new Date()),
          }
        );
      }

      return res.status(410).json({ success: false, message: "Session expired." });
    }

    const rawAttendanceLog = (sessionData.attendanceLog || []).length > 0
      ? sessionData.attendanceLog
      : (sessionData.attendeeIds || []).map((studentId) => ({
          studentId: normalizeStudentId(studentId),
          markedAt: sessionData.updatedAt || sessionData.createdAt || new Date().toISOString(),
        }));

    const attendanceLog = dedupeAttendanceLog(rawAttendanceLog);
    const studentIds = attendanceLog.map((entry) => entry.studentId);
    const students = studentIds.length > 0
      ? await db.collection("students")
          .find(
            { uniqueId: { $in: studentIds } },
            { projection: { password: 0 } }
          )
          .toArray()
      : [];

    const studentMap = new Map(students.map((student) => [normalizeStudentId(student.uniqueId), student]));

    const attendees = attendanceLog.map((entry) => {
      const student = studentMap.get(entry.studentId);
      return {
        id: entry.studentId,
        name: student?.name || entry.studentId,
        branch: student?.branch || "Unknown",
        semester: student?.semester || "-",
        markedAt: entry.markedAt,
      };
    });

    res.json({
      success: true,
      data: {
        session: {
          sessionId,
          subjectCode: sessionData.subjectCode,
          lectureTime: sessionData.lectureTime,
          room: sessionData.room,
          className: sessionData.className,
          createdAt: sessionData.createdAt,
          expiresAt: sessionData.expiresAt,
          status: activeSession ? "active" : sessionData.status || "ended",
          presentCount: attendees.length,
          tokenExpiresInSeconds: getTokenExpiresInSeconds(),
          sessionExpiresInSeconds: getSessionExpiresInSeconds(sessionData),
          restartMode: sessionData.restartMode || "new",
          restartReason: sessionData.restartReason || "",
        },
        attendees,
      },
    });
  } catch (error) {
    console.error("Live session fetch error:", error);
    res.status(500).json({ success: false, message: "Error fetching live session." });
  }
});

router.post("/generate-qr", async (req, res) => {
  try {
    const {
      subjectCode,
      lectureTime,
      room,
      className,
      semester,
      clientUrl,
      carryForwardSessionId,
      restartFromSessionId,
      restartReason = "",
      restartMode = "new",
    } = req.body;

    const normalizedRestartReason = String(restartReason).trim();
    if (restartFromSessionId && !normalizedRestartReason) {
      return res.status(400).json({
        success: false,
        message: "Generate again karne ke liye Issue / Reason likhna zaroori hai.",
      });
    }

    const createdAt = new Date();
    const resolvedClientUrl = normalizeBaseUrl(
      clientUrl || req.get("origin") || process.env.CLIENT_URL || "http://localhost:3000"
    );
    const db = await connectDB();

    let attendeeIds = [];
    let attendanceLog = [];

    if (carryForwardSessionId) {
      const sourceSession = await resolveSessionSource(carryForwardSessionId, db);
      if (!sourceSession) {
        return res.status(404).json({
          success: false,
          message: "Previous attendance session not found. Fresh attendance start karo.",
        });
      }

      attendeeIds = Array.from(
        new Set((sourceSession.attendeeIds || []).map(normalizeStudentId).filter(Boolean))
      );
      attendanceLog = dedupeAttendanceLog(
        sourceSession.attendanceLog?.length > 0
          ? sourceSession.attendanceLog
          : attendeeIds.map((studentId) => ({
              studentId,
              markedAt: sourceSession.updatedAt || sourceSession.createdAt || createdAt.toISOString(),
            }))
      );
    }

    const sessionId = createSessionId();
    const sessionSecret = crypto.randomBytes(32).toString("hex");
    const lectureKey = getLectureKey({ subjectCode, className, lectureTime, room });
    const activeSessionData = {
      subjectCode: subjectCode || "Unknown",
      lectureTime: lectureTime || "Unknown",
      room: room || "Unknown",
      className: className || "General",
      lectureKey,
      createdAt,
      expiresAt: getSessionExpiresAt(createdAt),
      updatedAt: createdAt,
      attendees: new Set(attendeeIds),
      attendanceLog,
      sessionSecret,
      clientUrl: resolvedClientUrl,
      sourceSessionId: restartFromSessionId || carryForwardSessionId || null,
      resumedFromPrevious: Boolean(carryForwardSessionId),
      restartMode,
      restartReason: normalizedRestartReason,
    };

    activeSessions.set(sessionId, activeSessionData);
    await syncSessionToDb(db, sessionId, activeSessionData, { status: "active" });

    // ── PERMANENT FIX: Increment totalHeld for all students in this class ──
    try {
      if (className && semester) {
        await db.collection("attendance").updateMany(
          { semester: parseInt(semester) },
          { $inc: { totalHeld: 1 } }
        );
      }
    } catch (dbErr) {
      console.error("Error updating totalHeld for class:", dbErr);
    }
    
    const qrCode = await qrcode.toDataURL(buildScanUrl(sessionId, sessionSecret, resolvedClientUrl));

    res.json({
      success: true,
      sessionId,
      qrCode,
      tokenExpiresInSeconds: getTokenExpiresInSeconds(),
      sessionExpiresInSeconds: getSessionExpiresInSeconds(activeSessionData),
      carryForwarded: Boolean(carryForwardSessionId),
      presentCount: attendeeIds.length,
    });
  } catch (error) {
    console.error("QR generation error:", error);
    res.status(500).json({ success: false, message: "Server Error generating QR." });
  }
});

router.get("/refresh-qr/:sessionId", async (req, res) => {
  try {
    const { sessionId } = req.params;
    const db = await connectDB();
    
    let session = activeSessions.get(sessionId);
    if (!session) {
      const stored = await db.collection("qr_attendance_sessions").findOne({ sessionId });
      if (stored && stored.status === "active") {
        session = {
          ...stored,
          attendees: new Set(stored.attendeeIds || []),
          attendanceLog: stored.attendanceLog || []
        };
        activeSessions.set(sessionId, session);
      }
    }

    if (!session) {
      return res.status(404).json({ success: false, message: "Session not found or already ended." });
    }

    if (isSessionExpired(session)) {
      activeSessions.delete(sessionId);
      await syncSessionToDb(
        db,
        sessionId,
        {
          ...session,
          attendees: new Set(session.attendees || []),
        },
        {
          status: "expired",
          endedAt: new Date(session.expiresAt || new Date()),
        }
      );
      return res.status(410).json({ success: false, message: "Session expired. Start a new QR session." });
    }

    const qrCode = await qrcode.toDataURL(buildScanUrl(sessionId, session.sessionSecret, session.clientUrl));

    res.json({
      success: true,
      qrCode,
      tokenExpiresInSeconds: getTokenExpiresInSeconds(),
      sessionExpiresInSeconds: getSessionExpiresInSeconds(session),
    });
  } catch (error) {
    console.error("Refresh QR error:", error);
    res.status(500).json({ success: false, message: "Error refreshing QR." });
  }
});

router.get("/live-session/:sessionId", async (req, res) => {
  try {
    const { sessionId } = req.params;
    const db = await connectDB();
    
    let session = activeSessions.get(sessionId);
    if (!session) {
      const stored = await db.collection("qr_attendance_sessions").findOne({ sessionId });
      if (stored) {
        session = {
          ...stored,
          attendees: new Set(stored.attendeeIds || [])
        };
      }
    }

    if (!session) {
      return res.status(404).json({ success: false, message: "Session not found." });
    }

    const attendeeIds = Array.from(session.attendees || []);
    
    // Resolve names for the UI list
    const students = await db.collection("students")
      .find({ uniqueId: { $in: attendeeIds } })
      .project({ name: 1, uniqueId: 1 })
      .toArray();

    const formattedAttendees = students.map(s => ({
      id: s.uniqueId,
      name: s.name
    }));

    res.json({
      success: true,
      data: {
        session: {
          subjectCode: session.subjectCode,
          className: session.className,
          status: session.status || "active"
        },
        attendees: formattedAttendees
      }
    });
  } catch (error) {
    console.error("Live session fetch error:", error);
    res.status(500).json({ success: false, message: "Error fetching live attendees." });
  }
});

router.post("/end-qr-session", async (req, res) => {
  const { sessionId, subjectCode } = req.body;

  let targetSessionId = sessionId && activeSessions.has(sessionId) ? sessionId : null;

  if (!targetSessionId) {
    for (const [activeId, sessionData] of activeSessions.entries()) {
      if (!subjectCode || sessionData.subjectCode === subjectCode) {
        targetSessionId = activeId;
        break;
      }
    }
  }

  if (!targetSessionId) {
    return res.status(404).json({ success: false, message: "Active session not found." });
  }

  const sessionData = activeSessions.get(targetSessionId);
  const presentStudents = Array.from(sessionData.attendees || []);
  const endedAt = new Date();
  activeSessions.delete(targetSessionId);

  try {
    const db = await connectDB();
    await syncSessionToDb(
      db,
      targetSessionId,
      {
        ...sessionData,
        attendees: new Set(presentStudents),
        updatedAt: endedAt,
      },
      {
        status: "ended",
        endedAt,
      }
    );
  } catch (error) {
    console.error("Error syncing ended session:", error);
  }

  const payloadPath = path.join(__dirname, "temp_attendance.json");
  try {
    fs.writeFileSync(
      payloadPath,
      JSON.stringify({
        subjectCode: sessionData.subjectCode,
        className: sessionData.className,
        present: presentStudents,
        date: endedAt.toISOString(),
      })
    );
  } catch (error) {
    console.error("Attendance payload write error:", error);
  }

  const scriptPath = path.join(__dirname, "attendance_agent.py");
  exec(`python "${scriptPath}"`, (error, stdout) => {
    if (fs.existsSync(payloadPath)) {
      try {
        fs.unlinkSync(payloadPath);
      } catch (cleanupError) {
        console.error("Attendance payload cleanup error:", cleanupError);
      }
    }

    if (error) {
      console.error(`Python script error: ${error.message}`);
      return res.json({
        success: true,
        sessionId: targetSessionId,
        message: "Attendance saved. Report generation skipped.",
      });
    }

    console.log(`Python Script output: ${stdout}`);
    return res.json({
      success: true,
      sessionId: targetSessionId,
      message: "Attendance session ended. Excel file generated.",
    });
  });
});

module.exports = { router, activeSessions, validateRotatingToken };
