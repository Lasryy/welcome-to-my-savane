import { Link } from "react-router-dom";
import { contractLabels, formatDate, formatSalary, workingTimeLabels } from "../utils/adminUtils";
import CompanyLogo from "./CompanyLogo";

function JobCard({ ad, index = 0 }) {
  const description = ad.short_description || ad.description || "Consultez l’offre pour découvrir le poste et ses missions.";
  const cardColors = ["bg-lavender", "bg-mint", "bg-mint", "bg-sun", "bg-lavender", "bg-mint"];

  return (
    <article className={`job-card flex min-h-full min-w-0 flex-col overflow-hidden rounded-[12px_28px_12px_12px] border border-rule ${cardColors[index % cardColors.length]}`} aria-labelledby={`job-title-${ad.id}`}>
      <header className="flex min-h-[74px] items-center gap-3 bg-ink px-[18px] py-3.5 text-paper">
        <CompanyLogo name={ad.company_name} url={ad.company_logo_url} size={44} />
        <p className="min-w-0 break-words font-bold">
          {ad.company_name || "Entreprise"}
          <span className="block text-[11px] font-normal text-[#e3e7f4]">
            {ad.category_name || "Toutes les équipes"}
          </span>
        </p>
      </header>
      <div className="flex flex-1 flex-col p-[20px_22px] max-[1200px]:p-[18px] max-[480px]:p-[23px]">
        <div className="flex items-center justify-between gap-3 text-xs">
          <span className="whitespace-nowrap border border-[#565d78] px-2 py-1">
            {contractLabels[ad.contract_type] || "Contrat non renseigné"}
          </span>
          <span>{ad.location || "Lieu à préciser"}</span>
        </div>
        <h3 id={`job-title-${ad.id}`} className="my-3.5 line-clamp-2 min-h-[2.26em] break-words text-[26px] font-[750] leading-[1.13] tracking-[-.035em] max-[480px]:text-[30px]">
          {ad.title}
        </h3>
        <p className="mb-3 text-[13px] font-bold tabular-nums">{formatSalary(ad)}</p>
        <p className="line-clamp-3 min-h-[4.65em] break-words text-[13px] leading-[1.55]" title={description}>
          {description}
        </p>
        <div className="mt-auto flex items-center justify-between gap-2.5 pt-[18px]">
          <span className="text-[11px]">
            {workingTimeLabels[ad.working_time] || "Temps à préciser"} · {formatDate(ad.created_at)}
          </span>
          <Link className="whitespace-nowrap text-[13px] font-bold underline-offset-4 hover:underline" to={`/jobs/${ad.id}`}>
            Découvrir l’offre <span aria-hidden="true">→</span>
          </Link>
        </div>
      </div>
    </article>
  );
}

export default JobCard;
