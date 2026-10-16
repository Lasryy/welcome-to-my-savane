import TextContent from "../components/ui/TextContent";
import { useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import {
  contractLabels,
  formatDate,
  formatSalary,
  workingTimeLabels,
} from "../utils/adminUtils";
import ApplicationForm from "./applications/ApplicationForm";
import CompanyLogo from "../components/CompanyLogo";

function publicUrl(value) {
  try {
    const url = new URL(value);
    return ["http:", "https:"].includes(url.protocol) ? url.href : null;
  } catch {
    return null;
  }
}

function JobDetail({ id }) {
  const location = useLocation();
  const applicationRef = useRef(null);
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
    if (showApplicationForm && !loading)
      applicationRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
  }, [showApplicationForm, loading]);

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
          throw new Error(
            "Le détail de cette offre est momentanément inaccessible.",
          );
        }

        const data = await response.json();
        if (!data || typeof data !== "object" || !data.id) {
          throw new Error(
            "La réponse du serveur ne contient pas d’offre valide.",
          );
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
      <div
        className="mx-auto my-6 w-[calc(100%_-_112px)] max-w-[900px] border border-rule bg-paper p-6 pt-8 pb-3 max-xl:w-[calc(100%_-_72px)] max-[760px]:w-[calc(100%_-_40px)] max-[760px]:pt-[22px]"
        role="status"
      >
        <h2 className="mb-2 text-[22px] font-extrabold">
          Chargement de l’offre…
        </h2>
      </div>
    );
  }
  if (notFound) {
    return (
      <section
        className="mx-auto my-6 w-[calc(100%_-_112px)] max-w-[900px] border border-rule bg-paper p-6 pt-8 pb-3 max-xl:w-[calc(100%_-_72px)] max-[760px]:w-[calc(100%_-_40px)] max-[760px]:pt-[22px]"
        role="status"
      >
        <h2 className="mb-2 text-[22px] font-extrabold">
          Cette offre n’est plus disponible.
        </h2>
        <p>Elle a peut-être été fermée ou retirée.</p>
        <Link
          className="mt-5 inline-flex min-h-11 items-center justify-center border border-ink bg-ink px-[18px] py-2.5 text-[13px] font-bold text-paper"
          to="/jobs"
        >
          Revenir aux offres
        </Link>
      </section>
    );
  }
  if (error) {
    return (
      <section
        className="mx-auto my-6 w-[calc(100%_-_112px)] max-w-[900px] border border-rule bg-paper p-6 pt-8 pb-3 max-xl:w-[calc(100%_-_72px)] max-[760px]:w-[calc(100%_-_40px)] max-[760px]:pt-[22px]"
        role="alert"
      >
        <h2 className="mb-2 text-[22px] font-extrabold">
          Impossible d’ouvrir cette offre.
        </h2>
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
        <Link
          className="mb-[18px] inline-block text-[13px] font-bold underline-offset-4"
          to="/jobs"
        >
          ← Retour aux offres
        </Link>
      </section>
    );
  }
  if (!ad) {
    return null;
  }

  return (
    <article
      className="job-detail page-container"
      aria-labelledby="job-detail-title"
    >
      <Link className="text-link mb-6 inline-block" to="/jobs">
        ← Toutes les offres
      </Link>
      <div className="job-detail-layout">
        <header className="job-detail-header">
          <p className="font-semibold">{ad.company_name}</p>
          <h1 id="job-detail-title">{ad.title}</h1>
          <div className="flex flex-wrap gap-2 text-xs">
            {ad.category_name && (
              <span className="rounded bg-white/60 px-3 py-1">
                {ad.category_name}
              </span>
            )}
            <span className="rounded bg-white/60 px-3 py-1">
              {contractLabels[ad.contract_type] || "Contrat à préciser"}
            </span>
            <span className="rounded bg-white/60 px-3 py-1">
              {ad.location || "Lieu à préciser"}
            </span>
          </div>
        </header>
        <section
          className="job-detail-body"
          aria-label="Description de l’offre"
        >
          {ad.short_description && (
            <p className="mb-8 font-medium">{ad.short_description}</p>
          )}
          <h2 className="mb-4 font-bold">Le poste</h2>
          <TextContent text={ad.description} />
          <section
            className="mt-9 border-t border-rule/30 pt-7"
            aria-labelledby="company-heading"
          >
            <div className="mb-4 flex items-center gap-4">
              <CompanyLogo name={ad.company_name} url={publicUrl(ad.company_logo_url)} size={56} />
              <h2 id="company-heading" className="font-bold">
                L’équipe {ad.company_name}
              </h2>
            </div>
            <p className="mb-3 text-sm">
              {ad.company_location ||
                "Localisation de l’entreprise non renseignée"}
            </p>
            <p className="whitespace-pre-line break-words">
              {ad.company_description ||
                "Cette entreprise n’a pas encore renseigné sa présentation."}
            </p>
            {publicUrl(ad.company_website) && (
              <a
                className="text-link mt-4 inline-block"
                href={publicUrl(ad.company_website)}
                target="_blank"
                rel="noopener noreferrer"
              >
                Découvrir le site de l’entreprise ↗
              </a>
            )}
          </section>
        </section>
        <aside className="job-detail-summary" aria-label="Le poste en bref">
          <h2>Le poste en bref</h2>
          <dl>
            <div>
              <dt>Lieu</dt>
              <dd>{ad.location || "À préciser"}</dd>
            </div>
            <div>
              <dt>Contrat</dt>
              <dd>{contractLabels[ad.contract_type] || "À préciser"}</dd>
            </div>
            <div>
              <dt>Temps de travail</dt>
              <dd>{workingTimeLabels[ad.working_time] || "À préciser"}</dd>
            </div>
            <div>
              <dt>Rémunération</dt>
              <dd>{formatSalary(ad)}</dd>
            </div>
          </dl>
          <button
            className="button button-primary"
            type="button"
            onClick={() => {
              if (showApplicationForm)
                applicationRef.current?.scrollIntoView({
                  behavior: "smooth",
                  block: "start",
                });
              else setShowApplicationForm(true);
            }}
          >
            {showApplicationForm
              ? "Reprendre ma candidature"
              : "Postuler à cette offre"}
          </button>
          <p className="mt-4 text-xs text-ink/70">
            Offre publiée le {formatDate(ad.created_at)}
          </p>
        </aside>
      </div>
      {showApplicationForm && (
        <div ref={applicationRef} id="apply-area" className="scroll-mt-6">
          <ApplicationForm
            ad={ad}
            onCancel={() => setShowApplicationForm(false)}
          />
        </div>
      )}
    </article>
  );
}

export default function JobDetailPage() {
  const { id } = useParams();
  return <JobDetail key={id} id={id} />;
}
