import { useEffect, useState } from "react";
import Icon from "./Icon.jsx";
import CustomSelect from "../components/CustomSelect";
import { categories, contracts, copy, jobs, salary } from "./data.js";

export function Brand({ footer = false }) {
  return (
    <a
      className={`brand ${footer ? "brand-footer" : ""}`}
      href="#top"
      aria-label="Welcome To My Savane, retour en haut"
    >
      <span className="brand-mark">
        <img
          src="/logo-welcome-to-my-savane.svg"
          alt=""
          width="42"
          height="42"
        />
      </span>
      <span className="brand-name">
        welcome to
        <br />
        <strong>my savane.</strong>
      </span>
    </a>
  );
}

export function Header({ lab }) {
  return (
    <header className="site-header">
      <Brand />
      <nav aria-label="Navigation principale">
        <a href="#offers" className="nav-active">
          Les offres
        </a>
        <button onClick={() => lab.setPanel("companies")}>
          Les entreprises
        </button>
        <button
          className={lab.onlySaved ? "nav-active" : ""}
          aria-pressed={lab.onlySaved}
          onClick={() => lab.setOnlySaved(!lab.onlySaved)}
        >
          Mes favoris
          {lab.saved.length > 0 && (
            <span className="saved-count">{lab.saved.length}</span>
          )}
        </button>
      </nav>
      <div className="auth-actions">
        <button className="login-button" onClick={() => lab.setPanel("login")}>
          Connexion
        </button>
        <button
          className="button primary register-button"
          onClick={() => lab.setPanel("register")}
        >
          S’inscrire <Icon name="arrow" />
        </button>
      </div>
    </header>
  );
}

export function Search({ lab }) {
  return (
    <form className="search-form" onSubmit={lab.search}>
      <label className="search-field">
        <Icon name="search" />
        <span className="sr-only">Métier, compétence ou entreprise</span>
        <input
          type="search"
          value={lab.draftQuery}
          onChange={(event) => lab.setDraftQuery(event.target.value)}
          placeholder={copy.searchPlaceholder}
        />
      </label>
      <label className="location-field">
        <Icon name="pin" />
        <span className="sr-only">Ville</span>
        <input
          type="search"
          value={lab.draftCity}
          onChange={(event) => lab.setDraftCity(event.target.value)}
          placeholder="Ville ou partout en France"
        />
      </label>
      <button
        className="button primary search-button"
        type="submit"
        disabled={lab.state === "loading"}
      >
        Rechercher <Icon name="arrow" />
      </button>
    </form>
  );
}

