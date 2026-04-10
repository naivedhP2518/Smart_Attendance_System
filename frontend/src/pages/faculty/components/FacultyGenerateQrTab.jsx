export default function FacultyGenerateQrTab({
  todayLectures,
  selectedLecture,
  qrCode,
  qrTimer,
  handleGenerateQR,
  handleEndSession,
  Icons,
}) {
  return (
    <div className="fd-tab">
      <div className="fd-two-col">
        <div className="fd-panel">
          <div className="fd-panel-header">
            <Icons.QrCode />
            <h3>Today's Lectures</h3>
          </div>
          {!todayLectures || todayLectures.length === 0 ? (
            <p className="fd-empty">No lectures scheduled for today.</p>
          ) : (
            <div className="fd-lecture-grid">
              {todayLectures.map((lec, i) => {
                const isCurrentActive =
                  selectedLecture?.subjectCode === lec.subjectCode && qrCode;

                return (
                  <div
                    key={i}
                    className={`fd-lecture-card ${isCurrentActive ? "active" : ""}`}
                  >
                    <div className="fd-lc-top">
                      <h4 className="fd-lc-subject">{lec.subject}</h4>
                      <span className="fd-lc-code">{lec.subjectCode}</span>
                    </div>
                    <div className="fd-lc-mid">
                      <p className="fd-lc-time">
                        {lec.startTime} - {lec.endTime}
                      </p>
                      <p className="fd-lc-room">Room: {lec.room}</p>
                      <p className="fd-lc-sem">
                        <strong>Class:</strong> {lec.className || `Sem ${lec.semester}`}
                      </p>
                    </div>
                    <button
                      className="fd-btn-primary fd-lc-btn"
                      disabled={isCurrentActive}
                      onClick={() => handleGenerateQR(lec)}
                    >
                      {isCurrentActive && qrTimer > 0 ? "Session Active" : "Generate QR"}
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="fd-panel fd-qr-display-panel">
          <div className="fd-panel-header">
            <h3>QR Attendance Session</h3>
          </div>
          <div className="fd-qr-container">
            {qrCode ? (
              <>
                {qrTimer > 0 ? (
                  <>
                    <img src={qrCode} alt="Attendance QR" className="fd-qr-img" />
                    <p className="fd-qr-sub">Scan to mark attendance</p>
                  </>
                ) : (
                  <div className="fd-qr-expired">
                    <Icons.QrCode />
                    <p>Session expired</p>
                  </div>
                )}

                {selectedLecture && (
                  <div className="fd-qr-info-box">
                    <p>
                      <strong>Subject:</strong> {selectedLecture.subject}
                    </p>
                    <p>
                      <strong>Class:</strong>{" "}
                      {selectedLecture.className || selectedLecture.semester}
                    </p>
                    <p>
                      <strong>Time:</strong> {selectedLecture.startTime} -{" "}
                      {selectedLecture.endTime}
                    </p>
                    <p>
                      <strong>Room:</strong> {selectedLecture.room}
                    </p>
                  </div>
                )}

                {qrTimer > 0 && (
                  <div className="fd-qr-timer-box">
                    <p>Expires in:</p>
                    <div className="fd-qr-timer">
                      {Math.floor(qrTimer / 60)
                        .toString()
                        .padStart(2, "0")}
                      :
                      {(qrTimer % 60).toString().padStart(2, "0")}
                    </div>
                    <button className="fd-btn-danger" onClick={handleEndSession}>
                      End Session & Submit
                    </button>
                  </div>
                )}
              </>
            ) : (
              <div className="fd-qr-placeholder">
                <Icons.QrCode />
                <p>No active session.</p>
                <span>Select a lecture to generate QR.</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
