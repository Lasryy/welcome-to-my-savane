import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import { contractLabels, formatDate, formatSalary, workingTimeLabels } from "../utils/adminUtils";
import ApplicationForm from "./applications/ApplicationForm";

function JobDetail({ id }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [ad, setAd] = useState(null);
  // After login, return to this offer and reopen the application form.
  const [showApplicationForm, setShowApplicationForm] = useState(() =>
    Boolean(location.state?.continueApplication),
  );
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [error, setError] = useState("");
  const [retryKey, setRetryKey] = useState(0);

  useEffect(() => {
    if (location.state?.continueApplication) {
      navigate(location.pathname, { replace: true, state: null });
    }
  }, [location.pathname, location.state, navigate]);

  useEffect(() => {
    const controller = new AbortController();
    async function loadAd() {
      try {
        const response = await fetch(`/api/ads/${encodeURIComponent(id)}`, {
          signal: controller.signal,
        });
        if (response.status === 404) {
          setNotFound(true);
          return;
        }
        if (!response.ok) {
          throw new Error("Le détail de cette offre est momentanément inaccessible.");
        }

        const data = await response.json();
        if (!data || typeof data !== "object" || !data.id) {
          throw new Error("La réponse du serveur ne contient pas d’offre valide.");
        }

        if (!controller.signal.aborted) {
          setAd(data);
        }
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

    loadAd();
    return () => controller.abort();
  }, [id, retryKey]);

  if (loading) {
    return (
      <div className="mx-auto my-6 w-[calc(100%_-_112px)] max-w-[900px] border border-rule bg-paper p-6 pt-8 pb-3 max-xl:w-[calc(100%_-_72px)] max-[760px]:w-[calc(100%_-_40px)] max-[760px]:pt-[22px]" role="status">
        <h2 className="mb-2 text-[22px] font-extrabold">Chargement de l’offre…</h2>
      </div>
    );
  }
  if (notFound) {
    return (
      <section className="mx-auto my-6 w-[calc(100%_-_112px)] max-w-[900px] border border-rule bg-paper p-6 pt-8 pb-3 max-xl:w-[calc(100%_-_72px)] max-[760px]:w-[calc(100%_-_40px)] max-[760px]:pt-[22px]" role="status">
        <h2 className="mb-2 text-[22px] font-extrabold">Cette offre n’est plus disponible.</h2>
        <p>Elle a peut-être été fermée ou retirée.</p>
        <Link className="mt-5 inline-flex min-h-11 items-center justify-center border border-ink bg-ink px-[18px] py-2.5 text-[13px] font-bold text-paper" to="/">Revenir aux offres</Link>
      </section>
    );
  }
  if (error) {
    return (
      <section className="mx-auto my-6 w-[calc(100%_-_112px)] max-w-[900px] border border-rule bg-paper p-6 pt-8 pb-3 max-xl:w-[calc(100%_-_72px)] max-[760px]:w-[calc(100%_-_40px)] max-[760px]:pt-[22px]" role="alert">
        <h2 className="mb-2 text-[22px] font-extrabold">Impossible d’ouvrir cette offre.</h2>
        <p>{error}</p>
        <button
          className="mt-5 inline-flex min-h-11 items-center justify-center border border-ink bg-ink px-[18px] py-2.5 text-[13px] font-bold text-paper"
          type="button"
          onClick={() => {
            setLoading(true);
            setError("");
            setRetryKey((key) => key + 1);
          }}
        >
          Réessayer
        </button>
        <Link className="mb-[18px] inline-block text-[13px] font-bold underline-offset-4" to="/">← Retour aux offres</Link>
      </section>
    );
  }
  if (!ad) {
    return null;
  }

  return (
    <article className="mx-auto w-[calc(100%_-_112px)] max-w-[900px] pt-8 pb-3 max-xl:w-[calc(100%_-_72px)] max-[760px]:w-[calc(100%_-_40px)] max-[760px]:pt-[22px]">
      <Link className="mb-[18px] inline-block text-[13px] font-bold underline-offset-4" to="/">← Toutes les offres</Link>
      <section className="overflow-hidden rounded-tr-[18px] border border-rule bg-paper" aria-labelledby="job-detail-title">
        <header className="bg-lavender p-7 max-[760px]:p-[22px]">
          <p className="mb-3 text-xs font-bold tracking-[.08em]">{ad.category_name || "OFFRE D’EMPLOI"}</p>
          <h1 id="job-detail-title" className="my-2 max-w-full break-words text-[clamp(34px,4vw,50px)] font-extrabold leading-[1.06] tracking-[-.04em]">{ad.title}</h1>
          <p className="text-[17px] font-bold">{ad.company_name}</p>
          <div className="mt-[18px] flex flex-wrap gap-x-[18px] gap-y-2.5 text-[13px]" aria-label="Informations sur le poste">
            <span>{ad.location || "Localisation à préciser"}</span>
            <span>{contractLabels[ad.contract_type] || "Contrat à préciser"}</span>
            <span>{workingTimeLabels[ad.working_time] || "Temps à préciser"}</span>
            <span>{formatDate(ad.created_at)}</span>
          </div>
        </header>
        <div className="p-7 max-[760px]:p-[22px]">
          <p className="mb-[13px] text-[13px] font-bold tabular-nums">{formatSalary(ad)}</p>
          {ad.short_description && <p className="mb-6 max-w-[70ch] leading-relaxed">{ad.short_description}</p>}
          <h2 className="mb-3.5 text-2xl font-extrabold">Description du poste</h2>
          <div className="max-w-[70ch] whitespace-pre-line break-words leading-[1.75]">{ad.description}</div>
          <div className="mt-7 flex flex-wrap items-center gap-4 border-t border-rule pt-[22px]">
            {!showApplicationForm && (
              <button
                className="inline-flex min-h-11 items-center justify-center gap-2 border border-ink bg-ink px-[18px] py-2.5 text-[13px] font-bold text-paper"
                type="button"
                onClick={() => setShowApplicationForm(true)}
              >
                Postuler à cette offre
              </button>
            )}
          </div>
          {showApplicationForm && (
            <ApplicationForm
              adId={ad.id}
              onCancel={() => setShowApplicationForm(false)}
            />
          )}
        </div>
      </section>
    </article>
  );
}

export default function JobDetailPage() {
  const { id } = useParams();
  return <JobDetail key={id} id={id} />;
}
