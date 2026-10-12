import { useEffect, useState } from "react";
import HorizonSign from "../components/horizonSign";
import JobCard from "../components/jobCard";

function JobBoardPage() {
  const [ads, setAds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [retryKey, setRetryKey] = useState(0);

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

  return (
    <>
      <section className="public-hero">
        <div className="site-container public-hero-inner">
          <div className="public-hero-copy">
            <p className="public-eyebrow">WELCOME TO MY SAVANE · CARRIÈRES</p>
            <h1>Le terrain des <span>possibles.</span></h1>
            <p className="public-hero-intro">
              Explorez des offres concrètes, des équipes qui recrutent et le
              prochain projet qui vous fera avancer.
            </p>
          </div>
          <div className="site-horizon"><HorizonSign /></div>
        </div>
      </section>

      <section className="site-container site-content" aria-labelledby="offers-heading">
        <div className="site-section-heading">
          <h2 id="offers-heading">Les offres du moment</h2>
          {!loading && !error && <p>{ads.length} offre(s)</p>}
        </div>

        {loading && (
          <div className="public-state" role="status">
            <h2>On prépare la savane…</h2>
            <p>Chargement des offres.</p>
          </div>
        )}

        {!loading && error && (
          <div className="public-state" role="alert">
            <h2>Les offres sont momentanément inaccessibles.</h2>
            <p>{error}</p>
            <button
              className="site-button mt-4"
              type="button"
              onClick={() => {
                setLoading(true);
                setRetryKey((key) => key + 1);
              }}
            >
              Réessayer
            </button>
          </div>
        )}

        {!loading && !error && ads.length === 0 && (
          <div className="public-state">
            <h2>Aucune offre pour le moment.</h2>
            <p>Reviens plus tard pour découvrir les nouvelles offres.</p>
          </div>
        )}

        {!loading && !error && ads.length > 0 && (
          <div className="job-grid">
            {ads.map((ad, index) => (
              <JobCard key={ad.id} ad={ad} index={index} />
            ))}
          </div>
        )}
      </section>
    </>
  );
}

export default JobBoardPage;
