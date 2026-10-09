import "./auth.css";

/** Shared layout for the login and registration pages. */
export default function AuthLayout({
  title,
  description,
  children,
  footer,
}) {
  return (
    <main className="auth-page">
      <header className="auth-header">
        <a
          className="auth-brand"
          href="/"
          aria-label="Welcome To My Savane — Retour aux offres"
        >
          <img
            src="/logo-welcome-to-my-savane.svg"
            alt=""
            aria-hidden="true"
          />
          <span className="auth-brand-name">
            Welcome
            <br />
            To My Savane
          </span>
        </a>

        <a className="auth-back-link" href="/">
          Retour aux offres
        </a>
      </header>

      <div className="auth-content">
        <section className="auth-panel" aria-labelledby="auth-title">
          <h1 id="auth-title">{title}</h1>
          <p className="auth-description">{description}</p>

          <div className="auth-form-content">{children}</div>

          {footer && <div className="auth-footer">{footer}</div>}
        </section>
      </div>
    </main>
  );
}
