import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import AdminCard from "../../components/admin/adminCard";
import { adminRequest } from "../../services/adminApi";
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

export default function AdminApplicationDetailPage() {
  const { id } = useParams();
  const [application, setApplication] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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
            <Link
              className="font-bold underline underline-offset-4"
              to={`/admin/ads/${application.ad_id}/edit`}
            >
              Voir l’offre
            </Link>
          </AdminCard>

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
        </>
      )}
    </section>
  );
}
