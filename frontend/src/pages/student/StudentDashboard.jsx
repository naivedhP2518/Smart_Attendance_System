import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Html5QrcodeScanner } from "html5-qrcode";
import "./StudentDashboard.css";
import StudentOverviewTab from "./components/StudentOverviewTab";
import StudentScanQrTab from "./components/StudentScanQrTab";
import StudentTimetableTab from "./components/StudentTimetableTab";
import StudentAttendanceTab from "./components/StudentAttendanceTab";
import StudentResultsTab from "./components/StudentResultsTab";
import StudentNoticesTab from "./components/StudentNoticesTab";
import StudentExamsTab from "./components/StudentExamsTab";

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
      <path
        d="M18 8L8 13.5V22.5L18 28L28 22.5V13.5L18 8Z"
        stroke="white"
        strokeWidth="1.8"
        strokeLinejoin="round"
        fill="none"
      />
      <path
        d="M18 8V18M18 18L8 13.5M18 18L28 13.5"
        stroke="white"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
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
      <path
        d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  ),
  Logout: () => (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none">
      <path
        d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  ),
  Clock: () => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.8" />
      <path d="M12 6v6l4 2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  ),
  Book: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path d="M4 19.5A2.5 2.5 0 016.5 17H20" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
    </svg>
  ),
  Chart: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path d="M18 20V10M12 20V4M6 20v-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  ),
  Award: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="8" r="6" stroke="currentColor" strokeWidth="1.8" />
      <path d="M15.477 12.89L17 22l-5-3-5 3 1.523-9.11" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
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
  MapPin: () => (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
      <path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0118 0z" stroke="currentColor" strokeWidth="1.8" />
      <circle cx="12" cy="10" r="3" stroke="currentColor" strokeWidth="1.8" />
    </svg>
  ),
  User: () => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="7" r="4" stroke="currentColor" strokeWidth="1.8" />
      <path d="M4 21c0-4 3.582-7 8-7s8 3 8 7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  ),
  Warning: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
      <path d="M10.29 3.86L1.82 18A2 2 0 003.54 21H20.46A2 2 0 0022.18 18L13.71 3.86A2 2 0 0010.29 3.86z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
      <path d="M12 9v4M12 17h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  ),
  Users: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <circle cx="9" cy="7" r="4" stroke="currentColor" strokeWidth="1.8" />
      <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  ),
  Scan: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <rect x="3" y="3" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="1.8" />
      <rect x="14" y="3" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="1.8" />
      <rect x="3" y="14" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="1.8" />
      <path d="M14 14h3v3h-3z" stroke="currentColor" strokeWidth="1.8" />
      <path d="M17 17h4v4h-4z" stroke="currentColor" strokeWidth="1.8" />
      <path d="M21 14v3M14 21v-4" stroke="currentColor" strokeWidth="1.8" />
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
};

const getGreeting = () => {
  const h = new Date().getHours();
  if (h < 12) return "Good Morning";
  if (h < 17) return "Good Afternoon";
  return "Good Evening";
};

const formatTime = (t) => {
  const [h, m] = t.split(":").map(Number);
  const ampm = h >= 12 ? "PM" : "AM";
  return `${h % 12 || 12}:${m.toString().padStart(2, "0")} ${ampm}`;
};

const formatDate = (d) =>
  new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });

const daysUntil = (d) => {
  const diff = new Date(d) - new Date();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
};

const NAV = [
  { key: "dashboard", label: "Dashboard", Icon: Icons.Chart },
  { key: "scan-qr", label: "Scan QR Attendance", Icon: Icons.Scan },
  { key: "timetable", label: "Timetable", Icon: Icons.Clock },
  { key: "attendance", label: "Attendance", Icon: Icons.Book },
  { key: "results", label: "Results", Icon: Icons.Award },
  { key: "notices", label: "Notices", Icon: Icons.Notice },
  { key: "exams", label: "Exams", Icon: Icons.Exam },
];

const STUDENT_ACTIVE_TAB_KEY = "studentDashboardActiveTab";
const STUDENT_TABS = NAV.map(({ key }) => key);

