import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { clearAuthError, registerUser } from "../store/authSlice";

export default function RegisterPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [formError, setFormError] = useState("");
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const auth = useSelector(function (state) {
    return state.auth;
  });

  if (auth.user) {
    return <Navigate to={auth.user.admin ? "/admin" : "/dashboard"} replace />;
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setFormError("");
    if (password !== confirmPassword) {
      setFormError("Passwords do not match");
      return;
    }
    const result = await dispatch(
      registerUser({ username: username, password: password }),
    );
    if (registerUser.fulfilled.match(result)) {
      navigate("/login", { state: { registered: true } });
    }
  }

  return (
    <main className="auth-page">
      <section className="auth-card register-card">
        <h2>Register</h2>
        {(formError || auth.error) && (
          <div className="alert alert-danger" role="alert">
            {formError || auth.error}
          </div>
        )}
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label" htmlFor="username">
              Username
            </label>
            <input
              id="username"
              className="form-control"
              autoComplete="username"
              required
              maxLength="50"
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
            <input
              id="password"
              className="form-control"
              type="password"
              autoComplete="new-password"
              minLength="6"
              required
              value={password}
              onChange={function (event) {
                setPassword(event.target.value);
              }}
            />
          </div>
          <div className="mb-3">
            <label className="form-label" htmlFor="confirmPassword">
              Confirm Password
            </label>
            <input
              id="confirmPassword"
              className="form-control"
              type="password"
              autoComplete="new-password"
              minLength="6"
              required
              value={confirmPassword}
              onChange={function (event) {
                setConfirmPassword(event.target.value);
              }}
            />
          </div>
          <button
            className="btn btn-primary w-100"
            disabled={auth.status === "loading"}
          >
            {auth.status === "loading" ? "Creating account..." : "Register"}
          </button>
        </form>
        <Link
          className="auth-link"
          to="/login"
          onClick={function () {
            dispatch(clearAuthError());
          }}
        >
          Already have an account? Login here
        </Link>
      </section>
    </main>
  );
}
