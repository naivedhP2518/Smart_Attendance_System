export default function AdminUsersTab({ users, deleteUser }) {
  return (
    <div className="ad-tab">
      <div className="ad-panel">
        <div className="ad-panel-header">
          <h3>System Users</h3>
          <button
            className="fd-btn-primary"
            style={{ padding: "8px 16px", fontSize: "0.8rem" }}
          >
            + Add User
          </button>
        </div>
        <table className="ad-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Role</th>
              <th>Performance / Workload</th>
              <th>Department / Branch</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.faculty.map((f) => (
              <tr key={f.uniqueId}>
                <td>{f.uniqueId}</td>
                <td>
                  <strong>{f.name}</strong>
                </td>
                <td>
                  <span className="ad-badge badge-faculty">{f.role}</span>
                </td>
                <td>
                  <div style={{ fontSize: "0.8rem" }}>
                    <strong>{f.classesCount} Classes</strong>
                    <br />
                    <span style={{ color: "#64748b" }}>
                      {f.managedClasses || "No assigned classes"}
                    </span>
                  </div>
                </td>
                <td>{f.department}</td>
                <td>
                  <button className="ad-btn-edit">Edit</button>
                  <button
                    className="ad-btn-delete"
                    onClick={() => deleteUser("faculty", f.uniqueId)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
            {users.students.map((s) => (
              <tr key={s.uniqueId}>
                <td>{s.uniqueId}</td>
                <td>
                  <strong>{s.name}</strong>
                </td>
                <td>
                  <span className="ad-badge badge-student">student</span>
                </td>
                <td>
                  <div style={{ width: "100px" }}>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        fontSize: "0.75rem",
                        marginBottom: "4px",
                      }}
                    >
                      <span>Attendance</span>
                      <span>{s.attendancePercentage}%</span>
                    </div>
                    <div
                      style={{
                        height: "6px",
                        background: "#e2e8f0",
                        borderRadius: "3px",
                        overflow: "hidden",
                      }}
                    >
                      <div
                        style={{
                          height: "100%",
                          width: `${s.attendancePercentage}%`,
                          background:
                            parseFloat(s.attendancePercentage) > 75
                              ? "#22c55e"
                              : "#ef4444",
                        }}
                      />
                    </div>
                  </div>
                </td>
                <td>
                  {s.branch} (Sem {s.semester})
                </td>
                <td>
                  <button className="ad-btn-edit">Edit</button>
                  <button
                    className="ad-btn-delete"
                    onClick={() => deleteUser("student", s.uniqueId)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
