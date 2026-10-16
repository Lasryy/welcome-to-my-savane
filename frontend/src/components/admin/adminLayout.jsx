import { NavLink, Outlet, useLocation } from "react-router-dom";
import SiteHeader from "../SiteHeader";
import UiIcon from "../ui/UiIcon";
import "../../styles/admin.css";

const sections = [
  {
    path: "/admin",
    label: "Vue d’ensemble",
    title: "Vue d’ensemble",
    description:
      "Un espace pour organiser les entreprises, les catégories et les offres de la Savane.",
  },
  {
    path: "/admin/ads",
    label: "Les offres",
    title: "Gestion des offres",
    description:
      "Retrouvez les offres publiées et fermées, affinez votre recherche et mettez leurs informations à jour.",
  },
  {
    path: "/admin/companies",
    label: "Les entreprises",
    title: "Gestion des entreprises",
    description:
      "Présentez les équipes qui recrutent et gardez leurs informations à jour.",
  },
  {
    path: "/admin/categories",
    label: "Les catégories",
    title: "Gestion des catégories",
    description:
      "Organisez les domaines de métiers pour faciliter la découverte des offres.",
  },
  {
    path: "/admin/applications",
    label: "Les candidatures",
    title: "Gestion des candidatures",
    description:
      "Consultez les candidatures reçues et faites évoluer leur statut.",
  },
  {
    path: "/admin/users",
    label: "Les utilisateurs",
    title: "Gestion des utilisateurs",
    description:
      "Consultez les comptes candidats et mettez leurs informations à jour.",
  },
];

export default function AdminLayout() {
  const { pathname } = useLocation();
  const section =
    [...sections]
      .reverse()
      .find(
        (item) =>
          pathname === item.path || pathname.startsWith(`${item.path}/`),
      ) || sections[0];
  const creating = pathname === "/admin/ads/new";
  const editing = pathname.endsWith("/edit");
  const title = creating
    ? "Créer une offre"
    : editing
      ? "Modifier une offre"
      : section.title;
  const description = creating
    ? "Présente le poste, l’équipe et les conditions de travail."
    : editing
      ? "Mets à jour les informations de cette offre."
      : section.description;
  const icons = [
    "folder",
    "briefcase",
    "building",
    "folder",
    "document",
    "user",
  ];

  return (
    <div id="top" className="admin-app app-page">
      <SiteHeader />
      <div className="workspace page-container">
        <aside className="workspace-sidebar">
          <p className="workspace-label">Administration</p>
          <nav aria-label="Administration">
            {sections.map((item, index) => (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === "/admin"}
              >
                <UiIcon name={icons[index]} />
                {item.label}
              </NavLink>
            ))}
          </nav>
          <p className="sidebar-note">
            Le catalogue, les comptes et les candidatures de la Savane.
          </p>
        </aside>
        <main id="main-content" className="workspace-content" tabIndex={-1}>
          <header className="page-heading">
            <h1>{title}</h1>
            <p>{description}</p>
          </header>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
