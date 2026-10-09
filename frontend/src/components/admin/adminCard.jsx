import { Link } from "react-router-dom";

function AdminCard({ title, description, link }) {
  return (
    <article>
      <h2>
        <Link to={link}>{title}</Link>
      </h2>
      <p>{description}</p>
    </article>
  );
}

export default AdminCard;
