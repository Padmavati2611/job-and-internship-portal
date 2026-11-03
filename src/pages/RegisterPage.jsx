import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getErrorMessage, getFieldErrors } from "../api/client";
import { register as registerRequest } from "../api/auth";
import AuthShell from "../components/AuthShell";
import { homePathFor } from "../components/ProtectedRoute";
import Icon from "../components/Icon";
import Spinner from "../components/Spinner";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";

export default function RegisterPage() {
  const navigate = useNavigate();
  const { setSession } = useAuth();
  const { success, error: showError } = useToast();

  const [role, setRole] = useState("student");
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    company_name: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const [formError, setFormError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    document.title = "Create account | CareerConnect";
  }, []);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
    setFieldErrors((current) => ({ ...current, [name]: undefined }));
    setFormError("");
  };

  const validate = () => {
    const errors = {};
    if (!form.name.trim()) errors.name = "Your full name is required.";
    if (role === "recruiter" && !form.company_name.trim()) {
      errors.company_name = "Your company name is required.";
    }
    if (!form.email.trim()) errors.email = "Email is required.";
    else if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(form.email.trim())) {
      errors.email = "Enter a valid email address.";
    }
    if (!form.password) errors.password = "Password is required.";
    else if (form.password.length < 8) {
      errors.password = "Use at least 8 characters.";
    } else if (!/[A-Za-z]/.test(form.password) || !/\d/.test(form.password)) {
      errors.password = "Include at least one letter and one number.";
    }
    if (form.confirmPassword !== form.password) {
      errors.confirmPassword = "Passwords do not match.";
    }
    return errors;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const errors = validate();
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    setSubmitting(true);
    setFormError("");
    try {
      const data = await registerRequest({
        name: form.name.trim(),
        email: form.email.trim(),
        password: form.password,
        role,
        company_name: role === "recruiter" ? form.company_name.trim() : undefined,
      });
      setSession(data.token, data.user);
      success(data.message || "Account created successfully.");
      navigate(homePathFor(data.user.role), { replace: true });
    } catch (err) {
      setFieldErrors(getFieldErrors(err));
      const message = getErrorMessage(err);
      setFormError(message);
      showError(message);
    } finally {
      setSubmitting(false);
    }
  };

  const passwordChecks = [
    { label: "At least 8 characters", valid: form.password.length >= 8 },
    { label: "Contains a letter", valid: /[A-Za-z]/.test(form.password) },
    { label: "Contains a number", valid: /\d/.test(form.password) },
  ];

  return (
    <AuthShell
      title="Create your account"
      subtitle={
        role === "recruiter"
          ? "Post opportunities and hire bright early-career talent."
          : "Start applying to jobs and internships in minutes."
      }
      footer={
        <p>
          Already have an account? <Link to="/login">Log in</Link>
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
        <div className="role-switch" role="tablist" aria-label="Account type">
          <button
            type="button"
            role="tab"
            aria-selected={role === "student"}
            className={`role-option ${role === "student" ? "active" : ""}`}
            onClick={() => setRole("student")}
          >
            <Icon name="graduation" size={18} />
            <span>
              <strong>Student</strong>
              <small>Find jobs & internships</small>
            </span>
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={role === "recruiter"}
            className={`role-option ${role === "recruiter" ? "active" : ""}`}
            onClick={() => setRole("recruiter")}
          >
            <Icon name="building" size={18} />
            <span>
              <strong>Recruiter</strong>
              <small>Post roles & hire</small>
            </span>
          </button>
        </div>

        <div className="form-group">
          <label className="label" htmlFor="register-name">
            Full name
          </label>
          <div className="input-icon-wrap">
            <Icon name="user" size={17} className="input-icon" />
            <input
              id="register-name"
              name="name"
              type="text"
              className={`input input-with-icon ${fieldErrors.name ? "input-error" : ""}`}
              placeholder="Aarav Sharma"
              value={form.name}
              onChange={handleChange}
              autoComplete="name"
              autoFocus
            />
          </div>
          {fieldErrors.name && <p className="error-text">{fieldErrors.name}</p>}
        </div>

        {role === "recruiter" && (
          <div className="form-group">
            <label className="label" htmlFor="register-company">
              Company name
            </label>
            <div className="input-icon-wrap">
              <Icon name="building" size={17} className="input-icon" />
              <input
                id="register-company"
                name="company_name"
                type="text"
                className={`input input-with-icon ${
                  fieldErrors.company_name ? "input-error" : ""
                }`}
                placeholder="NovaTech Solutions"
                value={form.company_name}
                onChange={handleChange}
              />
            </div>
            {fieldErrors.company_name && (
              <p className="error-text">{fieldErrors.company_name}</p>
            )}
          </div>
        )}

        <div className="form-group">
          <label className="label" htmlFor="register-email">
            Email address
          </label>
          <div className="input-icon-wrap">
            <Icon name="mail" size={17} className="input-icon" />
            <input
              id="register-email"
              name="email"
              type="email"
              className={`input input-with-icon ${fieldErrors.email ? "input-error" : ""}`}
              placeholder="you@example.com"
              value={form.email}
              onChange={handleChange}
              autoComplete="email"
            />
          </div>
          {fieldErrors.email && <p className="error-text">{fieldErrors.email}</p>}
        </div>

        <div className="form-group">
          <label className="label" htmlFor="register-password">
            Password
          </label>
          <div className="input-icon-wrap">
            <Icon name="lock" size={17} className="input-icon" />
            <input
              id="register-password"
              name="password"
              type={showPassword ? "text" : "password"}
              className={`input input-with-icon input-with-action ${
                fieldErrors.password ? "input-error" : ""
              }`}
              placeholder="Create a strong password"
              value={form.password}
              onChange={handleChange}
              autoComplete="new-password"
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
          {form.password && (
            <ul className="password-checks">
              {passwordChecks.map((check) => (
                <li
                  key={check.label}
                  className={check.valid ? "check-valid" : ""}
                >
                  <Icon name={check.valid ? "checkCircle" : "circle"} size={13} />
                  {check.label}
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="form-group">
          <label className="label" htmlFor="register-confirm">
            Confirm password
          </label>
          <div className="input-icon-wrap">
            <Icon name="lock" size={17} className="input-icon" />
            <input
              id="register-confirm"
              name="confirmPassword"
              type={showPassword ? "text" : "password"}
              className={`input input-with-icon ${
                fieldErrors.confirmPassword ? "input-error" : ""
              }`}
              placeholder="Re-enter your password"
              value={form.confirmPassword}
              onChange={handleChange}
              autoComplete="new-password"
            />
          </div>
          {fieldErrors.confirmPassword && (
            <p className="error-text">{fieldErrors.confirmPassword}</p>
          )}
        </div>

        <button
          type="submit"
          className="btn btn-primary btn-block btn-lg"
          disabled={submitting}
        >
          {submitting ? (
            <>
              <Spinner size="sm" /> Creating account…
            </>
          ) : (
            <>
              {role === "recruiter" ? "Create recruiter account" : "Create account"}
              <Icon name="arrowRight" size={17} />
            </>
          )}
        </button>
      </form>
    </AuthShell>
  );
}
