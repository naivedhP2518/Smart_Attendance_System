import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./FacultyDashboard.css";
import FacultyDashboardTab from "./components/FacultyDashboardTab";
import FacultyGenerateQrTab from "./components/FacultyGenerateQrTab";
import FacultyAttendanceTab from "./components/FacultyAttendanceTab";
import FacultyStudentsTab from "./components/FacultyStudentsTab";
import FacultyNoticesTab from "./components/FacultyNoticesTab";
import FacultyExamsTab from "./components/FacultyExamsTab";
import FacultySettingsTab from "./components/FacultySettingsTab";

const api = axios.create({ baseURL: "http://localhost:5000/api" });
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

const Icons = {
  Logo: () => (
    <svg width="28" height="28" viewBox="0 0 36 36" fill="none">
      <rect width="36" height="36" rx="9" fill="url(#lg)" />
      <path d="M18 8L8 13.5V22.5L18 28L28 22.5V13.5L18 8Z" stroke="white" strokeWidth="1.8" strokeLinejoin="round" fill="none" />
      <path d="M18 8V18M18 18L8 13.5M18 18L28 13.5" stroke="white" strokeWidth="1.8" strokeLinecap="round" />
      <defs>
        <linearGradient id="lg" x1="0" y1="0" x2="36" y2="36">
          <stop stopColor="#2563EB" />
          <stop offset="1" stopColor="#1D4ED8" />
        </linearGradient>
      </defs>
    </svg>
  ),
  Bell: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  ),
  Logout: () => (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none">
      <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  Dashboard: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path d="M18 20V10M12 20V4M6 20v-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  ),
  QrCode: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <rect x="3" y="3" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="1.8" />
      <rect x="14" y="3" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="1.8" />
      <rect x="3" y="14" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="1.8" />
      <path d="M14 14h3v3h-3z" stroke="currentColor" strokeWidth="1.8" />
      <path d="M17 17h4v4h-4z" stroke="currentColor" strokeWidth="1.8" />
      <path d="M21 14v3M14 21v-4" stroke="currentColor" strokeWidth="1.8" />
    </svg>
  ),
  Chart: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path d="M18 20V10M12 20V4M6 20v-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  ),
  Users: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <circle cx="9" cy="7" r="4" stroke="currentColor" strokeWidth="1.8" />
      <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  ),
  Notice: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
      <path d="M14 2v6h6M16 13H8M16 17H8M10 9H8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  ),
  Exam: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <rect x="3" y="4" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="1.8" />
      <path d="M16 2v4M8 2v4M3 10h18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M8 14h.01M12 14h.01M16 14h.01M8 18h.01M12 18h.01" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  ),
  Settings: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.8" />
      <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z" stroke="currentColor" strokeWidth="1.8" />
    </svg>
  ),
  Menu: () => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <path d="M3 12h18M3 6h18M3 18h18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  ),
  Close: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  ),
  Search: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
      <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="1.8" />
      <path d="M21 21l-4.35-4.35" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  ),
};

const getGreeting = () => {
  const h = new Date().getHours();
  if (h < 12) return "Good Morning";
  if (h < 17) return "Good Afternoon";
  return "Good Evening";
};

const formatDate = (d) =>
  new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });

const NAV = [
  { key: "dashboard", label: "Dashboard", Icon: Icons.Dashboard },
  { key: "generate-qr", label: "Generate QR Attendance", Icon: Icons.QrCode },
  { key: "attendance", label: "Attendance Analytics", Icon: Icons.Chart },
  { key: "students", label: "Students", Icon: Icons.Users },
  { key: "notices", label: "Notices", Icon: Icons.Notice },
  { key: "exams", label: "Exams", Icon: Icons.Exam },
  { key: "settings", label: "Settings", Icon: Icons.Settings },
];

const FACULTY_ACTIVE_TAB_KEY = "facultyDashboardActiveTab";
const FACULTY_TABS = NAV.map(({ key }) => key);

