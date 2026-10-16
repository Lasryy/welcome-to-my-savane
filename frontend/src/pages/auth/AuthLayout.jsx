import { Link } from "react-router-dom";
import { SiteBrand } from "../../components/SiteHeader";

/** The same entry layout is used for login and registration. */
export default function AuthLayout({ title, description, children, footer, variant = "login" }) {
  const illustration = variant === "register"
    ? {
        src: "/illustrations/auth-meerkat-approved.webp",
        alt: "Suricate avec un carnet de profil, prêt à commencer son parcours.",
      }
    : {
        src: "/illustrations/auth-warthog-approved.webp",
        alt: "Phacochère souriant, illustré aux couleurs de la savane.",
      };

  return (
    <div className="auth-page">
      <header className="auth-brand-header">
        <div className="auth-entry-header page-container">
          <SiteBrand />
          <Link className="text-link" to="/jobs">
            Retour aux offres <span aria-hidden="true">↗</span>
          </Link>
        </div>
      </header>
      <main className="auth-entry page-container">
        <aside className="auth-story">
          <h2>
            Le prochain
            <br />
            chapitre,
            <br />
            <span>c’est le tien.</span>
          </h2>
          <p>
            Un profil pour raconter ton parcours.
            <br />
            Des opportunités pour écrire la suite.
          </p>
          <img
            className={`auth-story-art auth-story-art--${variant}`}
            src={illustration.src}
            alt={illustration.alt}
          />
        </aside>
        <section className="auth-panel" aria-labelledby="auth-title">
          <h1 id="auth-title" className="auth-title">
            {title}
          </h1>
          <p className="auth-description">{description}</p>
          <div className="auth-form-content">{children}</div>
          {footer && <div className="auth-footer">{footer}</div>}
        </section>
      </main>
    </div>
  );
}