export default function StudentDashboard() {
  const navigate = useNavigate();
  const [active, setActive] = useState(() => {
    const storedTab = localStorage.getItem(STUDENT_ACTIVE_TAB_KEY);
    return STUDENT_TABS.includes(storedTab) ? storedTab : "dashboard";
  });
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [sideOpen, setSideOpen] = useState(false);
  const [scanResult, setScanResult] = useState(null);
  const [scanLoading, setScanLoading] = useState(false);
  const [scanMsg, setScanMsg] = useState("");
  const scannerRef = useRef(null);

  useEffect(() => {
    return () => {
      if (scannerRef.current) {
        scannerRef.current.clear().catch((e) => console.warn(e));
        scannerRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    api
      .get("/student/dashboard")
      .then((r) => setData(r.data.data))
      .catch(() => setError("Failed to load dashboard data."))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    localStorage.setItem(STUDENT_ACTIVE_TAB_KEY, active);
  }, [active]);

  useEffect(() => {
    if (active === "scan-qr") {
      setScanResult(null);
      setScanMsg("");

      const initScanner = () => {
        if (scannerRef.current) {
          scannerRef.current.clear().catch(() => {});
        }

        const scanner = new Html5QrcodeScanner(
          "reader",
          { qrbox: { width: 250, height: 250 }, fps: 10 }
        );
        scannerRef.current = scanner;

        scanner.render(
          (decodedText) => {
            try {
              let extractedSessionId = null;

              if (decodedText.startsWith("http")) {
                const parsedUrl = new URL(decodedText);
                extractedSessionId = parsedUrl.searchParams.get("sessionId");
              } else {
                extractedSessionId = decodedText.trim();
              }

              if (extractedSessionId) {
                scanner.clear();
                scannerRef.current = null;
                setScanResult({ sessionId: extractedSessionId });
              } else {
                setScanMsg("Invalid QR Format. No sessionId found in URL.");
              }
            } catch (err) {
              console.error("QR Parse Error:", err);
              setScanMsg("Invalid QR code scanned.");
            }
          },
          () => {}
        );
      };

      setTimeout(initScanner, 100);
    } else if (scannerRef.current) {
      scannerRef.current.clear().catch(() => {});
      scannerRef.current = null;
    }
  }, [active]);

  const student = data?.student;
  const todayDay = data?.todayDay;
  const todayLectures = data?.todayLectures || [];
  const attendance = data?.attendance;
  const results = data?.results;
  const notices = data?.notices || [];
  const upcomingExams = data?.upcomingExams || [];

  const submitAttendance = () => {
    setScanLoading(true);
    setScanMsg("");
    api
      .post("/student/mark-attendance", {
        studentId: student?.uniqueId,
        sessionId: scanResult?.sessionId,
      })
      .then((res) => {
        setScanMsg(res.data.message || "Attendance marked successfully!");
        setTimeout(() => setActive("dashboard"), 2000);
      })
      .catch((err) => {
        setScanMsg(err.response?.data?.message || "Failed connecting to server.");
      })
      .finally(() => setScanLoading(false));
  };

  const logout = () => {
    localStorage.clear();
    navigate("/login");
  };

  if (loading) {
    return (
      <div className="sd-loader">
        <div className="sd-spinner" />
        <p>Loading your dashboard…</p>
      </div>
    );
  }

  if (error || !data || !student || !attendance || !results) {
    return (
      <div className="sd-loader">
        <p className="sd-error">{error || "Failed to load dashboard data."}</p>
        <button onClick={logout} className="sd-retry-btn">
          Back to Login
        </button>
      </div>
    );
  }

  return (
    <div className="sd-root">
      <aside className={`sd-sidebar ${sideOpen ? "open" : ""}`}>
        <div className="sd-sidebar-header">
          <Icons.Logo />
          <span className="sd-brand">Campus Connect</span>
          <button className="sd-close-btn" onClick={() => setSideOpen(false)}>
            <Icons.Close />
          </button>
        </div>

        <div className="sd-student-pill">
          <div className="sd-avatar">{student.name.charAt(0)}</div>
          <div>
            <p className="sd-pill-name">{student.name}</p>
            <p className="sd-pill-id">
              {student.uniqueId} · Sem {student.semester}
            </p>
          </div>
        </div>

        <nav className="sd-nav">
          {NAV.map(({ key, label, Icon }) => (
            <button
              key={key}
              className={`sd-nav-item ${active === key ? "sd-nav-active" : ""}`}
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

        <button className="sd-logout" onClick={logout}>
          <Icons.Logout />
          <span>Logout</span>
        </button>
      </aside>

      {sideOpen && <div className="sd-overlay" onClick={() => setSideOpen(false)} />}

      <main className="sd-main">
        <header className="sd-topbar">
          <button className="sd-menu-btn" onClick={() => setSideOpen(true)}>
            <Icons.Menu />
          </button>
          <div className="sd-topbar-left">
            <h1 className="sd-page-title">
              {NAV.find((n) => n.key === active)?.label}
            </h1>
            <span className="sd-today-badge">
              {todayDay},{" "}
              {new Date().toLocaleDateString("en-IN", {
                day: "numeric",
                month: "short",
              })}
            </span>
          </div>
          <div className="sd-topbar-right">
            <button className="sd-icon-btn">
              <Icons.Bell />
            </button>
            <div className="sd-top-avatar">{student.name.charAt(0)}</div>
          </div>
        </header>

        <div className="sd-content">
          {active === "dashboard" && (
            <StudentOverviewTab
              student={student}
              todayLectures={todayLectures}
              attendance={attendance}
              results={results}
              notices={notices}
              upcomingExams={upcomingExams}
              getGreeting={getGreeting}
              formatTime={formatTime}
              formatDate={formatDate}
              daysUntil={daysUntil}
              Icons={Icons}
            />
          )}

          {active === "scan-qr" && (
            <StudentScanQrTab
              scanResult={scanResult}
              scanLoading={scanLoading}
              scanMsg={scanMsg}
              setScanResult={setScanResult}
              setScanMsg={setScanMsg}
              submitAttendance={submitAttendance}
              student={student}
              Icons={Icons}
            />
          )}

          {active === "timetable" && (
            <StudentTimetableTab
              student={student}
              todayDay={todayDay}
              todayLectures={todayLectures}
              formatTime={formatTime}
              Icons={Icons}
            />
          )}

          {active === "attendance" && (
            <StudentAttendanceTab attendance={attendance} Icons={Icons} />
          )}

          {active === "results" && (
            <StudentResultsTab
              results={results}
              formatDate={formatDate}
              Icons={Icons}
            />
          )}

          {active === "notices" && (
            <StudentNoticesTab
              notices={notices}
              formatDate={formatDate}
              Icons={Icons}
            />
          )}

          {active === "exams" && (
            <StudentExamsTab
              upcomingExams={upcomingExams}
              formatDate={formatDate}
              daysUntil={daysUntil}
              Icons={Icons}
            />
          )}
        </div>
      </main>
    </div>
  );
}
