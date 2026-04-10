export default function FacultyStudentsTab({
  studentsData,
  searchQuery,
  setSearchQuery,
  Icons,
}) {
  return (
    <div className="fd-tab">
      <div className="fd-panel">
        <div className="fd-panel-header" style={{ justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <Icons.Users />
            <h3>My Students</h3>
          </div>
          <div className="fd-search-box">
            <Icons.Search />
            <input
              type="text"
              placeholder="Search students..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
        <div className="fd-results-table">
          <div className="fd-results-thead">
            <span>ID</span>
            <span>Student Name</span>
            <span>Branch</span>
            <span>Sem</span>
            <span>Attendance</span>
          </div>
          {studentsData
            ?.filter(
              (s) =>
                s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                s.id.toLowerCase().includes(searchQuery.toLowerCase())
            )
            .map((s, i) => (
              <div key={i} className="fd-results-trow">
                <span className="fd-txt-mute">{s.id}</span>
                <span className="fd-txt-bold">{s.name}</span>
                <span>{s.branch}</span>
                <span>{s.semester}</span>
                <span
                  className={`fd-grade-chip ${
                    s.attendance >= 75 ? "grade-AA" : "grade-BB"
                  }`}
                >
                  {s.attendance}%
                </span>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}
