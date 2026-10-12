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
  { path: "/admin/applications", label: "Les candidatures", title: "Gestion des candidatures", description: "Consultez les candidatures reçues et faites évoluer leur statut." },
  { path: "/admin/users", label: "Les utilisateurs", title: "Gestion des utilisateurs", description: "Consultez les comptes candidats et mettez leurs informations à jour." },
];

export default function AdminLayout() {
  const { pathname } = useLocation();
  let currentPath = pathname;
  if (currentPath.endsWith("/")) {
    currentPath = currentPath.slice(0, -1);
  }

  const pathParts = currentPath.split("/");
  const editing =
    pathParts.length === 5 &&
    pathParts[1] === "admin" &&
    pathParts[2] === "ads" &&
    pathParts[3] !== "" &&
    pathParts[4] === "edit";
  const creating = currentPath === "/admin/ads/new";
  const section = sections.find((item) => item.path === currentPath) || sections[0];

  let title = section.title;
  let description = section.description;
  if (editing) {
    title = "Modifier une offre";
    description = "Ajustez le contenu, les conditions et la visibilité de cette offre.";
  } else if (creating) {
    title = "Créer une offre";
    description = "Présentez un poste et ses missions aux personnes qui cherchent leur prochain projet.";
  }

  return (
    <div
      id="top"
      className="admin-app flex min-h-[100svh] w-full flex-col font-brand text-[14px] leading-[1.55] text-ink tracking-normal [font-synthesis:none]
        [--admin-ink:#252a46] [--admin-paper:#fff9ee] [--admin-coral:#f09169]
        [--admin-yellow:#f0e970] [--admin-blue:#acbefa] [--admin-mint:#bedbc7] [--admin-rule:#8e93a4]"
    >
      <a href="#admin-content" className="admin-skip absolute left-[-9999px] focus:z-[10] focus:left-[20px] focus:top-[12px] focus:p-[12px] focus:[background:var(--admin-paper)]">Aller au contenu</a>
      <header className="admin-cover [background:var(--admin-coral)]">
        <div className="admin-container w-[min(1280px,_calc(100%_-_112px))] [margin-inline:auto] admin-max-1200:w-[calc(100%_-_72px)] admin-max-760:w-[calc(100%_-_40px)]">
          <div className="admin-header flex flex-wrap items-center justify-between gap-5 min-h-[80px] [padding-block:16px] [border-bottom:1px_solid_var(--admin-ink)] admin-max-760:gap-[12px]">
            <Brand />
            <Link to="/" className="admin-button secondary inline-flex min-h-10 items-center justify-center gap-2 px-5 py-3 text-[13px] font-bold [border:1px_solid_var(--admin-ink)] rounded-none no-underline" aria-label="Voir le job board">
              <span className="hidden sm:inline">Voir le job board</span><span className="sm:hidden">Job board</span><Icon name="arrow" />
            </Link>
          </div>
          <nav className="admin-nav flex flex-wrap items-center gap-x-6 gap-y-2 py-3 text-[13px]" aria-label="Administration">
            {sections.map((item) => (
              <NavLink key={item.path} to={item.path} end={item.path === "/admin"}>{item.label}</NavLink>
            ))}
          </nav>
          <div className="admin-hero relative flex items-center justify-between gap-5 [padding-block:28px_40px] admin-max-760:[padding-block:22px_30px]">
            <div>
              <p className="admin-eyebrow text-[12px] font-bold tracking-[.08em] pb-[12px]">WELCOME TO MY SAVANE · ADMIN</p>
              <h1>{title}</h1>
              <p className="admin-intro mt-[20px] max-w-[55ch] leading-[1.7] admin-max-760:pr-[65px]">{description}</p>
            </div>
            <HorizonSign />
          </div>
        </div>
      </header>
      <main id="admin-content" className="admin-container flex-1 py-10 w-[min(1280px,_calc(100%_-_112px))] [margin-inline:auto] admin-max-1200:w-[calc(100%_-_72px)] admin-max-760:w-[calc(100%_-_40px)]" tabIndex={-1}>
        <Outlet />
      </main>
      <footer className="admin-container admin-footer w-[min(1280px,_calc(100%_-_112px))] [margin-inline:auto] admin-max-1200:w-[calc(100%_-_72px)] admin-max-760:w-[calc(100%_-_40px)] py-6 text-xs [border-top:1px_solid_var(--admin-rule)]">Welcome To My Savane · Espace administration</footer>
    </div>
  );
}
