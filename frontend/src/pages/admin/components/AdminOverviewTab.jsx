export default function AdminOverviewTab({ stats, Icons }) {
  return (
    <div className="ad-tab">
      <div className="ad-stats-grid">
        <div className="ad-stat-card">
          <div className="ad-stat-icon ad-stat-blue">
            <Icons.Users />
          </div>
          <div>
            <p className="ad-stat-val">{stats.studentCount}</p>
            <p className="ad-stat-label">Total Students</p>
          </div>
        </div>
        <div className="ad-stat-card">
          <div className="ad-stat-icon ad-stat-purple">
            <Icons.Users />
          </div>
          <div>
            <p className="ad-stat-val">{stats.facultyCount}</p>
            <p className="ad-stat-label">Total Faculty</p>
          </div>
        </div>
        <div className="ad-stat-card">
          <div className="ad-stat-icon ad-stat-orange">
            <Icons.Dashboard />
          </div>
          <div>
            <p className="ad-stat-val">{stats.campusAverageAttendance}%</p>
            <p className="ad-stat-label">Campus Attendance</p>
          </div>
        </div>
        <div className="ad-stat-card">
          <div className="ad-stat-icon ad-stat-green">
            <Icons.Timetable />
          </div>
          <div>
            <p className="ad-stat-val">{stats.totalAttendanceRecords}</p>
            <p className="ad-stat-label">System Records</p>
          </div>
        </div>
      </div>

      <div className="ad-panel">
        <div className="ad-panel-header">
          <h3>Recent System Activity</h3>
        </div>
        <div style={{ padding: "24px", color: "#64748b" }}>
          No recent critical alerts. System is stable.
        </div>
      </div>
    </div>
  );
}
