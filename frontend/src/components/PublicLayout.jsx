import { Link, NavLink, Outlet } from "react-router-dom";
import { Brand } from "../design-lab/components";
import "../styles/site.css";

export default function PublicLayout() {
  return (
    <div className="site-shell" id="top">
      <a className="site-skip" href="#main-content">Aller au contenu</a>
      <header className="site-topbar">
        <div className="site-container site-topbar-inner">
          <Brand />
          <nav className="site-navigation" aria-label="Navigation principale">
            <NavLink to="/" end>Les offres</NavLink>
            <Link to="/admin">Administration</Link>
          </nav>
        </div>
      </header>
      <main id="main-content" className="site-main">
        <Outlet />
      </main>
      <footer className="site-footer">
        <div className="site-container site-footer-inner">
          <span>Welcome To My Savane</span>
          <a href="#top">Retour en haut ↑</a>
        </div>
      </footer>
    </div>
  );
}
