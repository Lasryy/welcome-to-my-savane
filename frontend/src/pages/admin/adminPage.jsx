import AdminCard from "../../components/admin/adminCard";

function AdminPage() {
  return (
    <section aria-labelledby="admin-sections-title">
      <h2 id="admin-sections-title" className="mb-6">Choisissez votre terrain.</h2>
      <div className="admin-grid">
        <AdminCard
          title="Gérer les offres"
          description="Accédez à la gestion des offres d’emploi."
          link="/admin/ads"
          index={0}
        />
        <AdminCard
          title="Gérer les entreprises"
          description="Accédez à la gestion des entreprises du job board."
          link="/admin/companies"
          index={1}
        />
        <AdminCard
          title="Gérer les catégories"
          description="Accédez à la gestion des catégories de métiers."
          link="/admin/categories"
          index={3}
        />
      </div>
    </section>
  );
}

export default AdminPage;
