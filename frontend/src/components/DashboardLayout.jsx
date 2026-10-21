import { useDispatch, useSelector } from "react-redux";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { logout } from "../store/authSlice";
import { clearQuizzes } from "../store/quizSlice";

export default function DashboardLayout() {
  const user = useSelector(function (state) {
    return state.auth.user;
  });
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const isAdmin = user.admin;

  function handleLogout() {
    dispatch(clearQuizzes());
    dispatch(logout());
    navigate("/login", { replace: true });
  }

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <h1>{isAdmin ? "Admin Dashboard" : "Dashboard"}</h1>
        <span>Welcome, {user.username}</span>
      </header>
      <nav className="dashboard-nav" aria-label="Main navigation">
        <NavLink to={isAdmin ? "/admin" : "/dashboard"} end>
          Home
        </NavLink>
        {isAdmin ? (
          <>
            <NavLink to="/admin/questions">Manage Questions</NavLink>
            <NavLink to="/admin/quizzes">Manage Quizzes</NavLink>
          </>
        ) : (
          <>
            <NavLink to="/dashboard/quiz">Quiz</NavLink>
          </>
        )}
        <button type="button" onClick={handleLogout}>
          Logout
        </button>
      </nav>
      <main>
        <Outlet />
      </main>
    </div>
  );
}
