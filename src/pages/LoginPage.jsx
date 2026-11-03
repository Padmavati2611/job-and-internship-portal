import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { getErrorMessage, getFieldErrors } from "../api/client";
import { homePathFor } from "../components/ProtectedRoute";
import { login as loginRequest } from "../api/auth";
import AuthShell from "../components/AuthShell";
import Icon from "../components/Icon";
import Spinner from "../components/Spinner";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { setSession } = useAuth();
  const { success, error: showError } = useToast();

  const [form, setForm] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const [formError, setFormError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    document.title = "Log in | CareerConnect";
  }, []);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
    setFieldErrors((current) => ({ ...current, [name]: undefined }));
    setFormError("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const errors = {};
    if (!form.email.trim()) errors.email = "Email is required.";
    if (!form.password) errors.password = "Password is required.";
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    setSubmitting(true);
    setFormError("");
    try {
      const data = await loginRequest({
        email: form.email.trim(),
        password: form.password,
      });
      setSession(data.token, data.user);
      success(data.message || "Logged in successfully.");
      const redirectTo = location.state?.from?.pathname;
      const fallback = homePathFor(data.user.role);
      navigate(redirectTo || fallback, { replace: true });
    } catch (err) {
      setFieldErrors(getFieldErrors(err));
      const message = getErrorMessage(err);
      if (err.response?.status === 401) {
        setFormError("The email or password you entered is incorrect.");
      } else {
        setFormError(message);
        showError(message);
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthShell
      title="Welcome back"
      subtitle="Log in to continue your career journey."
      footer={
        <p>
          New to CareerConnect? <Link to="/register">Create an account</Link>
        </p>
      }
    >
      {formError && (
        <div className="alert alert-error" role="alert">
          <Icon name="alertCircle" size={18} />
          <span>{formError}</span>
        </div>
      )}

      <form className="auth-form" onSubmit={handleSubmit} noValidate>
        <div className="form-group">
          <label className="label" htmlFor="login-email">
            Email address
          </label>
          <div className="input-icon-wrap">
            <Icon name="mail" size={17} className="input-icon" />
            <input
              id="login-email"
              name="email"
              type="email"
              className={`input input-with-icon ${fieldErrors.email ? "input-error" : ""}`}
              placeholder="you@example.com"
              value={form.email}
              onChange={handleChange}
              autoComplete="email"
              autoFocus
            />
          </div>
          {fieldErrors.email && <p className="error-text">{fieldErrors.email}</p>}
        </div>

        <div className="form-group">
          <div className="label-row">
            <label className="label" htmlFor="login-password">
              Password
            </label>
          </div>
          <div className="input-icon-wrap">
            <Icon name="lock" size={17} className="input-icon" />
            <input
              id="login-password"
              name="password"
              type={showPassword ? "text" : "password"}
              className={`input input-with-icon input-with-action ${
                fieldErrors.password ? "input-error" : ""
              }`}
              placeholder="Enter your password"
              value={form.password}
              onChange={handleChange}
              autoComplete="current-password"
            />
            <button
              type="button"
              className="input-action"
              onClick={() => setShowPassword((visible) => !visible)}
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              <Icon name={showPassword ? "eyeOff" : "eye"} size={17} />
            </button>
          </div>
          {fieldErrors.password && (
            <p className="error-text">{fieldErrors.password}</p>
          )}
        </div>

        <button
          type="submit"
          className="btn btn-primary btn-block btn-lg"
          disabled={submitting}
        >
          {submitting ? (
            <>
              <Spinner size="sm" /> Logging in…
            </>
          ) : (
            <>
              Log in <Icon name="arrowRight" size={17} />
            </>
          )}
        </button>
      </form>

      <div className="demo-note">
        <Icon name="info" size={16} />
        <p>
          Demo accounts are created by <code>backend/seed.py</code>. Use the
          emails and passwords configured in your <code>.env</code> file.
        </p>
      </div>
    </AuthShell>
  );
}
