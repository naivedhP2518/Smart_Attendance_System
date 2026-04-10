export default function StudentNoticesTab({ notices, formatDate, Icons }) {
  return (
    <div className="sd-tab">
      <div className="sd-panel">
        <div className="sd-panel-header">
          <Icons.Notice />
          <h3>All Notices</h3>
          <span className="sd-panel-badge">{notices.length} notices</span>
        </div>
        <div className="sd-notices-full">
          {notices.map((n, i) => (
            <div
              key={i}
              className={`sd-notice-full-item ${
                n.priority === "high" ? "nf-high" : "nf-medium"
              }`}
            >
              <div className="sd-nf-left">
                <span
                  className={`sd-nf-priority ${
                    n.priority === "high" ? "pri-high" : "pri-medium"
                  }`}
                >
                  {n.priority === "high" ? "Important" : "General"}
                </span>
                <h4 className="sd-nf-title">{n.title}</h4>
                <p className="sd-nf-content">{n.content}</p>
              </div>
              <p className="sd-nf-date">{formatDate(n.createdAt)}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
