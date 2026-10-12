import AdminCard from "../../components/admin/adminCard";

function AdminPage() {
  return (
    <section aria-labelledby="admin-sections-title">
      <h2 id="admin-sections-title" className="mb-6">Choisissez votre terrain.</h2>
      <div className="admin-grid grid items-start [grid-template-columns:repeat(3,_minmax(0,_1fr))] gap-[22px] admin-max-1200:gap-[17px] admin-max-1000:[grid-template-columns:repeat(2,_minmax(0,_1fr))] admin-max-480:[grid-template-columns:minmax(0,_1fr)]">
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
        <AdminCard
          title="Gérer les candidatures"
          description="Consultez les candidatures reçues et leur statut."
          link="/admin/applications"
          index={2}
        />
        <AdminCard
          title="Gérer les utilisateurs"
          description="Consultez et modifiez les comptes candidats."
          link="/admin/users"
          index={4}
        />
      </div>
    </section>
  );
}

export default AdminPage;
