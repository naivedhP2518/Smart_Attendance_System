export default function FacultyDashboardTab({
  dashboardData,
  facultyUser,
  getGreeting,
  Icons,
}) {
  return (
    <div className="fd-tab">
      <div className="fd-greeting-card">
        <div>
          <p className="fd-greeting-text">{getGreeting()},</p>
          <h2 className="fd-greeting-name">Prof. {facultyUser.name} 👋</h2>
          <p className="fd-greeting-sub">Department of Computer Science</p>
        </div>
      </div>

      <div className="fd-stats-row">
        <div className="fd-stat-card fd-stat-blue">
          <div className="fd-stat-icon">
            <Icons.Chart />
          </div>
          <div>
            <p className="fd-stat-val">{dashboardData.todayLecturesCount || 0}</p>
            <p className="fd-stat-label">Today's Classes</p>
          </div>
        </div>
        <div className="fd-stat-card fd-stat-purple">
          <div className="fd-stat-icon">
            <Icons.Users />
          </div>
          <div>
            <p className="fd-stat-val">{dashboardData.totalStudents || 0}</p>
            <p className="fd-stat-label">Total Students</p>
          </div>
        </div>
        <div className="fd-stat-card fd-stat-green">
          <div className="fd-stat-icon">
            <Icons.Dashboard />
          </div>
          <div>
            <p className="fd-stat-val">{dashboardData.averageAttendance || 0}%</p>
            <p className="fd-stat-label">Avg Attendance</p>
          </div>
        </div>
        <div className="fd-stat-card fd-stat-orange">
          <div className="fd-stat-icon">
            <Icons.Exam />
          </div>
          <div>
            <p className="fd-stat-val">{dashboardData.upcomingExamsCount || 0}</p>
            <p className="fd-stat-label">Upcoming Exams</p>
          </div>
        </div>
      </div>
    </div>
  );
}
