import { Link } from "react-router-dom";
import Icon from "./Icon";
import Logo from "./Logo";

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-grid">
          <div className="footer-brand">
            <Logo light />
            <p>
              Connecting ambitious students with meaningful jobs and internships.
              Build your future, one application at a time.
            </p>
            <div className="footer-contact">
              <span>
                <Icon name="mail" size={16} /> hello@careerconnect.com
              </span>
              <span>
                <Icon name="mapPin" size={16} /> Bengaluru, India
              </span>
            </div>
          </div>

          <div className="footer-column">
            <h4>Explore</h4>
            <Link to="/jobs">All opportunities</Link>
            <Link to="/internships">Internships</Link>
            <Link to="/jobs?job_type=job">Full-time jobs</Link>
            <Link to="/jobs?work_mode=remote">Remote roles</Link>
          </div>

          <div className="footer-column">
            <h4>For students</h4>
            <Link to="/register">Create an account</Link>
            <Link to="/login">Student login</Link>
            <Link to="/dashboard/profile">Build your profile</Link>
            <Link to="/dashboard/applications">Track applications</Link>
          </div>

          <div className="footer-column">
            <h4>Platform</h4>
            <Link to="/">Home</Link>
            <Link to="/login">Admin login</Link>
            <a href="http://localhost:5000/api/health" target="_blank" rel="noreferrer">
              API status
            </a>
            <Link to="/register">Get started</Link>
          </div>
        </div>

        <div className="footer-bottom">
          <p>© {new Date().getFullYear()} CareerConnect. All rights reserved.</p>
          <p>Built with React, Flask and MySQL.</p>
        </div>
      </div>
    </footer>
  );
}
