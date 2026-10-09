import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import CustomSelect from "../../components/CustomSelect";
import AdminCard from "../../components/admin/adminCard";
import { AdminListState } from "../../components/admin/adminUi";
import { adminRequest } from "../../services/adminApi";
import { contractLabels, formatDate, formatSalary } from "../../utils/adminUtils";

const sortLabels = {
  recent: "Plus récentes",
  oldest: "Plus anciennes",
  title: "Titre A à Z",
  company: "Entreprise A à Z",
};

export default function AdminAdsPage() {
  const [ads, setAds] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("all");
  const [companyId, setCompanyId] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [contractType, setContractType] = useState("");
  const [sort, setSort] = useState("recent");
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    Promise.all([
      adminRequest("/api/admin/ads", { signal: controller.signal }),
      adminRequest("/api/companies", { signal: controller.signal }),
      adminRequest("/api/categories", { signal: controller.signal }),
    ]).then(([adList, companyList, categoryList]) => {
      if (!Array.isArray(adList) || !Array.isArray(companyList) || !Array.isArray(categoryList)) {
        throw new Error("Les données d’administration reçues sont invalides.");
      }
      if (controller.signal.aborted) {
        return;
      }

      setAds(adList);
      setCompanies(companyList);
      setCategories(categoryList);
      setError("");
    }).catch((requestError) => {
      if (!controller.signal.aborted) {
        setError(requestError.message);
      }
    }).finally(() => {
      if (!controller.signal.aborted) {
        setLoading(false);
      }
    });
    return () => controller.abort();
  }, [reloadKey]);

  const filteredAds = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase("fr");
    const result = ads.filter((ad) => {
      const searchableText = [ad.title, ad.company_name, ad.location, ad.short_description]
        .filter(Boolean).join(" ").toLocaleLowerCase("fr");
      return (!normalizedQuery || searchableText.includes(normalizedQuery))
        && (status === "all" || ad.status === status)
        && (!companyId || String(ad.company_id) === companyId)
        && (!categoryId || String(ad.category_id) === categoryId)
        && (!contractType || ad.contract_type === contractType);
    });
    return result.sort((a, b) => {
      if (sort === "oldest") {
        return new Date(a.created_at) - new Date(b.created_at);
      }
      if (sort === "title") {
        return a.title.localeCompare(b.title, "fr");
      }
      if (sort === "company") {
        const firstCompany = a.company_name || "";
        const secondCompany = b.company_name || "";
        return firstCompany.localeCompare(secondCompany, "fr");
      }

      return new Date(b.created_at) - new Date(a.created_at);
    });
  }, [ads, categoryId, companyId, contractType, query, sort, status]);

  return (
    <>
      <div className="admin-toolbar">
        <div><h2>Offres publiées et fermées</h2><p aria-live="polite">{filteredAds.length} résultat{filteredAds.length !== 1 ? "s" : ""} sur {ads.length}</p></div>
        <Link className="admin-button accent" to="/admin/ads/new">Créer une offre <span aria-hidden="true">＋</span></Link>
      </div>
      <section className="admin-filters" aria-label="Filtres des offres">
        <label className="admin-field" htmlFor="ads-search">Recherche
          <input id="ads-search" type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Titre, entreprise, ville…" />
        </label>
        <div className="admin-filters-grid">
          <label className="admin-field" htmlFor="ads-status">Statut
            <CustomSelect id="ads-status" value={status} onChange={setStatus} options={[{ value: "all", label: "Tous les statuts" }, { value: "published", label: "Publiées" }, { value: "closed", label: "Fermées" }]} />
          </label>
          <label className="admin-field" htmlFor="ads-company">Entreprise
            <CustomSelect id="ads-company" value={companyId} onChange={setCompanyId} placeholder="Toutes les entreprises" options={companies.map((company) => ({ value: company.id, label: company.name }))} />
          </label>
          <label className="admin-field" htmlFor="ads-category">Catégorie
            <CustomSelect id="ads-category" value={categoryId} onChange={setCategoryId} placeholder="Toutes les catégories" options={categories.map((category) => ({ value: category.id, label: category.name }))} />
          </label>
          <label className="admin-field" htmlFor="ads-contract">Contrat
            <CustomSelect id="ads-contract" value={contractType} onChange={setContractType} placeholder="Tous les contrats" options={Object.entries(contractLabels).map(([value, label]) => ({ value, label }))} />
          </label>
          <label className="admin-field" htmlFor="ads-sort">Trier par
            <CustomSelect id="ads-sort" value={sort} onChange={setSort} options={Object.entries(sortLabels).map(([value, label]) => ({ value, label }))} />
          </label>
        </div>
        <button className="admin-button secondary justify-self-start" type="button" onClick={() => { setQuery(""); setStatus("all"); setCompanyId(""); setCategoryId(""); setContractType(""); setSort("recent"); }}>Effacer les filtres</button>
      </section>
      <AdminListState loading={loading} error={error} empty={!filteredAds.length} onRetry={() => { setLoading(true); setReloadKey((key) => key + 1); }}>
        <div className="grid items-start gap-[22px] xl:grid-cols-2">
          {filteredAds.map((ad, index) => (
            <AdminCard key={ad.id} title={ad.title} description={ad.short_description || ad.description} index={index}>
              <div className="admin-meta">
                <span className={`admin-status status-${ad.status}`}>
                  {ad.status === "published" ? "Publiée" : "Fermée"}
                </span>
                <span>{formatDate(ad.created_at)}</span>
              </div>
              <p><strong>{ad.company_name}</strong>{ad.category_name ? ` · ${ad.category_name}` : ""}</p>
              <p>{ad.location || "Lieu à préciser"} · {contractLabels[ad.contract_type] || "Contrat à préciser"}</p>
              <p className="admin-salary">{formatSalary(ad)}</p>
              <div className="admin-actions"><Link className="admin-button primary" to={`/admin/ads/${ad.id}/edit`}>Modifier l’offre</Link></div>
            </AdminCard>
          ))}
        </div>
      </AdminListState>
    </>
  );
}
