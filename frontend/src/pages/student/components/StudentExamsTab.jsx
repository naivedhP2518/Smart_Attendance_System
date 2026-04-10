export default function StudentExamsTab({
  upcomingExams,
  formatDate,
  daysUntil,
  Icons,
}) {
  return (
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
                  <div
                    className={`sd-exam-countdown ${
                      days <= 3 ? "days-urgent" : days <= 7 ? "days-soon" : "days-ok"
                    }`}
                  >
                    <span className="sd-exam-days-num">{days}</span>
                    <span className="sd-exam-days-label">days left</span>
                  </div>
                  <div className="sd-exam-full-info">
                    <p className="sd-exam-full-name">
                      {ex.subject}{" "}
                      <span className="sd-exam-full-code">({ex.subjectCode})</span>
                    </p>
                    <div className="sd-exam-full-meta">
                      <span>
                        <Icons.Clock /> {formatDate(ex.examDate)}
                      </span>
                      <span>
                        <Icons.MapPin /> {ex.room}
                      </span>
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
  );
}
