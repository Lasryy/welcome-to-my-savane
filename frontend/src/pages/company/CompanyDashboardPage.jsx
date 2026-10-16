import Pagination from "../../components/ui/Pagination";
import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import CompanyLayout from "./CompanyLayout";
import CompanyOfferForm from "./CompanyOfferForm";
import CompanyApplicationDossier from "./CompanyApplicationDossier";
import UiIcon from "../../components/ui/UiIcon";
import PersonAvatar from "../../components/PersonAvatar";
import { adminRequest } from "../../services/adminApi";
import CompanyUsersPanel from "./CompanyUsersPanel";
import CustomSelect from "../../components/CustomSelect";

const EMPTY_AD = {
  title: "",
  short_description: "",
  description: "",
  location: "",
  salary_min: "",
  salary_max: "",
  salary_period: "year",
  contract_type: "",
  working_time: "",
  category_id: "",
  status: "published",
};
const STATUSES = [
  "sent",
  "in_progress",
  "technical_test",
  "accepted",
  "rejected",
];
const STATUS_LABELS = {
  sent: "Envoyée",
  in_progress: "En cours",
  technical_test: "Test technique",
  accepted: "Acceptée",
  rejected: "Refusée",
};
const EMPTY_PAGE = { items: [], page: 1, total: 0, total_pages: 0 };

function scopedCompanyPath(path, companyId, adminView) {
  if (!adminView) return path;
  const separator = path.includes("?") ? "&" : "?";
  return `${path}${separator}company_id=${encodeURIComponent(companyId)}`;
}

