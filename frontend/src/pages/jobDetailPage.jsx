import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { contractLabels, formatDate, formatSalary, workingTimeLabels } from "../utils/adminUtils";

function JobDetail({ id }) {
  const [ad, setAd] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [error, setError] = useState("");
  const [retryKey, setRetryKey] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    fetch(`/api/ads/${encodeURIComponent(id)}`, { signal: controller.signal })
      .then(async (response) => {
        if (response.status === 404) {
          setNotFound(true);
          return null;
        }
        if (!response.ok) {
          throw new Error("Le détail de cette offre est momentanément inaccessible.");
        }

        const data = await response.json();
        const hasValidAd = data && typeof data === "object" && data.id;
        if (!hasValidAd) {
          throw new Error("La réponse du serveur ne contient pas d’offre valide.");
        }

        return data;
      })
      .then((data) => {
        if (data && !controller.signal.aborted) {
          setAd(data);
        }
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
  }, [id, retryKey]);

  if (loading) {
    return (
      <div className="site-container public-state job-detail" role="status">
        <h2>Chargement de l’offre…</h2>
      </div>
    );
  }
  if (notFound) {
    return (
      <section className="site-container public-state job-detail" role="status">
        <h2>Cette offre n’est plus disponible.</h2>
        <p>Elle a peut-être été fermée ou retirée.</p>
        <Link className="site-button mt-5" to="/">Revenir aux offres</Link>
      </section>
    );
  }
  if (error) {
    return (
      <section className="site-container public-state job-detail" role="alert">
        <h2>Impossible d’ouvrir cette offre.</h2>
        <p>{error}</p>
        <button
          className="site-button mt-5"
          type="button"
          onClick={() => {
            setLoading(true);
            setError("");
            setRetryKey((key) => key + 1);
          }}
        >
          Réessayer
        </button>
        <Link className="job-back" to="/">← Retour aux offres</Link>
      </section>
    );
  }
  if (!ad) {
    return null;
  }

  return (
    <article className="site-container job-detail">
      <Link className="job-back" to="/">← Toutes les offres</Link>
      <section className="job-detail-panel" aria-labelledby="job-detail-title">
        <header className="job-detail-heading">
          <p className="public-eyebrow">{ad.category_name || "OFFRE D’EMPLOI"}</p>
          <h1 id="job-detail-title">{ad.title}</h1>
          <p className="job-detail-company">{ad.company_name}</p>
          <div className="job-detail-metadata" aria-label="Informations sur le poste">
            <span>{ad.location || "Localisation à préciser"}</span>
            <span>{contractLabels[ad.contract_type] || "Contrat à préciser"}</span>
            <span>{workingTimeLabels[ad.working_time] || "Temps à préciser"}</span>
            <span>{formatDate(ad.created_at)}</span>
          </div>
        </header>
        <div className="job-detail-body">
          <p className="job-poster-salary">{formatSalary(ad)}</p>
          {ad.short_description && <p className="mb-6 max-w-[70ch] leading-relaxed">{ad.short_description}</p>}
          <h2>Description du poste</h2>
          <div className="job-detail-copy">{ad.description}</div>
          <div className="job-detail-apply">
            <button className="site-button" type="button" disabled aria-describedby="apply-note">Postuler à cette offre</button>
            <p id="apply-note">Les candidatures en ligne ne sont pas encore disponibles sur le site.</p>
          </div>
        </div>
      </section>
    </article>
  );
}

export default function JobDetailPage() {
  const { id } = useParams();
  return <JobDetail key={id} id={id} />;
}
