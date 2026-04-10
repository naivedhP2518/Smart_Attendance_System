export default function StudentScanQrTab({
  scanResult,
  scanLoading,
  scanMsg,
  setScanResult,
  setScanMsg,
  submitAttendance,
  student,
  Icons,
}) {
  const isSubmitted =
    scanMsg.includes("success") ||
    scanMsg.includes("marked") ||
    scanMsg.includes("already");

  return (
    <div className="sd-tab">
      <div
        className="sd-panel"
        style={{ maxWidth: "600px", margin: "0 auto", overflow: "hidden" }}
      >
        <div className="sd-panel-header">
          <Icons.Scan />
          <h3>Scan Lecture QR</h3>
        </div>
        <div style={{ padding: "24px", textAlign: "center" }}>
          {!scanResult ? (
            <>
              <p className="sd-txt-mute" style={{ marginBottom: "16px" }}>
                Point your camera at the active projection code to record
                attendance.
              </p>
              <div
                id="reader"
                style={{
                  width: "100%",
                  overflow: "hidden",
                  borderRadius: "12px",
                  border: "1px solid var(--slate-200)",
                }}
              />
              {scanMsg && (
                <div
                  className="sd-error-msg"
                  style={{
                    marginTop: "16px",
                    background: "var(--red-50)",
                    color: "var(--red-600)",
                    padding: "12px",
                    borderRadius: "8px",
                    fontSize: "14px",
                  }}
                >
                  {scanMsg}
                </div>
              )}
            </>
          ) : (
            <div
              className="sd-scan-success-flow"
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "20px",
                alignItems: "center",
              }}
            >
              <div
                style={{
                  padding: "20px",
                  background: "var(--blue-50)",
                  borderRadius: "12px",
                  width: "100%",
                  color: "var(--blue-700)",
                }}
              >
                <h2
                  style={{
                    fontSize: "20px",
                    marginBottom: "12px",
                    color: "var(--blue-600)",
                  }}
                >
                  QR Scanned!
                </h2>
                <p style={{ marginBottom: "8px" }}>
                  <strong>Session ID:</strong>{" "}
                  <span style={{ color: "var(--blue-600)" }}>
                    {scanResult.sessionId}
                  </span>
                </p>
                <p>
                  <strong>Student:</strong>{" "}
                  <span style={{ color: "var(--blue-600)" }}>
                    {student.uniqueId}
                  </span>
                </p>
              </div>

              {scanMsg && (
                <div
                  className="sd-success-msg"
                  style={{
                    padding: "16px",
                    borderRadius: "8px",
                    background: isSubmitted
                      ? "var(--green-50)"
                      : "var(--red-50)",
                    color: isSubmitted ? "var(--green-600)" : "var(--red-600)",
                    width: "100%",
                    fontWeight: "600",
                  }}
                >
                  {scanMsg.includes("success") || scanMsg.includes("marked") ? (
                    <Icons.Award />
                  ) : (
                    <Icons.Warning />
                  )}{" "}
                  {scanMsg}
                </div>
              )}

              <button
                className="sd-btn-primary"
                onClick={submitAttendance}
                disabled={scanLoading || isSubmitted}
                style={{
                  padding: "14px 24px",
                  fontSize: "16px",
                  width: "100%",
                  borderRadius: "12px",
                }}
              >
                {scanLoading
                  ? "Submitting..."
                  : isSubmitted
                    ? "Attendance Recorded"
                    : "Submit Present"}
              </button>

              <button
                className="sd-btn-danger"
                onClick={() => {
                  setScanResult(null);
                  setScanMsg("");
                }}
                style={{
                  width: "100%",
                  background: "transparent",
                  color: "var(--slate-500)",
                  border: "1px solid var(--slate-200)",
                  borderRadius: "12px",
                  padding: "12px",
                }}
              >
                Cancel & Rescan
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
