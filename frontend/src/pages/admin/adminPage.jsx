import { Link } from "react-router-dom";
import UiIcon from "../../components/ui/UiIcon";

const catalogue = [
  {
    to: "/admin/ads",
    title: "Les offres",
    description: "Publier, modifier et fermer les offres d’emploi.",
    icon: "briefcase",
  },
  {
    to: "/admin/companies",
    title: "Les entreprises",
    description: "Présenter les équipes qui recrutent.",
    icon: "building",
  },
  {
    to: "/admin/categories",
    title: "Les catégories",
    description: "Organiser les domaines de métiers.",
    icon: "folder",
  },
  {
    to: "/admin/users",
    title: "Les utilisateurs",
    description: "Gérer les comptes et attribuer les accès recruteur.",
    icon: "user",
  },
];

export default function AdminPage() {
  return (
    <>
      <section className="admin-welcome" aria-labelledby="admin-welcome-title">
        <div>
          <h2 id="admin-welcome-title">Fais grandir les opportunités.</h2>
          <p>
            Un nouveau poste à partager ou des candidatures à suivre ? Retrouve
            les actions essentielles ici.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link className="button button-primary" to="/admin/ads/new">
            <UiIcon name="plus" size={18} />
            Créer une offre
          </Link>
          <Link className="button button-secondary" to="/admin/applications">
            Voir les candidatures
          </Link>
        </div>
      </section>
      <section className="mt-8" aria-labelledby="admin-catalogue-title">
        <h2 id="admin-catalogue-title" className="mb-5">
          Gérer la plateforme
        </h2>
        <div className="admin-directory">
          {catalogue.map((item) => (
            <Link key={item.to} to={item.to}>
              <span className="directory-icon">
                <UiIcon name={item.icon} size={24} />
              </span>
              <span>
                <strong>{item.title}</strong>
                <span>{item.description}</span>
              </span>
              <UiIcon name="arrow" />
            </Link>
          ))}
        </div>
      </section>
    </>
  );
}
