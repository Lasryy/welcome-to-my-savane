import Pagination from "../../components/ui/Pagination";
import CustomSelect from "../../components/CustomSelect";
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
  const [activeSection, setActiveSection] = useState("applications");
  const [applications, setApplications] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [favoritesLoading, setFavoritesLoading] = useState(true);
  const [favoritesError, setFavoritesError] = useState("");
  const [favoritePendingIds, setFavoritePendingIds] = useState(() => new Set());
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

  useEffect(() => {
    const controller = new AbortController();
    async function loadFavorites() {
      try {
        const response = await fetch("/api/favorites", {
          credentials: "same-origin",
          signal: controller.signal,
        });
        const data = await response.json();
        if (response.status === 401 || response.status === 403) {
          setIsLoggedOut(true);
          return;
        }
        if (!response.ok || !Array.isArray(data)) {
          throw new Error(data.message || "Impossible de charger tes favoris.");
        }
        setFavorites(data);
      } catch (requestError) {
        if (requestError.name !== "AbortError") {
          setFavoritesError(requestError.message || "Impossible de charger tes favoris.");
        }
      } finally {
        if (!controller.signal.aborted) setFavoritesLoading(false);
      }
    }
    loadFavorites();
    return () => controller.abort();
  }, []);

  async function removeFavorite(ad) {
    setFavoritesError("");
    setFavoritePendingIds((current) => new Set(current).add(ad.id));
    try {
      const response = await fetch(`/api/favorites/${ad.id}`, {
        method: "DELETE",
        credentials: "same-origin",
      });
      if (response.status === 401) {
        setIsLoggedOut(true);
        return;
      }
      if (!response.ok) {
        const data = await response.json().catch(() => null);
        throw new Error(data?.message || "Impossible de retirer ce favori.");
      }
      setFavorites((current) => current.filter((favorite) => favorite.id !== ad.id));
    } catch (requestError) {
      setFavoritesError(requestError.message || "Impossible de retirer ce favori.");
    } finally {
      setFavoritePendingIds((current) => {
        const next = new Set(current);
        next.delete(ad.id);
        return next;
      });
    }
  }

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
        <h1 id="applications-title">Espace candidat</h1>
        <p>
          Retrouve tes candidatures et les offres que tu as sauvegardées.
        </p>
      </header>

      <nav className="mb-7 flex flex-wrap gap-3" aria-label="Espace candidat">
        <button
          className={activeSection === "applications" ? "button button-primary" : "button button-secondary"}
          type="button"
          aria-pressed={activeSection === "applications"}
          onClick={() => setActiveSection("applications")}
        >
          Candidatures <span className="ml-2 tabular-nums">{applications.length}</span>
        </button>
        <button
          className={activeSection === "favorites" ? "button button-primary" : "button button-secondary"}
          type="button"
          aria-pressed={activeSection === "favorites"}
          onClick={() => setActiveSection("favorites")}
        >
          Favoris <span className="ml-2 tabular-nums">{favorites.length}</span>
        </button>
      </nav>

      {activeSection === "applications" && !loading && !isLoggedOut && !error && applications.length > 0 && (
        <label className="form-field mb-6 max-w-xs">
          Filtrer par statut
          <CustomSelect
            value={statusFilter}
            onChange={(value) => {
              setStatusFilter(value);
              setPage(1);
            }}
            options={[
              { value: "all", label: "Tous les statuts" },
              ...Object.entries(STATUS_LABELS).map(([value, label]) => ({ value, label })),
            ]}
          />
        </label>
      )}
      {activeSection === "applications" && loading && <p role="status">Chargement de tes candidatures…</p>}
      {activeSection === "applications" && error && (
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
      {activeSection === "applications" && !loading && !error && !isLoggedOut && applications.length === 0 && (
        <div className="illustrated-empty-state border border-rule bg-white p-6">
          <img src="/illustrations/applications-elephant-brand.webp" alt="" aria-hidden="true" />
          <div>
            <h2 className="mb-2 text-xl font-bold">
              Tu n’as pas encore postulé.
            </h2>
            <p className="mb-4">
              Parcours les offres et envoie ta première candidature.
            </p>
            <Link className="font-bold underline" to="/jobs">
              Voir les offres
            </Link>
          </div>
        </div>
      )}
      {activeSection === "applications" && !loading && !error && !isLoggedOut && applications.length > 0 && (
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

      {activeSection === "favorites" && favoritesLoading && !isLoggedOut && (
        <p role="status">Chargement de tes favoris…</p>
      )}
      {activeSection === "favorites" && favoritesError && !isLoggedOut && (
        <p className="border border-ink p-4" role="alert">{favoritesError}</p>
      )}
      {activeSection === "favorites" && !favoritesLoading && !favoritesError && !isLoggedOut && favorites.length === 0 && (
        <div className="illustrated-empty-state border border-rule bg-white p-6">
          <div>
            <h2 className="mb-2 text-xl font-bold">Aucune offre enregistrée pour le moment.</h2>
            <p className="mb-4">Ajoute une offre à tes favoris depuis la page des offres pour la retrouver ici.</p>
            <Link className="font-bold underline" to="/jobs">Voir les offres</Link>
          </div>
        </div>
      )}
      {activeSection === "favorites" && !favoritesLoading && !isLoggedOut && favorites.length > 0 && (
        <ul className="grid list-none gap-4 p-0">
          {favorites.map((ad) => (
            <li key={ad.id} className="grid gap-3 border border-rule bg-white p-5 sm:grid-cols-[1fr_auto] sm:items-center">
              <div>
                <h2 className="mb-1 text-xl font-bold">
                  {ad.status === "closed" ? ad.title : <Link className="underline underline-offset-4" to={`/jobs/${ad.id}`}>{ad.title}</Link>}
                </h2>
                <p>{ad.company_name}{ad.location ? ` · ${ad.location}` : ""}</p>
                {ad.status === "closed" && <p className="mt-1 text-sm">Cette offre est fermée.</p>}
              </div>
              <button
                className="button button-secondary w-fit"
                type="button"
                disabled={favoritePendingIds.has(ad.id)}
                onClick={() => removeFavorite(ad)}
              >
                {favoritePendingIds.has(ad.id) ? "Retrait…" : "Retirer des favoris"}
              </button>
            </li>
          ))}
        </ul>
      )}
      {activeSection === "applications" && !loading && !error && !isLoggedOut && applications.length > 0 && (
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
