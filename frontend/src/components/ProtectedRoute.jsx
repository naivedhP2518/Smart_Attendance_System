import { Navigate } from "react-router-dom";

// Usage:
// <ProtectedRoute role="student"> <StudentDashboard /> </ProtectedRoute>
// <ProtectedRoute role="faculty"> <FacultyDashboard /> </ProtectedRoute>

export default function ProtectedRoute({ children, role }) {
  const token = localStorage.getItem("token");
  const user  = JSON.parse(localStorage.getItem("user") || "null");

  // No token → back to login
  if (!token || !user) {
    return <Navigate to="/login" replace />;
  }

  // Wrong role → back to login
  if (role && user.role !== role) {
    return <Navigate to="/login" replace />;
  }

  return children;
}