export default function CompanyDashboardPage() {
  const [, setSearchParams] = useSearchParams();
  const [company, setCompany] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [categories, setCategories] = useState([]);
  const [feedbackType, setFeedbackType] = useState("success");
  const [tab, setTab] = useState("ads");
  const [ads, setAds] = useState(EMPTY_PAGE);
  const [applications, setApplications] = useState(EMPTY_PAGE);
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [feedback, setFeedback] = useState("");
  const [pending, setPending] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);
  const [form, setForm] = useState(EMPTY_AD);
  const [editingId, setEditingId] = useState(null);
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [selectedAdId, setSelectedAdId] = useState("");
  const [search, setSearch] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);
  const [companies, setCompanies] = useState([]);
  const [selectedCompanyId, setSelectedCompanyId] = useState("");

  useEffect(() => {
    let cancelled = false;
    adminRequest("/api/public/categories")
      .then(setCategories)
      .catch(() => setCategories([]));
    adminRequest("/api/auth/me")
      .then(async (user) => {
        if (cancelled) return;
        if (user.role === "ADMIN") {
          setIsAdmin(true);
          const list = await adminRequest("/api/companies");
          if (cancelled) return;
          setCompanies(list);
          const requestedId = new URLSearchParams(window.location.search).get("company_id");
          const selected = list.find((item) => String(item.id) === requestedId) || list[0];
          if (selected) {
            setSelectedCompanyId(String(selected.id));
            setCompany(selected);
          }
        } else {
          const data = await adminRequest("/api/company");
          if (!cancelled) {
            setCompany(data);
            setSelectedCompanyId(String(data.id));
          }
        }
      })
      .catch((requestError) => { if (!cancelled) setError(requestError.message); });
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    async function load() {
      if (!selectedCompanyId || tab === "users") {
        setLoading(false);
        return;
      }
      setLoading(true);
      const params = new URLSearchParams({
        page: String(page),
        page_size: "10",
      });
      if (statusFilter !== "all") params.set("status", statusFilter);
      if (tab === "ads" && search.trim()) params.set("q", search.trim());
      if (tab === "applications" && selectedAdId)
        params.set("ad_id", selectedAdId);
      try {
        const endpoint = scopedCompanyPath(
          tab === "ads"
            ? `/api/company/ads?${params}`
            : `/api/company/applications?${params}`,
          selectedCompanyId,
          isAdmin,
        );
        const result = await adminRequest(endpoint, {
          signal: controller.signal,
        });
        if (!Array.isArray(result?.items))
          throw new Error("La liste reçue est invalide.");
        if (tab === "ads") setAds(result);
        else setApplications(result);
        setError("");
      } catch (requestError) {
        if (requestError.name !== "AbortError") setError(requestError.message);
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }
    load();
    return () => controller.abort();
  }, [tab, page, statusFilter, search, selectedAdId, reloadKey, selectedCompanyId, isAdmin]);

  function switchTab(nextTab) {
    setTab(nextTab);
    setPage(1);
    setStatusFilter("all");
    setSelectedAdId("");
    setSelectedApplication(null);
  }
  function updateForm(event) {
    setForm((current) => ({
      ...current,
      [event.target.name]: event.target.value,
    }));
  }
  function editAd(ad) {
    setEditingId(ad.id);
    setShowForm(true);
    setFeedback("");
    setForm(
      Object.fromEntries(
        Object.keys(EMPTY_AD).map((field) => [
          field,
          ad[field] ?? EMPTY_AD[field],
        ]),
      ),
    );
  }
  function resetForm() {
    setEditingId(null);
    setForm(EMPTY_AD);
    setShowForm(false);
  }
  async function saveAd(event) {
    event.preventDefault();
    setPending(true);
    setFeedback("");
    setFeedbackType("success");
    try {
      await adminRequest(
        scopedCompanyPath(editingId ? `/api/company/ads/${editingId}` : "/api/company/ads", selectedCompanyId, isAdmin),
        {
          method: editingId ? "PATCH" : "POST",
          body: {
            ...form,
            category_id: form.category_id || null,
            salary_min: form.salary_min === "" ? null : Number(form.salary_min),
            salary_max: form.salary_max === "" ? null : Number(form.salary_max),
            contract_type: form.contract_type || null,
            working_time: form.working_time || null,
          },
        },
      );
      setFeedback(
        editingId ? "L’offre a été mise à jour." : "L’offre a été créée.",
      );
      resetForm();
      setReloadKey((key) => key + 1);
    } catch (requestError) {
      setFeedbackType("error");
      setFeedback(requestError.message);
    } finally {
      setPending(false);
    }
  }
  async function changeAdStatus(ad) {
    setPending(true);
    setFeedback("");
    setFeedbackType("success");
    try {
      await adminRequest(scopedCompanyPath(`/api/company/ads/${ad.id}`, selectedCompanyId, isAdmin), {
        method: "PATCH",
        body: { status: ad.status === "published" ? "closed" : "published" },
      });
      setFeedback(
        ad.status === "published"
          ? "L’offre est fermée."
          : "L’offre est publiée.",
      );
      setReloadKey((key) => key + 1);
    } catch (requestError) {
      setFeedbackType("error");
      setFeedback(requestError.message);
    } finally {
      setPending(false);
    }
  }
  async function openApplication(application) {
    setFeedback("");
    setSelectedApplication({ loading: true, id: application.id });
    try {
      const result = await adminRequest(
        scopedCompanyPath(`/api/company/applications/${application.id}`, selectedCompanyId, isAdmin),
      );
      setSelectedApplication((current) =>
        current?.id === application.id ? result : current,
      );
    } catch (requestError) {
      setSelectedApplication((current) =>
        current?.id === application.id
          ? { error: requestError.message }
          : current,
      );
    }
  }
  async function changeApplicationStatus(id, status) {
    setPending(true);
    setFeedback("");
    setFeedbackType("success");
    try {
      await adminRequest(scopedCompanyPath(`/api/company/applications/${id}`, selectedCompanyId, isAdmin), {
        method: "PATCH",
        body: { status },
      });
      setFeedback("Le statut a été mis à jour.");
      setReloadKey((key) => key + 1);
      if (selectedApplication?.id === id)
        setSelectedApplication((current) => ({ ...current, status }));
    } catch (requestError) {
      setFeedbackType("error");
      setFeedback(requestError.message);
    } finally {
      setPending(false);
    }
  }
  const data = tab === "ads" ? ads : applications;
  return (
    <CompanyLayout
      headingTone="coral"
      title={company?.name || "Mes recrutements"}
      description="Publie tes offres, retrouve les candidatures et fais avancer tes recrutements."
      companyId={selectedCompanyId}
      adminView={isAdmin}
    >
      {isAdmin && (
        <label className="mb-5 grid max-w-xl gap-2 font-bold">
          Entreprise à consulter
          <CustomSelect
            value={selectedCompanyId}
            onChange={(nextId) => {
              setSelectedCompanyId(nextId);
              setCompany(companies.find((item) => String(item.id) === nextId) || null);
              setSearchParams(nextId ? { company_id: nextId } : {});
              setPage(1);
              setSelectedApplication(null);
            }}
            options={[
              { value: "", label: "Choisir une entreprise" },
              ...companies.map((item) => ({ value: item.id, label: item.name })),
            ]}
          />
        </label>
      )}
      <div
        className="company-tabs"
        role="group"
        aria-label="Vue des recrutements"
      >
        <button aria-pressed={tab === "ads"} onClick={() => switchTab("ads")}>
          Mes offres
        </button>
        <button
          aria-pressed={tab === "applications"}
          onClick={() => switchTab("applications")}
        >
          Candidatures reçues
        </button>
        <button aria-pressed={tab === "users"} onClick={() => switchTab("users")}>
          Utilisateurs de l’entreprise
        </button>
        {tab === "ads" && (
          <button
            className="button button-primary"
            onClick={() => {
              resetForm();
              setFeedback("");
              setShowForm(true);
            }}
          >
            <UiIcon name="plus" size={18} />
            Nouvelle offre
          </button>
        )}
      </div>
      {tab === "users" && selectedCompanyId && (
        <CompanyUsersPanel companyId={selectedCompanyId} adminView={isAdmin} />
      )}
      {feedback && (
        <p
          className={`mb-4 ${feedbackType === "error" ? "form-error" : "form-success"}`}
          role={feedbackType === "error" ? "alert" : "status"}
        >
          {feedback}
        </p>
      )}
      {error && (
        <div className="form-error mb-4" role="alert">
          <p>{error}</p>
          <button
            className="text-link mt-2"
            onClick={() => setReloadKey((key) => key + 1)}
          >
            Réessayer
          </button>
        </div>
      )}
      {tab === "ads" && showForm && (
        <CompanyOfferForm
          form={form}
          categories={categories}
          editing={editingId !== null}
          pending={pending}
          error={feedbackType === "error" ? feedback : ""}
          onChange={updateForm}
          onSubmit={saveAd}
          onClose={resetForm}
        />
      )}
      {tab === "applications" && selectedAdId && (
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3 rounded-lg bg-lavender/20 p-4 text-sm">
          <span>
            Offre :{" "}
            {ads.items.find((ad) => String(ad.id) === selectedAdId)?.title ||
              "Offre sélectionnée"}
          </span>
          <button
            className="text-link"
            onClick={() => {
              setSelectedAdId("");
              setPage(1);
            }}
          >
            Voir toutes les candidatures
          </button>
        </div>
      )}
      {tab !== "users" && <section
        aria-label={tab === "ads" ? "Mes offres" : "Candidatures reçues"}
      >
        <div className="company-list-toolbar">
          <h2 className="text-2xl font-bold">
            {tab === "ads" ? "Mes offres" : "Candidatures reçues"}
          </h2>
          <div className="flex flex-wrap gap-3">
            {tab === "ads" && (
              <label className="grid gap-1 text-sm">
                Recherche
                <input
                  className="rounded border border-ink bg-white p-2"
                  type="search"
                  value={search}
                  onChange={(event) => {
                    setPage(1);
                    setSearch(event.target.value);
                  }}
                  placeholder="Titre ou lieu"
                />
              </label>
            )}
            <label className="grid gap-1 text-sm">
              Statut
              <CustomSelect
                value={statusFilter}
                triggerClassName="min-h-10 p-2"
                onChange={(value) => {
                  setPage(1);
                  setStatusFilter(value);
                }}
                options={[
                  { value: "all", label: "Tous" },
                  ...(tab === "ads"
                    ? [{ value: "published", label: "Publiées" }, { value: "closed", label: "Fermées" }]
                    : STATUSES.map((status) => ({ value: status, label: STATUS_LABELS[status] }))),
                ]}
              />
            </label>
          </div>
        </div>
        {loading ? (
          <p role="status">Chargement…</p>
        ) : data.items.length === 0 ? (
          tab === "ads" && data.total === 0 && statusFilter === "all" && !search.trim() && page === 1 ? (
            <div className="illustrated-empty-state company-empty-state rounded border border-ink bg-white/60 p-6">
              <img src="/illustrations/company-hornbill.webp" alt="" aria-hidden="true" />
              <div>
                <h3 className="text-xl font-bold">Aucune offre publiée pour le moment.</h3>
                <p>Créez votre première offre pour la faire découvrir aux candidats.</p>
              </div>
            </div>
          ) : (
            <p className="rounded border border-ink bg-white/60 p-6">
              Aucun résultat pour ces filtres.
            </p>
          )
        ) : (
          <div className="grid gap-4 lg:grid-cols-2">
            {data.items.map((item) =>
              tab === "ads" ? (
                <article
                  key={item.id}
                  className="company-offer-card rounded border border-ink bg-white/60 p-5"
                >
                  <header className="flex items-start justify-between gap-3">
                    <h3 className="text-xl font-bold">{item.title}</h3>
                    <span>
                      {item.status === "published" ? "Publiée" : "Fermée"}
                    </span>
                  </header>
                  <p className="mt-2">
                    {item.short_description || item.description}
                  </p>
                  <p className="mt-2 text-sm">
                    {item.location || "Lieu non précisé"}
                  </p>
                  <div className="mt-4 flex flex-wrap gap-3">
                    <button className="underline" onClick={() => editAd(item)}>
                      Modifier
                    </button>
                    <button
                      className="underline"
                      disabled={pending}
                      onClick={() => changeAdStatus(item)}
                    >
                      {item.status === "published"
                        ? "Fermer l’offre"
                        : "Publier l’offre"}
                    </button>
                    <button
                      className="underline"
                      onClick={() => {
                        setTab("applications");
                        setStatusFilter("all");
                        setPage(1);
                        setSelectedAdId(String(item.id));
                      }}
                    >
                      Candidatures
                    </button>
                  </div>
                </article>
              ) : (
                <article
                  key={item.id}
                  className="rounded border border-ink bg-white/60 p-5"
                >
                  <div className="flex items-center gap-3">
                    <PersonAvatar person={item} size={48} forVisibleCandidate />
                    <div>
                      <h3 className="text-xl font-bold">{item.title}</h3>
                      <p className="mt-1">{item.first_name} {item.last_name}</p>
                    </div>
                  </div>
                  <p className="mt-1 text-sm">
                    {new Date(item.created_at).toLocaleDateString("fr-FR")} ·{" "}
                    {STATUS_LABELS[item.status]}
                  </p>
                  <div className="mt-4 flex flex-wrap items-center gap-3">
                    <button
                      className="underline"
                      onClick={() => openApplication(item)}
                    >
                      Ouvrir le dossier
                    </button>
                    {!isAdmin ? <CustomSelect
                      ariaLabel={`Statut de ${item.first_name} ${item.last_name}`}
                      value={item.status}
                      disabled={pending}
                      triggerClassName="min-h-10 p-2"
                      onChange={(value) => changeApplicationStatus(item.id, value)}
                      options={STATUSES.map((status) => ({ value: status, label: STATUS_LABELS[status] }))}
                    /> : <Link className="underline" to={`/admin/applications/${item.id}`}>Modifier avec confirmation</Link>}
                  </div>
                </article>
              ),
            )}
          </div>
        )}
        {!loading && (
          <Pagination
            page={data.page}
            totalPages={data.total_pages}
            total={data.total}
            onPageChange={setPage}
          />
        )}
      </section>}
      {tab === "applications" && selectedApplication && (
        <CompanyApplicationDossier
          dossier={selectedApplication}
          pending={pending}
          feedback={{ type: feedbackType, message: feedback }}
          onClose={() => setSelectedApplication(null)}
          onStatusChange={changeApplicationStatus}
          adminView={isAdmin}
        />
      )}
    </CompanyLayout>
  );
}
