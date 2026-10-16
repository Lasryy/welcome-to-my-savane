import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import AdminCard from "../../components/admin/adminCard";
import { adminRequest } from "../../services/adminApi";
import { formatDate } from "../../utils/adminUtils";
import Modal from "../../components/ui/Modal";
import CustomSelect from "../../components/CustomSelect";

const STATUS_LABELS = {
  sent: "Envoyée",
  in_progress: "En cours",
  technical_test: "Test technique",
  accepted: "Acceptée",
  rejected: "Refusée",
};

function formatPeriod(startDate, endDate) {
  if (!startDate) return "Dates non renseignées";
  return `${formatDate(startDate)} – ${endDate ? formatDate(endDate) : "En cours"}`;
}

export default function AdminApplicationDetailPage() {
  const { id } = useParams();
  const [application, setApplication] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [draft, setDraft] = useState(null);
  const [reviewOpen, setReviewOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [saveError, setSaveError] = useState("");

  useEffect(() => {
    const controller = new AbortController();

    async function loadApplication() {
      try {
        const data = await adminRequest(`/api/admin/applications/${id}`, {
          signal: controller.signal,
        });
        if (!controller.signal.aborted) setApplication(data);
      } catch (requestError) {
        if (!controller.signal.aborted) setError(requestError.message);
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }

    loadApplication();
    return () => controller.abort();
  }, [id]);

  function startEditing() {
    setDraft({
      status: application.status,
      person: { ...application.person },
      message: application.message || "",
      projects: (application.projects || []).map((item) => ({ ...item })),
      experiences: (application.experiences || []).map((item) => ({ ...item })),
    });
    setFeedback("");
    setSaveError("");
  }

  function updatePerson(field, value) {
    setDraft((current) => ({ ...current, person: { ...current.person, [field]: value } }));
  }

  function updateItem(collection, index, field, value) {
    setDraft((current) => ({
      ...current,
      [collection]: current[collection].map((item, itemIndex) =>
        itemIndex === index ? { ...item, [field]: value } : item,
      ),
    }));
  }

  function changedFields() {
    if (!draft || !application) return [];
    const fields = [];
    if (draft.status !== application.status) fields.push("statut");
    if (JSON.stringify(draft.person) !== JSON.stringify(application.person)) fields.push("coordonnées du candidat");
    if (draft.message !== (application.message || "")) fields.push("message de motivation");
    if (JSON.stringify(draft.projects) !== JSON.stringify(application.projects || [])) fields.push("projets présentés");
    if (JSON.stringify(draft.experiences) !== JSON.stringify(application.experiences || [])) fields.push("expériences présentées");
    return fields;
  }

  async function saveChanges() {
    setSaving(true);
    setSaveError("");
    setFeedback("");
    try {
      await adminRequest(`/api/admin/applications/${id}`, {
        method: "PATCH",
        body: draft,
      });
      const updated = await adminRequest(`/api/admin/applications/${id}`);
      setApplication(updated);
      setDraft(null);
      setReviewOpen(false);
      setFeedback("Les modifications de la candidature ont été enregistrées.");
    } catch (requestError) {
      setSaveError(requestError.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="grid gap-5" aria-labelledby="admin-application-title">
      <Link
        className="w-fit font-bold underline underline-offset-4"
        to="/admin/applications"
      >
        ← Retour aux candidatures
      </Link>

      {loading && <p role="status">Chargement du dossier…</p>}
      {error && (
        <p className="border border-ink bg-white p-5" role="alert">
          {error}
        </p>
      )}

      {feedback && <p className="form-success" role="status">{feedback}</p>}

      {!loading && !error && application && (
        <>
          <AdminCard
            title={application.title}
            description={application.company_name}
            index={0}
          >
            <p className="text-sm">
              Offre #{application.ad_id}
              {application.location ? ` · ${application.location}` : ""}
            </p>
            <p>
              <strong>Envoyée le :</strong> {formatDate(application.created_at)}
            </p>
            <p>
              <strong>Statut :</strong>{" "}
              {STATUS_LABELS[application.status] || "Statut inconnu"}
            </p>
            <button
              type="button"
              className="admin-button accent mt-3 inline-flex min-h-10 items-center justify-center px-5 py-3 text-[13px] font-bold [border:1px_solid_var(--admin-ink)]"
              onClick={draft ? () => setDraft(null) : startEditing}
            >
              {draft ? "Annuler les modifications" : "Modifier la candidature"}
            </button>
            <Link
              className="font-bold underline underline-offset-4"
              to={`/admin/ads/${application.ad_id}/edit`}
            >
              Voir l’offre
            </Link>
          </AdminCard>

          {draft && (
            <form
              className="admin-form grid gap-5 border border-ink bg-white p-5"
              onSubmit={(event) => { event.preventDefault(); setReviewOpen(true); }}
            >
              <h2 className="text-xl font-bold">Modifier les informations à l’envoi</h2>
              <p className="text-sm">Ces corrections s’appliquent à cette candidature. Le profil du candidat reste inchangé.</p>
              <p className="text-sm">Le fichier du CV joint reste inchangé.</p>
              <label className="grid gap-2">Statut
                <CustomSelect
                  value={draft.status}
                  onChange={(value) => setDraft((current) => ({ ...current, status: value }))}
                  options={Object.entries(STATUS_LABELS).map(([value, label]) => ({ value, label }))}
                />
              </label>
              <div className="grid gap-4 sm:grid-cols-2">
                {["first_name", "last_name", "email", "phone"].map((field) => (
                  <label className="grid gap-2" key={field}>
                    {({ first_name: "Prénom", last_name: "Nom", email: "E-mail", phone: "Téléphone" })[field]}
                    <input
                      type={field === "email" ? "email" : "text"}
                      value={draft.person[field] || ""}
                      onChange={(event) => updatePerson(field, event.target.value)}
                      required={field !== "phone"}
                      maxLength={({ first_name: 100, last_name: 100, email: 255, phone: 30 })[field]}
                    />
                  </label>
                ))}
              </div>
              <label className="grid gap-2">Message de motivation
                <textarea rows={6} maxLength={5000} value={draft.message} onChange={(event) => setDraft((current) => ({ ...current, message: event.target.value }))} />
              </label>
              <section className="grid gap-4" aria-labelledby="edit-projects-title">
                <h3 id="edit-projects-title" className="font-bold">Projets présentés</h3>
                {draft.projects.map((project, index) => (
                  <fieldset key={project.id || index} className="grid gap-3 border-t border-rule/30 pt-4 sm:grid-cols-2">
                    <legend className="sr-only">Projet {index + 1}</legend>
                    {["title", "description", "project_url", "repository_url"].map((field) => (
                      <label className="grid gap-2" key={field}>{({ title: "Titre", description: "Description", project_url: "Lien du projet", repository_url: "Lien du dépôt" })[field]}
                        {field === "description" ? <textarea rows={3} maxLength={5000} value={project[field] || ""} onChange={(event) => updateItem("projects", index, field, event.target.value)} /> : <input maxLength={field === "title" ? 200 : 500} value={project[field] || ""} onChange={(event) => updateItem("projects", index, field, event.target.value)} />}
                      </label>
                    ))}
                  </fieldset>
                ))}
              </section>
              <section className="grid gap-4" aria-labelledby="edit-experiences-title">
                <h3 id="edit-experiences-title" className="font-bold">Expériences présentées</h3>
                {draft.experiences.map((experience, index) => (
                  <fieldset key={experience.id || index} className="grid gap-3 border-t border-rule/30 pt-4 sm:grid-cols-2">
                    <legend className="sr-only">Expérience {index + 1}</legend>
                    {["job_title", "company_name", "start_date", "end_date", "description"].map((field) => (
                      <label className="grid gap-2" key={field}>{({ job_title: "Poste", company_name: "Entreprise", start_date: "Date de début", end_date: "Date de fin", description: "Description" })[field]}
                        {field === "description" ? <textarea rows={3} maxLength={5000} value={experience[field] || ""} onChange={(event) => updateItem("experiences", index, field, event.target.value)} /> : <input type={field.endsWith("date") ? "date" : "text"} maxLength={150} value={experience[field] ? String(experience[field]).slice(0, 10) : ""} onChange={(event) => updateItem("experiences", index, field, event.target.value)} />}
                      </label>
                    ))}
                  </fieldset>
                ))}
              </section>
              <button className="admin-button accent inline-flex min-h-10 w-fit items-center justify-center px-5 py-3 text-[13px] font-bold [border:1px_solid_var(--admin-ink)]" type="submit">Vérifier les changements</button>
            </form>
          )}

          {!draft && <>
          {!application.snapshot_available && (
            <aside className="border border-rule bg-white p-5" role="note">
              <h2 className="font-bold">Ancienne candidature</h2>
              <p className="mt-2">
                La copie figée n’existe pas pour cet envoi. Seules les
                informations encore disponibles sont affichées ; les coordonnées
                du candidat correspondent à son profil actuel.
              </p>
            </aside>
          )}

          <AdminCard
            title="Coordonnées du candidat"
            description="Informations à l’envoi"
            index={1}
          >
            <p>
              {application.person?.first_name} {application.person?.last_name}
            </p>
            <p>
              <a
                className="underline"
                href={`mailto:${application.person?.email}`}
              >
                {application.person?.email}
              </a>
            </p>
            <p>{application.person?.phone || "Téléphone non renseigné"}</p>
          </AdminCard>

          <AdminCard title="Message de motivation" index={2}>
            <p className="whitespace-pre-wrap">
              {application.message || "Aucun message conservé."}
            </p>
          </AdminCard>

          <AdminCard title="Projets présentés" index={3}>
            {!application.projects?.length ? (
              <p>Aucun projet disponible pour cette candidature.</p>
            ) : (
              <ul className="grid list-none gap-4 p-0">
                {application.projects.map((project) => (
                  <li key={project.id} className="border-t border-rule/30 pt-4">
                    <h3 className="font-bold">{project.title}</h3>
                    {project.description && (
                      <p className="mt-1 whitespace-pre-wrap">
                        {project.description}
                      </p>
                    )}
                    <div className="mt-2 flex flex-wrap gap-4 text-sm">
                      {project.project_url && (
                        <a
                          className="font-bold underline"
                          href={project.project_url}
                          target="_blank"
                          rel="noreferrer"
                        >
                          Voir le projet
                        </a>
                      )}
                      {project.repository_url && (
                        <a
                          className="font-bold underline"
                          href={project.repository_url}
                          target="_blank"
                          rel="noreferrer"
                        >
                          Voir le dépôt
                        </a>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </AdminCard>

          <AdminCard title="Expériences présentées" index={4}>
            {!application.experiences?.length ? (
              <p>Aucune expérience disponible pour cette candidature.</p>
            ) : (
              <ul className="grid list-none gap-4 p-0">
                {application.experiences.map((experience) => (
                  <li
                    key={experience.id}
                    className="border-t border-rule/30 pt-4"
                  >
                    <h3 className="font-bold">
                      {experience.job_title} · {experience.company_name}
                    </h3>
                    <p className="mt-1 text-sm">
                      {formatPeriod(experience.start_date, experience.end_date)}
                    </p>
                    {experience.description && (
                      <p className="mt-2 whitespace-pre-wrap">
                        {experience.description}
                      </p>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </AdminCard>

          <AdminCard title="CV joint" index={5}>
            {application.cv ? (
              <div className="flex flex-wrap gap-4">
                {application.cv.file_url ? (
                  <>
                    <a
                      className="font-bold underline underline-offset-4"
                      href={application.cv.file_url}
                      target="_blank"
                      rel="noreferrer"
                    >
                      Consulter {application.cv.original_name}
                    </a>
                    <a
                      className="font-bold underline underline-offset-4"
                      href={`${application.cv.file_url}?download=1`}
                    >
                      Télécharger
                    </a>
                  </>
                ) : (
                  <p>
                    {application.cv.original_name ||
                      "CV conservé sans fichier consultable."}
                  </p>
                )}
              </div>
            ) : (
              <p>Aucun CV n’était joint à cette candidature.</p>
            )}
          </AdminCard>
          </>}
        </>
      )}
      {reviewOpen && draft && (
        <Modal
          title="Confirmer la modification"
          description="Vérifie les éléments qui seront enregistrés sur cette candidature."
          onClose={() => { if (!saving) setReviewOpen(false); }}
        >
          <div className="grid gap-4 p-5">
            {saveError && <p className="form-error" role="alert">{saveError}</p>}
            {changedFields().length ? (
              <ul className="list-disc pl-5">{changedFields().map((field) => <li key={field}>{field}</li>)}</ul>
            ) : <p>Aucun changement détecté.</p>}
            <p>Le profil du candidat ne sera pas modifié.</p>
            <div className="flex flex-wrap gap-3">
              <button className="admin-button accent px-5 py-3 text-[13px] font-bold" type="button" disabled={saving || !changedFields().length} onClick={saveChanges}>{saving ? "Enregistrement…" : "Confirmer et enregistrer"}</button>
              <button className="admin-button secondary px-5 py-3 text-[13px] font-bold" type="button" disabled={saving} onClick={() => setReviewOpen(false)}>Revenir au formulaire</button>
            </div>
          </div>
        </Modal>
      )}
    </section>
  );
}
