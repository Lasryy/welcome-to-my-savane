import { NavLink } from "react-router-dom";
import SiteHeader from "../../components/SiteHeader";
import UiIcon from "../../components/ui/UiIcon";

export default function CompanyLayout({
  title,
  description,
  children,
  headingTone = "mint",
}) {
  return (
    <div className="app-page">
      <SiteHeader />
      <div className="workspace page-container">
        <aside className="workspace-sidebar">
          <p className="workspace-label">Espace recruteur</p>
          <nav aria-label="Espace recruteur">
            <NavLink to="/company" end>
              <UiIcon name="briefcase" />
              Mes recrutements
            </NavLink>
            <NavLink to="/company/candidates">
              <UiIcon name="user" />
              Annuaire de candidats
            </NavLink>
          </nav>
          <p className="sidebar-note">
            Les offres et les candidatures de ton entreprise, au même endroit.
          </p>
        </aside>
        <main id="main-content" className="workspace-content company-content">
          <header
            className={`page-heading page-heading-banner page-heading-${headingTone}`}
          >
            <h1>{title}</h1>
            {description && <p>{description}</p>}
          </header>
          {children}
        </main>
      </div>
    </div>
  );
}
