import { Link } from "react-router-dom";
import Icon from "../../design-lab/Icon";

function AdminCard({ title, description, link, header, meta, children, index = 0 }) {
  return (
    <article className={`admin-card tone-${index % 6}`}>
      {header && <div className="admin-card-header">{header}</div>}
      <div className="admin-card-body">
        {meta}
        <h3>{title}</h3>
        {description && <p className="admin-description">{description}</p>}
        {children}
        {link && <Link to={link} className="admin-card-link">Accéder à la gestion <Icon name="arrow" /></Link>}
      </div>
    </article>
  );
}

export default AdminCard;
