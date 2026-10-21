import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import { clearAuthError, loginUser } from "../store/authSlice";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const auth = useSelector(function (state) {
    return state.auth;
  });

  if (auth.user) {
    return <Navigate to={auth.user.admin ? "/admin" : "/dashboard"} replace />;
  }

  async function handleSubmit(event) {
    event.preventDefault();
    const result = await dispatch(
      loginUser({ username: username, password: password }),
    );
    if (loginUser.fulfilled.match(result)) {
      const user = result.payload.user;
      navigate(user.admin ? "/admin" : "/dashboard", { replace: true });
    }
  }

  return (
    <main className="auth-page">
      <section className="auth-card">
        <h2>Login</h2>
        {location.state?.registered && (
          <div className="alert alert-success">
            Account created. Please log in.
          </div>
        )}
        {auth.error && (
          <div className="alert alert-danger" role="alert">
            {auth.error}
          </div>
        )}
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="form-label" htmlFor="username">
              Username
            </label>
            <input
              id="username"
              className="form-control"
              autoComplete="username"
              required
              value={username}
              onChange={function (event) {
                setUsername(event.target.value);
              }}
            />
          </div>
          <div className="mb-3">
            <label className="form-label" htmlFor="password">
              Password
            </label>
            <div className="password-field">
              <input
                id="password"
                className="form-control"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                required
                value={password}
                onChange={function (event) {
                  setPassword(event.target.value);
                }}
              />
              <button
                type="button"
                className="password-toggle"
                aria-label={showPassword ? "Hide password" : "Show password"}
                onClick={function () {
                  setShowPassword(!showPassword);
                }}
              >
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  aria-hidden="true"
                >
                  <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7S2 12 2 12Z" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
              </button>
            </div>
          </div>
          <button
            className="btn btn-primary w-100"
            disabled={auth.status === "loading" || auth.checkingSession}
          >
            {auth.status === "loading" ? "Logging in..." : "Login"}
          </button>
        </form>
        <Link
          className="auth-link"
          to="/register"
          onClick={function () {
            dispatch(clearAuthError());
          }}
        >
          Don't have an account? Register here
        </Link>
      </section>
    </main>
  );
}
