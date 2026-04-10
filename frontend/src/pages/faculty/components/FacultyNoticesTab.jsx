export default function FacultyNoticesTab({
  notices,
  noticeForm,
  setNoticeForm,
  handlePostNotice,
  formatDate,
  Icons,
}) {
  return (
    <div className="fd-tab">
      <div className="fd-two-col">
        <div className="fd-panel">
          <div className="fd-panel-header">
            <Icons.Notice />
            <h3>Post a Notice</h3>
          </div>
          <form onSubmit={handlePostNotice} className="fd-form">
            <div className="fd-form-group">
              <label>Notice Title</label>
              <input
                type="text"
                required
                value={noticeForm.title}
                onChange={(e) =>
                  setNoticeForm({ ...noticeForm, title: e.target.value })
                }
              />
            </div>
            <div className="fd-form-group">
              <label>Content</label>
              <textarea
                required
                rows="4"
                value={noticeForm.content}
                onChange={(e) =>
                  setNoticeForm({ ...noticeForm, content: e.target.value })
                }
              />
            </div>
            <div className="fd-form-group">
              <label>Priority</label>
              <select
                value={noticeForm.priority}
                onChange={(e) =>
                  setNoticeForm({ ...noticeForm, priority: e.target.value })
                }
              >
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
            <button type="submit" className="fd-btn-primary">
              Post Notice
            </button>
          </form>
        </div>

        <div className="fd-panel">
          <div className="fd-panel-header">
            <h3>Recent Notices</h3>
          </div>
          <div className="fd-notices-full">
            {notices.length === 0 ? (
              <p className="fd-empty">No notices posted recently.</p>
            ) : (
              notices.map((n, i) => (
                <div
                  key={i}
                  className={`fd-notice-full-item ${
                    n.priority === "high" ? "nf-high" : "nf-medium"
                  }`}
                >
                  <div className="fd-nf-left">
                    <span
                      className={`fd-nf-priority ${
                        n.priority === "high" ? "pri-high" : "pri-medium"
                      }`}
                    >
                      {n.priority === "high" ? "High Priority" : "Normal"}
                    </span>
                    <h4 className="fd-nf-title">{n.title}</h4>
                    <p className="fd-nf-content">{n.content}</p>
                  </div>
                  <p className="fd-nf-date">{formatDate(n.createdAt)}</p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
