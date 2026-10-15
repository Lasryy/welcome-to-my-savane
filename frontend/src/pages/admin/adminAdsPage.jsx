import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import CustomSelect from "../../components/CustomSelect";
import AdminCard from "../../components/admin/adminCard";
import { AdminDeleteConfirmation, AdminFeedback, AdminListState } from "../../components/admin/adminUi";
import { adminRequest } from "../../services/adminApi";
import { contractLabels, formatDate, formatSalary } from "../../utils/adminUtils";
import AdminPagination from "../../components/admin/AdminPagination";

const sortLabels = {
  recent: "Plus récentes",
  oldest: "Plus anciennes",
  title: "Titre A à Z",
  company: "Entreprise A à Z",
};

export default function AdminAdsPage() {
  const [ads, setAds] = useState([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [page, setPage] = useState(1);
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
      setPage(1);
      setReloadKey((key) => key + 1);
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
      setPage(1);
      setReloadKey((key) => key + 1);
      setDeletingId(null);
      setFeedback({ type: "success", message: "L’offre a été supprimée." });
    } catch (requestError) {
      setFeedback({ type: "error", message: requestError.message });
    } finally {
      setPending(null);
    }
  }

  function clearFilters() {
    setLoading(true);
    setPage(1); setQuery(""); setStatus("all"); setCompanyId(""); setCategoryId(""); setContractType(""); setSort("recent");
  }

  function updateFilter(setter, value) {
    setLoading(true);
    setPage(1);
    setter(value);
  }

  function retryLoading() {
    setLoading(true);
    setReloadKey((key) => key + 1);
  }

  useEffect(() => {
    const controller = new AbortController();
    async function loadAdminData() {
      try {
        const params = new URLSearchParams({ page: String(page), page_size: "20", status, sort });
        if (query.trim()) params.set("q", query.trim());
        if (companyId) params.set("company_id", companyId);
        if (categoryId) params.set("category_id", categoryId);
        if (contractType) params.set("contract_type", contractType);
        const [adList, companyList, categoryList] = await Promise.all([
          adminRequest(`/api/admin/ads?${params}`, { signal: controller.signal }),
          adminRequest("/api/companies", { signal: controller.signal }),
          adminRequest("/api/categories", { signal: controller.signal }),
        ]);

        const listsAreValid =
          Array.isArray(adList?.items) &&
          Array.isArray(companyList) &&
          Array.isArray(categoryList);
        if (!listsAreValid) {
          throw new Error("Les données d’administration reçues sont invalides.");
        }
        if (controller.signal.aborted) {
          return;
        }

        setAds(adList.items);
        setTotal(adList.total);
        setTotalPages(adList.total_pages);
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
  }, [reloadKey, page, query, status, sort, companyId, categoryId, contractType]);

  return (
    <>
      <AdminFeedback feedback={feedback} />
      <div className="admin-toolbar mb-6 flex flex-wrap items-center justify-between gap-4">
        <div><h2>Offres publiées et fermées</h2><p aria-live="polite">{total} résultat{total !== 1 ? "s" : ""}</p></div>
        <Link className="admin-button accent inline-flex min-h-10 items-center justify-center gap-2 px-5 py-3 text-[13px] font-bold [border:1px_solid_var(--admin-ink)] rounded-none no-underline" to="/admin/ads/new">Créer une offre <span aria-hidden="true">＋</span></Link>
      </div>
      <section className="admin-filters mb-6 grid gap-4 p-5 [background:var(--admin-ink)] text-[var(--admin-paper)]" aria-label="Filtres des offres">
        <label className="admin-field grid min-w-0 gap-2" htmlFor="ads-search">Recherche
          <input id="ads-search" type="search" value={query} onChange={(event) => updateFilter(setQuery, event.target.value)} placeholder="Titre, entreprise, ville…" />
        </label>
        <div className="admin-filters-grid grid gap-4 [grid-template-columns:repeat(3,_minmax(0,_1fr))] admin-max-760:[grid-template-columns:repeat(2,_minmax(0,_1fr))] admin-max-480:[grid-template-columns:minmax(0,_1fr)]">
          <label className="admin-field grid min-w-0 gap-2" htmlFor="ads-status">Statut
            <CustomSelect id="ads-status" value={status} onChange={(value) => updateFilter(setStatus, value)} options={[{ value: "all", label: "Tous les statuts" }, { value: "published", label: "Publiées" }, { value: "closed", label: "Fermées" }]} />
          </label>
          <label className="admin-field grid min-w-0 gap-2" htmlFor="ads-company">Entreprise
            <CustomSelect id="ads-company" value={companyId} onChange={(value) => updateFilter(setCompanyId, value)} placeholder="Toutes les entreprises" options={companies.map((company) => ({ value: company.id, label: company.name }))} />
          </label>
          <label className="admin-field grid min-w-0 gap-2" htmlFor="ads-category">Catégorie
            <CustomSelect id="ads-category" value={categoryId} onChange={(value) => updateFilter(setCategoryId, value)} placeholder="Toutes les catégories" options={categories.map((category) => ({ value: category.id, label: category.name }))} />
          </label>
          <label className="admin-field grid min-w-0 gap-2" htmlFor="ads-contract">Contrat
            <CustomSelect id="ads-contract" value={contractType} onChange={(value) => updateFilter(setContractType, value)} placeholder="Tous les contrats" options={Object.entries(contractLabels).map(([value, label]) => ({ value, label }))} />
          </label>
          <label className="admin-field grid min-w-0 gap-2" htmlFor="ads-sort">Trier par
            <CustomSelect id="ads-sort" value={sort} onChange={(value) => updateFilter(setSort, value)} options={Object.entries(sortLabels).map(([value, label]) => ({ value, label }))} />
          </label>
        </div>
        <button className="admin-button secondary justify-self-start inline-flex min-h-10 items-center justify-center gap-2 px-5 py-3 text-[13px] font-bold [border:1px_solid_var(--admin-ink)] rounded-none no-underline" type="button" onClick={clearFilters}>Effacer les filtres</button>
      </section>
      <AdminListState loading={loading} error={error} empty={!ads.length} onRetry={retryLoading}>
        <div className="grid items-start gap-[22px] xl:grid-cols-2">
          {ads.map((ad, index) => (
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
                <Link className="admin-button secondary inline-flex min-h-10 items-center justify-center gap-2 px-5 py-3 text-[13px] font-bold [border:1px_solid_var(--admin-ink)] rounded-none no-underline" to={`/admin/applications?ad_id=${ad.id}`}>Voir les candidatures</Link>
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
      <AdminPagination page={page} totalPages={totalPages} total={total} onPageChange={(value) => { setLoading(true); setPage(value); }} />
    </>
  );
}
