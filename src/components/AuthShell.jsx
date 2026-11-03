import { Link } from "react-router-dom";
import Icon from "./Icon";
import Logo from "./Logo";

const BENEFITS = [
  {
    icon: "briefcase",
    text: "Discover curated jobs and internships from growing companies.",
  },
  {
    icon: "clipboard",
    text: "Track every application from pending to selected.",
  },
  {
    icon: "shield",
    text: "Your resume and profile stay private and secure.",
  },
];

export default function AuthShell({ title, subtitle, children, footer }) {
  return (
    <div className="auth-page">
      <aside className="auth-aside">
        <div className="auth-aside-glow" aria-hidden="true" />
        <div className="auth-aside-top">
          <Logo light />
        </div>

        <div className="auth-aside-content">
          <span className="eyebrow eyebrow-light">
            <span className="eyebrow-dot" />
            Build your future with CareerConnect
          </span>
          <h1>One profile. Endless opportunities.</h1>
          <p>
            Join thousands of students taking control of their careers — from
            the first internship to the first full-time role.
          </p>

          <ul className="auth-benefits">
            {BENEFITS.map((benefit) => (
              <li key={benefit.text}>
                <span className="auth-benefit-icon">
                  <Icon name={benefit.icon} size={17} />
                </span>
                {benefit.text}
              </li>
            ))}
          </ul>

          <div className="auth-quote">
            <Icon name="sparkles" size={18} />
            <p>
              "I found my first internship here within two weeks. Keeping every
              application in one dashboard made the process so much calmer."
            </p>
            <span>Ananya · Computer Science student</span>
          </div>
        </div>

        <p className="auth-aside-footer">
          © {new Date().getFullYear()} CareerConnect
        </p>
      </aside>

      <main className="auth-main">
        <div className="auth-mobile-logo">
          <Logo />
        </div>
        <div className="auth-card">
          <Link to="/" className="auth-back">
            <Icon name="arrowLeft" size={15} /> Back to home
          </Link>
          <h2>{title}</h2>
          <p className="auth-subtitle">{subtitle}</p>
          {children}
          {footer && <div className="auth-footer">{footer}</div>}
        </div>
        <p className="auth-legal">
          By continuing you agree to CareerConnect's terms of service and privacy
          policy.
        </p>
      </main>
    </div>
  );
}
