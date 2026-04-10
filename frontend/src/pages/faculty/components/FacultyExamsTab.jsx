export default function FacultyExamsTab({
  upcomingExams,
  examForm,
  setExamForm,
  handleScheduleExam,
  formatDate,
  Icons,
}) {
  return (
    <div className="fd-tab">
      <div className="fd-two-col">
        <div className="fd-panel">
          <div className="fd-panel-header">
            <Icons.Exam />
            <h3>Schedule Exam</h3>
          </div>
          <form onSubmit={handleScheduleExam} className="fd-form">
            <div className="fd-form-group">
              <label>Subject</label>
              <input
                type="text"
                required
                value={examForm.subject}
                onChange={(e) =>
                  setExamForm({ ...examForm, subject: e.target.value })
                }
                placeholder="e.g. OOPS"
              />
            </div>
            <div className="fd-form-group">
              <label>Date and Time</label>
              <input
                type="datetime-local"
                required
                value={examForm.date}
                onChange={(e) => setExamForm({ ...examForm, date: e.target.value })}
              />
            </div>
            <div className="fd-form-group">
              <label>Room</label>
              <input
                type="text"
                required
                value={examForm.room}
                onChange={(e) => setExamForm({ ...examForm, room: e.target.value })}
              />
            </div>
            <div className="fd-form-group">
              <label>Duration (e.g. 2 hours)</label>
              <input
                type="text"
                required
                value={examForm.duration}
                onChange={(e) =>
                  setExamForm({ ...examForm, duration: e.target.value })
                }
              />
            </div>
            <button type="submit" className="fd-btn-primary">
              Schedule Exam
            </button>
          </form>
        </div>

        <div className="fd-panel">
          <div className="fd-panel-header">
            <h3>Upcoming Scheduled Exams</h3>
          </div>
          {upcomingExams.length === 0 ? (
            <p className="fd-empty">No exams scheduled.</p>
          ) : (
            <div className="fd-exam-full-list">
              {upcomingExams.map((ex, i) => (
                <div key={i} className="fd-exam-full-row">
                  <div className="fd-exam-full-info">
                    <p className="fd-exam-full-name">{ex.subject}</p>
                    <div className="fd-exam-full-meta">
                      <span>{formatDate(ex.examDate || ex.date)}</span>
                      <span>{ex.room}</span>
                      <span>{ex.duration}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
