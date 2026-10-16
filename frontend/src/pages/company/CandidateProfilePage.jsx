import CompanyLayout from "./CompanyLayout";
import { useEffect, useState } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import { adminRequest } from "../../services/adminApi";
import PersonAvatar from "../../components/PersonAvatar";

function formatDate(date) {
  if (!date) return "Non renseignée";
  return new Date(`${String(date).slice(0, 10)}T00:00:00`).toLocaleDateString(
    "fr-FR",
  );
}

export default function CandidateProfilePage() {
  const { personId } = useParams();
  const [searchParams] = useSearchParams();
  const companyId = searchParams.get("company_id") || "";
  const [result, setResult] = useState(null);
  const candidate = result?.id === personId ? result.data : null;
  const error = result?.id === personId ? result.error : "";
  const loading = result?.id !== personId;
  const backToDirectory = `/company/candidates${searchParams.size ? `?${searchParams}` : ""}`;

  useEffect(() => {
    const controller = new AbortController();
    const endpoint = companyId
      ? `/api/company/candidates/${personId}?company_id=${encodeURIComponent(companyId)}`
      : `/api/company/candidates/${personId}`;
    adminRequest(endpoint, {
      signal: controller.signal,
    })
      .then((data) => setResult({ id: personId, data, error: "" }))
      .catch((requestError) => {
        if (requestError.name !== "AbortError") {
          setResult({ id: personId, data: null, error: requestError.message });
        }
      });
    return () => controller.abort();
  }, [personId, companyId]);

  return (
    <CompanyLayout
      title="Profil candidat"
      description="Un aperçu des réalisations et du parcours de ce candidat."
      companyId={companyId}
      adminView={Boolean(companyId)}
    >
      <div className="mx-auto max-w-4xl">
        <Link className="underline" to={backToDirectory}>
          ← Retour à l’annuaire
        </Link>
        {loading ? (
          <p className="mt-8" role="status">
            Chargement du profil…
          </p>
        ) : error ? (
          <section
            className="mt-8 rounded border border-red-700 bg-white/70 p-6"
            role="alert"
          >
            <h1 className="text-2xl font-bold">Profil indisponible</h1>
            <p className="mt-2">{error}</p>
          </section>
        ) : (
          candidate && (
            <>
              <header className="my-8 rounded border border-ink bg-coral p-6 sm:p-8">
                <PersonAvatar person={candidate} size={72} forVisibleCandidate />
                <h1 className="mt-2 text-3xl font-bold">
                  {candidate.first_name} {candidate.last_name}
                </h1>
              </header>

              <section
                className="mb-8"
                aria-labelledby="candidate-projects-title"
              >
                <h2
                  id="candidate-projects-title"
                  className="mb-4 text-2xl font-bold"
                >
                  Projets
                </h2>
                {candidate.projects.length === 0 ? (
                  <p className="rounded border border-ink bg-white/70 p-5">
                    Aucun projet renseigné.
                  </p>
                ) : (
                  <div className="grid gap-4">
                    {candidate.projects.map((project) => (
                      <article
                        key={project.id}
                        className="rounded border border-ink bg-white/70 p-5"
                      >
                        <h3 className="text-xl font-bold">{project.title}</h3>
                        {project.description && (
                          <p className="mt-2 whitespace-pre-wrap">
                            {project.description}
                          </p>
                        )}
                        <div className="mt-3 flex flex-wrap gap-4">
                          {project.project_url && (
                            <a
                              className="underline"
                              href={project.project_url}
                              target="_blank"
                              rel="noreferrer"
                            >
                              Voir le projet
                            </a>
                          )}
                          {project.repository_url && (
                            <a
                              className="underline"
                              href={project.repository_url}
                              target="_blank"
                              rel="noreferrer"
                            >
                              Voir le code
                            </a>
                          )}
                        </div>
                      </article>
                    ))}
                  </div>
                )}
              </section>

              <section aria-labelledby="candidate-experiences-title">
                <h2
                  id="candidate-experiences-title"
                  className="mb-4 text-2xl font-bold"
                >
                  Expériences
                </h2>
                {candidate.experiences.length === 0 ? (
                  <p className="rounded border border-ink bg-white/70 p-5">
                    Aucune expérience renseignée.
                  </p>
                ) : (
                  <div className="grid gap-4">
                    {candidate.experiences.map((experience) => (
                      <article
                        key={experience.id}
                        className="rounded border border-ink bg-white/70 p-5"
                      >
                        <h3 className="text-xl font-bold">
                          {experience.job_title} — {experience.company_name}
                        </h3>
                        <p className="mt-1">
                          {formatDate(experience.start_date)} →{" "}
                          {experience.end_date
                            ? formatDate(experience.end_date)
                            : "En cours"}
                        </p>
                        {experience.description && (
                          <p className="mt-2 whitespace-pre-wrap">
                            {experience.description}
                          </p>
                        )}
                      </article>
                    ))}
                  </div>
                )}
              </section>
            </>
          )
        )}
      </div>
    </CompanyLayout>
  );
}