export default function FacultyDashboard() {
  const navigate = useNavigate();
  const [active, setActive] = useState(() => {
    const storedTab = localStorage.getItem(FACULTY_ACTIVE_TAB_KEY);
    return FACULTY_TABS.includes(storedTab) ? storedTab : "dashboard";
  });
  const [sideOpen, setSideOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const facultyUser = JSON.parse(localStorage.getItem("user") || '{"name":"Faculty"}');

  const [dashboardData, setDashboardData] = useState(null);
  const [attendanceData, setAttendanceData] = useState(null);
  const [studentsData, setStudentsData] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [notices, setNotices] = useState([]);
  const [upcomingExams, setUpcomingExams] = useState([]);
  const [todayLectures, setTodayLectures] = useState(null);
  const [selectedLecture, setSelectedLecture] = useState(null);
  const [qrCode, setQrCode] = useState(null);
  const [qrTimer, setQrTimer] = useState(0);
  const [noticeForm, setNoticeForm] = useState({ title: "", content: "", priority: "medium" });
  const [examForm, setExamForm] = useState({ subject: "", date: "", room: "", duration: "" });

  useEffect(() => {
    if (active === "dashboard" && !dashboardData) {
      setLoading(true);
      api.get("/faculty/dashboard")
        .then((r) => setDashboardData(r.data.data || r.data))
        .catch(() =>
          setDashboardData({
            todayLecturesCount: 3,
            totalStudents: 154,
            averageAttendance: 82,
            upcomingExamsCount: 2,
          })
        )
        .finally(() => setLoading(false));
    } else if (active === "generate-qr" && !todayLectures) {
      setLoading(true);
      api.get("/faculty/today-lectures")
        .then((r) => setTodayLectures(r.data.data || r.data))
        .catch(() =>
          setTodayLectures([
            { subject: "Data Structures", subjectCode: "CS201", startTime: "10:00", endTime: "11:00", room: "Lab 2", semester: 4 },
            { subject: "Algorithms", subjectCode: "CS301", startTime: "12:00", endTime: "13:00", room: "Room 204", semester: 5 },
          ])
        )
        .finally(() => setLoading(false));
    } else if (active === "attendance" && !attendanceData) {
      setLoading(true);
      api.get("/faculty/attendance")
        .then((r) => setAttendanceData(r.data.data || r.data))
        .catch(() =>
          setAttendanceData([
            { subject: "Data Structures", totalLectures: 40, averagePct: 84 },
            { subject: "Algorithms", totalLectures: 35, averagePct: 78 },
          ])
        )
        .finally(() => setLoading(false));
    } else if (active === "students" && !studentsData) {
      setLoading(true);
      api.get("/faculty/students")
        .then((r) => setStudentsData(r.data.data || r.data))
        .catch(() =>
          setStudentsData([
            { id: "S001", name: "Alice Johnson", branch: "CS", semester: 4, attendance: 88 },
            { id: "S002", name: "Bob Smith", branch: "CS", semester: 4, attendance: 72 },
          ])
        )
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [active, attendanceData, dashboardData, studentsData, todayLectures]);

  useEffect(() => {
    localStorage.setItem(FACULTY_ACTIVE_TAB_KEY, active);
  }, [active]);

  useEffect(() => {
    let interval;
    if (qrTimer > 0) interval = setInterval(() => setQrTimer((prev) => prev - 1), 1000);
    return () => clearInterval(interval);
  }, [qrTimer]);

  const logout = () => {
    localStorage.clear();
    navigate("/login");
  };

  const handleGenerateQR = (lecture) => {
    setSelectedLecture(lecture);
    const durationMins = 5;
    const payload = {
      subjectCode: lecture.subjectCode,
      lectureTime: `${lecture.startTime} - ${lecture.endTime}`,
      room: lecture.room,
      className: lecture.className || `Semester ${lecture.semester}`,
    };

    api.post("/faculty/generate-qr", payload)
      .then((res) => {
        setQrCode(res.data.qrCode || "data:image/svg+xml;base64,...");
        setQrTimer(durationMins * 60);
      })
      .catch(() => {
        console.warn("API missing, using mock QR.");
        setQrCode("https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=" + lecture.subjectCode);
        setQrTimer(durationMins * 60);
      });
  };

  const handleEndSession = () => {
    api.post("/faculty/end-qr-session", { subjectCode: selectedLecture?.subjectCode })
      .catch(() => console.warn("API missing, mock end session submitted."));
    setQrTimer(0);
  };

  const handlePostNotice = (e) => {
    e.preventDefault();
    api.post("/faculty/notices", noticeForm)
      .then((res) => {
        setNotices([res.data.notice || { ...noticeForm, createdAt: new Date() }, ...notices]);
        setNoticeForm({ title: "", content: "", priority: "medium" });
      })
      .catch(() => {
        setNotices([{ ...noticeForm, createdAt: Date.now() }, ...notices]);
        setNoticeForm({ title: "", content: "", priority: "medium" });
      });
  };

  const handleScheduleExam = (e) => {
    e.preventDefault();
    api.post("/faculty/exams", examForm)
      .then((res) => {
        setUpcomingExams([...upcomingExams, res.data.exam || { ...examForm, examDate: examForm.date }]);
        setExamForm({ subject: "", date: "", room: "", duration: "" });
      })
      .catch(() => {
        setUpcomingExams([...upcomingExams, { ...examForm, examDate: examForm.date }]);
        setExamForm({ subject: "", date: "", room: "", duration: "" });
      });
  };

  if (loading && active === "dashboard" && !dashboardData) {
    return (
      <div className="fd-loader">
        <div className="fd-spinner" />
        <p>Loading Faculty Dashboard...</p>
      </div>
    );
  }

  return (
    <div className="fd-root">
      <aside className={`fd-sidebar ${sideOpen ? "open" : ""}`}>
        <div className="fd-sidebar-header">
          <Icons.Logo />
          <span className="fd-brand">Campus Connect</span>
          <button className="fd-close-btn" onClick={() => setSideOpen(false)}>
            <Icons.Close />
          </button>
        </div>

        <div className="fd-student-pill">
          <div className="fd-avatar">{facultyUser.name?.charAt(0) || "F"}</div>
          <div>
            <p className="fd-pill-name">{facultyUser.name || "Faculty Member"}</p>
            <p className="fd-pill-id">Faculty Portal</p>
          </div>
        </div>

        <nav className="fd-nav">
          {NAV.map(({ key, label, Icon }) => (
            <button
              key={key}
              className={`fd-nav-item ${active === key ? "fd-nav-active" : ""}`}
              onClick={() => {
                setActive(key);
                setSideOpen(false);
              }}
            >
              <Icon />
              <span>{label}</span>
            </button>
          ))}
        </nav>

        <button className="fd-logout" onClick={logout}>
          <Icons.Logout />
          <span>Logout</span>
        </button>
      </aside>

      {sideOpen && <div className="fd-overlay" onClick={() => setSideOpen(false)} />}

      <main className="fd-main">
        <header className="fd-topbar">
          <button className="fd-menu-btn" onClick={() => setSideOpen(true)}>
            <Icons.Menu />
          </button>
          <div className="fd-topbar-left">
            <h1 className="fd-page-title">{NAV.find((n) => n.key === active)?.label}</h1>
            <span className="fd-today-badge">
              {new Date().toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short" })}
            </span>
          </div>
          <div className="fd-topbar-right">
            <button className="fd-icon-btn">
              <Icons.Bell />
            </button>
            <div className="fd-top-avatar">{facultyUser.name?.charAt(0) || "F"}</div>
          </div>
        </header>

        <div className="fd-content">
          {active === "dashboard" && dashboardData && (
            <FacultyDashboardTab
              dashboardData={dashboardData}
              facultyUser={facultyUser}
              getGreeting={getGreeting}
              Icons={Icons}
            />
          )}

          {active === "generate-qr" && (
            <FacultyGenerateQrTab
              todayLectures={todayLectures}
              selectedLecture={selectedLecture}
              qrCode={qrCode}
              qrTimer={qrTimer}
              handleGenerateQR={handleGenerateQR}
              handleEndSession={handleEndSession}
              Icons={Icons}
            />
          )}

          {active === "attendance" && (
            <FacultyAttendanceTab attendanceData={attendanceData} Icons={Icons} />
          )}

          {active === "students" && (
            <FacultyStudentsTab
              studentsData={studentsData}
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              Icons={Icons}
            />
          )}

          {active === "notices" && (
            <FacultyNoticesTab
              notices={notices}
              noticeForm={noticeForm}
              setNoticeForm={setNoticeForm}
              handlePostNotice={handlePostNotice}
              formatDate={formatDate}
              Icons={Icons}
            />
          )}

          {active === "exams" && (
            <FacultyExamsTab
              upcomingExams={upcomingExams}
              examForm={examForm}
              setExamForm={setExamForm}
              handleScheduleExam={handleScheduleExam}
              formatDate={formatDate}
              Icons={Icons}
            />
          )}

          {active === "settings" && <FacultySettingsTab Icons={Icons} />}
        </div>
      </main>
    </div>
  );
}
