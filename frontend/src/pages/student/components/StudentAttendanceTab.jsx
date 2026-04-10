export default function StudentAttendanceTab({ attendance, Icons }) {
  return (
    <div className="sd-tab">
      {attendance.isLow && (
        <div className="sd-warning-banner">
          <Icons.Warning />
          <span>
            Overall attendance is <strong>{attendance.overall}%</strong> — below
            75%. You need to attend more classes.
          </span>
        </div>
      )}
      <div className="sd-panel">
        <div className="sd-panel-header">
          <Icons.Chart />
          <h3>Subject-wise Attendance</h3>
          <span
            className={`sd-panel-badge ${
              attendance.overall < 75 ? "badge-red" : "badge-green"
            }`}
          >
            Overall: {attendance.overall}%
          </span>
        </div>
        <div className="sd-attendance-list">
          {attendance.subjects.map((sub, i) => (
            <div key={i} className="sd-att-row">
              <div className="sd-att-top">
                <div>
                  <p className="sd-att-subject">{sub.subject}</p>
                  <p className="sd-att-code">
                    {sub.subjectCode} · {sub.totalAttended}/{sub.totalHeld} lectures
                  </p>
                </div>
                <div className="sd-att-right">
                  <span
                    className={`sd-att-pct ${
                      sub.status === "safe"
                        ? "pct-green"
                        : sub.status === "warning"
                          ? "pct-yellow"
                          : "pct-red"
                    }`}
                  >
                    {sub.percentage}%
                  </span>
                  {sub.lecturesNeeded > 0 && (
                    <span className="sd-att-needed">
                      Need {sub.lecturesNeeded} more
                    </span>
                  )}
                </div>
              </div>
              <div className="sd-att-bar-bg">
                <div
                  className={`sd-att-bar-fill ${
                    sub.status === "safe"
                      ? "fill-green"
                      : sub.status === "warning"
                        ? "fill-yellow"
                        : "fill-red"
                  }`}
                  style={{ width: `${sub.percentage}%` }}
                />
                <div
                  className="sd-att-bar-mark"
                  style={{ left: "75%" }}
                  title="75% required"
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
