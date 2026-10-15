import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { adminRequest } from "../../services/adminApi";

const EMPTY_AD = { title: "", short_description: "", description: "", location: "", salary_period: "year", status: "published" };
const STATUSES = ["sent", "in_progress", "technical_test", "accepted", "rejected"];
const STATUS_LABELS = { sent: "Envoyée", in_progress: "En cours", technical_test: "Test technique", accepted: "Acceptée", rejected: "Refusée" };
const EMPTY_PAGE = { items: [], page: 1, total: 0, total_pages: 0 };

function Pagination({ data, onChange }) {
  if (data.total_pages < 2) return <p className="mt-5 text-sm" aria-live="polite">{data.total} résultat{data.total !== 1 ? "s" : ""}</p>;
  return <nav className="mt-5 flex items-center justify-between gap-4" aria-label="Pagination">
    <span aria-live="polite">Page {data.page} sur {data.total_pages} · {data.total} résultats</span>
    <div className="flex gap-2">
      <button className="rounded border border-ink px-4 py-2 disabled:opacity-50" disabled={data.page <= 1} onClick={() => onChange(data.page - 1)}>Précédent</button>
      <button className="rounded border border-ink px-4 py-2 disabled:opacity-50" disabled={data.page >= data.total_pages} onClick={() => onChange(data.page + 1)}>Suivant</button>
    </div>
  </nav>;
}

