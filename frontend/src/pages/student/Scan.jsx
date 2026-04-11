import React, { useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import "./Scan.css";
import api from "../../utils/api";

const PENDING_SCAN_PATH_KEY = "pendingScanPath";

export default function Scan() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const location = useLocation();
  const submitOnceRef = useRef(false);

  const sessionId = searchParams.get("sessionId");
  const token = searchParams.get("token");
  const user = useMemo(() => JSON.parse(localStorage.getItem("user") || "null"), []);
  const authToken = localStorage.getItem("token");

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const pendingPath = `${location.pathname}${location.search}`;
  const hasValidQrParams = Boolean(sessionId) && Boolean(token);
  const isLoggedInStudent = Boolean(authToken) && user?.role === "student";

  const handleMarkAttendance = async () => {
    if (!hasValidQrParams) {
      setError("Invalid QR code. Please scan the latest QR again.");
      return;
    }

    setLoading(true);
    setMessage("");
    setError("");

    try {
      const res = await api.post("/student/mark-attendance", {
        sessionId,
        token,
      });

      if (res.data.success) {
        localStorage.removeItem(PENDING_SCAN_PATH_KEY);
        setMessage(res.data.message || "Attendance marked successfully!");
      } else {
        setError(res.data.message || "Failed to mark attendance.");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Error connecting to server.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!hasValidQrParams || !isLoggedInStudent || submitOnceRef.current) {
      return;
    }

    submitOnceRef.current = true;
    handleMarkAttendance();
  }, [hasValidQrParams, isLoggedInStudent, handleMarkAttendance]);

  const handleLoginRedirect = () => {
    localStorage.setItem(PENDING_SCAN_PATH_KEY, pendingPath);
    navigate("/login");
  };

  if (!hasValidQrParams) {
    return (
      <div className="scan-root">
        <div className="scan-box">
          <h2 className="scan-title text-red">Error</h2>
          <p className="scan-desc">Invalid or missing session details in the QR. Please scan the latest QR again.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="scan-root">
      <div className="scan-box">
        <h2 className="scan-title">QR Attendance</h2>
        <p className="scan-desc">
          Session <strong>{sessionId}</strong> ke liye attendance mark ho rahi hai.
        </p>

        {message ? (
          <div className="scan-success">
            <svg viewBox="0 0 24 24" fill="none" width="48" height="48" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 11.08V12a10 10 0 11-5.93-9.14" />
              <polyline points="22 4 12 14.01 9 11.01" />
            </svg>
            <h3>{message}</h3>
            <p>You can now close this tab.</p>
          </div>
        ) : !isLoggedInStudent ? (
          <div className="scan-status">
            <p className="scan-note">
              Mobile par attendance mark karne ke liye pehle student login zaroori hai.
            </p>
            {user && user.role !== "student" ? (
              <div className="scan-error-msg">Current login student account nahi hai. Student account se login karo.</div>
            ) : null}
            <div className="scan-actions">
              <button type="button" className="scan-btn" onClick={handleLoginRedirect}>
                Login as Student
              </button>
            </div>
          </div>
        ) : (
          <div className="scan-status">
            <div className="scan-loader" />
            <h3 className="scan-status-title">
              {loading ? "Attendance submit ho rahi hai..." : "Attendance ready to submit"}
            </h3>
            <p className="scan-note">
              Agar auto submit fail ho jaye to niche wala button dubara try karega.
            </p>
            {error ? <div className="scan-error-msg">{error}</div> : null}
            <div className="scan-actions">
              <button type="button" className="scan-btn" onClick={handleMarkAttendance} disabled={loading}>
                {loading ? "Submitting..." : "Retry Mark Attendance"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
