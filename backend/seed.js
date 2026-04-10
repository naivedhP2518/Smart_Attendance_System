// seed.js — Run once: node seed.js
require("dotenv").config();
const bcrypt = require("bcryptjs");
const { connectDB, closeDB } = require("./db");

const seed = async () => {
  const db = await connectDB();
  const hashedPass = await bcrypt.hash("password123", 10);

  // ── 1. STUDENTS (100 Students in 4 Classes) ─────────────────────────────
  await db.collection("students").deleteMany({});
  const students = [];
  const classConfigs = [
    { sem: 1, count: 25, start: 1 },
    { sem: 3, count: 25, start: 26 },
    { sem: 5, count: 25, start: 51 },
    { sem: 7, count: 25, start: 76 }
  ];

  classConfigs.forEach(cfg => {
    for (let i = 0; i < cfg.count; i++) {
       const idNum = cfg.start + i;
       const stuId = `STU${idNum.toString().padStart(3, '0')}`;
       students.push({
         uniqueId: stuId,
         password: hashedPass,
         name: `Student ${idNum}`,
         branch: "Computer Science",
         semester: cfg.sem
       });
    }
  });
  await db.collection("students").insertMany(students);

  // ── 2. FACULTY & ADMIN ──────────────────────────────────────────────────
  await db.collection("faculty").deleteMany({});
  const faculty = [];
  for (let i = 1; i <= 10; i++) {
    const facId = `FAC${i.toString().padStart(3, '0')}`;
    faculty.push({
      uniqueId: facId,
      password: hashedPass,
      name: `Faculty Member ${i}`,
      department: "Computer Science",
      role: "faculty"
    });
  }

  // Add Admin
  faculty.push({
    uniqueId: "ADMIN001",
    password: hashedPass, // matches password123
    name: "System Administrator",
    department: "Administration",
    role: "admin"
  });

  await db.collection("faculty").insertMany(faculty);

  // ── 3. TIMETABLE (Fixed weekly structure for all 4 classes) ────────────
  await db.collection("timetable").deleteMany({});
  const timetables = [
    {
      branch: "Computer Science",
      semester: 1,
      className: "Class A",
      schedule: {
        Monday: [{ subject: "Programming Basics", subjectCode: "CS101", faculty: "Faculty Member 1", room: "A-101", startTime: "09:00", endTime: "10:00" }],
        Tuesday: [{ subject: "Maths I", subjectCode: "MA101", faculty: "Faculty Member 5", room: "A-102", startTime: "10:00", endTime: "11:00" }],
        Wednesday: [{ subject: "Programming Basics", subjectCode: "CS101", faculty: "Faculty Member 1", room: "A-101", startTime: "09:00", endTime: "10:00" }],
        Thursday: [{ subject: "Physics", subjectCode: "PH101", faculty: "Faculty Member 6", room: "A-103", startTime: "11:00", endTime: "12:00" }],
        Friday: [{ subject: "Programming Basics", subjectCode: "CS101", faculty: "Faculty Member 1", room: "A-101", startTime: "14:00", endTime: "15:00" }],
        Saturday: [], Sunday: []
      }
    },
    {
      branch: "Computer Science",
      semester: 3,
      className: "Class B",
      schedule: {
        Monday: [{ subject: "OOPS", subjectCode: "CS301", faculty: "Faculty Member 3", room: "B-101", startTime: "09:00", endTime: "10:00" }],
        Tuesday: [{ subject: "Data Structures", subjectCode: "CS302", faculty: "Faculty Member 2", room: "B-102", startTime: "10:00", endTime: "11:00" }],
        Wednesday: [{ subject: "OOPS", subjectCode: "CS301", faculty: "Faculty Member 3", room: "B-101", startTime: "09:00", endTime: "10:00" }],
        Thursday: [{ subject: "Digital Logic", subjectCode: "CS303", faculty: "Faculty Member 7", room: "B-103", startTime: "11:00", endTime: "12:00" }],
        Friday: [{ subject: "OOPS", subjectCode: "CS301", faculty: "Faculty Member 3", room: "B-101", startTime: "14:00", endTime: "15:00" }],
        Saturday: [], Sunday: []
      }
    },
    {
      branch: "Computer Science",
      semester: 5,
      className: "Class C",
      schedule: {
        Monday: [
          { subject: "Data Structures",     subjectCode: "CS501", faculty: "Faculty Member 1", room: "A-101", startTime: "09:00", endTime: "10:00" },
          { subject: "Operating Systems",   subjectCode: "CS502", faculty: "Faculty Member 2", room: "A-102", startTime: "10:00", endTime: "11:00" },
        ],
        Tuesday: [
          { subject: "Software Engineering", subjectCode: "CS505", faculty: "Faculty Member 1", room: "A-103", startTime: "09:00", endTime: "10:00" },
        ],
        Wednesday: [
          { subject: "Computer Networks",    subjectCode: "CS503", faculty: "Faculty Member 1", room: "A-101", startTime: "09:00", endTime: "10:00" },
        ],
        Thursday: [
          { subject: "Data Structures",      subjectCode: "CS501", faculty: "Faculty Member 1", room: "A-101", startTime: "09:00", endTime: "10:00" },
        ],
        Friday: [
          { subject: "Operating Systems",    subjectCode: "CS502", faculty: "Faculty Member 2", room: "A-102", startTime: "09:00", endTime: "10:00" },
        ],
        Saturday: [
          { subject: "Data Structures",      subjectCode: "CS501", faculty: "Faculty Member 1", room: "A-101", startTime: "09:00", endTime: "10:00" },
          { subject: "Theory of Computation", subjectCode: "CS506", faculty: "Faculty Member 3", room: "A-101", startTime: "11:00", endTime: "12:00" },
          { subject: "Computer Systems",      subjectCode: "CS507", faculty: "Faculty Member 5", room: "A-102", startTime: "13:00", endTime: "14:00" },
        ],
        Sunday: [],
      }
    },
    {
      branch: "Computer Science",
      semester: 7,
      className: "Class D",
      schedule: {
        Monday: [{ subject: "Cloud Computing", subjectCode: "CS701", faculty: "Faculty Member 4", room: "C-101", startTime: "09:00", endTime: "10:00" }],
        Tuesday: [{ subject: "AI", subjectCode: "CS702", faculty: "Faculty Member 8", room: "C-102", startTime: "10:00", endTime: "11:00" }],
        Wednesday: [{ subject: "Cloud Computing", subjectCode: "CS701", faculty: "Faculty Member 4", room: "C-101", startTime: "09:00", endTime: "10:00" }],
        Thursday: [{ subject: "Cyber Security", subjectCode: "CS703", faculty: "Faculty Member 9", room: "C-103", startTime: "11:00", endTime: "12:00" }],
        Friday: [{ subject: "Cloud Computing", subjectCode: "CS701", faculty: "Faculty Member 4", room: "C-101", startTime: "14:00", endTime: "15:00" }],
        Saturday: [], Sunday: []
      }
    }
  ];
  await db.collection("timetable").insertMany(timetables);

  // ── 4. ATTENDANCE (Seeding for all 100 students) ─────────────────────────
  await db.collection("attendance").deleteMany({});
  const subjects = [
    { subject: "Data Structures",     subjectCode: "CS501", totalHeld: 30 },
    { subject: "Operating Systems",   subjectCode: "CS502", totalHeld: 28 },
    { subject: "Computer Networks",   subjectCode: "CS503", totalHeld: 26 },
    { subject: "Database Management", subjectCode: "CS504", totalHeld: 24 },
    { subject: "Software Engineering",subjectCode: "CS505", totalHeld: 22 },
    { subject: "Theory of Computation",subjectCode: "CS506", totalHeld: 25 },
    { subject: "Computer Systems",     subjectCode: "CS507", totalHeld: 20 },
  ];

  const attendanceDocs = [];
  students.forEach((stu) => {
    subjects.forEach((sub) => {
      // Randomly assign 70-95% attendance
      const attended = Math.floor(sub.totalHeld * (0.7 + Math.random() * 0.25));
      attendanceDocs.push({
        studentId: stu.uniqueId,
        semester: stu.semester,
        subject: sub.subject,
        subjectCode: sub.subjectCode,
        totalHeld: sub.totalHeld,
        totalAttended: attended,
      });
    });
  });
  await db.collection("attendance").insertMany(attendanceDocs);

  // ── 5. RESULTS (Simplified SPI history for all students) ─────────────────
  await db.collection("results").deleteMany({});
  const resultsDocs = [];
  students.forEach(stu => {
    const historicalSems = stu.semester === 1 ? [] : [1, 2, 3, 4, 5, 6].filter(s => s < stu.semester);
    historicalSems.forEach(s => {
      const spi = (7.5 + Math.random() * 2).toFixed(1);
      resultsDocs.push({ 
        studentId: stu.uniqueId, 
        semester: s, 
        spi: parseFloat(spi), 
        grade: parseFloat(spi) > 8.5 ? "AA" : "AB", 
        declaredAt: new Date(2023 + Math.floor(s/2), (s%2)*6, 15)
      });
    });
  });
  if (resultsDocs.length > 0) await db.collection("results").insertMany(resultsDocs);

  // ── 6. NOTICES ───────────────────────────────────────────────────────────
  await db.collection("notices").deleteMany({});
  await db.collection("notices").insertMany([
    { title: "Mid-Semester Exam Schedule Released", content: "Mid-semester examinations will be held from March 20 to March 28.", target: "all",      priority: "high",   createdBy: "FAC001", createdAt: new Date("2026-03-08") },
    { title: "CS Department Seminar",               content: "Guest lecture on AI & ML on March 12 at 2 PM in Seminar Hall.",              target: "students", branch: "Computer Science", priority: "medium", createdBy: "FAC002", createdAt: new Date("2026-03-06") },
  ]);

  // ── 7. EXAMS ─────────────────────────────────────────────────────────────
  await db.collection("exams").deleteMany({});
  await db.collection("exams").insertMany([
    { subject: "Data Structures",     subjectCode: "CS501", branch: "Computer Science", semester: 5, examDate: new Date("2026-03-20T09:00:00"), duration: "3 hours", room: "Exam Hall A", type: "Mid Semester" },
    { subject: "Operating Systems",   subjectCode: "CS502", branch: "Computer Science", semester: 5, examDate: new Date("2026-03-22T09:00:00"), duration: "3 hours", room: "Exam Hall B", type: "Mid Semester" },
    { subject: "Computer Networks",   subjectCode: "CS503", branch: "Computer Science", semester: 5, examDate: new Date("2026-03-24T09:00:00"), duration: "3 hours", room: "Exam Hall A", type: "Mid Semester" },
    { subject: "Database Management", subjectCode: "CS504", branch: "Computer Science", semester: 5, examDate: new Date("2026-03-26T09:00:00"), duration: "3 hours", room: "Exam Hall B", type: "Mid Semester" },
    { subject: "Software Engineering",subjectCode: "CS505", branch: "Computer Science", semester: 5, examDate: new Date("2026-03-28T09:00:00"), duration: "3 hours", room: "Exam Hall A", type: "Mid Semester" },
    { subject: "Theory of Computation",subjectCode: "CS506", branch: "Computer Science", semester: 5, examDate: new Date("2026-03-30T09:00:00"), duration: "3 hours", room: "Exam Hall B", type: "Mid Semester" },
    { subject: "Computer Systems",     subjectCode: "CS507", branch: "Computer Science", semester: 5, examDate: new Date("2026-04-01T09:00:00"), duration: "3 hours", room: "Exam Hall A", type: "Mid Semester" },
  ]);

  console.log("✅ All seed data inserted!");
  console.log("   Collections: students, faculty, timetable, attendance, results, notices, exams");
  console.log("   Credentials: STU001-STU100 / FAC001-FAC010  →  password123");
  await closeDB();
};

seed().catch((err) => { console.error("Seed error:", err); process.exit(1); });