export default function CompanyDashboardPage() {
  const [company, setCompany] = useState(null);
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
  const navigate = useNavigate();

  useEffect(() => {
    adminRequest("/api/company").then(setCompany).catch((requestError) => setError(requestError.message));
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    async function load() {
      setLoading(true);
      const params = new URLSearchParams({ page: String(page), page_size: "10" });
      if (statusFilter !== "all") params.set("status", statusFilter);
      if (tab === "ads" && search.trim()) params.set("q", search.trim());
      if (tab === "applications" && selectedAdId) params.set("ad_id", selectedAdId);
      try {
        const endpoint = tab === "ads" ? `/api/company/ads?${params}` : `/api/company/applications?${params}`;
        const result = await adminRequest(endpoint, { signal: controller.signal });
        if (!Array.isArray(result?.items)) throw new Error("La liste reçue est invalide.");
        if (tab === "ads") setAds(result); else setApplications(result);
        setError("");
      } catch (requestError) {
        if (requestError.name !== "AbortError") setError(requestError.message);
      } finally { if (!controller.signal.aborted) setLoading(false); }
    }
    load();
    return () => controller.abort();
  }, [tab, page, statusFilter, search, selectedAdId, reloadKey]);

  function switchTab(nextTab) { setTab(nextTab); setPage(1); setStatusFilter("all"); setSelectedAdId(""); setSelectedApplication(null); }
  function updateForm(event) { setForm((current) => ({ ...current, [event.target.name]: event.target.value })); }
  function editAd(ad) {
    setEditingId(ad.id);
    setForm({ title: ad.title, short_description: ad.short_description || "", description: ad.description, location: ad.location || "", status: ad.status });
  }
  function resetForm() { setEditingId(null); setForm(EMPTY_AD); }
  async function saveAd(event) {
    event.preventDefault(); setPending(true); setFeedback("");
    try {
      await adminRequest(editingId ? `/api/company/ads/${editingId}` : "/api/company/ads", {
        method: editingId ? "PATCH" : "POST", body: form,
      });
      setFeedback(editingId ? "L’offre a été mise à jour." : "L’offre a été créée.");
      resetForm(); setReloadKey((key) => key + 1);
    } catch (requestError) { setFeedback(requestError.message); }
    finally { setPending(false); }
  }
  async function changeAdStatus(ad) {
    setPending(true); setFeedback("");
    try {
      await adminRequest(`/api/company/ads/${ad.id}`, { method: "PATCH", body: { status: ad.status === "published" ? "closed" : "published" } });
      setFeedback(ad.status === "published" ? "L’offre est fermée." : "L’offre est publiée.");
      setReloadKey((key) => key + 1);
    } catch (requestError) { setFeedback(requestError.message); }
    finally { setPending(false); }
  }
  async function openApplication(application) {
    setSelectedApplication({ loading: true });
    try { setSelectedApplication(await adminRequest(`/api/company/applications/${application.id}`)); }
    catch (requestError) { setSelectedApplication({ error: requestError.message }); }
  }
  async function changeApplicationStatus(id, status) {
    setPending(true); setFeedback("");
    try {
      await adminRequest(`/api/company/applications/${id}`, { method: "PATCH", body: { status } });
      setFeedback("Le statut a été mis à jour."); setReloadKey((key) => key + 1);
      if (selectedApplication?.id === id) setSelectedApplication((current) => ({ ...current, status }));
    } catch (requestError) { setFeedback(requestError.message); }
    finally { setPending(false); }
  }
  async function logout() {
    await fetch("/api/auth/logout", { method: "POST", credentials: "same-origin" });
    navigate("/", { replace: true });
  }

  const data = tab === "ads" ? ads : applications;
  return <div className="min-h-[100svh] bg-paper text-ink">
    <header className="bg-coral border-b border-ink">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-5 py-5">
        <div><p className="text-xs font-bold uppercase tracking-widest">Espace entreprise</p><h1 className="text-3xl font-bold">{company?.name || "Recrutement"}</h1></div>
        <div className="flex flex-wrap gap-4"><Link className="underline" to="/company/candidates">Annuaire de candidats</Link><Link className="underline" to="/">Voir le site</Link><button className="underline" onClick={logout}>Déconnexion</button></div>
      </div>
    </header>
    <main className="mx-auto max-w-6xl px-5 py-8">
      <div className="mb-6 flex flex-wrap gap-3" role="tablist" aria-label="Espace entreprise">
        <button role="tab" aria-selected={tab === "ads"} className={`rounded border border-ink px-4 py-2 ${tab === "ads" ? "bg-ink text-paper" : ""}`} onClick={() => switchTab("ads")}>Mes offres</button>
        <button role="tab" aria-selected={tab === "applications"} className={`rounded border border-ink px-4 py-2 ${tab === "applications" ? "bg-ink text-paper" : ""}`} onClick={() => switchTab("applications")}>Candidatures reçues</button>
      </div>
      {feedback && <p className="mb-4 rounded border border-ink p-3" role="status">{feedback}</p>}
      {error && <p className="mb-4 rounded border border-red-700 p-3" role="alert">{error}</p>}
      {tab === "ads" && <section className="mb-8 rounded border border-ink bg-white/70 p-5" aria-labelledby="company-ad-form">
        <h2 id="company-ad-form" className="mb-4 text-xl font-bold">{editingId ? "Modifier une offre" : "Créer une offre"}</h2>
        <form className="grid gap-4 md:grid-cols-2" onSubmit={saveAd}>
          <label className="grid gap-1">Titre *<input className="rounded border border-ink p-2" name="title" value={form.title} onChange={updateForm} required maxLength={200} /></label>
          <label className="grid gap-1">Lieu<input className="rounded border border-ink p-2" name="location" value={form.location} onChange={updateForm} maxLength={255} /></label>
          <label className="grid gap-1 md:col-span-2">Résumé<input className="rounded border border-ink p-2" name="short_description" value={form.short_description} onChange={updateForm} maxLength={500} /></label>
          <label className="grid gap-1 md:col-span-2">Description *<textarea className="rounded border border-ink p-2" name="description" value={form.description} onChange={updateForm} required rows={5} /></label>
          <label className="grid gap-1">Publication<select className="rounded border border-ink p-2" name="status" value={form.status} onChange={updateForm}><option value="published">Publier</option><option value="closed">Fermer</option></select></label>
          <div className="flex items-end gap-3"><button className="rounded bg-ink px-4 py-2 font-bold text-paper" disabled={pending}>{pending ? "Enregistrement…" : editingId ? "Enregistrer" : "Créer l’offre"}</button>{editingId && <button type="button" className="underline" onClick={resetForm}>Annuler</button>}</div>
        </form>
      </section>}
      <section aria-label={tab === "ads" ? "Mes offres" : "Candidatures reçues"}>
        <div className="mb-4 flex flex-wrap items-end justify-between gap-4">
          <h2 className="text-2xl font-bold">{tab === "ads" ? "Mes offres" : "Candidatures reçues"}</h2>
          <div className="flex flex-wrap gap-3">
            {tab === "ads" && <label className="grid gap-1 text-sm">Recherche<input className="rounded border border-ink bg-white p-2" type="search" value={search} onChange={(event) => { setPage(1); setSearch(event.target.value); }} placeholder="Titre ou lieu" /></label>}
            <label className="grid gap-1 text-sm">Statut<select className="rounded border border-ink bg-white p-2" value={statusFilter} onChange={(event) => { setPage(1); setStatusFilter(event.target.value); }}>
              <option value="all">Tous</option>{tab === "ads" ? <><option value="published">Publiées</option><option value="closed">Fermées</option></> : STATUSES.map((status) => <option key={status} value={status}>{STATUS_LABELS[status]}</option>)}
            </select></label>
          </div>
        </div>
        {loading ? <p role="status">Chargement…</p> : data.items.length === 0 ? <p className="rounded border border-ink bg-white/60 p-6">Aucun résultat pour ces filtres.</p> : <div className="grid gap-4 lg:grid-cols-2">
          {data.items.map((item) => tab === "ads" ? <article key={item.id} className="rounded border border-ink bg-white/60 p-5">
            <div className="flex items-start justify-between gap-3"><h3 className="text-xl font-bold">{item.title}</h3><span>{item.status === "published" ? "Publiée" : "Fermée"}</span></div>
            <p className="mt-2">{item.short_description || item.description}</p><p className="mt-2 text-sm">{item.location || "Lieu non précisé"}</p>
            <div className="mt-4 flex flex-wrap gap-3"><button className="underline" onClick={() => editAd(item)}>Modifier</button><button className="underline" disabled={pending} onClick={() => changeAdStatus(item)}>{item.status === "published" ? "Fermer l’offre" : "Publier l’offre"}</button><button className="underline" onClick={() => { setTab("applications"); setStatusFilter("all"); setPage(1); setSelectedAdId(String(item.id)); }}>Candidatures</button></div>
          </article> : <article key={item.id} className="rounded border border-ink bg-white/60 p-5">
            <h3 className="text-xl font-bold">{item.title}</h3><p className="mt-1">{item.first_name} {item.last_name}</p><p className="mt-1 text-sm">{new Date(item.created_at).toLocaleDateString("fr-FR")} · {STATUS_LABELS[item.status]}</p>
            <div className="mt-4 flex flex-wrap items-center gap-3"><button className="underline" onClick={() => openApplication(item)}>Ouvrir le dossier</button><select aria-label={`Statut de ${item.first_name} ${item.last_name}`} value={item.status} disabled={pending} onChange={(event) => changeApplicationStatus(item.id, event.target.value)} className="rounded border border-ink bg-white p-2">{STATUSES.map((status) => <option key={status} value={status}>{STATUS_LABELS[status]}</option>)}</select></div>
          </article>)}
        </div>}
        {!loading && <Pagination data={data} onChange={setPage} />}
      </section>
      {tab === "applications" && selectedApplication && <section className="mt-8 rounded border border-ink bg-white/70 p-6" aria-labelledby="dossier-title">
        {selectedApplication.loading ? <p role="status">Chargement du dossier…</p> : selectedApplication.error ? <p role="alert">{selectedApplication.error}</p> : <>
          <div className="flex flex-wrap items-start justify-between gap-4"><div><p className="text-sm uppercase tracking-wide">Dossier de candidature</p><h2 id="dossier-title" className="text-2xl font-bold">{selectedApplication.person?.first_name} {selectedApplication.person?.last_name}</h2><p>{selectedApplication.title} · {selectedApplication.company_name}</p></div><button className="underline" onClick={() => setSelectedApplication(null)}>Fermer</button></div>
          {!selectedApplication.snapshot_available && <p className="my-4 border border-amber-700 p-3">Cette candidature ancienne n’a pas de copie figée ; certaines données reflètent le profil actuel.</p>}
          <p className="mt-4"><strong>Contact transmis :</strong> {selectedApplication.person?.email || "E-mail non disponible"}{selectedApplication.person?.phone ? ` · ${selectedApplication.person.phone}` : ""}</p>
          <p className="mt-3"><strong>Message :</strong> {selectedApplication.message || "Aucun message enregistré."}</p>
          <div className="mt-4 grid gap-5 md:grid-cols-2"><div><h3 className="font-bold">Projets sélectionnés</h3>{selectedApplication.projects?.length ? selectedApplication.projects.map((project) => <article key={project.id || project.title} className="mt-2 border-t border-rule pt-2"><strong>{project.title}</strong>{project.description && <p>{project.description}</p>}</article>) : <p>Aucun projet joint.</p>}</div><div><h3 className="font-bold">Expériences sélectionnées</h3>{selectedApplication.experiences?.length ? selectedApplication.experiences.map((experience) => <article key={experience.id || experience.job_title} className="mt-2 border-t border-rule pt-2"><strong>{experience.job_title}</strong> · {experience.company_name}{experience.description && <p>{experience.description}</p>}</article>) : <p>Aucune expérience jointe.</p>}</div></div>
          {selectedApplication.cv && <p className="mt-5"><strong>CV :</strong> <a className="underline" href={selectedApplication.cv.file_url} target="_blank" rel="noreferrer">{selectedApplication.cv.original_name}</a></p>}
          <label className="mt-5 flex items-center gap-3">Statut du dossier<select className="rounded border border-ink bg-white p-2" value={selectedApplication.status} disabled={pending} onChange={(event) => changeApplicationStatus(selectedApplication.id, event.target.value)}>{STATUSES.map((status) => <option key={status} value={status}>{STATUS_LABELS[status]}</option>)}</select></label>
        </>}
      </section>}
    </main>
  </div>;
}
