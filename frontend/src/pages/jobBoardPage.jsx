import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import CustomSelect from "../components/CustomSelect";
import HorizonSign from "../components/horizonSign";
import JobCard from "../components/jobCard";
import { contractLabels } from "../utils/adminUtils";

const fieldClass = "grid min-w-0 gap-1.5 text-xs";
const inputClass = "min-h-[46px] w-full rounded-[3px] border border-[#c8c5b9] bg-paper px-[13px] py-2.5 text-ink";
const buttonClass = "inline-flex min-h-11 items-center justify-center border border-transparent bg-sun px-[18px] py-2.5 text-[13px] font-bold text-ink disabled:opacity-50";

function JobSearch({ query, setSearchParams, catalogue, catalogueError, retry }) {
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
      // Demander explicitement le format paginé, même pour la première page.
      if (!apiParams.has("page")) apiParams.set("page", "1");
      try {
        const response = await fetch(`/api/ads?${apiParams}`, { signal: controller.signal });
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || "Les offres ne peuvent pas être chargées.");
        if (!Array.isArray(data.ads)) throw new Error("La réponse du serveur est invalide.");
        if (!controller.signal.aborted) setResult(data);
      } catch (requestError) {
        if (!controller.signal.aborted) setError(requestError.message);
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
      if (value.trim() && !(name === "sort" && value === "recent")) next.set(name, value.trim());
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
        <div className="relative mx-auto flex min-h-[300px] w-[calc(100%_-_112px)] max-w-[1280px] items-center pt-[42px] pb-[52px] max-[1200px]:w-[calc(100%_-_72px)] max-[760px]:min-h-[260px] max-[760px]:w-[calc(100%_-_40px)] max-[760px]:pt-[30px] max-[760px]:pb-[38px]">
          <div className="relative z-[1] max-w-[700px]">
            <p className="mb-3 text-xs font-bold tracking-[.08em]">WELCOME TO MY SAVANE · CARRIÈRES</p>
            <h1 className="m-0 max-w-[720px] text-[clamp(48px,5.4vw,78px)] font-extrabold leading-[.99] tracking-[-.04em] max-[1000px]:text-[54px] max-[760px]:max-w-[580px] max-[760px]:text-[clamp(36px,6.7vw,51px)]">
              Le terrain des
              <span className="mt-2 inline-block bg-ink px-[11px] pt-[2px] pb-[7px] text-sun">
                possibles.
              </span>
            </h1>
            <p className="mt-5 max-w-[55ch] pr-0 leading-[1.7] max-[760px]:max-w-[46ch] max-[760px]:pr-7">
              Explorez des offres concrètes, des équipes qui recrutent et le prochain projet qui vous fera avancer.
            </p>
          </div>
          <div className="absolute right-0 bottom-0 origin-bottom-right scale-[.86] max-[1000px]:scale-[.68] max-[760px]:right-[-4px] max-[760px]:scale-[.32] max-[480px]:hidden">
            <HorizonSign tailwind />
          </div>
        </div>
      </section>

      <section className="mx-auto w-[calc(100%_-_112px)] max-w-[1280px] pt-10 pb-3 max-[1200px]:w-[calc(100%_-_72px)] max-[760px]:w-[calc(100%_-_40px)] max-[760px]:pt-7" aria-labelledby="offers-heading">
        <div className="mb-5 flex items-end justify-between gap-4 max-[480px]:items-start max-[480px]:flex-col">
          <h2 id="offers-heading" className="m-0 text-[27px] font-extrabold leading-[1.25] tracking-[-.025em]">Les offres du moment</h2>
          {result && <p className="text-[13px]" role="status">{result.total} offre{result.total !== 1 ? "s" : ""}</p>}
        </div>

        <form className="mb-[22px] grid grid-cols-3 items-end gap-3 bg-ink p-4 text-paper max-[1000px]:grid-cols-2 max-[480px]:grid-cols-1" role="search" aria-label="Filtrer les offres" onSubmit={search}>
          <label className={fieldClass} htmlFor="job-search-text">
            Métier ou mot-clé
            <input className={inputClass} id="job-search-text" type="search" maxLength={255} value={filters.q} onChange={(event) => changeFilter("q", event.target.value)} placeholder="Ex. développeur…" />
          </label>
          <label className={fieldClass} htmlFor="job-search-location">
            Lieu
            <input className={inputClass} id="job-search-location" type="search" maxLength={255} value={filters.location} onChange={(event) => changeFilter("location", event.target.value)} placeholder="Ex. Lyon…" />
          </label>
          <label className={fieldClass} htmlFor="job-search-company">
            Entreprise
            <CustomSelect id="job-search-company" value={filters.company_id} onChange={(value) => changeFilter("company_id", value)} placeholder="Toutes les entreprises" options={[
              { value: "", label: "Toutes les entreprises" },
              ...catalogue.companies.map((company) => ({ value: String(company.id), label: company.name })),
            ]} />
          </label>
          <label className={fieldClass} htmlFor="job-search-category">
            Domaine
            <CustomSelect id="job-search-category" value={filters.category_id} onChange={(value) => changeFilter("category_id", value)} placeholder="Tous les domaines" options={[
              { value: "", label: "Tous les domaines" },
              ...catalogue.categories.map((category) => ({ value: String(category.id), label: category.name })),
            ]} />
          </label>
          <label className={fieldClass} htmlFor="job-search-contract">
            Contrat
            <CustomSelect id="job-search-contract" value={filters.contract_type} onChange={(value) => changeFilter("contract_type", value)} placeholder="Tous les contrats" options={[
              { value: "", label: "Tous les contrats" },
              ...Object.entries(contractLabels).map(([value, label]) => ({ value, label })),
            ]} />
          </label>
          <label className={fieldClass} htmlFor="job-search-sort">
            Trier par
            <CustomSelect id="job-search-sort" value={filters.sort} onChange={(value) => changeFilter("sort", value)} options={[
              { value: "recent", label: "Les plus récentes" },
              { value: "salary_desc", label: "Salaire décroissant" },
              { value: "salary_asc", label: "Salaire croissant" },
            ]} />
          </label>
          <div className="flex flex-wrap gap-3 min-[1001px]:col-span-3 min-[481px]:max-[1000px]:col-span-2">
            <button className={buttonClass} type="submit">Rechercher</button>
            <button className={`${buttonClass} bg-paper`} type="button" onClick={() => {
              if (!query) retry();
              else setSearchParams({});
            }}>Réinitialiser</button>
          </div>
          <p className="text-xs leading-relaxed min-[1001px]:col-span-3 min-[481px]:max-[1000px]:col-span-2">Tri salaire : montant minimum (sinon maximum), comparé sur une année. Les salaires non renseignés sont placés en dernier.</p>
        </form>

        {catalogueError && <div className="my-6 border border-rule bg-paper p-6" role="alert">
          <p>{catalogueError}</p>
          <button className={`${buttonClass} mt-4`} type="button" onClick={retry}>Recharger les filtres</button>
        </div>}
        {loading && <div className="my-6 border border-rule bg-paper p-6" role="status">
          <h2 className="mb-2 text-[22px] font-extrabold">On prépare la savane…</h2>
          <p>Chargement des offres.</p>
        </div>}
        {error && <div className="my-6 border border-rule bg-paper p-6" role="alert">
          <h2 className="mb-2 text-[22px] font-extrabold">Impossible de charger les offres.</h2>
          <p>{error}</p>
          <button className={`${buttonClass} mt-4`} type="button" onClick={retry}>Réessayer</button>
        </div>}
        {result && result.ads.length === 0 && <div className="my-6 border border-rule bg-paper p-6" role="status">
          <h2 className="mb-2 text-[22px] font-extrabold">Aucune offre sur cette page.</h2>
          <p>{result.total > 0 ? "Revenez à la première page pour voir les résultats." : "Essayez un autre métier, lieu, domaine ou contrat."}</p>
          {result.total > 0 && <button className={`${buttonClass} mt-4`} type="button" onClick={() => changePage(1)}>Première page</button>}
        </div>}
        {result && result.ads.length > 0 && <div className="grid grid-cols-3 items-stretch gap-[22px] max-[1200px]:gap-[17px] max-[1000px]:grid-cols-2 max-[480px]:grid-cols-1">
          {result.ads.map((ad, index) => <JobCard key={ad.id} ad={ad} index={index} />)}
        </div>}
        {result && result.total_pages > 0 && <nav className="mt-7 flex flex-wrap items-center justify-center gap-4" aria-label="Pagination des offres">
          <button className={buttonClass} type="button" disabled={result.page <= 1} onClick={() => changePage(result.page - 1)}>Précédente</button>
          <p role="status">Page {result.page} sur {result.total_pages}</p>
          <button className={buttonClass} type="button" disabled={result.page >= result.total_pages} onClick={() => changePage(result.page + 1)}>Suivante</button>
        </nav>}
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
        if (responses.some((response) => !response.ok)) throw new Error("Les filtres entreprise et domaine sont momentanément indisponibles.");
        const [companies, categories] = await Promise.all(responses.map((response) => response.json()));
        if (!Array.isArray(companies) || !Array.isArray(categories)) throw new Error("Les listes de filtres sont invalides.");
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

  // Un changement d'URL remet la saisie et le chargement dans leur état initial.
  return <JobSearch key={`${query}-${retryKey}`} query={query} setSearchParams={setSearchParams} catalogue={catalogue} catalogueError={catalogueError} retry={() => setRetryKey((key) => key + 1)} />;
}
