import { useSelector } from "react-redux";
import { Navigate, Outlet } from "react-router-dom";

export default function ProtectedRoute({ adminOnly = false }) {
  const auth = useSelector(function (state) {
    return state.auth;
  });

  if (auth.checkingSession) {
    return <p className="text-center my-5">Loading your session...</p>;
  }
  if (!auth.user) {
    return <Navigate to="/login" replace />;
  }
  if (adminOnly && !auth.user.admin) {
    return <Navigate to="/dashboard" replace />;
  }
  return <Outlet />;
}
