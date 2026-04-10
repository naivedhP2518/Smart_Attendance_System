export default function FacultyAttendanceTab({ attendanceData, Icons }) {
  return (
    <div className="fd-tab">
      <div className="fd-panel">
        <div className="fd-panel-header">
          <Icons.Chart />
          <h3>Subject Attendance Overview</h3>
        </div>
        <div className="fd-attendance-list">
          {attendanceData?.map((sub, i) => (
            <div key={i} className="fd-att-row">
              <div className="fd-att-top">
                <div>
                  <p className="fd-att-subject">{sub.subject}</p>
                  <p className="fd-att-code">{sub.totalLectures} Total Lectures Held</p>
                </div>
                <div className="fd-att-right">
                  <span
                    className={`fd-att-pct ${
                      sub.averagePct >= 75
                        ? "pct-green"
                        : sub.averagePct >= 60
                          ? "pct-yellow"
                          : "pct-red"
                    }`}
                  >
                    {sub.averagePct}%
                  </span>
                </div>
              </div>
              <div className="fd-att-bar-bg">
                <div
                  className={`fd-att-bar-fill ${
                    sub.averagePct >= 75
                      ? "fill-green"
                      : sub.averagePct >= 60
                        ? "fill-yellow"
                        : "fill-red"
                  }`}
                  style={{ width: `${sub.averagePct}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
