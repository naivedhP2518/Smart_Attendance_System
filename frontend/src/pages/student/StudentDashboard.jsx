import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Html5QrcodeScanner } from "html5-qrcode";
import "./StudentDashboard.css";

// ── Axios instance ────────────────────────────────────────────
const api = axios.create({ baseURL: "http://localhost:5000/api" });
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// ── SVG Icons ─────────────────────────────────────────────────
const Icons = {
  Logo: () => (
    <svg width="28" height="28" viewBox="0 0 36 36" fill="none">
      <rect width="36" height="36" rx="9" fill="url(#lg)"/>
      <path d="M18 8L8 13.5V22.5L18 28L28 22.5V13.5L18 8Z" stroke="white" strokeWidth="1.8" strokeLinejoin="round" fill="none"/>
      <path d="M18 8V18M18 18L8 13.5M18 18L28 13.5" stroke="white" strokeWidth="1.8" strokeLinecap="round"/>
      <defs><linearGradient id="lg" x1="0" y1="0" x2="36" y2="36"><stop stopColor="#2563EB"/><stop offset="1" stopColor="#1D4ED8"/></linearGradient></defs>
    </svg>
  ),
  Bell: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
    </svg>
  ),
  Logout: () => (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none">
      <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  Clock: () => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.8"/>
      <path d="M12 6v6l4 2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
    </svg>
  ),
  Book: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path d="M4 19.5A2.5 2.5 0 016.5 17H20" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round"/>
    </svg>
  ),
  Chart: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path d="M18 20V10M12 20V4M6 20v-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  ),
  Award: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="8" r="6" stroke="currentColor" strokeWidth="1.8"/>
      <path d="M15.477 12.89L17 22l-5-3-5 3 1.523-9.11" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round"/>
    </svg>
  ),
  Notice: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round"/>
      <path d="M14 2v6h6M16 13H8M16 17H8M10 9H8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
    </svg>
  ),
  Exam: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <rect x="3" y="4" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="1.8"/>
      <path d="M16 2v4M8 2v4M3 10h18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
      <path d="M8 14h.01M12 14h.01M16 14h.01M8 18h.01M12 18h.01" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
    </svg>
  ),
  MapPin: () => (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
      <path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0118 0z" stroke="currentColor" strokeWidth="1.8"/>
      <circle cx="12" cy="10" r="3" stroke="currentColor" strokeWidth="1.8"/>
    </svg>
  ),
  User: () => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="7" r="4" stroke="currentColor" strokeWidth="1.8"/>
      <path d="M4 21c0-4 3.582-7 8-7s8 3 8 7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
    </svg>
  ),
  Warning: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
      <path d="M10.29 3.86L1.82 18A2 2 0 003.54 21H20.46A2 2 0 0022.18 18L13.71 3.86A2 2 0 0010.29 3.86z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round"/>
      <path d="M12 9v4M12 17h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  ),
  Users: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
      <circle cx="9" cy="7" r="4" stroke="currentColor" strokeWidth="1.8"/>
      <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
    </svg>
  ),
  Scan: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <rect x="3" y="3" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="1.8"/>
      <rect x="14" y="3" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="1.8"/>
      <rect x="3" y="14" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="1.8"/>
      <path d="M14 14h3v3h-3z" stroke="currentColor" strokeWidth="1.8"/>
      <path d="M17 17h4v4h-4z" stroke="currentColor" strokeWidth="1.8"/>
      <path d="M21 14v3M14 21v-4" stroke="currentColor" strokeWidth="1.8"/>
    </svg>
  ),
  Menu: () => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <path d="M3 12h18M3 6h18M3 18h18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  ),
  Close: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  ),
};

// ── Greeting helper ───────────────────────────────────────────
const getGreeting = () => {
  const h = new Date().getHours();
  if (h < 12) return "Good Morning";
  if (h < 17) return "Good Afternoon";
  return "Good Evening";
};

