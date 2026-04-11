import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Login.css";
import api from "../utils/api";

// ── SVG Icons ────────────────────────────────────────────────────────────────
const LogoMark = () => (
  <svg width="36" height="36" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="36" height="36" rx="10" fill="url(#logoGrad)"/>
    <path d="M18 8L8 13.5V22.5L18 28L28 22.5V13.5L18 8Z" stroke="white" strokeWidth="1.8" strokeLinejoin="round" fill="none"/>
    <path d="M18 8V18M18 18L8 13.5M18 18L28 13.5" stroke="white" strokeWidth="1.8" strokeLinecap="round"/>
    <defs>
      <linearGradient id="logoGrad" x1="0" y1="0" x2="36" y2="36" gradientUnits="userSpaceOnUse">
        <stop stopColor="#2563EB"/>
        <stop offset="1" stopColor="#1D4ED8"/>
      </linearGradient>
    </defs>
  </svg>
);

const StudentSVG = ({ active }) => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M22 10L12 5L2 10L12 15L22 10Z" stroke={active ? "#2563EB" : "#94a3b8"} strokeWidth="2" strokeLinejoin="round"/>
    <path d="M6 12.5V17.5C6 17.5 8.5 20 12 20C15.5 20 18 17.5 18 17.5V12.5" stroke={active ? "#2563EB" : "#94a3b8"} strokeWidth="2" strokeLinecap="round"/>
    <path d="M22 10V15" stroke={active ? "#2563EB" : "#94a3b8"} strokeWidth="2" strokeLinecap="round"/>
  </svg>
);

const FacultySVG = ({ active }) => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="9" cy="7" r="4" stroke={active ? "#2563EB" : "#94a3b8"} strokeWidth="2"/>
    <path d="M2 21C2 17.686 5.134 15 9 15" stroke={active ? "#2563EB" : "#94a3b8"} strokeWidth="2" strokeLinecap="round"/>
    <path d="M15 17L17 19L21 15" stroke={active ? "#2563EB" : "#94a3b8"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <circle cx="18" cy="17" r="5" stroke={active ? "#2563EB" : "#94a3b8"} strokeWidth="2"/>
  </svg>
);

const AdminSVG = ({ active }) => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" stroke={active ? "#2563EB" : "#94a3b8"} strokeWidth="2" strokeLinejoin="round"/>
    <path d="M12 8v4M12 16h.01" stroke={active ? "#2563EB" : "#94a3b8"} strokeWidth="2" strokeLinecap="round"/>
  </svg>
);

const IdSVG = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="2" y="5" width="20" height="14" rx="3" stroke="#94a3b8" strokeWidth="1.8"/>
    <circle cx="8.5" cy="12" r="2.5" stroke="#94a3b8" strokeWidth="1.8"/>
    <path d="M13 10H19" stroke="#94a3b8" strokeWidth="1.8" strokeLinecap="round"/>
    <path d="M13 14H16" stroke="#94a3b8" strokeWidth="1.8" strokeLinecap="round"/>
  </svg>
);

const LockSVG = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="5" y="11" width="14" height="10" rx="2.5" stroke="#94a3b8" strokeWidth="1.8"/>
    <path d="M8 11V7.5C8 5.567 9.791 4 12 4C14.209 4 16 5.567 16 7.5V11" stroke="#94a3b8" strokeWidth="1.8" strokeLinecap="round"/>
    <circle cx="12" cy="16" r="1.5" fill="#94a3b8"/>
  </svg>
);

const EyeSVG = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M2 12C2 12 5.5 5 12 5C18.5 5 22 12 22 12C22 12 18.5 19 12 19C5.5 19 2 12 2 12Z" stroke="#94a3b8" strokeWidth="1.8"/>
    <circle cx="12" cy="12" r="3" stroke="#94a3b8" strokeWidth="1.8"/>
  </svg>
);

