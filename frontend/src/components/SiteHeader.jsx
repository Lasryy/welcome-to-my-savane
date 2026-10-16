import { useEffect, useRef, useState } from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import UiIcon from "./ui/UiIcon";

export function SiteBrand() {
  return (
    <Link
      to="/"
      className="site-brand"
      aria-label="Welcome To My Savane — Accueil"
    >
      <img
        src="/logo-welcome-to-my-savane-ink.svg"
        width="54"
        height="54"
        alt=""
      />
      <span className="brand-wordmark" aria-hidden="true">
        <span className="brand-greeting">Welcome to</span>
        <strong>My Savane</strong>
      </span>
    </Link>
  );
}

export default function SiteHeader() {
  const [user, setUser] = useState(undefined);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const location = useLocation();
  const navigate = useNavigate();
  const menuRef = useRef(null);

  useEffect(() => {
    const controller = new AbortController();
    fetch("/api/auth/me", {
      credentials: "same-origin",
      signal: controller.signal,
    })
      .then((response) => (response.ok ? response.json() : null))
      .then((account) => {
        if (!controller.signal.aborted) setUser(account);
      })
      .catch(() => {
        if (!controller.signal.aborted) setUser(null);
      });
    if (menuRef.current) menuRef.current.open = false;
    return () => controller.abort();
  }, [location.pathname]);

  async function logout() {
    setPending(true);
    setError("");
    try {
      const response = await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "same-origin",
      });
      if (!response.ok) throw new Error("Déconnexion impossible. Réessaie.");
      setUser(null);
      navigate("/login");
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setPending(false);
    }
  }

  const links = (
    <>
      {user === null && (
        <NavLink to="/" end>
          Accueil
        </NavLink>
      )}
      <NavLink to="/jobs">
        Les offres
      </NavLink>
      {(user?.role === "USER" || user?.role === "ADMIN") && (
        <>
          <NavLink to="/applications">Mes candidatures</NavLink>
          <NavLink to="/profile">Mon profil</NavLink>
        </>
      )}
      {user?.role === "ADMIN" && (
        <NavLink to="/admin">Administration</NavLink>
      )}
      {user?.role === "COMPANY" && (
        <NavLink to="/company">Espace recruteur</NavLink>
      )}
      {user ? (
        <button
          type="button"
          className="nav-logout"
          onClick={logout}
          disabled={pending}
        >
          <UiIcon name="logout" size={17} />
          {pending ? "Déconnexion…" : "Se déconnecter"}
        </button>
      ) : (
        user === null && (
          <>
            <NavLink to="/login">Connexion</NavLink>
            <Link className="button button-primary" to="/register">
              Créer mon compte
            </Link>
          </>
        )
      )}
    </>
  );

  return (
    <>
      <a className="skip-link" href="#main-content">
        Aller au contenu
      </a>
      <header className="site-header">
        <div className="site-header-inner">
          <SiteBrand />
          <nav className="site-nav" aria-label="Navigation principale">
            {links}
          </nav>
          <details className="mobile-navigation" ref={menuRef}>
            <summary aria-label="Menu de navigation">
              <UiIcon name="menu" />
              Menu
            </summary>
            <nav aria-label="Navigation mobile">{links}</nav>
          </details>
        </div>
        {error && (
          <p role="alert" className="form-error page-container">
            {error}
          </p>
        )}
      </header>
    </>
  );
}
