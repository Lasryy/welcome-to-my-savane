import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { formatDate } from "../../utils/adminUtils";

const STATUS_LABELS = {
  sent: "Envoyée",
  in_progress: "En cours",
  technical_test: "Test technique",
  accepted: "Acceptée",
  rejected: "Refusée",
};

export default function ApplicationsHistoryPage() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isLoggedOut, setIsLoggedOut] = useState(false);

  useEffect(() => {
    const controller = new AbortController();

    async function loadApplications() {
      try {
        const response = await fetch("/api/applications/mine", {
          credentials: "same-origin",
          signal: controller.signal,
        });
        const data = await response.json();

        if (response.status === 401) {
          setIsLoggedOut(true);
          return;
        }
        if (!response.ok || !Array.isArray(data)) {
          throw new Error(data.error || "Impossible de charger tes candidatures.");
        }

        setApplications(data);
      } catch (requestError) {
        if (requestError.name !== "AbortError") {
          setError(requestError.message || "Le serveur ne répond pas.");
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    loadApplications();
    return () => controller.abort();
  }, []);

  return (
    <section className="mx-auto w-[calc(100%_-_40px)] max-w-[1000px] py-12" aria-labelledby="applications-title">
      <p className="mb-3 text-xs font-bold tracking-[.08em]">WELCOME TO MY SAVANE · CANDIDAT</p>
      <h1 id="applications-title" className="mb-3 text-4xl font-extrabold">Mes candidatures</h1>
      <p className="mb-8 max-w-[60ch]">Retrouve les offres auxquelles tu as postulé et suis leur avancement.</p>

      {loading && <p role="status">Chargement de tes candidatures…</p>}
      {error && <p className="border border-ink p-4" role="alert">{error}</p>}
      {isLoggedOut && (
        <div className="border border-ink bg-white p-6">
          <p className="mb-4">Connecte-toi pour consulter ton historique de candidatures.</p>
          <Link className="font-bold underline" to="/login" state={{ from: "/applications" }}>Se connecter</Link>
        </div>
      )}
      {!loading && !error && !isLoggedOut && applications.length === 0 && (
        <div className="border border-rule bg-white p-6">
          <h2 className="mb-2 text-xl font-bold">Tu n’as pas encore postulé.</h2>
          <p className="mb-4">Parcours les offres et envoie ta première candidature.</p>
          <Link className="font-bold underline" to="/">Voir les offres</Link>
        </div>
      )}
      {!loading && !error && applications.length > 0 && (
        <ul className="grid list-none gap-4 p-0">
          {applications.map((application) => (
            <li key={application.id} className="grid gap-3 border border-rule bg-white p-5 sm:grid-cols-[1fr_auto] sm:items-center">
              <div>
                <h2 className="mb-1 text-xl font-bold">
                  <Link className="underline underline-offset-4" to={`/jobs/${application.ad_id}`}>
                    {application.title}
                  </Link>
                </h2>
                <p>{application.company_name}{application.location ? ` · ${application.location}` : ""}</p>
                <p className="mt-1 text-sm">Envoyée le {formatDate(application.created_at)}</p>
                {application.cv_file_url && (
                  <p className="mt-2 text-sm">
                    CV envoyé :{" "}
                    <a className="font-bold underline underline-offset-4" href={application.cv_file_url} target="_blank" rel="noreferrer">
                      {application.cv_original_name || "Consulter le CV"}
                    </a>
                  </p>
                )}
              </div>
              <span className="inline-flex w-fit border border-ink px-3 py-2 text-sm font-bold">
                {STATUS_LABELS[application.status] || "Statut inconnu"}
              </span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