const formatTime  = (t) => {
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

// ── Sidebar nav items ─────────────────────────────────────────
const NAV = [
  { key: "dashboard", label: "Dashboard",  Icon: Icons.Chart  },
  { key: "scan-qr",   label: "Scan QR Attendance", Icon: Icons.Scan },
  { key: "timetable", label: "Timetable",  Icon: Icons.Clock  },
  { key: "attendance",label: "Attendance", Icon: Icons.Book   },
  { key: "results",   label: "Results",    Icon: Icons.Award  },
  { key: "notices",   label: "Notices",    Icon: Icons.Notice },
  { key: "exams",     label: "Exams",      Icon: Icons.Exam   },
];

// ═════════════════════════════════════════════════════════════
export default function StudentDashboard() {
  const navigate   = useNavigate();
  const [active, setActive]     = useState("dashboard");
  const [data,   setData]       = useState(null);
  const [loading, setLoading]   = useState(true);
  const [error,   setError]     = useState("");
  const [sideOpen, setSideOpen] = useState(false);

  // Scanner states
  const [scanResult, setScanResult] = useState(null);
  const [scanLoading, setScanLoading] = useState(false);
  const [scanMsg, setScanMsg]   = useState("");
  const scannerRef = useRef(null);

  const user = JSON.parse(localStorage.getItem("user") || "{}");

  // Cleanup scanner on exit/tab switch
  useEffect(() => {
    return () => {
      if (scannerRef.current) {
         scannerRef.current.clear().catch(e => console.warn(e));
         scannerRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    api.get("/student/dashboard")
      .then((r) => setData(r.data.data))
      .catch(() => setError("Failed to load dashboard data."))
      .finally(() => setLoading(false));
  }, []);

  // QR Scanning Init
  useEffect(() => {
     if (active === "scan-qr") {
        setScanResult(null);
        setScanMsg("");
        
        const initScanner = () => {
           if (scannerRef.current) {
              scannerRef.current.clear().catch(() => {});
           }
           const scanner = new Html5QrcodeScanner("reader", { qrbox: { width: 250, height: 250 }, fps: 10 });
           scannerRef.current = scanner;
           
           scanner.render((decodedText) => {
              try {
                 let extractedSessionId = null;

                 // Check if it's a valid URL string
                 if (decodedText.startsWith("http")) {
                    const parsedUrl = new URL(decodedText);
                    extractedSessionId = parsedUrl.searchParams.get("sessionId");
                 } else {
                    // Fallback if the QR somehow just holds the sessionId directly
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
           }, () => {});
        };

        setTimeout(initScanner, 100); // Wait for DOM
     } else if (scannerRef.current) {
        scannerRef.current.clear().catch(() => {});
        scannerRef.current = null;
     }
  }, [active]);

  const submitAttendance = () => {
     setScanLoading(true);
     setScanMsg("");
     api.post("/student/mark-attendance", {
       studentId: student?.uniqueId,
       sessionId: scanResult?.sessionId
     })
     .then(res => {
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

  if (loading) return (
    <div className="sd-loader">
      <div className="sd-spinner" />
      <p>Loading your dashboard…</p>
    </div>
  );

  if (error) return (
    <div className="sd-loader">
      <p className="sd-error">{error}</p>
      <button onClick={logout} className="sd-retry-btn">Back to Login</button>
    </div>
  );

  const { student, todayDay, todayLectures, nextLecture,
          attendance, results, notices, upcomingExams } = data;

  return (
    <div className="sd-root">

      {/* ── Sidebar ─────────────────────────────────────── */}
      <aside className={`sd-sidebar ${sideOpen ? "open" : ""}`}>
        <div className="sd-sidebar-header">
          <Icons.Logo />
          <span className="sd-brand">Campus Connect</span>
          <button className="sd-close-btn" onClick={() => setSideOpen(false)}><Icons.Close /></button>
        </div>

        <div className="sd-student-pill">
          <div className="sd-avatar">{student.name.charAt(0)}</div>
          <div>
            <p className="sd-pill-name">{student.name}</p>
            <p className="sd-pill-id">{student.uniqueId} · Sem {student.semester}</p>
          </div>
        </div>

        <nav className="sd-nav">
          {NAV.map(({ key, label, Icon }) => (
            <button
              key={key}
              className={`sd-nav-item ${active === key ? "sd-nav-active" : ""}`}
              onClick={() => { setActive(key); setSideOpen(false); }}
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

      {/* ── Main ────────────────────────────────────────── */}
      <main className="sd-main">

        {/* Topbar */}
        <header className="sd-topbar">
          <button className="sd-menu-btn" onClick={() => setSideOpen(true)}><Icons.Menu /></button>
          <div className="sd-topbar-left">
            <h1 className="sd-page-title">
              {NAV.find((n) => n.key === active)?.label}
            </h1>
            <span className="sd-today-badge">{todayDay}, {new Date().toLocaleDateString("en-IN", { day: "numeric", month: "short" })}</span>
          </div>
          <div className="sd-topbar-right">
            <button className="sd-icon-btn"><Icons.Bell /></button>
            <div className="sd-top-avatar">{student.name.charAt(0)}</div>
          </div>
        </header>

        <div className="sd-content">

          {/* ══ DASHBOARD TAB ══════════════════════════════ */}
          {active === "dashboard" && (
            <div className="sd-tab">

              {/* Greeting */}
              <div className="sd-greeting-card">
                <div>
                  <p className="sd-greeting-text">{getGreeting()},</p>
                  <h2 className="sd-greeting-name">{student.name} 👋</h2>
                  <p className="sd-greeting-sub">{student.branch} · Semester {student.semester}</p>
                </div>
                <div className="sd-greeting-stat">
                  <span className="sd-greeting-stat-val">{todayLectures.length}</span>
                  <span className="sd-greeting-stat-label">lectures today</span>
                </div>
              </div>

              {/* Attendance warning */}
              {attendance.isLow && (
                <div className="sd-warning-banner">
                  <Icons.Warning />
                  <span>Your overall attendance is <strong>{attendance.overall}%</strong> — below the required 75%. Please attend more classes.</span>
                </div>
              )}

              {/* Stats row */}
              <div className="sd-stats-row">
                <div className="sd-stat-card sd-stat-blue">
                  <div className="sd-stat-icon"><Icons.Book /></div>
                  <div>
                    <p className="sd-stat-val">{todayLectures.length}</p>
                    <p className="sd-stat-label">Today's Lectures</p>
                  </div>
                </div>
                <div className={`sd-stat-card ${attendance.overall >= 75 ? "sd-stat-green" : "sd-stat-red"}`}>
                  <div className="sd-stat-icon"><Icons.Chart /></div>
                  <div>
                    <p className="sd-stat-val">{attendance.overall}%</p>
                    <p className="sd-stat-label">Overall Attendance</p>
                  </div>
                </div>
                <div className="sd-stat-card sd-stat-purple">
                  <div className="sd-stat-icon"><Icons.Award /></div>
                  <div>
                    <p className="sd-stat-val">{results.cpi ?? "—"}</p>
                    <p className="sd-stat-label">Current CPI</p>
                  </div>
                </div>
                <div className="sd-stat-card sd-stat-orange">
                  <div className="sd-stat-icon"><Icons.Exam /></div>
                  <div>
                    <p className="sd-stat-val">{upcomingExams.length}</p>
                    <p className="sd-stat-label">Upcoming Exams</p>
                  </div>
                </div>
              </div>

              {/* Today's lectures + Next lecture */}
              <div className="sd-two-col">
                <div className="sd-panel">
                  <div className="sd-panel-header">
                    <Icons.Clock />
                    <h3>Today's Schedule</h3>
                    <span className="sd-panel-badge">{todayLectures.length} lectures</span>
                  </div>
                  {todayLectures.length === 0 ? (
                    <p className="sd-empty">No lectures today 🎉</p>
                  ) : (
                    <div className="sd-lecture-list">
                      {todayLectures.map((lec, i) => (
                        <div key={i} className="sd-lecture-row">
                          <div className="sd-lecture-time">
                            <span>{formatTime(lec.startTime)}</span>
                            <span className="sd-lecture-end">{formatTime(lec.endTime)}</span>
                          </div>
                          <div className="sd-lecture-bar" />
                          <div className="sd-lecture-info">
                            <p className="sd-lecture-name">{lec.subject}</p>
                            <p className="sd-lecture-meta">
                              <Icons.User /> {lec.faculty} &nbsp;·&nbsp;
                              <Icons.MapPin /> {lec.room}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="sd-panel">
                  <div className="sd-panel-header">
                    <Icons.Notice />
                    <h3>Recent Notices</h3>
                  </div>
                  {notices.length === 0 ? (
                    <p className="sd-empty">No notices yet.</p>
                  ) : (
                    <div className="sd-notice-list">
                      {notices.slice(0, 3).map((n, i) => (
                        <div key={i} className={`sd-notice-item ${n.priority === "high" ? "notice-high" : "notice-medium"}`}>
                          <div className="sd-notice-dot" />
                          <div>
                            <p className="sd-notice-title">{n.title}</p>
                            <p className="sd-notice-date">{formatDate(n.createdAt)}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Upcoming exams preview */}
              {upcomingExams.length > 0 && (
                <div className="sd-panel">
                  <div className="sd-panel-header">
                    <Icons.Exam />
                    <h3>Upcoming Exams</h3>
                  </div>
                  <div className="sd-exam-grid">
                    {upcomingExams.map((ex, i) => {
                      const days = daysUntil(ex.examDate);
                      return (
                        <div key={i} className="sd-exam-card">
                          <div className={`sd-exam-days ${days <= 3 ? "days-urgent" : days <= 7 ? "days-soon" : "days-ok"}`}>
                            <span className="sd-exam-days-num">{days}</span>
                            <span className="sd-exam-days-label">days</span>
                          </div>
                          <div className="sd-exam-info">
                            <p className="sd-exam-subject">{ex.subject}</p>
                            <p className="sd-exam-meta">{formatDate(ex.examDate)} · {ex.room}</p>
                            <span className="sd-exam-type">{ex.type}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ══ SCAN QR TAB ════════════════════════════════ */}
          {active === "scan-qr" && (
            <div className="sd-tab">
               <div className="sd-panel" style={{ maxWidth: '600px', margin: '0 auto', overflow: 'hidden' }}>
                  <div className="sd-panel-header">
                     <Icons.Scan />
                     <h3>Scan Lecture QR</h3>
                  </div>
                  <div style={{ padding: '24px', textAlign: 'center' }}>
                     {!scanResult ? (
                       <>
                         <p className="sd-txt-mute" style={{ marginBottom: '16px' }}>Point your camera at the active projection code to record attendance.</p>
                         <div id="reader" style={{ width: "100%", overflow: "hidden", borderRadius: "12px", border: "1px solid var(--slate-200)" }}></div>
                         {scanMsg && <div className="sd-error-msg" style={{ marginTop: '16px', background: 'var(--red-50)', color: 'var(--red-600)', padding: '12px', borderRadius: '8px', fontSize: '14px' }}>{scanMsg}</div>}
                       </>
                     ) : (
                       <div className="sd-scan-success-flow" style={{ display: 'flex', flexDirection: 'column', gap: '20px', alignItems: 'center' }}>
                         <div style={{ padding: '20px', background: 'var(--blue-50)', borderRadius: '12px', width: '100%', color: 'var(--blue-700)' }}>
                           <h2 style={{ fontSize: '20px', marginBottom: '12px', color: 'var(--blue-600)' }}>QR Scanned!</h2>
                           <p style={{ marginBottom: '8px' }}><strong>Session ID:</strong> <span style={{ color: 'var(--blue-600)' }}>{scanResult.sessionId}</span></p>
                           <p><strong>Student:</strong> <span style={{ color: 'var(--blue-600)' }}>{student.uniqueId}</span> </p>
                         </div>
                         
                         {scanMsg && (
                           <div className="sd-success-msg" style={{ padding: '16px', borderRadius: '8px', background: scanMsg.includes("success") || scanMsg.includes("marked") || scanMsg.includes("already") ? 'var(--green-50)' : 'var(--red-50)', color: scanMsg.includes("success") || scanMsg.includes("marked") || scanMsg.includes("already") ? 'var(--green-600)' : 'var(--red-600)', width: '100%', fontWeight: '600' }}>
                             {scanMsg.includes("success") || scanMsg.includes("marked") ? <Icons.Award /> : <Icons.Warning />} {scanMsg}
                           </div>
                         )}

                         <button 
                            className="sd-btn-primary"
                            onClick={submitAttendance}
                            disabled={scanLoading || scanMsg.includes("success") || scanMsg.includes("marked") || scanMsg.includes("already")}
                            style={{ padding: '14px 24px', fontSize: '16px', width: '100%', borderRadius: '12px' }}
                          >
                            {scanLoading ? "Submitting..." : (scanMsg.includes("success") || scanMsg.includes("marked") || scanMsg.includes("already") ? "Attendance Recorded" : "Submit Present")}
                         </button>
                         
                         <button className="sd-btn-danger" onClick={() => { setScanResult(null); setScanMsg(""); }} style={{ width: '100%', background: 'transparent', color: 'var(--slate-500)', border: '1px solid var(--slate-200)', borderRadius: '12px', padding: '12px' }}>
                           Cancel & Rescan
                         </button>
                       </div>
                     )}
                  </div>
               </div>
            </div>
          )}

          {/* ══ TIMETABLE TAB ══════════════════════════════ */}
          {active === "timetable" && (
            <div className="sd-tab">
              <div className="sd-panel">
                <div className="sd-panel-header">
                  <Icons.Clock />
                  <h3>Weekly Timetable</h3>
                  <span className="sd-panel-badge">{student.branch} · Sem {student.semester}</span>
                </div>
                {["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"].map((day) => {
                  const lectures = data.todayLectures && day === todayDay
                    ? todayLectures
                    : [];
                  // For other days we'd need full timetable API — show today's data for now
                  return null;
                })}
                {/* Show today's full schedule */}
                <div className="sd-tt-day-block">
                  <div className="sd-tt-day-label today-label">
                    {todayDay} <span className="today-chip">Today</span>
                  </div>
                  {todayLectures.length === 0 ? (
                    <p className="sd-empty" style={{paddingLeft:"16px"}}>No lectures today</p>
                  ) : (
                    todayLectures.map((lec, i) => (
                      <div key={i} className="sd-tt-row">
                        <span className="sd-tt-time">{formatTime(lec.startTime)} – {formatTime(lec.endTime)}</span>
                        <span className="sd-tt-subject">{lec.subject}</span>
                        <span className="sd-tt-code">{lec.subjectCode}</span>
                        <span className="sd-tt-faculty">{lec.faculty}</span>
                        <span className="sd-tt-room"><Icons.MapPin /> {lec.room}</span>
                      </div>
                    ))
                  )}
                </div>
                <p className="sd-tip">💡 Full weekly timetable loads from the timetable API — connect <code>/api/student/timetable</code> to show all days.</p>
              </div>
            </div>
          )}


          {/* ══ ATTENDANCE TAB ═════════════════════════════ */}
          {active === "attendance" && (
            <div className="sd-tab">
              {attendance.isLow && (
                <div className="sd-warning-banner">
                  <Icons.Warning />
                  <span>Overall attendance is <strong>{attendance.overall}%</strong> — below 75%. You need to attend more classes.</span>
                </div>
              )}
              <div className="sd-panel">
                <div className="sd-panel-header">
                  <Icons.Chart />
                  <h3>Subject-wise Attendance</h3>
                  <span className={`sd-panel-badge ${attendance.overall < 75 ? "badge-red" : "badge-green"}`}>
                    Overall: {attendance.overall}%
                  </span>
                </div>
                <div className="sd-attendance-list">
                  {attendance.subjects.map((sub, i) => (
                    <div key={i} className="sd-att-row">
                      <div className="sd-att-top">
                        <div>
                          <p className="sd-att-subject">{sub.subject}</p>
                          <p className="sd-att-code">{sub.subjectCode} · {sub.totalAttended}/{sub.totalHeld} lectures</p>
                        </div>
                        <div className="sd-att-right">
                          <span className={`sd-att-pct ${sub.status === "safe" ? "pct-green" : sub.status === "warning" ? "pct-yellow" : "pct-red"}`}>
                            {sub.percentage}%
                          </span>
                          {sub.lecturesNeeded > 0 && (
                            <span className="sd-att-needed">Need {sub.lecturesNeeded} more</span>
                          )}
                        </div>
                      </div>
                      <div className="sd-att-bar-bg">
                        <div
                          className={`sd-att-bar-fill ${sub.status === "safe" ? "fill-green" : sub.status === "warning" ? "fill-yellow" : "fill-red"}`}
                          style={{ width: `${sub.percentage}%` }}
                        />
                        <div className="sd-att-bar-mark" style={{ left: "75%" }} title="75% required" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ══ RESULTS TAB ════════════════════════════════ */}
          {active === "results" && (
            <div className="sd-tab">
              <div className="sd-results-top">
                <div className="sd-cpi-card">
                  <p className="sd-cpi-label">Cumulative Performance Index</p>
                  <p className="sd-cpi-val">{results.cpi ?? "—"}</p>
                  <p className="sd-cpi-sub">Based on {results.history.length} semesters</p>
                </div>
                {results.latest && (
                  <div className="sd-spi-card">
                    <p className="sd-cpi-label">Latest SPI</p>
                    <p className="sd-cpi-val">{results.latest.spi}</p>
                    <p className="sd-cpi-sub">Semester {results.latest.semester} · Grade {results.latest.grade}</p>
                  </div>
                )}
              </div>
              <div className="sd-panel">
                <div className="sd-panel-header">
                  <Icons.Award />
                  <h3>Semester Results</h3>
                </div>
                <div className="sd-results-table">
                  <div className="sd-results-thead">
                    <span>Semester</span>
                    <span>SPI</span>
                    <span>Grade</span>
                    <span>Declared</span>
                  </div>
                  {results.history.map((r, i) => (
                    <div key={i} className="sd-results-trow">
                      <span>Semester {r.semester}</span>
                      <span className="sd-spi-chip">{r.spi}</span>
                      <span className={`sd-grade-chip grade-${r.grade}`}>{r.grade}</span>
                      <span>{formatDate(r.declaredAt)}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ══ NOTICES TAB ════════════════════════════════ */}
          {active === "notices" && (
            <div className="sd-tab">
              <div className="sd-panel">
                <div className="sd-panel-header">
                  <Icons.Notice />
                  <h3>All Notices</h3>
                  <span className="sd-panel-badge">{notices.length} notices</span>
                </div>
                <div className="sd-notices-full">
                  {notices.map((n, i) => (
                    <div key={i} className={`sd-notice-full-item ${n.priority === "high" ? "nf-high" : "nf-medium"}`}>
                      <div className="sd-nf-left">
                        <span className={`sd-nf-priority ${n.priority === "high" ? "pri-high" : "pri-medium"}`}>
                          {n.priority === "high" ? "Important" : "General"}
                        </span>
                        <h4 className="sd-nf-title">{n.title}</h4>
                        <p className="sd-nf-content">{n.content}</p>
                      </div>
                      <p className="sd-nf-date">{formatDate(n.createdAt)}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ══ EXAMS TAB ══════════════════════════════════ */}
          {active === "exams" && (
            <div className="sd-tab">
              <div className="sd-panel">
                <div className="sd-panel-header">
                  <Icons.Exam />
                  <h3>Exam Schedule</h3>
                  <span className="sd-panel-badge">{upcomingExams.length} upcoming</span>
                </div>
                {upcomingExams.length === 0 ? (
                  <p className="sd-empty">No upcoming exams scheduled.</p>
                ) : (
                  <div className="sd-exam-full-list">
                    {upcomingExams.map((ex, i) => {
                      const days = daysUntil(ex.examDate);
                      return (
                        <div key={i} className="sd-exam-full-row">
                          <div className={`sd-exam-countdown ${days <= 3 ? "days-urgent" : days <= 7 ? "days-soon" : "days-ok"}`}>
                            <span className="sd-exam-days-num">{days}</span>
                            <span className="sd-exam-days-label">days left</span>
                          </div>
                          <div className="sd-exam-full-info">
                            <p className="sd-exam-full-name">{ex.subject} <span className="sd-exam-full-code">({ex.subjectCode})</span></p>
                            <div className="sd-exam-full-meta">
                              <span><Icons.Clock /> {formatDate(ex.examDate)}</span>
                              <span><Icons.MapPin /> {ex.room}</span>
                              <span>⏱ {ex.duration}</span>
                            </div>
                          </div>
                          <span className="sd-exam-type-badge">{ex.type}</span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}

        </div>
      </main>
    </div>
  );
}