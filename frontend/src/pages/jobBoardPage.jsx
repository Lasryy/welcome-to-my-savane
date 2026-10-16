import Pagination from "../components/ui/Pagination";
import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import CustomSelect from "../components/CustomSelect";
import JobCard from "../components/jobCard";
import { contractLabels } from "../utils/adminUtils";

const fieldClass = "grid min-w-0 gap-1.5 text-xs";
const inputClass =
  "min-h-[46px] w-full rounded-[3px] border border-[#c8c5b9] bg-paper px-[13px] py-2.5 text-ink";
const buttonClass =
  "inline-flex min-h-11 items-center justify-center border border-transparent bg-sun px-[18px] py-2.5 text-[13px] font-bold text-ink disabled:opacity-50";

function JobSearch({
  query,
  setSearchParams,
  catalogue,
  catalogueError,
  retry,
}) {
  const params = new URLSearchParams(query);
  const [filters, setFilters] = useState(() => ({
    q: params.get("q") || "",
    location: params.get("location") || "",
    company_id: params.get("company_id") || "",
    category_id: params.get("category_id") || "",
    contract_type: params.get("contract_type") || "",
    sort: params.get("sort") || "recent",
  }));
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const controller = new AbortController();
    async function loadAds() {
      const apiParams = new URLSearchParams(query);
      // Request the paginated format, including on the first page.
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
        if (!controller.signal.aborted) setResult(data);
      } catch (requestError) {
        if (!controller.signal.aborted)
          setError(
            requestError instanceof SyntaxError
              ? "Le serveur ne répond pas correctement. Réessaie dans un instant."
              : requestError.message,
          );
      }
    }
    loadAds();
    return () => controller.abort();
  }, [query]);

  function changeFilter(name, value) {
    setFilters((current) => ({ ...current, [name]: value }));
  }

  function search(event) {
    event.preventDefault();
    const next = new URLSearchParams();
    for (const [name, value] of Object.entries(filters)) {
      if (value.trim() && !(name === "sort" && value === "recent"))
        next.set(name, value.trim());
    }
    if (params.has("page_size")) next.set("page_size", params.get("page_size"));
    next.set("page", "1");
    if (next.toString() === query) retry();
    else setSearchParams(next);
  }

  function changePage(page) {
    const next = new URLSearchParams(query);
    next.set("page", String(page));
    setSearchParams(next);
  }

  const loading = !result && !error;
  return (
    <>
      <section className="bg-coral">
        <div className="home-hero-layout mx-auto w-[calc(100%_-_112px)] max-w-[1280px] max-[1200px]:w-[calc(100%_-_72px)] max-[760px]:w-[calc(100%_-_40px)]">
          <div className="home-hero-copy relative z-[1] max-w-[700px]">
            <h1 className="m-0 max-w-[720px] text-[clamp(48px,5.4vw,78px)] font-extrabold leading-[.99] tracking-[-.04em] max-[1000px]:text-[54px] max-[760px]:max-w-[580px] max-[760px]:text-[clamp(36px,6.7vw,51px)]">
              Le terrain des
              <span className="mt-2 inline-block bg-ink px-[11px] pt-[2px] pb-[7px] text-sun">
                possibles.
              </span>
            </h1>
            <p className="mt-5 max-w-[55ch] pr-0 leading-[1.7] max-[760px]:max-w-[46ch] max-[760px]:pr-7">
              Explorez des offres concrètes, des équipes qui recrutent et le
              prochain projet qui vous fera avancer.
            </p>
          </div>
          <figure className="home-lion" aria-label="Illustration d’un lion adulte">
            <img
              src="/illustrations/hero-lion-approved.png"
              alt="Lion peint à la crinière bleu nuit, dans la savane."
              fetchPriority="high"
            />
          </figure>
        </div>
      </section>

      <section
        className="mx-auto w-[calc(100%_-_112px)] max-w-[1280px] pt-10 pb-3 max-[1200px]:w-[calc(100%_-_72px)] max-[760px]:w-[calc(100%_-_40px)] max-[760px]:pt-7"
        aria-labelledby="offers-heading"
      >
        <div className="mb-5 flex items-end justify-between gap-4 max-[480px]:items-start max-[480px]:flex-col">
          <h2
            id="offers-heading"
            className="m-0 text-[27px] font-extrabold leading-[1.25] tracking-[-.025em]"
          >
            Les offres du moment
          </h2>
          {result && (
            <p className="text-[13px]" role="status">
              {result.total} offre{result.total !== 1 ? "s" : ""}
            </p>
          )}
        </div>

        <form
          className="job-search mb-[22px] grid grid-cols-3 items-end gap-3 bg-ink p-4 text-paper max-[1000px]:grid-cols-2 max-[480px]:grid-cols-1"
          role="search"
          aria-label="Filtrer les offres"
          onSubmit={search}
        >
          <label className={fieldClass} htmlFor="job-search-text">
            Métier ou mot-clé
            <input
              className={inputClass}
              id="job-search-text"
              type="search"
              maxLength={255}
              value={filters.q}
              onChange={(event) => changeFilter("q", event.target.value)}
              placeholder="Ex. développeur…"
            />
          </label>
          <label className={fieldClass} htmlFor="job-search-location">
            Lieu
            <input
              className={inputClass}
              id="job-search-location"
              type="search"
              maxLength={255}
              value={filters.location}
              onChange={(event) => changeFilter("location", event.target.value)}
              placeholder="Ex. Lyon…"
            />
          </label>
          <div className="search-actions max-[1000px]:col-span-2 max-[480px]:col-span-1">
            <button className={buttonClass} type="submit">
              Rechercher
            </button>
            <button
              className={`${buttonClass} bg-paper`}
              type="button"
              onClick={() => {
                if (!query) retry();
                else setSearchParams({});
              }}
            >
              Effacer
            </button>
          </div>
          <details className="search-more col-span-full">
            <summary>
              Plus de filtres
              <span>
                {[
                  filters.company_id,
                  filters.category_id,
                  filters.contract_type,
                ].filter(Boolean).length || ""}
              </span>
            </summary>
            <div className="mt-5 grid grid-cols-2 gap-4 max-[580px]:grid-cols-1">
              <label className={fieldClass} htmlFor="job-search-company">
                Entreprise
                <CustomSelect
                  id="job-search-company"
                  value={filters.company_id}
                  onChange={(value) => changeFilter("company_id", value)}
                  placeholder="Toutes les entreprises"
                  options={[
                    { value: "", label: "Toutes les entreprises" },
                    ...catalogue.companies.map((company) => ({
                      value: String(company.id),
                      label: company.name,
                    })),
                  ]}
                />
              </label>
              <label className={fieldClass} htmlFor="job-search-category">
                Domaine
                <CustomSelect
                  id="job-search-category"
                  value={filters.category_id}
                  onChange={(value) => changeFilter("category_id", value)}
                  placeholder="Tous les domaines"
                  options={[
                    { value: "", label: "Tous les domaines" },
                    ...catalogue.categories.map((category) => ({
                      value: String(category.id),
                      label: category.name,
                    })),
                  ]}
                />
              </label>
              <label className={fieldClass} htmlFor="job-search-contract">
                Contrat
                <CustomSelect
                  id="job-search-contract"
                  value={filters.contract_type}
                  onChange={(value) => changeFilter("contract_type", value)}
                  placeholder="Tous les contrats"
                  options={[
                    { value: "", label: "Tous les contrats" },
                    ...Object.entries(contractLabels).map(([value, label]) => ({
                      value,
                      label,
                    })),
                  ]}
                />
              </label>
              <label className={fieldClass} htmlFor="job-search-sort">
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
              <p className="salary-help mt-4">
                Les salaires sont comparés sur une année. Les montants non
                renseignés apparaissent en dernier.
              </p>
            )}
          </details>
        </form>

        {catalogueError && (
          <div className="my-6 border border-rule bg-paper p-6" role="alert">
            <p>{catalogueError}</p>
            <button
              className={`${buttonClass} mt-4`}
              type="button"
              onClick={retry}
            >
              Recharger les filtres
            </button>
          </div>
        )}
        {loading && (
          <div className="my-6 border border-rule bg-paper p-6" role="status">
            <h2 className="mb-2 text-[22px] font-extrabold">
              On prépare la savane…
            </h2>
            <p>Chargement des offres.</p>
          </div>
        )}
        {error && (
          <div className="my-6 border border-rule bg-paper p-6" role="alert">
            <h2 className="mb-2 text-[22px] font-extrabold">
              Impossible de charger les offres.
            </h2>
            <p>{error}</p>
            <button
              className={`${buttonClass} mt-4`}
              type="button"
              onClick={retry}
            >
              Réessayer
            </button>
          </div>
        )}
        {result && result.ads.length === 0 && (
          <div className="job-empty-state my-6 border border-rule bg-paper p-6" role="status">
            {result.total === 0 && (
              <img src="/illustrations/search-hyena.webp" alt="" aria-hidden="true" />
            )}
            <div>
              <h2 className="mb-2 text-[22px] font-extrabold">
                {result.total > 0 ? "Aucune offre sur cette page." : "Aucune offre pour cette recherche."}
              </h2>
              <p>
                {result.total > 0
                  ? "Revenez à la première page pour voir les résultats."
                  : "Essayez un autre métier, lieu, domaine ou contrat."}
              </p>
              {result.total > 0 && (
                <button
                  className={`${buttonClass} mt-4`}
                  type="button"
                  onClick={() => changePage(1)}
                >
                  Première page
                </button>
              )}
            </div>
          </div>
        )}
        {result && result.ads.length > 0 && (
          <div className="grid grid-cols-3 items-stretch gap-[22px] max-[1200px]:gap-[17px] max-[1000px]:grid-cols-2 max-[480px]:grid-cols-1">
            {result.ads.map((ad, index) => (
              <JobCard key={ad.id} ad={ad} index={index} />
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
    </>
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

  // Reset the form and loading state when the URL changes.
  return (
    <JobSearch
      key={`${query}-${retryKey}`}
      query={query}
      setSearchParams={setSearchParams}
      catalogue={catalogue}
      catalogueError={catalogueError}
      retry={() => setRetryKey((key) => key + 1)}
    />
  );
}
