import { Outlet } from "react-router-dom";
import SiteHeader from "./SiteHeader";

export default function PublicLayout() {
  return (
    <div id="top" className="app-page">
      <SiteHeader />
      <main id="main-content" className="flex-1">
        <Outlet />
      </main>
      <footer className="site-footer page-container">
        <span>Welcome To My Savane</span>
        <a href="#top">Retour en haut ↑</a>
      </footer>
    </div>
  );
}
