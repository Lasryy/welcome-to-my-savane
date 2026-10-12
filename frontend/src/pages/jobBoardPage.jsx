import { useEffect, useMemo, useState } from "react";
import CustomSelect from "../components/CustomSelect";
import HorizonSign from "../components/horizonSign";
import JobCard from "../components/jobCard";

function JobBoardPage() {
  const [ads, setAds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [retryKey, setRetryKey] = useState(0);
  const [search, setSearch] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [contractType, setContractType] = useState("");

  function clearFilters() {
    setSearch("");
    setCategoryId("");
    setContractType("");
  }

  function retryLoading() {
    setLoading(true);
    setRetryKey((key) => key + 1);
  }

  useEffect(() => {
    const controller = new AbortController();
    async function loadAds() {
      try {
        const response = await fetch("/api/ads", { signal: controller.signal });
        if (!response.ok) {
          throw new Error("Les offres ne peuvent pas être chargées pour le moment.");
        }

        const data = await response.json();
        if (!Array.isArray(data)) {
          throw new Error("La réponse du serveur n’est pas une liste d’offres valide.");
        }

        setAds(data);
        setError("");
      } catch (requestError) {
        if (requestError.name !== "AbortError") {
          setError(requestError.message);
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    loadAds();
    return () => controller.abort();
  }, [retryKey]);

  const categories = useMemo(() => {
    const values = new Map();
    ads.forEach((ad) => {
      if (ad.category_id && ad.category_name) {
        values.set(String(ad.category_id), ad.category_name);
      }
    });
    return [...values].sort((a, b) => a[1].localeCompare(b[1], "fr"));
  }, [ads]);

  const filteredAds = useMemo(() => {
    const query = search.trim().toLocaleLowerCase("fr");
    return ads.filter((ad) => {
      const searchable = [
        ad.title,
        ad.company_name,
        ad.location,
        ad.short_description,
      ]
        .filter(Boolean)
        .join(" ")
        .toLocaleLowerCase("fr");
      const matchesSearch = !query || searchable.includes(query);
      const matchesCategory = !categoryId || String(ad.category_id) === categoryId;
      const matchesContract = !contractType || ad.contract_type === contractType;
      return matchesSearch && matchesCategory && matchesContract;
    });
  }, [ads, categoryId, contractType, search]);

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
          <h2 id="offers-heading" className="m-0 text-[27px] font-extrabold leading-[1.25] tracking-[-.025em]">
            Les offres du moment
          </h2>
          {!loading && !error && (
            <p className="text-[13px]" aria-live="polite">
              {filteredAds.length} offre{filteredAds.length !== 1 ? "s" : ""}
            </p>
          )}
        </div>

        <div className="mb-[22px] grid grid-cols-[minmax(0,1.4fr)_minmax(180px,1fr)_minmax(160px,.8fr)_auto] items-end gap-3 bg-ink p-4 text-paper max-[1000px]:grid-cols-2 max-[760px]:grid-cols-2 max-[480px]:grid-cols-1" role="search" aria-label="Filtrer les offres">
          <label className="grid min-w-0 gap-1.5 text-xs" htmlFor="job-search-text">
            Métier, entreprise ou ville
            <input className="min-h-[46px] w-full rounded-[3px] border border-[#c8c5b9] bg-paper px-[13px] py-2.5 text-ink" id="job-search-text" type="search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Ex. développeur, Lyon…" />
          </label>
          <label className="grid min-w-0 gap-1.5 text-xs" htmlFor="job-search-category">
            Domaine
            <CustomSelect id="job-search-category" value={categoryId} onChange={setCategoryId} placeholder="Tous les domaines" options={categories.map(([value, label]) => ({ value, label }))} />
          </label>
          <label className="grid min-w-0 gap-1.5 text-xs" htmlFor="job-search-contract">
            Contrat
            <CustomSelect id="job-search-contract" value={contractType} onChange={setContractType} placeholder="Tous les contrats" options={[
              { value: "internship", label: "Stage" },
              { value: "apprenticeship", label: "Alternance" },
              { value: "permanent", label: "CDI" },
              { value: "fixed_term", label: "CDD" },
              { value: "other", label: "Autre" },
            ]} />
          </label>
          <button className="inline-flex min-h-11 items-center justify-center gap-2 border border-transparent bg-sun px-[18px] py-2.5 text-[13px] font-bold text-ink hover:bg-[color-mix(in_srgb,#f0e970_90%,#252a46)]" type="button" onClick={clearFilters}>
            Réinitialiser
          </button>
        </div>

        {loading && (
          <div className="my-6 border border-rule bg-paper p-6" role="status">
            <h2 className="mb-2 text-[22px] font-extrabold">On prépare la savane…</h2>
            <p>Chargement des offres.</p>
          </div>
        )}
        {!loading && error && (
          <div className="my-6 border border-rule bg-paper p-6" role="alert">
            <h2 className="mb-2 text-[22px] font-extrabold">Les offres sont momentanément inaccessibles.</h2>
            <p>{error}</p>
            <button className="mt-4 inline-flex min-h-11 items-center justify-center border border-ink bg-ink px-[18px] py-2.5 text-[13px] font-bold text-paper" type="button" onClick={retryLoading}>
              Réessayer
            </button>
          </div>
        )}
        {!loading && !error && filteredAds.length === 0 && (
          <div className="my-6 border border-rule bg-paper p-6">
            <h2 className="mb-2 text-[22px] font-extrabold">Aucune offre pour cette recherche.</h2>
            <p>Essayez un autre métier, domaine ou contrat.</p>
          </div>
        )}
        {!loading && !error && filteredAds.length > 0 && (
          <div className="grid grid-cols-3 items-stretch gap-[22px] max-[1200px]:gap-[17px] max-[1000px]:grid-cols-2 max-[480px]:grid-cols-1">
            {filteredAds.map((ad, index) => (
              <JobCard key={ad.id} ad={ad} index={index} />
            ))}
          </div>
        )}
      </section>
    </>
  );
}

export default JobBoardPage;
