import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { requestJson } from "./applicationApi";
import { formatDate } from "../../utils/adminUtils";

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

export default function ApplicationDetailPage() {
  const { id } = useParams();
  const [application, setApplication] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isLoggedOut, setIsLoggedOut] = useState(false);

  useEffect(() => {
    const controller = new AbortController();

    async function loadApplication() {
      try {
        const data = await requestJson(`/api/applications/mine/${id}`, {
          signal: controller.signal,
        });
        if (!controller.signal.aborted) setApplication(data);
      } catch (requestError) {
        if (controller.signal.aborted) return;
        if (requestError.status === 401) {
          setIsLoggedOut(true);
        } else {
          setError(
            requestError.message || "Impossible de charger cette candidature.",
          );
        }
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }

    loadApplication();
    return () => controller.abort();
  }, [id]);

  const snapshot = application?.submitted_snapshot;
  const projects =
    snapshot?.projects || application?.legacy_items?.projects || [];
  const experiences =
    snapshot?.experiences || application?.legacy_items?.experiences || [];

  return (
    <section
      className="page-container dossier-page py-10"
      aria-labelledby="application-title"
    >
      <Link
        className="mb-6 inline-flex font-bold underline underline-offset-4"
        to="/applications"
      >
        ← Retour à l’espace candidat
      </Link>

      {loading && <p role="status">Chargement du dossier…</p>}
      {error && (
        <p className="border border-ink bg-white p-5" role="alert">
          {error}
        </p>
      )}
      {isLoggedOut && (
        <div className="border border-rule bg-white p-6">
          <p className="mb-4">Connecte-toi pour consulter ce dossier.</p>
          <Link
            className="font-bold underline underline-offset-4"
            to="/login"
            state={{ from: `/applications/${id}` }}
          >
            Se connecter
          </Link>
        </div>
      )}

      {!loading && !error && !isLoggedOut && application && (
        <div className="grid gap-5">
          <header className="rounded-[24px] border border-rule bg-white p-6 sm:p-8">
            <p className="mb-2 text-sm text-ink/70">Dossier envoyé</p>
            <h1
              id="application-title"
              className="mb-2 text-3xl font-extrabold sm:text-4xl"
            >
              {application.title}
            </h1>
            <p className="mb-5">
              {application.company_name}
              {application.location ? ` · ${application.location}` : ""}
            </p>
            <div className="flex flex-wrap items-center gap-3 text-sm">
              <span className="rounded-full border border-ink px-3 py-1 font-bold">
                {STATUS_LABELS[application.status] || "Statut inconnu"}
              </span>
              <span>Envoyée le {formatDate(application.created_at)}</span>
            </div>
          </header>

          {!application.snapshot_available && (
            <aside
              className="rounded-[20px] border border-rule bg-[#fff3d9] p-5"
              role="note"
            >
              <h2 className="mb-2 font-bold">
                Dossier envoyé avant l’archivage détaillé
              </h2>
              <p>
                Le message et les éléments encore liés sont affichés ci-dessous.
                Les projets et expériences montrent leur version actuelle, pas
                forcément celle qui existait au moment de l’envoi.
              </p>
            </aside>
          )}

          {snapshot?.person && (
            <section
              className="rounded-[20px] border border-rule bg-white p-6"
              aria-labelledby="candidate-title"
            >
              <h2 id="candidate-title" className="mb-4 text-xl font-bold">
                Tes coordonnées à l’envoi
              </h2>
              <p>
                {snapshot.person.first_name} {snapshot.person.last_name}
              </p>
              <p>{snapshot.person.email}</p>
              <p>{snapshot.person.phone || "Téléphone non renseigné"}</p>
            </section>
          )}

          <section
            className="rounded-[20px] border border-rule bg-white p-6"
            aria-labelledby="message-title"
          >
            <h2 id="message-title" className="mb-3 text-xl font-bold">
              Message de motivation
            </h2>
            <p className="whitespace-pre-wrap">
              {snapshot?.message ||
                application.legacy_message ||
                "Aucun message conservé."}
            </p>
          </section>

          <section
            className="rounded-[20px] border border-rule bg-white p-6"
            aria-labelledby="projects-title"
          >
            <h2 id="projects-title" className="mb-4 text-xl font-bold">
              Projets présentés
            </h2>
            {projects.length === 0 ? (
              <p>Aucun projet n’était associé à ce dossier.</p>
            ) : (
              <ul className="grid list-none gap-4 p-0">
                {projects.map((project) => (
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
          </section>

          <section
            className="rounded-[20px] border border-rule bg-white p-6"
            aria-labelledby="experiences-title"
          >
            <h2 id="experiences-title" className="mb-4 text-xl font-bold">
              Expériences présentées
            </h2>
            {experiences.length === 0 ? (
              <p>Aucune expérience n’était associée à ce dossier.</p>
            ) : (
              <ul className="grid list-none gap-4 p-0">
                {experiences.map((experience) => (
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
          </section>

          <section
            className="rounded-[20px] border border-rule bg-white p-6"
            aria-labelledby="cv-title"
          >
            <h2 id="cv-title" className="mb-3 text-xl font-bold">
              CV joint
            </h2>
            {application.cv ? (
              <a
                className="font-bold underline underline-offset-4"
                href={application.cv.file_url}
                target="_blank"
                rel="noreferrer"
              >
                Consulter {application.cv.original_name}
              </a>
            ) : (
              <p>Aucun CV n’était joint à cette candidature.</p>
            )}
          </section>
        </div>
      )}
    </section>
  );
}
