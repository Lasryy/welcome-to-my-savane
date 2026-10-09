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

  useEffect(() => {
    const controller = new AbortController();
    fetch("/api/ads", { signal: controller.signal })
      .then(async (response) => {
        if (!response.ok) {
          throw new Error("Les offres ne peuvent pas être chargées pour le moment.");
        }

        const data = await response.json();
        if (!Array.isArray(data)) {
          throw new Error("La réponse du serveur n’est pas une liste d’offres valide.");
        }

        setAds(data);
        setError("");
      })
      .catch((requestError) => {
        if (requestError.name !== "AbortError") {
          setError(requestError.message);
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      });
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
      const searchable = [ad.title, ad.company_name, ad.location, ad.short_description]
        .filter(Boolean).join(" ").toLocaleLowerCase("fr");
      const matchesSearch = !query || searchable.includes(query);
      const matchesCategory = !categoryId || String(ad.category_id) === categoryId;
      const matchesContract = !contractType || ad.contract_type === contractType;
      return matchesSearch && matchesCategory && matchesContract;
    });
  }, [ads, categoryId, contractType, search]);

  return (
    <>
      <section className="public-hero">
        <div className="site-container public-hero-inner">
          <div className="public-hero-copy">
            <p className="public-eyebrow">WELCOME TO MY SAVANE · CARRIÈRES</p>
            <h1>Le terrain des <span>possibles.</span></h1>
            <p className="public-hero-intro">Explorez des offres concrètes, des équipes qui recrutent et le prochain projet qui vous fera avancer.</p>
          </div>
          <div className="site-horizon"><HorizonSign /></div>
        </div>
      </section>

      <section className="site-container site-content" aria-labelledby="offers-heading">
        <div className="site-section-heading">
          <h2 id="offers-heading">Les offres du moment</h2>
          {!loading && !error && <p className="site-results-count" aria-live="polite">{filteredAds.length} offre{filteredAds.length !== 1 ? "s" : ""}</p>}
        </div>

        <div className="job-search" role="search" aria-label="Filtrer les offres">
          <label htmlFor="job-search-text">Métier, entreprise ou ville
            <input id="job-search-text" type="search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Ex. développeur, Lyon…" />
          </label>
          <label htmlFor="job-search-category">Domaine
            <CustomSelect id="job-search-category" value={categoryId} onChange={setCategoryId} placeholder="Tous les domaines" options={categories.map(([value, label]) => ({ value, label }))} />
          </label>
          <label htmlFor="job-search-contract">Contrat
            <CustomSelect id="job-search-contract" value={contractType} onChange={setContractType} placeholder="Tous les contrats" options={[
              { value: "internship", label: "Stage" },
              { value: "apprenticeship", label: "Alternance" },
              { value: "permanent", label: "CDI" },
              { value: "fixed_term", label: "CDD" },
              { value: "other", label: "Autre" },
            ]} />
          </label>
          <button className="site-button yellow" type="button" onClick={() => { setSearch(""); setCategoryId(""); setContractType(""); }}>Réinitialiser</button>
        </div>

        {loading && <div className="public-state" role="status"><h2>On prépare la savane…</h2><p>Chargement des offres.</p></div>}
        {!loading && error && <div className="public-state" role="alert"><h2>Les offres sont momentanément inaccessibles.</h2><p>{error}</p><button className="site-button mt-4" type="button" onClick={() => { setLoading(true); setRetryKey((key) => key + 1); }}>Réessayer</button></div>}
        {!loading && !error && filteredAds.length === 0 && <div className="public-state"><h2>Aucune offre pour cette recherche.</h2><p>Essayez un autre métier, domaine ou contrat.</p></div>}
        {!loading && !error && filteredAds.length > 0 && <div className="job-grid">{filteredAds.map((ad, index) => <JobCard key={ad.id} ad={ad} index={index} />)}</div>}
      </section>
    </>
  );
}

export default JobBoardPage;
