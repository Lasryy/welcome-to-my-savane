import Pagination from "../components/ui/Pagination";
import { useEffect, useState } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import CustomSelect from "../components/CustomSelect";
import JobSearchBar from "../components/JobSearchBar";
import JobCard from "../components/jobCard";
import UiIcon from "../components/ui/UiIcon";
import { contractLabels } from "../utils/adminUtils";
import "../styles/job-board.css";

function readFilters(query) {
  const params = new URLSearchParams(query);
  return {
    q: params.get("q") || "",
    location: params.get("location") || "",
    company_id: params.get("company_id") || "",
    category_id: params.get("category_id") || "",
    contract_type: params.get("contract_type") || "",
    sort: params.get("sort") || "recent",
  };
}

function JobSearch({
  query,
  setSearchParams,
  catalogue,
  catalogueError,
  retry,
  retryKey,
}) {
  const params = new URLSearchParams(query);
  const [searchState, setSearchState] = useState(() => ({
    query,
    filters: readFilters(query),
  }));
  const [responseState, setResponseState] = useState(null);
  const [favoriteIds, setFavoriteIds] = useState([]);
  const [favoriteAccess, setFavoriteAccess] = useState(false);
  const [favoritePendingIds, setFavoritePendingIds] = useState(() => new Set());
  const [favoriteError, setFavoriteError] = useState("");
  const location = useLocation();
  const navigate = useNavigate();
  const requestKey = `${query}-${retryKey}`;
  let filters = searchState.filters;

  // Keep browser history in sync without remounting the focused controls.
  if (searchState.query !== query) {
    filters = readFilters(query);
    setSearchState({ query, filters });
  }

  const result =
    responseState?.key === requestKey ? responseState.result : null;
  const error = responseState?.key === requestKey ? responseState.error : "";

  useEffect(() => {
    const controller = new AbortController();
    async function loadAds() {
      const apiParams = new URLSearchParams(query);
      if (!apiParams.has("page")) apiParams.set("page", "1");
      try {
        const response = await fetch(`/api/ads?${apiParams}`, {
          signal: controller.signal,
        });
        if (!response.ok)
          throw new Error(
            "Les offres ne peuvent pas être chargées. Réessaie dans un instant.",
          );
        const data = await response.json();
        if (!Array.isArray(data.ads))
          throw new Error("La réponse du serveur est invalide.");
        if (!controller.signal.aborted)
          setResponseState({ key: requestKey, result: data, error: "" });
      } catch (requestError) {
        if (!controller.signal.aborted)
          setResponseState({
            key: requestKey,
            result: null,
            error:
              requestError instanceof SyntaxError
                ? "Le serveur ne répond pas correctement. Réessaie dans un instant."
                : requestError.message,
          });
      }
    }
    loadAds();
    return () => controller.abort();
  }, [query, requestKey]);

  useEffect(() => {
    const controller = new AbortController();
    async function loadFavorites() {
      try {
        const response = await fetch("/api/favorites", {
          credentials: "same-origin",
          signal: controller.signal,
        });
        if (response.status === 401 || response.status === 403) {
          if (!controller.signal.aborted) setFavoriteAccess(false);
          return;
        }
        if (!response.ok) throw new Error("Les favoris ne peuvent pas être chargés.");
        const favorites = await response.json();
        if (!Array.isArray(favorites)) throw new Error("La liste des favoris reçue est invalide.");
        if (!controller.signal.aborted) {
          setFavoriteIds(favorites.map((ad) => ad.id));
          setFavoriteAccess(true);
          setFavoriteError("");
        }
      } catch (error) {
        if (!controller.signal.aborted) setFavoriteError(error.message || "Impossible de charger les favoris.");
      }
    }
    loadFavorites();
    return () => controller.abort();
  }, []);

  async function toggleFavorite(ad) {
    if (favoritePendingIds.has(ad.id)) return;
    const wasFavorite = favoriteIds.includes(ad.id);
    setFavoritePendingIds((current) => new Set(current).add(ad.id));
    setFavoriteError("");
    try {
      const response = await fetch(`/api/favorites/${ad.id}`, {
        method: wasFavorite ? "DELETE" : "PUT",
        credentials: "same-origin",
      });
      if (response.status === 401) {
        navigate("/login", { state: { from: `${location.pathname}${location.search}` } });
        return;
      }
      if (!response.ok) {
        const data = await response.json().catch(() => null);
        throw new Error(data?.message || "Impossible de mettre à jour ce favori.");
      }
      setFavoriteIds((current) => wasFavorite
        ? current.filter((id) => id !== ad.id)
        : [...current, ad.id]);
    } catch (error) {
      setFavoriteError(error.message || "Impossible de mettre à jour ce favori.");
    } finally {
      setFavoritePendingIds((current) => {
        const next = new Set(current);
        next.delete(ad.id);
        return next;
      });
    }
  }

  function editSearch(name, value) {
    setSearchState((current) => ({
      ...current,
      filters: { ...current.filters, [name]: value },
    }));
  }

  function applyFilters(nextFilters) {
    const next = new URLSearchParams();
    for (const [name, value] of Object.entries(nextFilters)) {
      if (value.trim() && !(name === "sort" && value === "recent"))
        next.set(name, value.trim());
    }
    if (params.has("page_size")) next.set("page_size", params.get("page_size"));
    next.set("page", "1");
    if (next.toString() === query) retry();
    else setSearchParams(next);
  }

  function changeFilter(name, value) {
    const nextFilters = { ...filters, [name]: value };
    applyFilters(nextFilters);
  }

  function resetSearch() {
    setSearchState({ query: "", filters: readFilters("") });
    if (query) setSearchParams({});
    else retry();
  }

  function changePage(page) {
    const next = new URLSearchParams(query);
    next.set("page", String(page));
    setSearchParams(next);
    document
      .getElementById("offers-heading")
      ?.scrollIntoView({ block: "start" });
  }

  const activeFilters = [
    { name: "q", label: params.get("q") },
    { name: "location", label: params.get("location") },
    {
      name: "contract_type",
      label: contractLabels[params.get("contract_type")],
    },
    {
      name: "category_id",
      label: catalogue.categories.find(
        (item) => String(item.id) === params.get("category_id"),
      )?.name,
    },
    {
      name: "company_id",
      label: catalogue.companies.find(
        (item) => String(item.id) === params.get("company_id"),
      )?.name,
    },
  ].filter((filter) => filter.label);
  const loading = !result && !error;

  return (
    <div className="job-board-page">
      <section className="board-header" aria-labelledby="board-title">
        <div className="page-container board-intro">
          <div>
            <h1 id="board-title">
              Votre prochain poste
              <br />
              est peut-être ici.
            </h1>
            <p>
              Un métier, un lieu, vos envies. Trouvez l’offre qui vous
              ressemble.
            </p>
          </div>
          <img
            src="/illustrations/hero-lion-approved.png"
            alt="Lion peint à la crinière bleu nuit, dans la savane."
            width="1536"
            height="1024"
            fetchPriority="high"
          />
        </div>
        <div className="page-container board-search-wrap">
          <JobSearchBar
            keyword={filters.q}
            location={filters.location}
            onKeywordChange={(value) => editSearch("q", value)}
            onLocationChange={(value) => editSearch("location", value)}
            onSubmit={(event) => {
              event.preventDefault();
              applyFilters(filters);
            }}
          />
        </div>
      </section>

      <div className="page-container">
        <section className="board-filter-area" aria-label="Affiner les offres">
          <div className="board-filter-row">
            <label htmlFor="job-search-contract">
              Contrat
              <CustomSelect
                id="job-search-contract"
                value={filters.contract_type}
                onChange={(value) => changeFilter("contract_type", value)}
                options={[
                  { value: "", label: "Tous les contrats" },
                  ...Object.entries(contractLabels).map(([value, label]) => ({
                    value,
                    label,
                  })),
                ]}
              />
            </label>
            <label htmlFor="job-search-category">
              Domaine
              <CustomSelect
                id="job-search-category"
                value={filters.category_id}
                onChange={(value) => changeFilter("category_id", value)}
                disabled={Boolean(catalogueError)}
                options={[
                  { value: "", label: "Tous les domaines" },
                  ...catalogue.categories.map((category) => ({
                    value: String(category.id),
                    label: category.name,
                  })),
                ]}
              />
            </label>
            <label htmlFor="job-search-company">
              Entreprise
              <CustomSelect
                id="job-search-company"
                value={filters.company_id}
                onChange={(value) => changeFilter("company_id", value)}
                disabled={Boolean(catalogueError)}
                options={[
                  { value: "", label: "Toutes les entreprises" },
                  ...catalogue.companies.map((company) => ({
                    value: String(company.id),
                    label: company.name,
                  })),
                ]}
              />
            </label>
            <button type="button" className="board-reset" onClick={resetSearch}>
              Tout effacer
            </button>
          </div>
          {activeFilters.length > 0 && (
            <div
              className="board-active-filters"
              aria-label="Filtres appliqués"
            >
              {activeFilters.map((filter) => (
                <button
                  key={filter.name}
                  type="button"
                  onClick={() => changeFilter(filter.name, "")}
                  aria-label={`Retirer le filtre ${filter.label}`}
                  title={`Retirer : ${filter.label}`}
                >
                  <span>{filter.label}</span>
                  <UiIcon name="close" size={15} />
                </button>
              ))}
            </div>
          )}
          {catalogueError && (
            <div className="board-catalogue-error" role="alert">
              <p>
                {catalogueError} La recherche par métier, lieu et contrat reste
                disponible.
              </p>
              <button type="button" className="text-link" onClick={retry}>
                Recharger les filtres
              </button>
            </div>
          )}
        </section>

        <section
          className="board-results"
          aria-labelledby="offers-heading"
          aria-busy={loading}
        >
          <div className="board-results-toolbar">
            <div>
              <h2 id="offers-heading">Les offres à explorer</h2>
              <p role="status">
                {loading
                  ? "Recherche des offres…"
                  : result
                    ? `${result.total} offre${result.total !== 1 ? "s" : ""}${activeFilters.length ? " pour votre recherche" : " à découvrir"}`
                    : ""}
              </p>
            </div>
            <label htmlFor="job-search-sort">
              Trier par
              <CustomSelect
                id="job-search-sort"
                value={filters.sort}
                onChange={(value) => changeFilter("sort", value)}
                options={[
                  { value: "recent", label: "Les plus récentes" },
                  { value: "salary_desc", label: "Salaire décroissant" },
                  { value: "salary_asc", label: "Salaire croissant" },
                ]}
              />
            </label>
          </div>
          {filters.sort !== "recent" && (
            <p className="board-salary-help">
              Les salaires sont comparés sur une année. Les montants non
              renseignés apparaissent en dernier.
            </p>
          )}
          {loading && (
            <div className="board-message" role="status">
              <h3>Les offres arrivent…</h3>
              <p>Nous préparons les résultats de votre recherche.</p>
            </div>
          )}
          {error && (
            <div className="board-message" role="alert">
              <h3>Impossible de charger les offres.</h3>
              <p>{error}</p>
              <button
                className="button button-primary"
                type="button"
                onClick={retry}
              >
                Réessayer
              </button>
            </div>
          )}
        {favoriteError && <p className="form-error mb-4" role="alert">{favoriteError}</p>}
          {result && result.ads.length === 0 && (
            <div className="board-message board-empty" role="status">
              {result.total === 0 && (
                <img
                  src="/illustrations/search-hyena.webp"
                  alt=""
                  aria-hidden="true"
                />
              )}
              <div>
                <h3>
                  {result.total > 0
                    ? "Aucune offre sur cette page."
                    : "Aucune offre pour le moment avec ces critères."}
                </h3>
                <p>
                  {result.total > 0
                    ? "Revenez à la première page pour voir les résultats."
                    : "Essayez un autre mot-clé, élargissez le lieu ou retirez un filtre."}
                </p>
                <button
                  type="button"
                  className="button button-primary"
                  onClick={result.total > 0 ? () => changePage(1) : resetSearch}
                >
                  {result.total > 0
                    ? "Première page"
                    : "Voir toutes les offres"}
                </button>
              </div>
            </div>
          )}
          {result && result.ads.length > 0 && (
            <div className="board-job-grid">
              {result.ads.map((ad, index) => (
                <JobCard
                  key={ad.id}
                  ad={ad}
                  index={index}
                  showFavorite={favoriteAccess}
                  isFavorite={favoriteIds.includes(ad.id)}
                  favoritePending={favoritePendingIds.has(ad.id)}
                  onToggleFavorite={toggleFavorite}
                />
              ))}
            </div>
          )}
          {result && (
            <Pagination
              page={result.page}
              totalPages={result.total_pages}
              total={result.total}
              label="Pagination des offres"
              onPageChange={changePage}
            />
          )}
        </section>
      </div>
    </div>
  );
}

