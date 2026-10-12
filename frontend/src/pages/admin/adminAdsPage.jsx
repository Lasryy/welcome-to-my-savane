import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import CustomSelect from "../../components/CustomSelect";
import AdminCard from "../../components/admin/adminCard";
import { AdminDeleteConfirmation, AdminFeedback, AdminListState } from "../../components/admin/adminUi";
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
  const [pending, setPending] = useState(null);
  const [feedback, setFeedback] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  async function changeStatus(ad) {
    if (pending) return;
    const nextStatus = ad.status === "published" ? "closed" : "published";
    setPending({ id: ad.id, action: "status" });
    setFeedback(null);
    try {
      const updated = await adminRequest(`/api/admin/ads/${ad.id}`, {
        method: "PATCH", body: { status: nextStatus },
      });
      setAds((current) => current.map((item) => item.id === ad.id ? updated : item));
      setDeletingId(null);
      setFeedback({ type: "success", message: nextStatus === "closed" ? "L’offre a été fermée. Les nouvelles candidatures sont refusées." : "L’offre a été rouverte." });
    } catch (requestError) {
      setFeedback({ type: "error", message: requestError.message });
    } finally {
      setPending(null);
    }
  }

  async function deleteAd(ad) {
    if (pending) return;
    setPending({ id: ad.id, action: "delete" });
    setFeedback(null);
    try {
      await adminRequest(`/api/admin/ads/${ad.id}`, { method: "DELETE" });
      setAds((current) => current.filter((item) => item.id !== ad.id));
      setDeletingId(null);
      setFeedback({ type: "success", message: "L’offre a été supprimée." });
    } catch (requestError) {
      setFeedback({ type: "error", message: requestError.message });
    } finally {
      setPending(null);
    }
  }

  function clearFilters() {
    setQuery("");
    setStatus("all");
    setCompanyId("");
    setCategoryId("");
    setContractType("");
    setSort("recent");
  }

  function retryLoading() {
    setLoading(true);
    setReloadKey((key) => key + 1);
  }

  useEffect(() => {
    const controller = new AbortController();
    async function loadAdminData() {
      try {
        const [adList, companyList, categoryList] = await Promise.all([
          adminRequest("/api/admin/ads", { signal: controller.signal }),
          adminRequest("/api/companies", { signal: controller.signal }),
          adminRequest("/api/categories", { signal: controller.signal }),
        ]);

        const listsAreValid =
          Array.isArray(adList) &&
          Array.isArray(companyList) &&
          Array.isArray(categoryList);
        if (!listsAreValid) {
          throw new Error("Les données d’administration reçues sont invalides.");
        }
        if (controller.signal.aborted) {
          return;
        }

        setAds(adList);
        setCompanies(companyList);
        setCategories(categoryList);
        setError("");
      } catch (requestError) {
        if (!controller.signal.aborted) {
          setError(requestError.message);
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    loadAdminData();
    return () => controller.abort();
  }, [reloadKey]);

  const filteredAds = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase("fr");
    const result = ads.filter((ad) => {
      const searchableText = [ad.title, ad.company_name, ad.location, ad.short_description]
        .filter(Boolean).join(" ").toLocaleLowerCase("fr");
      const matchesQuery =
        !normalizedQuery || searchableText.includes(normalizedQuery);
      const matchesStatus = status === "all" || ad.status === status;
      const matchesCompany = !companyId || String(ad.company_id) === companyId;
      const matchesCategory = !categoryId || String(ad.category_id) === categoryId;
      const matchesContract = !contractType || ad.contract_type === contractType;

      return (
        matchesQuery &&
        matchesStatus &&
        matchesCompany &&
        matchesCategory &&
        matchesContract
      );
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
      <AdminFeedback feedback={feedback} />
      <div className="admin-toolbar mb-6 flex flex-wrap items-center justify-between gap-4">
        <div><h2>Offres publiées et fermées</h2><p aria-live="polite">{filteredAds.length} résultat{filteredAds.length !== 1 ? "s" : ""} sur {ads.length}</p></div>
        <Link className="admin-button accent inline-flex min-h-10 items-center justify-center gap-2 px-5 py-3 text-[13px] font-bold [border:1px_solid_var(--admin-ink)] rounded-none no-underline" to="/admin/ads/new">Créer une offre <span aria-hidden="true">＋</span></Link>
      </div>
      <section className="admin-filters mb-6 grid gap-4 p-5 [background:var(--admin-ink)] text-[var(--admin-paper)]" aria-label="Filtres des offres">
        <label className="admin-field grid min-w-0 gap-2" htmlFor="ads-search">Recherche
          <input id="ads-search" type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Titre, entreprise, ville…" />
        </label>
        <div className="admin-filters-grid grid gap-4 [grid-template-columns:repeat(3,_minmax(0,_1fr))] admin-max-760:[grid-template-columns:repeat(2,_minmax(0,_1fr))] admin-max-480:[grid-template-columns:minmax(0,_1fr)]">
          <label className="admin-field grid min-w-0 gap-2" htmlFor="ads-status">Statut
            <CustomSelect id="ads-status" value={status} onChange={setStatus} options={[{ value: "all", label: "Tous les statuts" }, { value: "published", label: "Publiées" }, { value: "closed", label: "Fermées" }]} />
          </label>
          <label className="admin-field grid min-w-0 gap-2" htmlFor="ads-company">Entreprise
            <CustomSelect id="ads-company" value={companyId} onChange={setCompanyId} placeholder="Toutes les entreprises" options={companies.map((company) => ({ value: company.id, label: company.name }))} />
          </label>
          <label className="admin-field grid min-w-0 gap-2" htmlFor="ads-category">Catégorie
            <CustomSelect id="ads-category" value={categoryId} onChange={setCategoryId} placeholder="Toutes les catégories" options={categories.map((category) => ({ value: category.id, label: category.name }))} />
          </label>
          <label className="admin-field grid min-w-0 gap-2" htmlFor="ads-contract">Contrat
            <CustomSelect id="ads-contract" value={contractType} onChange={setContractType} placeholder="Tous les contrats" options={Object.entries(contractLabels).map(([value, label]) => ({ value, label }))} />
          </label>
          <label className="admin-field grid min-w-0 gap-2" htmlFor="ads-sort">Trier par
            <CustomSelect id="ads-sort" value={sort} onChange={setSort} options={Object.entries(sortLabels).map(([value, label]) => ({ value, label }))} />
          </label>
        </div>
        <button className="admin-button secondary justify-self-start inline-flex min-h-10 items-center justify-center gap-2 px-5 py-3 text-[13px] font-bold [border:1px_solid_var(--admin-ink)] rounded-none no-underline" type="button" onClick={clearFilters}>Effacer les filtres</button>
      </section>
      <AdminListState loading={loading} error={error} empty={!filteredAds.length} onRetry={retryLoading}>
        <div className="grid items-start gap-[22px] xl:grid-cols-2">
          {filteredAds.map((ad, index) => (
            <AdminCard key={ad.id} title={ad.title} description={ad.short_description || ad.description} index={index}>
              <div className="admin-meta flex flex-wrap items-center justify-between gap-3 text-xs">
                <span className={`admin-status status-${ad.status} inline-flex items-center px-2 py-1 text-xs font-bold [border:1px_solid_currentColor] `}>
                  {ad.status === "published" ? "Publiée" : "Fermée"}
                </span>
                <span>{formatDate(ad.created_at)}</span>
              </div>
              <p><strong>{ad.company_name}</strong>{ad.category_name ? ` · ${ad.category_name}` : ""}</p>
              <p>{ad.location || "Lieu à préciser"} · {contractLabels[ad.contract_type] || "Contrat à préciser"}</p>
              <p className="admin-salary font-bold tabular-nums">{formatSalary(ad)}</p>
              <div className="admin-actions flex flex-wrap items-center gap-3">
                <Link className="admin-button primary inline-flex min-h-10 items-center justify-center gap-2 px-5 py-3 text-[13px] font-bold [border:1px_solid_var(--admin-ink)] rounded-none no-underline" to={`/admin/ads/${ad.id}/edit`}>Modifier l’offre</Link>
                <button className="admin-button secondary inline-flex min-h-10 items-center justify-center gap-2 px-5 py-3 text-[13px] font-bold [border:1px_solid_var(--admin-ink)] rounded-none no-underline" type="button" disabled={Boolean(pending)} onClick={() => changeStatus(ad)}>
                  {pending?.id === ad.id && pending.action === "status" ? "Mise à jour…" : ad.status === "published" ? "Fermer l’offre" : "Rouvrir l’offre"}
                </button>
                <button className="admin-button secondary inline-flex min-h-10 items-center justify-center gap-2 px-5 py-3 text-[13px] font-bold [border:1px_solid_var(--admin-ink)] rounded-none no-underline" type="button" disabled={Boolean(pending)} onClick={() => { setDeletingId(ad.id); setFeedback(null); }}>Supprimer</button>
              </div>
              {deletingId === ad.id && (
                <AdminDeleteConfirmation name={ad.title} pending={Boolean(pending)} onConfirm={() => deleteAd(ad)} onCancel={() => setDeletingId(null)} />
              )}
            </AdminCard>
          ))}
        </div>
      </AdminListState>
    </>
  );
}
