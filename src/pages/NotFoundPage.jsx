import { useEffect } from "react";
import { Link } from "react-router-dom";
import Icon from "../components/Icon";

export default function NotFoundPage() {
  useEffect(() => {
    document.title = "Page not found | CareerConnect";
  }, []);

  return (
    <section className="not-found">
      <div className="not-found-card">
        <span className="not-found-code">404</span>
        <h1>This page took a different career path.</h1>
        <p>
          The page you're looking for doesn't exist or may have moved. Let's get
          you back to the opportunities.
        </p>
        <div className="not-found-actions">
          <Link to="/" className="btn btn-primary">
            <Icon name="arrowLeft" size={16} /> Back to home
          </Link>
          <Link to="/jobs" className="btn btn-secondary">
            Browse opportunities <Icon name="arrowRight" size={16} />
          </Link>
        </div>
      </div>
    </section>
  );
}
