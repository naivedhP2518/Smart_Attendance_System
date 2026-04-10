export default function StudentTimetableTab({
  student,
  todayDay,
  todayLectures,
  formatTime,
  Icons,
}) {
  return (
    <div className="sd-tab">
      <div className="sd-panel">
        <div className="sd-panel-header">
          <Icons.Clock />
          <h3>Weekly Timetable</h3>
          <span className="sd-panel-badge">
            {student.branch} · Sem {student.semester}
          </span>
        </div>
        <div className="sd-tt-day-block">
          <div className="sd-tt-day-label today-label">
            {todayDay} <span className="today-chip">Today</span>
          </div>
          {todayLectures.length === 0 ? (
            <p className="sd-empty" style={{ paddingLeft: "16px" }}>
              No lectures today
            </p>
          ) : (
            todayLectures.map((lec, i) => (
              <div key={i} className="sd-tt-row">
                <span className="sd-tt-time">
                  {formatTime(lec.startTime)} – {formatTime(lec.endTime)}
                </span>
                <span className="sd-tt-subject">{lec.subject}</span>
                <span className="sd-tt-code">{lec.subjectCode}</span>
                <span className="sd-tt-faculty">{lec.faculty}</span>
                <span className="sd-tt-room">
                  <Icons.MapPin /> {lec.room}
                </span>
              </div>
            ))
          )}
        </div>
        <p className="sd-tip">
          💡 Full weekly timetable loads from the timetable API — connect{" "}
          <code>/api/student/timetable</code> to show all days.
        </p>
      </div>
    </div>
  );
}
