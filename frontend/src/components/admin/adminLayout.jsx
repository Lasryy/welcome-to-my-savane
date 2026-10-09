import { Link, NavLink, Outlet, useLocation } from "react-router-dom";
import { Brand } from "../../design-lab/components";
import Icon from "../../design-lab/Icon";
import HorizonSign from "../horizonSign";
import "../../styles/admin.css";

const sections = [
  { path: "/admin", label: "Vue d’ensemble", title: "Administration", description: "Un espace pour organiser les entreprises, les catégories et les offres de la Savane." },
  { path: "/admin/ads", label: "Les offres", title: "Gestion des offres", description: "Retrouvez les offres publiées et fermées, affinez votre recherche et mettez leurs informations à jour." },
  { path: "/admin/companies", label: "Les entreprises", title: "Gestion des entreprises", description: "Présentez les équipes qui recrutent et gardez leurs informations à jour." },
  { path: "/admin/categories", label: "Les catégories", title: "Gestion des catégories", description: "Organisez les domaines de métiers pour faciliter la découverte des offres." },
];

export default function AdminLayout() {
  const { pathname } = useLocation();
  const editing = /^\/admin\/ads\/[^/]+\/edit\/?$/.test(pathname);
  const creating = /^\/admin\/ads\/new\/?$/.test(pathname);
  const section = sections.find((item) => item.path === pathname.replace(/\/$/, "")) || sections[0];

  return (
    <div className="admin-app" id="top">
      <a href="#admin-content" className="admin-skip">Aller au contenu</a>
      <header className="admin-cover">
        <div className="admin-container">
          <div className="admin-header">
            <Brand />
            <Link to="/" className="admin-button secondary" aria-label="Voir le job board">
              <span className="hidden sm:inline">Voir le job board</span><span className="sm:hidden">Job board</span><Icon name="arrow" />
            </Link>
          </div>
          <nav className="admin-nav" aria-label="Administration">
            {sections.map((item) => (
              <NavLink key={item.path} to={item.path} end={item.path === "/admin"}>{item.label}</NavLink>
            ))}
          </nav>
          <div className="admin-hero">
            <div>
              <p className="admin-eyebrow">WELCOME TO MY SAVANE · ADMIN</p>
              <h1>{editing ? "Modifier une offre" : creating ? "Créer une offre" : section.title}</h1>
              <p className="admin-intro">{editing ? "Ajustez le contenu, les conditions et la visibilité de cette offre." : creating ? "Présentez un poste et ses missions aux personnes qui cherchent leur prochain projet." : section.description}</p>
            </div>
            <HorizonSign />
          </div>
        </div>
      </header>
      <main id="admin-content" className="admin-container flex-1 py-10" tabIndex={-1}>
        <Outlet />
      </main>
      <footer className="admin-container admin-footer">Welcome To My Savane · Espace administration</footer>
    </div>
  );
}
