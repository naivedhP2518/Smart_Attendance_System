export default function StudentOverviewTab({
  student,
  todayLectures,
  attendance,
  results,
  notices,
  upcomingExams,
  getGreeting,
  formatTime,
  formatDate,
  daysUntil,
  Icons,
}) {
  return (
    <div className="sd-tab">
      <div className="sd-greeting-card">
        <div>
          <p className="sd-greeting-text">{getGreeting()},</p>
          <h2 className="sd-greeting-name">{student.name} 👋</h2>
          <p className="sd-greeting-sub">
            {student.branch} · Semester {student.semester}
          </p>
        </div>
        <div className="sd-greeting-stat">
          <span className="sd-greeting-stat-val">{todayLectures.length}</span>
          <span className="sd-greeting-stat-label">lectures today</span>
        </div>
      </div>

      {attendance.isLow && (
        <div className="sd-warning-banner">
          <Icons.Warning />
          <span>
            Your overall attendance is <strong>{attendance.overall}%</strong> —
            below the required 75%. Please attend more classes.
          </span>
        </div>
      )}

      <div className="sd-stats-row">
        <div className="sd-stat-card sd-stat-blue">
          <div className="sd-stat-icon">
            <Icons.Book />
          </div>
          <div>
            <p className="sd-stat-val">{todayLectures.length}</p>
            <p className="sd-stat-label">Today's Lectures</p>
          </div>
        </div>
        <div
          className={`sd-stat-card ${
            attendance.overall >= 75 ? "sd-stat-green" : "sd-stat-red"
          }`}
        >
          <div className="sd-stat-icon">
            <Icons.Chart />
          </div>
          <div>
            <p className="sd-stat-val">{attendance.overall}%</p>
            <p className="sd-stat-label">Overall Attendance</p>
          </div>
        </div>
        <div className="sd-stat-card sd-stat-purple">
          <div className="sd-stat-icon">
            <Icons.Award />
          </div>
          <div>
            <p className="sd-stat-val">{results.cpi ?? "—"}</p>
            <p className="sd-stat-label">Current CPI</p>
          </div>
        </div>
        <div className="sd-stat-card sd-stat-orange">
          <div className="sd-stat-icon">
            <Icons.Exam />
          </div>
          <div>
            <p className="sd-stat-val">{upcomingExams.length}</p>
            <p className="sd-stat-label">Upcoming Exams</p>
          </div>
        </div>
      </div>

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
                    <span className="sd-lecture-end">
                      {formatTime(lec.endTime)}
                    </span>
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
                <div
                  key={i}
                  className={`sd-notice-item ${
                    n.priority === "high" ? "notice-high" : "notice-medium"
                  }`}
                >
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
                  <div
                    className={`sd-exam-days ${
                      days <= 3 ? "days-urgent" : days <= 7 ? "days-soon" : "days-ok"
                    }`}
                  >
                    <span className="sd-exam-days-num">{days}</span>
                    <span className="sd-exam-days-label">days</span>
                  </div>
                  <div className="sd-exam-info">
                    <p className="sd-exam-subject">{ex.subject}</p>
                    <p className="sd-exam-meta">
                      {formatDate(ex.examDate)} · {ex.room}
                    </p>
                    <span className="sd-exam-type">{ex.type}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