const EyeOffSVG = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M17.94 17.94A10.07 10.07 0 0112 20C5.5 20 2 12 2 12A18.45 18.45 0 015.06 5.06" stroke="#94a3b8" strokeWidth="1.8" strokeLinecap="round"/>
    <path d="M9.9 4.24A9.12 9.12 0 0112 4C18.5 4 22 12 22 12C21.37 13.14 20.54 14.27 19.56 15.28" stroke="#94a3b8" strokeWidth="1.8" strokeLinecap="round"/>
    <path d="M3 3L21 21" stroke="#94a3b8" strokeWidth="1.8" strokeLinecap="round"/>
  </svg>
);

const AlertSVG = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="12" cy="12" r="10" stroke="#ef4444" strokeWidth="1.8"/>
    <path d="M12 8V12" stroke="#ef4444" strokeWidth="2" strokeLinecap="round"/>
    <circle cx="12" cy="16" r="1" fill="#ef4444"/>
  </svg>
);

const ArrowSVG = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M5 12H19" stroke="white" strokeWidth="2.2" strokeLinecap="round"/>
    <path d="M13 6L19 12L13 18" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const BuildingSVG = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M3 21H21" stroke="#94a3b8" strokeWidth="1.8" strokeLinecap="round"/>
    <path d="M5 21V7L12 3L19 7V21" stroke="#94a3b8" strokeWidth="1.8" strokeLinejoin="round"/>
    <path d="M9 21V15H15V21" stroke="#94a3b8" strokeWidth="1.8" strokeLinejoin="round"/>
    <path d="M9 11H9.01M12 11H12.01M15 11H15.01" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round"/>
  </svg>
);

const ShieldSVG = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 3L4 7V13C4 17.418 7.582 21 12 21C16.418 21 20 17.418 20 13V7L12 3Z" stroke="#22c55e" strokeWidth="1.8" strokeLinejoin="round"/>
    <path d="M9 12L11 14L15 10" stroke="#22c55e" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const PENDING_SCAN_PATH_KEY = "pendingScanPath";

