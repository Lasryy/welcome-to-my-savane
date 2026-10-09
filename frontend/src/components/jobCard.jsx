import { Link } from "react-router-dom";
import { contractLabels, formatDate, formatSalary, workingTimeLabels } from "../utils/adminUtils";

function companyInitials(name = "") {
  return name.split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]).join("").toLocaleUpperCase("fr") || "?";
}

function JobCard({ ad, index = 0 }) {
  const description = ad.short_description || ad.description || "Consultez l’offre pour découvrir le poste et ses missions.";
  return (
    <article className={`job-poster tone-${index % 6}`} aria-labelledby={`job-title-${ad.id}`}>
      <header className="job-poster-head">
        <span className="job-company-mark" aria-hidden="true">{companyInitials(ad.company_name)}</span>
        <p className="job-company-name">{ad.company_name || "Entreprise"}<span className="job-company-sector">{ad.category_name || "Toutes les équipes"}</span></p>
      </header>
      <div className="job-poster-body">
        <div className="job-poster-meta">
          <span className="job-contract">{contractLabels[ad.contract_type] || "Contrat non renseigné"}</span>
          <span>{ad.location || "Lieu à préciser"}</span>
        </div>
        <h3 id={`job-title-${ad.id}`}>{ad.title}</h3>
        <p className="job-poster-salary">{formatSalary(ad)}</p>
        <p className="job-poster-desc" title={description}>{description}</p>
        <div className="job-poster-footer">
          <span className="job-posted">{workingTimeLabels[ad.working_time] || "Temps à préciser"} · {formatDate(ad.created_at)}</span>
          <Link className="job-open-link" to={`/jobs/${ad.id}`}>Découvrir l’offre <span aria-hidden="true">→</span></Link>
        </div>
      </div>
    </article>
  );
}

export default JobCard;