export default function JobBoardPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [retryKey, setRetryKey] = useState(0);
  const [catalogue, setCatalogue] = useState({ companies: [], categories: [] });
  const [catalogueError, setCatalogueError] = useState("");
  const query = searchParams.toString();

  useEffect(() => {
    const controller = new AbortController();
    async function loadCatalogue() {
      try {
        const responses = await Promise.all([
          fetch("/api/public/companies", { signal: controller.signal }),
          fetch("/api/public/categories", { signal: controller.signal }),
        ]);
        if (responses.some((response) => !response.ok))
          throw new Error(
            "Les filtres entreprise et domaine sont momentanément indisponibles.",
          );
        const [companies, categories] = await Promise.all(
          responses.map((response) => response.json()),
        );
        if (!Array.isArray(companies) || !Array.isArray(categories))
          throw new Error("Les listes de filtres sont invalides.");
        if (!controller.signal.aborted) {
          setCatalogue({ companies, categories });
          setCatalogueError("");
        }
      } catch (error) {
        if (!controller.signal.aborted) setCatalogueError(error.message);
      }
    }
    loadCatalogue();
    return () => controller.abort();
  }, [retryKey]);

  return (
    <JobSearch
      query={query}
      retryKey={retryKey}
      setSearchParams={setSearchParams}
      catalogue={catalogue}
      catalogueError={catalogueError}
      retry={() => setRetryKey((key) => key + 1)}
    />
  );
}
