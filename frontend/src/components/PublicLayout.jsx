import { Link, Outlet, useLocation } from "react-router-dom";
import SiteHeader, { SiteBrand } from "./SiteHeader";

export default function PublicLayout() {
  const isHome = useLocation().pathname === "/";
  return (
    <div id="top" className="app-page">
      <SiteHeader />
      <main id="main-content" className="flex-1">
        <Outlet />
      </main>
      {isHome ? (
        <footer className="landing-footer page-container">
          <div>
            <SiteBrand />
            <p>Un nouveau job. Un nouvel horizon.</p>
          </div>
          <nav aria-label="Explorer My Savane">
            <h2>Votre prochaine étape</h2>
            <Link to="/jobs">Explorer les offres</Link>
            <Link to="/register">Créer un compte</Link>
            <Link to="/login">Se connecter</Link>
          </nav>
          <nav aria-label="Espace professionnel">
            <h2>Vous recrutez ?</h2>
            <Link to="/company">Espace recruteur</Link>
            <Link to="/company/candidates">Annuaire des candidats</Link>
          </nav>
        </footer>
      ) : (
        <footer className="site-footer page-container">
          <span>Welcome To My Savane</span>
          <a href="#top">Retour en haut ↑</a>
        </footer>
      )}
    </div>
  );
}
