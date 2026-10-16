import Modal from "../../components/ui/Modal";
import { Link } from "react-router-dom";
import { formatDate } from "../../utils/adminUtils";

const STATUS_LABELS = {
  sent: "Envoyée",
  in_progress: "En cours",
  technical_test: "Test technique",
  accepted: "Acceptée",
  rejected: "Refusée",
};

export default function CompanyApplicationDossier({
  dossier,
  pending,
  feedback,
  onClose,
  onStatusChange,
  adminView = false,
}) {
  return (
    <Modal
      title="Dossier de candidature"
      onClose={onClose}
      className="dossier-dialog"
    >
      {feedback?.message && (
        <p
          className={
            feedback.type === "error" ? "form-error mb-4" : "form-success mb-4"
          }
          role={feedback.type === "error" ? "alert" : "status"}
        >
          {feedback.message}
        </p>
      )}
      {dossier.loading ? (
        <p role="status">Chargement du dossier…</p>
      ) : dossier.error ? (
        <p className="form-error" role="alert">
          {dossier.error}
        </p>
      ) : (
        <>
          <header className="dossier-identity">
            <h3>
              {dossier.person?.first_name} {dossier.person?.last_name}
            </h3>
            <p>
              {dossier.title} · {dossier.company_name}
            </p>
          </header>
          {!dossier.snapshot_available && (
            <p className="dossier-note" role="note">
              Cette candidature ancienne n’a pas de copie figée ; certaines
              données reflètent le profil actuel.
            </p>
          )}
          <section className="dossier-section">
            <h3>Contact transmis</h3>
            <p>
              {dossier.person?.email || "E-mail non disponible"}
              {dossier.person?.phone ? ` · ${dossier.person.phone}` : ""}
            </p>
          </section>
          <section className="dossier-section">
            <h3>Message</h3>
            <p className="whitespace-pre-wrap">
              {dossier.message || "Aucun message enregistré."}
            </p>
          </section>
          <section className="dossier-section">
            <h3>Projets présentés</h3>
            {dossier.projects?.length ? (
              dossier.projects.map((project) => (
                <article
                  key={project.id || project.title}
                  className="dossier-record"
                >
                  <h4>{project.title}</h4>
                  {project.description && <p>{project.description}</p>}
                  <div className="mt-3 flex flex-wrap gap-4">
                    {project.project_url && (
                      <a
                        className="text-link"
                        href={project.project_url}
                        target="_blank"
                        rel="noreferrer"
                      >
                        Voir le projet ↗
                      </a>
                    )}
                    {project.repository_url && (
                      <a
                        className="text-link"
                        href={project.repository_url}
                        target="_blank"
                        rel="noreferrer"
                      >
                        Voir le code ↗
                      </a>
                    )}
                  </div>
                </article>
              ))
            ) : (
              <p>Aucun projet joint.</p>
            )}
          </section>
          <section className="dossier-section">
            <h3>Expériences présentées</h3>
            {dossier.experiences?.length ? (
              dossier.experiences.map((experience) => (
                <article
                  key={experience.id || experience.job_title}
                  className="dossier-record"
                >
                  <h4>
                    {experience.job_title} · {experience.company_name}
                  </h4>
                  {experience.start_date && (
                    <p className="text-sm">
                      {formatDate(experience.start_date)} —{" "}
                      {experience.end_date
                        ? formatDate(experience.end_date)
                        : "En cours"}
                    </p>
                  )}
                  {experience.description && <p>{experience.description}</p>}
                </article>
              ))
            ) : (
              <p>Aucune expérience jointe.</p>
            )}
          </section>
          <section className="dossier-section">
            <h3>CV joint</h3>
            {dossier.cv?.file_url ? (
              <div className="flex flex-wrap gap-3">
                <a
                  className="button button-secondary"
                  href={dossier.cv.file_url}
                  target="_blank"
                  rel="noreferrer"
                >
                  Consulter le CV
                </a>
                <a
                  className="text-link"
                  href={`${dossier.cv.file_url}?download=1`}
                >
                  Télécharger
                </a>
              </div>
            ) : (
              <p>{dossier.cv?.original_name || "Aucun CV joint."}</p>
            )}
          </section>
          {adminView ? (
            <div className="mt-6 grid gap-3">
              <p><strong>Statut du dossier :</strong> {STATUS_LABELS[dossier.status] || dossier.status}</p>
              <Link className="button button-primary w-fit" to={`/admin/applications/${dossier.id}`}>
                Modifier avec confirmation
              </Link>
            </div>
          ) : (
            <label className="form-field mt-6">
              Statut du dossier
              <select
                className="form-input"
                value={dossier.status}
                disabled={pending}
                onChange={(event) => onStatusChange(dossier.id, event.target.value)}
              >
                {Object.entries(STATUS_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
            </label>
          )}
        </>
      )}
    </Modal>
  );
}
