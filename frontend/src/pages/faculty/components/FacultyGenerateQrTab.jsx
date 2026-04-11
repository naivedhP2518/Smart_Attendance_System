import { useState } from "react";

export default function FacultyGenerateQrTab({
  todayLectures,
  selectedLecture,
  qrCode,
  qrTimer,
  sessionTimer,
  handleGenerateQR,
  handleRefreshQR,
  handleEndSession,
  liveAttendees,
  sessionStatusMap,
  sessionId,
  Icons,
}) {
  const isSessionActive = Boolean(qrCode) && (Boolean(sessionId) || qrTimer > 0);
  const RefreshIcon = Icons.RefreshCw || Icons.QrCode;
  const [restartLecture, setRestartLecture] = useState(null);
  const [restartReason, setRestartReason] = useState("");

  const formatCountdown = (seconds) => {
    const safeSeconds = Math.max(seconds || 0, 0);
    return `${Math.floor(safeSeconds / 60).toString().padStart(2, "0")}:${(safeSeconds % 60)
      .toString()
      .padStart(2, "0")}`;
  };

  const triggerRestart = (mode) => {
    handleGenerateQR(restartLecture, {
      carryForward: mode === "add",
      mode: mode, // "add" or "fresh"
      reason: restartReason
    });
    setRestartLecture(null);
    setRestartReason("");
  };

  return (
    <div className="fd-tab">
      {!isSessionActive ? (
        /* State A: Full width Lectures list (No active session) */
        <div className="fd-panel fd-lecture-panel full-width">
          <div className="fd-panel-header">
            <Icons.QrCode />
            <h3>Today's Lectures</h3>
          </div>
          {!todayLectures || todayLectures.length === 0 ? (
            <p className="fd-empty">No lectures scheduled for today.</p>
          ) : (
            <div className="fd-lecture-grid">
              {todayLectures.map((lec, i) => {
                const status = sessionStatusMap[lec.subjectCode] || "pending";
                const isCompleted = status === "completed";

                return (
                  <div
                    key={i}
                    className={`fd-lecture-card ${isCompleted ? "completed" : ""}`}
                  >
                    <div className="fd-lc-top">
                      <h4 className="fd-lc-subject">{lec.subject}</h4>
                      <div className="fd-status-badges">
                        {isCompleted && <span className="fd-badge done">COMPLETED</span>}
                        {!isCompleted && <span className="fd-badge">PENDING</span>}
                      </div>
                    </div>
                    <div className="fd-lc-mid">
                      <p className="fd-lc-time">
                        {lec.startTime} - {lec.endTime}
                      </p>
                      <span className="fd-lc-code">{lec.subjectCode}</span>
                    </div>
                    {isCompleted ? (
                      <button
                        className="fd-btn-outline fd-lc-btn"
                        onClick={() => setRestartLecture(lec)}
                      >
                        <RefreshIcon />
                        Restart Session
                      </button>
                    ) : (
                      <button
                        className="fd-btn-primary fd-lc-btn"
                        onClick={() => handleGenerateQR(lec)}
                      >
                        Generate QR
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      ) : (
        /* State B: Full width Live Workspace (Active session) */
        <div className="fd-panel fd-qr-display-panel full-workspace-active">
          {/* ... (keep same) */}
          <div className="fd-panel-header">
            <div className="fd-ph-left">
              <button className="fd-back-btn" onClick={handleEndSession}>
                <Icons.Close />
              </button>
              <h3>Live Attendance: {selectedLecture?.subject}</h3>
            </div>
            <div className="fd-ph-right">
              <span className="fd-live-count">
                <Icons.Users /> {liveAttendees.length} Students Present
              </span>
            </div>
          </div>
          
          <div className="fd-qr-workspace">
            <div className="fd-qr-side">
              <div className="fd-qr-wrapper">
                <div className="fd-qr-rotation-badge">
                  <span className="fd-qr-rotation-label">QR refresh in</span>
                  <span className="fd-qr-rotation-value">{formatCountdown(qrTimer)}</span>
                </div>
                <img src={qrCode} alt="Attendance QR" className="fd-qr-img" />
                <div className="fd-qr-refresh-status">
                  <div className="fd-refresh-dot" />
                  <span>QR auto refresh every 30 seconds</span>
                </div>
              </div>

              <div className="fd-qr-timer-box">
                <div className="fd-timer-display fd-session-timer-display">
                  <span className="fd-timer-val">{formatCountdown(sessionTimer)}</span>
                  <span className="fd-timer-label">SESSION ENDS IN</span>
                </div>
                <div className="fd-qr-actions">
                  <button className="fd-btn-outline" onClick={handleRefreshQR}>
                    Manual Refresh QR
                  </button>
                  <button className="fd-btn-danger" onClick={handleEndSession}>
                    Finish & Submit Attendance
                  </button>
                </div>
              </div>
            </div>

            <div className="fd-attendees-side">
              <div className="fd-side-header">
                <h4>Live Attendee List</h4>
                <div className="fd-pulse" />
              </div>
              <div className="fd-attendees-list">
                {liveAttendees.length === 0 ? (
                  <div className="fd-list-empty">
                    <p>Waiting for first student to scan...</p>
                  </div>
                ) : (
                  liveAttendees.map((attendee, idx) => (
                    <div key={idx} className="fd-attendee-row">
                      <div className="fd-att-avatar">{attendee.name.charAt(0)}</div>
                      <div className="fd-att-info">
                        <p className="fd-att-name">{attendee.name}</p>
                        <p className="fd-att-id">{attendee.id}</p>
                      </div>
                      <span className="fd-att-time">
                        {new Date(attendee.markedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Restart Mode Selection Modal */}
      {restartLecture && (
        <div className="fd-modal-overlay">
          <div className="fd-modal">
            <div className="fd-modal-header">
              <h3>Restart Session: {restartLecture.subject}</h3>
              <button onClick={() => setRestartLecture(null)}><Icons.Close /></button>
            </div>
            <div className="fd-modal-body">
              <p className="fd-modal-desc">Attendance session ko kaise restart karna chahte hain?</p>
              
              <div className="fd-restart-options">
                <button className="fd-restart-option" onClick={() => triggerRestart("add")}>
                  <div className="fd-ro-icon"><Icons.Users /></div>
                  <div className="fd-ro-text">
                    <strong>Add to Existing</strong>
                    <span>Pichle attendees carry forward honge.</span>
                  </div>
                </button>
                
                <button className="fd-restart-option" onClick={() => triggerRestart("fresh")}>
                  <div className="fd-ro-icon"><RefreshIcon /></div>
                  <div className="fd-ro-text">
                    <strong>Fresh Start</strong>
                    <span>Nayi attendance record hogi (0 se shuru).</span>
                  </div>
                </button>
              </div>

              <div className="fd-form-group" style={{ marginTop: 20 }}>
                <label>Reason for Restart (Optional)</label>
                <input 
                  type="text" 
                  placeholder="e.g. Network issue, scan error..."
                  value={restartReason}
                  onChange={(e) => setRestartReason(e.target.value)}
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