export function ResponsiveFilters({ lab }) {
  const [mobile, setMobile] = useState(
    () => window.matchMedia("(max-width: 760px)").matches,
  );
  const [open, setOpen] = useState(false);
  useEffect(() => {
    const media = window.matchMedia("(max-width: 760px)");
    const update = () => setMobile(media.matches);
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);
  if (!mobile) {
    return <FilterRail lab={lab} />;
  }
  return (
    <details
      className="filter-disclosure"
      open={open}
      onToggle={(event) => setOpen(event.currentTarget.open)}
    >
      <summary>
        <Icon name="sliders" />
        Affiner la recherche{lab.hasFilters && <span>Filtres actifs</span>}
        <Icon name="chevron" />
      </summary>
      <FilterRail lab={lab} />
    </details>
  );
}

export function FilterRail({ lab }) {
  return (
    <aside className="filter-rail" aria-label="Filtrer les offres">
      <div className="filter-title">
        <h2>Affiner la recherche</h2>
        <Icon name="sliders" />
      </div>
      <fieldset>
        <legend>Type de contrat</legend>
        {contracts.map((contract) => (
          <label key={contract} className="check-option">
            <input
              type="checkbox"
              checked={lab.contracts.includes(contract)}
              onChange={() => lab.toggleContract(contract)}
            />
            <span>{contract}</span>
            <span className="filter-count">
              {jobs.filter((job) => job.contract === contract).length}
            </span>
          </label>
        ))}
      </fieldset>
      <fieldset>
        <legend>Domaine</legend>
        <label className="select-field">
          <span className="sr-only">Domaine</span>
          <CustomSelect
            ariaLabel="Domaine"
            value={lab.category}
            placeholder="Tous les domaines"
            onChange={lab.setCategory}
            options={categories.map((category) => ({ value: category, label: category }))}
          />
        </label>
      </fieldset>
      <fieldset>
        <legend>Mode de travail</legend>
        <label className="check-option">
          <input
            type="checkbox"
            checked={lab.remote}
            onChange={(event) => lab.setRemote(event.target.checked)}
          />
          <span>Télétravail possible</span>
        </label>
      </fieldset>
      <button className="reset-button" onClick={lab.reset}>
        Réinitialiser les filtres <Icon name="close" />
      </button>
      <p className="filter-note">
        La bonne équipe.
        <br />
        Le bon départ.
      </p>
    </aside>
  );
}

export function FilterBar({ lab }) {
  return (
    <div className="filter-bar" aria-label="Filtrer les offres">
      <label className="select-field">
        <span className="sr-only">Type de contrat</span>
        <CustomSelect
          ariaLabel="Type de contrat"
          value={lab.contracts.length > 1 ? "multiple" : lab.contracts[0] || ""}
          placeholder="Tous les contrats"
          onChange={(value) => lab.setContracts(value ? [value] : [])}
          options={[
            ...(lab.contracts.length > 1 ? [{ value: "multiple", label: `${lab.contracts.length} contrats sélectionnés`, disabled: true }] : []),
            ...contracts.map((contract) => ({ value: contract, label: contract })),
          ]}
        />
      </label>
      <label className="select-field">
        <span className="sr-only">Domaine</span>
        <CustomSelect
          ariaLabel="Domaine"
          value={lab.category}
          placeholder="Tous les domaines"
          onChange={lab.setCategory}
          options={categories.map((category) => ({ value: category, label: category }))}
        />
      </label>
      <button
        className="filter-toggle"
        aria-pressed={lab.remote}
        onClick={() => lab.setRemote(!lab.remote)}
      >
        Télétravail possible{lab.remote && <Icon name="check" />}
      </button>
      {lab.hasFilters && (
        <button className="reset-button" onClick={lab.reset}>
          Réinitialiser <Icon name="close" />
        </button>
      )}
    </div>
  );
}

export function ResultsHeading({ lab }) {
  return (
    <div className="results-heading">
      <div>
        <h2 id="offers-title">
          {lab.onlySaved
            ? "Vos offres sauvegardées"
            : "Les opportunités à explorer"}{" "}
          <span className="result-count" aria-live="polite">
            {lab.state === "empty"
              ? 0
              : lab.state === "loading"
                ? "…"
                : lab.results.length}
          </span>
        </h2>
        <p>
          {lab.query || lab.city
            ? `Résultats pour ${[lab.query, lab.city].filter(Boolean).join(" · ")}`
            : "Des équipes à découvrir. Un parcours à écrire."}
        </p>
      </div>
      <label className="sort-control">
        <span>Trier par</span>
        <CustomSelect
          ariaLabel="Trier les offres"
          value={lab.sort}
          onChange={lab.setSort}
          options={[
            { value: "recent", label: "Plus récentes" },
            { value: "salary", label: "Salaire annualisé ↓" },
            { value: "company", label: "Entreprise A–Z" },
          ]}
        />
      </label>
    </div>
  );
}

export function CompanyMark({ job }) {
  return (
    <span className={`company-mark company-${job.tone}`} aria-hidden="true">
      {job.initials}
    </span>
  );
}

export function SaveButton({ job, lab }) {
  const saved = lab.saved.includes(job.id);
  return (
    <button
      className={`save-button ${saved ? "is-saved" : ""}`}
      aria-label={`${saved ? "Retirer" : "Sauvegarder"} l’offre ${job.title}`}
      aria-pressed={saved}
      onClick={() => lab.toggleSaved(job.id)}
    >
      <Icon name="bookmark" />
    </button>
  );
}

export function JobMeta({ job }) {
  return (
    <div className="job-meta">
      <span>
        {job.contract}
        {job.duration ? ` · ${job.duration}` : ""}
      </span>
      <span>{job.city}</span>
      <span>{salary(job)}</span>
    </div>
  );
}

export function JobActions({ job, lab, onDetails }) {
  return (
    <div className="job-actions">
      <button
        className="text-button"
        onClick={
          onDetails ||
          (() => lab.setExpanded(lab.expanded === job.id ? null : job.id))
        }
        aria-expanded={
          onDetails ? lab.selected === job.id : lab.expanded === job.id
        }
      >
        En savoir plus <Icon name="arrow" />
      </button>
      <button
        className="button apply-button"
        onClick={() => lab.setApplying(lab.applying === job.id ? null : job.id)}
      >
        Postuler <Icon name="arrow" />
      </button>
    </div>
  );
}

export function ApplicationNote({ job, lab }) {
  if (lab.applying !== job.id) {
    return null;
  }
  return (
    <div className="application-note" role="status">
      <strong>Envie de rejoindre {job.company} ?</strong>
      <p>
        La candidature avec votre profil, vos projets et vos expériences sera
        disponible dans le MVP. Ce prototype n’envoie aucune candidature.
      </p>
      <button className="text-button" onClick={() => lab.setApplying(null)}>
        Fermer <Icon name="close" />
      </button>
    </div>
  );
}

export function Details({ job, heading = "Vos missions" }) {
  return (
    <div className="job-details">
      <h3>{heading}</h3>
      <ul>
        {job.missions.map((mission) => (
          <li key={mission}>{mission}</li>
        ))}
      </ul>
      <div className="skill-list">
        {job.skills.map((skill) => (
          <span key={skill}>{skill}</span>
        ))}
      </div>
      <p className="work-mode">
        {job.remote ? "Télétravail partiel possible" : "Poste sur site"} ·
        Publiée il y a {job.age} jour{job.age > 1 ? "s" : ""}
      </p>
    </div>
  );
}

export function JobRow({ job, lab, editorial = false }) {
  return (
    <article className={`job-row ${editorial ? "editorial-row" : ""}`}>
      <div className="job-row-content">
        <div className="job-company">
          <CompanyMark job={job} />
          <div>
            <span className="company-name">{job.company}</span>
            <span className="company-sector">{job.sector}</span>
          </div>
        </div>
        <div className="job-body">
          <span className="job-body-company">{job.company}</span>
          <div className="job-title-line">
            <h3>{job.title}</h3>
            <SaveButton job={job} lab={lab} />
          </div>
          <JobMeta job={job} />
          <p className="job-description">{job.description}</p>
          <div className="job-row-bottom">
            <span className="posted-date">
              Il y a {job.age} jour{job.age > 1 ? "s" : ""}
            </span>
            <JobActions job={job} lab={lab} />
          </div>
        </div>
      </div>
      {lab.expanded === job.id && <Details job={job} />}
      <ApplicationNote job={job} lab={lab} />
    </article>
  );
}

export function ResultsState({ lab, children }) {
  if (lab.state === "loading")
    return (
      <div
        className="loading-state"
        role="status"
        aria-label="Chargement des offres"
      >
        <p>Nous préparons les opportunités…</p>
        {[0, 1, 2].map((index) => (
          <div className="skeleton-row" key={index}>
            <span />
            <span />
            <span />
          </div>
        ))}
      </div>
    );
  if (lab.state === "error")
    return (
      <div className="empty-state" role="alert">
        <h3>Les offres n’ont pas pu être chargées.</h3>
        <p>Votre recherche est conservée. Vous pouvez réessayer.</p>
        <button className="button primary" onClick={lab.retry}>
          Réessayer <Icon name="arrow" />
        </button>
      </div>
    );
  if (lab.results.length === 0 || lab.state === "empty")
    return (
      <div className="empty-state" role="status">
        <h3>
          {lab.onlySaved
            ? "Votre prochaine piste est à découvrir."
            : "Aucune offre pour cette recherche."}
        </h3>
        <p>
          {lab.onlySaved
            ? "Sauvegardez une offre avec le signet pour la retrouver ici."
            : "Essayez un autre métier, une autre ville ou élargissez vos filtres."}
        </p>
        <button className="button primary" onClick={lab.reset}>
          Voir toutes les offres <Icon name="arrow" />
        </button>
      </div>
    );
  return children;
}

export function Footer({ lab }) {
  return (
    <footer className="site-footer">
      <div className="footer-top">
        <Brand footer />
        <p>
          La bonne équipe.
          <br />
          Le bon départ.
        </p>
        <div>
          <a href="#offers">Explorer les offres</a>
          <button onClick={() => lab.setPanel("about")}>
            À propos de la Savane
          </button>
          <button onClick={() => lab.setPanel("privacy")}>
            Confidentialité
          </button>
        </div>
      </div>
      <div className="footer-bottom">
        <span>Welcome To My Savane · Projet étudiant Epitech</span>
        <span>Offres et entreprises fictives · Prototype de démonstration</span>
        <a href="#top">
          Retour en haut <Icon name="arrow" />
        </a>
      </div>
    </footer>
  );
}
