import AdminCard from "../../components/admin/adminCard";

function AdminPage() {
  return (
    <main>
      <h1>Administration</h1>
      <p>Choisissez une section pour administrer le job board.</p>

      <nav aria-label="Sections de l’administration">
        <AdminCard
          title="Gérer les offres"
          description="Accédez à la gestion des offres d’emploi."
          link="/admin/ads"
        />
        <AdminCard
          title="Gérer les entreprises"
          description="Accédez à la gestion des entreprises du job board."
          link="/admin/companies"
        />
        <AdminCard
          title="Gérer les catégories"
          description="Accédez à la gestion des catégories de métiers."
          link="/admin/categories"
        />
      </nav>
    </main>
  );
}

export default AdminPage;
