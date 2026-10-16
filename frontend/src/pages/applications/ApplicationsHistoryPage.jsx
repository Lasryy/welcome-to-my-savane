import Pagination from "../../components/ui/Pagination";
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
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState("all");
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
          throw new Error(
            data.error || "Impossible de charger tes candidatures.",
          );
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

  const filteredApplications = applications.filter(
    (application) =>
      statusFilter === "all" || application.status === statusFilter,
  );
  const totalPages = Math.max(1, Math.ceil(filteredApplications.length / 10));
  const currentPage = Math.min(page, totalPages);
  const visibleApplications = filteredApplications.slice(
    (currentPage - 1) * 10,
    currentPage * 10,
  );

  return (
    <section
      className="history-page page-container py-10"
      aria-labelledby="applications-title"
    >
      <header className="page-heading page-heading-banner page-heading-lavender">
        <h1 id="applications-title">Mes candidatures</h1>
        <p>
          Retrouve les offres auxquelles tu as postulé et suis leur avancement.
        </p>
      </header>

      {!loading && !isLoggedOut && !error && applications.length > 0 && (
        <label className="form-field mb-6 max-w-xs">
          Filtrer par statut
          <select
            className="form-input"
            value={statusFilter}
            onChange={(event) => {
              setStatusFilter(event.target.value);
              setPage(1);
            }}
          >
            <option value="all">Tous les statuts</option>
            {Object.entries(STATUS_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </label>
      )}
      {loading && <p role="status">Chargement de tes candidatures…</p>}
      {error && (
        <p className="border border-ink p-4" role="alert">
          {error}
        </p>
      )}
      {isLoggedOut && (
        <div className="border border-ink bg-white p-6">
          <p className="mb-4">
            Connecte-toi pour consulter ton historique de candidatures.
          </p>
          <Link
            className="font-bold underline"
            to="/login"
            state={{ from: "/applications" }}
          >
            Se connecter
          </Link>
        </div>
      )}
      {!loading && !error && !isLoggedOut && applications.length === 0 && (
        <div className="illustrated-empty-state border border-rule bg-white p-6">
          <img src="/illustrations/applications-elephant-brand.webp" alt="" aria-hidden="true" />
          <div>
            <h2 className="mb-2 text-xl font-bold">
              Tu n’as pas encore postulé.
            </h2>
            <p className="mb-4">
              Parcours les offres et envoie ta première candidature.
            </p>
            <Link className="font-bold underline" to="/">
              Voir les offres
            </Link>
          </div>
        </div>
      )}
      {!loading && !error && applications.length > 0 && (
        <ul className="grid list-none gap-4 p-0">
          {visibleApplications.map((application) => (
            <li
              key={application.id}
              className="grid gap-3 border border-rule bg-white p-5 sm:grid-cols-[1fr_auto] sm:items-center"
            >
              <div>
                <h2 className="mb-1 text-xl font-bold">
                  <Link
                    className="underline underline-offset-4"
                    to={`/jobs/${application.ad_id}`}
                  >
                    {application.title}
                  </Link>
                </h2>
                <p>
                  {application.company_name}
                  {application.location ? ` · ${application.location}` : ""}
                </p>
                <p className="mt-1 text-sm">
                  Envoyée le {formatDate(application.created_at)}
                </p>
                {application.cv_file_url && (
                  <p className="mt-2 text-sm">
                    CV envoyé :{" "}
                    <a
                      className="font-bold underline underline-offset-4"
                      href={application.cv_file_url}
                      target="_blank"
                      rel="noreferrer"
                    >
                      {application.cv_original_name || "Consulter le CV"}
                    </a>
                  </p>
                )}
                <Link
                  className="mt-3 inline-flex font-bold underline underline-offset-4"
                  to={`/applications/${application.id}`}
                >
                  Voir le dossier envoyé
                </Link>
              </div>
              <span className={`status-badge status-${application.status}`}>
                {STATUS_LABELS[application.status] || "Statut inconnu"}
              </span>
            </li>
          ))}
        </ul>
      )}
      {!loading && !error && !isLoggedOut && applications.length > 0 && (
        <>
          {filteredApplications.length === 0 && (
            <p className="profile-empty">Aucune candidature avec ce statut.</p>
          )}
          <Pagination
            page={currentPage}
            totalPages={totalPages}
            total={filteredApplications.length}
            label="Pagination de mes candidatures"
            onPageChange={setPage}
          />
        </>
      )}
    </section>
  );
}
