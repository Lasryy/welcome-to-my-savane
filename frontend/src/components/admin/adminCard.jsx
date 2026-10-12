import { Link } from "react-router-dom";
import Icon from "../../design-lab/Icon";

function AdminCard({ title, description, link, header, meta, children, index = 0 }) {
  return (
    <article className={`admin-card tone-${index % 6} rounded-[0_18px_0_0] overflow-hidden min-w-[0] `}>
      {header && <div className="admin-card-header flex items-center gap-3 p-[16px_22px] [background:var(--admin-ink)] text-[var(--admin-paper)]">{header}</div>}
      <div className="admin-card-body grid gap-4 p-[22px_23px] admin-max-1200:p-[20px] admin-max-480:p-[23px]">
        {meta}
        <h3>{title}</h3>
        {description && <p className="admin-description whitespace-pre-line text-[13px] leading-[1.65] max-w-[70ch] wrap-anywhere">{description}</p>}
        {children}
        {link && <Link to={link} className="admin-card-link inline-flex items-center gap-3 pt-3 font-bold">Accéder à la gestion <Icon name="arrow" /></Link>}
      </div>
    </article>
  );
}

export default AdminCard;
