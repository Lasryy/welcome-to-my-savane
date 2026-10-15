import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import AdminCard from "../../components/admin/adminCard";
import CustomSelect from "../../components/CustomSelect";
import { AdminFeedback, AdminListState } from "../../components/admin/adminUi";
import { adminRequest } from "../../services/adminApi";
import { formatDate } from "../../utils/adminUtils";

const STATUSES = [
  { value: "sent", label: "Envoyée" },
  { value: "in_progress", label: "En cours" },
  { value: "technical_test", label: "Test technique" },
  { value: "accepted", label: "Acceptée" },
  { value: "rejected", label: "Refusée" },
];
const STATUS_OPTIONS = [{ value: "all", label: "Tous les statuts" }, ...STATUSES];

export default function AdminApplicationsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const companyId = searchParams.get("company_id") || "";
  const adId = searchParams.get("ad_id") || "";
  const status = searchParams.get("status") || "all";
  const filterParams = new URLSearchParams();
  if (companyId) filterParams.set("company_id", companyId);
  if (adId) filterParams.set("ad_id", adId);
  if (status !== "all") filterParams.set("status", status);
  const applicationQuery = filterParams.toString();
  const [applications, setApplications] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [ads, setAds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadedFilterQuery, setLoadedFilterQuery] = useState(null);
  const [error, setError] = useState("");
  const [feedback, setFeedback] = useState(null);
  const [pendingId, setPendingId] = useState(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    const controller = new AbortController();

    async function loadFilters() {
      try {
        const [companyList, adList] = await Promise.all([
          adminRequest("/api/companies", { signal: controller.signal }),
          adminRequest("/api/admin/ads", { signal: controller.signal }),
        ]);
        if (controller.signal.aborted) return;
        if (!Array.isArray(companyList) || !Array.isArray(adList)) {
          throw new Error("Les filtres reçus sont invalides.");
        }
        setCompanies(companyList);
        setAds(adList);
      } catch (requestError) {
        if (!controller.signal.aborted) setError(requestError.message);
      }
    }

    loadFilters();
    return () => controller.abort();
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    const suffix = applicationQuery ? `?${applicationQuery}` : "";

    async function loadApplications() {
      try {
        const data = await adminRequest(`/api/admin/applications${suffix}`, { signal: controller.signal });
        if (!Array.isArray(data)) throw new Error("La liste des candidatures reçue est invalide.");
        if (!controller.signal.aborted) {
          setApplications(data);
          setError("");
          setLoadedFilterQuery(applicationQuery);
        }
      } catch (requestError) {
        if (!controller.signal.aborted) {
          setError(requestError.message);
          setLoadedFilterQuery(applicationQuery);
        }
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }

    loadApplications();
    return () => controller.abort();
  }, [applicationQuery, reloadKey]);

  function updateFilter(name, value) {
    setSearchParams((current) => {
      const next = new URLSearchParams(current);
      if (value && value !== "all") next.set(name, value);
      else next.delete(name);
      return next;
    });
  }

  async function changeStatus(application, nextStatus) {
    if (nextStatus === application.status) return;

    setPendingId(application.id);
    setFeedback(null);
    try {
      const updated = await adminRequest(`/api/admin/applications/${application.id}`, {
        method: "PATCH",
        body: { status: nextStatus },
      });
      setApplications((current) => {
        if (status !== "all" && updated.status !== status) {
          return current.filter((item) => item.id !== updated.id);
        }
        return current.map((item) =>
          item.id === updated.id ? { ...item, status: updated.status } : item,
        );
      });
      setFeedback({ type: "success", message: "Le statut de la candidature a été mis à jour." });
    } catch (requestError) {
      setFeedback({ type: "error", message: requestError.message });
    } finally {
      setPendingId(null);
    }
  }

  const visibleAds = companyId ? ads.filter((ad) => String(ad.company_id) === companyId) : ads;

  return (
    <>
      <AdminFeedback feedback={feedback} />
      <div className="admin-toolbar mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2>Suivi des candidatures</h2>
          <p aria-live="polite">{applications.length} candidature{applications.length !== 1 ? "s" : ""}</p>
        </div>
        <button
          className="admin-button secondary inline-flex min-h-10 items-center justify-center gap-2 px-5 py-3 text-[13px] font-bold [border:1px_solid_var(--admin-ink)] rounded-none"
          type="button"
          onClick={() => { setLoading(true); setReloadKey((key) => key + 1); }}
          disabled={loading}
        >
          Actualiser
        </button>
      </div>

      <section className="admin-filters mb-6 grid gap-4 p-5 [background:var(--admin-ink)] text-[var(--admin-paper)]" aria-label="Filtres des candidatures">
        <div className="admin-filters-grid grid gap-4 [grid-template-columns:repeat(3,_minmax(0,_1fr))] admin-max-760:[grid-template-columns:repeat(2,_minmax(0,_1fr))] admin-max-480:[grid-template-columns:minmax(0,_1fr)]">
          <label className="admin-field grid min-w-0 gap-2" htmlFor="applications-company">Entreprise
            <CustomSelect id="applications-company" value={companyId} onChange={(value) => {
              setSearchParams((current) => {
                const next = new URLSearchParams(current);
                if (value) next.set("company_id", value);
                else next.delete("company_id");
                next.delete("ad_id");
                return next;
              });
            }} placeholder="Toutes les entreprises" options={companies.map((company) => ({ value: company.id, label: company.name }))} />
          </label>
          <label className="admin-field grid min-w-0 gap-2" htmlFor="applications-ad">Offre
            <CustomSelect id="applications-ad" value={adId} onChange={(value) => updateFilter("ad_id", value)} placeholder="Toutes les offres" options={visibleAds.map((ad) => ({ value: ad.id, label: ad.title }))} />
          </label>
          <label className="admin-field grid min-w-0 gap-2" htmlFor="applications-status">Statut
            <CustomSelect id="applications-status" value={status} onChange={(value) => updateFilter("status", value)} options={STATUS_OPTIONS} />
          </label>
        </div>
        {(companyId || adId || status !== "all") && (
          <button
            className="admin-button secondary justify-self-start inline-flex min-h-10 items-center justify-center gap-2 px-5 py-3 text-[13px] font-bold [border:1px_solid_var(--admin-ink)] rounded-none"
            type="button"
            onClick={() => setSearchParams({})}
          >
            Effacer les filtres
          </button>
        )}
      </section>

      <AdminListState loading={loading || loadedFilterQuery !== applicationQuery} error={error} empty={!applications.length} onRetry={() => { setLoading(true); setReloadKey((key) => key + 1); }}>
        <div className="grid items-start gap-[22px] xl:grid-cols-2">
          {applications.map((application, index) => (
            <AdminCard key={application.id} title={application.title} description={application.company_name} index={index} overflowVisible>
              <p><strong>Candidat :</strong> {application.first_name} {application.last_name} · {application.email}</p>
              <p><strong>Envoyée le :</strong> {formatDate(application.created_at)}</p>
              {application.cv_file_url && (
                <p>
                  <strong>CV reçu :</strong>{" "}
                  <a className="font-bold underline underline-offset-4" href={application.cv_file_url} target="_blank" rel="noreferrer">
                    {application.cv_original_name || "Consulter le CV"}
                  </a>
                </p>
              )}
              <div className="grid gap-4">
                <Link className="admin-button primary inline-flex min-h-10 w-fit items-center justify-center gap-2 px-5 py-3 text-[13px] font-bold [border:1px_solid_var(--admin-ink)] rounded-none no-underline" to={`/admin/applications/${application.id}`}>
                  Ouvrir le dossier
                </Link>
                <label className="admin-field grid max-w-[320px] gap-2" htmlFor={`application-status-${application.id}`}>
                  Statut de la candidature
                  <CustomSelect
                    id={`application-status-${application.id}`}
                    value={application.status}
                    onChange={(nextStatus) => changeStatus(application, nextStatus)}
                    options={STATUSES}
                    disabled={pendingId === application.id}
                  />
                </label>
              </div>
              {pendingId === application.id && <p role="status">Enregistrement du statut…</p>}
            </AdminCard>
          ))}
        </div>
      </AdminListState>
    </>
  );
}