// ── Component ─────────────────────────────────────────────────────────────────
export default function Login() {
  const navigate = useNavigate();
  const [role, setRole] = useState("student");
  const [uniqueId, setUniqueId] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    if (!uniqueId.trim() || !password) {
      setError("Please enter both ID and Password.");
      return;
    }
    setLoading(true);
    try {
      const res = await api.post("/auth/login", {
        uniqueId: uniqueId.trim(),
        password,
        role,
      });
      if (res.data.success) {
        localStorage.setItem("token", res.data.token);
        localStorage.setItem("user", JSON.stringify(res.data.user));
        const pendingScanPath = localStorage.getItem(PENDING_SCAN_PATH_KEY);

        if (res.data.user.role === "student" && pendingScanPath) {
          localStorage.removeItem(PENDING_SCAN_PATH_KEY);
          navigate(pendingScanPath);
        } else if (res.data.user.role === "student") {
          navigate("/student/dashboard");
        } else if (res.data.user.role === "admin") {
          localStorage.removeItem(PENDING_SCAN_PATH_KEY);
          navigate("/admin/dashboard");
        } else {
          localStorage.removeItem(PENDING_SCAN_PATH_KEY);
          navigate("/faculty/dashboard");
        }
      }
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page">
      {/* ── Left Panel ── */}
      <div className="left-panel">
        <div className="left-content">
          <div className="left-logo">
            <LogoMark />
            <span className="left-logo-text">Campus Connect</span>
          </div>

          <div className="left-hero">
            <h2 className="left-title">
              Welcome to your <br />
              <span className="left-title-accent">Academic Hub</span>
            </h2>
            <p className="left-desc">
              A unified portal for students and faculty to manage academics, attendance, results, and more — all in one place.
            </p>
          </div>

          <div className="left-features">
            <div className="feature-item">
              <div className="feature-dot" />
              <span>Real-time attendance tracking</span>
            </div>
            <div className="feature-item">
              <div className="feature-dot" />
              <span>Instant result announcements</span>
            </div>
            <div className="feature-item">
              <div className="feature-dot" />
              <span>Campus notices & timetables</span>
            </div>
            <div className="feature-item">
              <div className="feature-dot" />
              <span>Secure role-based access</span>
            </div>
          </div>

          <div className="left-badge">
            <ShieldSVG />
            <span>Secured & encrypted access</span>
          </div>
        </div>

        {/* Decorative circles */}
        <div className="deco-circle deco-1" />
        <div className="deco-circle deco-2" />
        <div className="deco-circle deco-3" />
      </div>

      {/* ── Right Panel ── */}
      <div className="right-panel">
        <div className="form-card">

          {/* Top bar */}
          <div className="form-topbar">
            <div className="form-logo">
              <LogoMark />
              <span className="form-logo-text">Campus Connect</span>
            </div>
            <div className="form-inst">
              <BuildingSVG />
              <span>Institution Portal</span>
            </div>
          </div>

          {/* Heading */}
          <div className="form-heading">
            <h1 className="form-title">Sign in to your account</h1>
            <p className="form-sub">Use your institution-issued credentials to continue</p>
          </div>

          {/* Role Selector */}
          <div className="role-selector">
            <button
              type="button"
              className={`role-card ${role === "student" ? "role-active" : ""}`}
              onClick={() => { setRole("student"); setError(""); }}
            >
              <div className={`role-card-icon ${role === "student" ? "icon-active" : ""}`}>
                <StudentSVG active={role === "student"} />
              </div>
              <div className="role-card-text">
                <span className="role-card-title">Student</span>
                <span className="role-card-sub">Academic access</span>
              </div>
              <div className={`role-radio ${role === "student" ? "radio-checked" : ""}`}>
                {role === "student" && <div className="radio-dot" />}
              </div>
            </button>

            <button
              type="button"
              className={`role-card ${role === "faculty" ? "role-active" : ""}`}
              onClick={() => { setRole("faculty"); setError(""); }}
            >
              <div className={`role-card-icon ${role === "faculty" ? "icon-active" : ""}`}>
                <FacultySVG active={role === "faculty"} />
              </div>
              <div className="role-card-text">
                <span className="role-card-title">Professor</span>
                <span className="role-card-sub">Faculty access</span>
              </div>
              <div className={`role-radio ${role === "faculty" ? "radio-checked" : ""}`}>
                {role === "faculty" && <div className="radio-dot" />}
              </div>
            </button>
          </div>

          {/* Divider */}
          <div className="divider">
            <span className="divider-line" />
            <span className="divider-text">Enter credentials</span>
            <span className="divider-line" />
          </div>

          {/* Form */}
          <form onSubmit={handleLogin} className="login-form" noValidate>

            <div className="field">
              <label className="field-label">
                {role === "student" ? "Student ID" : "Faculty ID"}
              </label>
              <div className={`field-input-wrap ${uniqueId ? "has-value" : ""}`}>
                <span className="field-icon"><IdSVG /></span>
                <input
                  type="text"
                  className="field-input"
                  placeholder={role === "student" ? "Enter your Student ID" : "Enter your Faculty ID"}
                  value={uniqueId}
                  onChange={(e) => setUniqueId(e.target.value)}
                  autoComplete="username"
                  spellCheck={false}
                />
              </div>
            </div>

            <div className="field">
              <div className="field-label-row">
                <label className="field-label">Password</label>
              </div>
              <div className={`field-input-wrap ${password ? "has-value" : ""}`}>
                <span className="field-icon"><LockSVG /></span>
                <input
                  type={showPassword ? "text" : "password"}
                  className="field-input"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  className="eye-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                  tabIndex={-1}
                  aria-label="Toggle password visibility"
                >
                  {showPassword ? <EyeOffSVG /> : <EyeSVG />}
                </button>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="error-alert" role="alert">
                <AlertSVG />
                <span>{error}</span>
              </div>
            )}

            {/* Submit */}
            <button type="submit" className="submit-btn" disabled={loading}>
              {loading ? (
                <span className="btn-spinner" />
              ) : (
                <>
                  <span>Sign in as {role === "student" ? "Student" : "Professor"}</span>
                  <ArrowSVG />
                </>
              )}
            </button>
          </form>

          {/* Footer note */}
          <p className="card-footer">
            Credentials are assigned by your institution. Contact your administrator if you're unable to log in.
          </p>
        </div>
      </div>
    </div>
  );
}
