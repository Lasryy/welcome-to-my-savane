import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import CompanyLogo from "../components/CompanyLogo";
import JobCard from "../components/jobCard";
import JobSearchBar from "../components/JobSearchBar";
import UiIcon from "../components/ui/UiIcon";
import "../styles/home.css";

const featuredDomains = [
  "Développement web",
  "Design et expérience utilisateur",
  "Data et intelligence artificielle",
  "Marketing et acquisition",
  "Commerce et relation client",
  "Ingénierie et industrie",
];

async function readJson(url, signal) {
  const response = await fetch(url, { signal, credentials: "same-origin" });
  if (!response.ok) throw new Error("Contenu indisponible");
  return response.json();
}

export default function HomePage() {
  const navigate = useNavigate();
  const [access, setAccess] = useState("checking");
  const [content, setContent] = useState(null);
  const [retryKey, setRetryKey] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    async function checkSession() {
      try {
        const response = await fetch("/api/auth/me", {
          credentials: "same-origin",
          signal: controller.signal,
        });

        if (controller.signal.aborted) return;
        if (response.status === 401) {
          setAccess("guest");
          return;
        }
        if (!response.ok) throw new Error("Session indisponible");

        const user = await response.json();
        const destination =
          user.role === "ADMIN"
            ? "/admin"
            : user.role === "COMPANY"
              ? "/company"
              : "/jobs";
        navigate(destination, { replace: true });
      } catch {
        if (!controller.signal.aborted) setAccess("error");
      }
    }
    checkSession();
    return () => controller.abort();
  }, [navigate, retryKey]);

  useEffect(() => {
    if (access !== "guest") return undefined;

    const controller = new AbortController();
    async function loadHome() {
      // Each section can still appear if another request is unavailable.
      const results = await Promise.allSettled([
        readJson("/api/ads?page=1&page_size=3&sort=recent", controller.signal),
        readJson("/api/public/categories", controller.signal),
        readJson("/api/public/companies", controller.signal),
      ]);
      if (controller.signal.aborted) return;
      const values = results.map((result) =>
        result.status === "fulfilled" ? result.value : null,
      );
      setContent({
        offers: Array.isArray(values[0]?.ads) ? values[0] : null,
        categories: Array.isArray(values[1]) ? values[1] : [],
        companies: Array.isArray(values[2]) ? values[2].slice(0, 6) : [],
      });
    }
    loadHome();
    return () => controller.abort();
  }, [access, retryKey]);

  if (access === "checking") {
    return (
      <main className="landing-access-status" role="status">
        Préparation de votre espace…
      </main>
    );
  }

  if (access === "error") {
    return (
      <main className="landing-access-status" role="alert">
        <p>Impossible de vérifier votre connexion.</p>
        <button
          type="button"
          className="button button-primary"
          onClick={() => {
            setAccess("checking");
            setRetryKey((key) => key + 1);
          }}
        >
          Réessayer
        </button>
      </main>
    );
  }

  function search(event) {
    event.preventDefault();
    const fields = new FormData(event.currentTarget);
    const params = new URLSearchParams();
    for (const field of ["q", "location"]) {
      const value = fields.get(field).trim();
      if (value) params.set(field, value);
    }
    navigate(`/jobs${params.size ? `?${params}` : ""}`);
  }

  const categories = [...(content?.categories || [])]
    .sort((a, b) => {
      const rank = (name) =>
        featuredDomains.includes(name)
          ? featuredDomains.indexOf(name)
          : featuredDomains.length;
      return rank(a.name) - rank(b.name);
    })
    .slice(0, 6);

  return (
    <div className="savane-home">
      <section className="landing-hero" aria-labelledby="home-title">
        <div className="page-container landing-hero-inner">
          <div className="landing-hero-copy">
            <h1 id="home-title">
              Un nouveau job.
              <br />
              Un nouvel <span>horizon.</span>
            </h1>
            <p>
              Un premier pas, un nouveau départ, une autre voie.
              <br className="landing-desktop-break" /> Trouvez l’offre qui
              donnera de l’élan à votre parcours.
            </p>
            <a className="landing-explore-link" href="#commencer">
              La suite commence ici <UiIcon name="arrow" size={19} />
            </a>
          </div>
          <img
            className="landing-hero-art"
            src="/illustrations/home-savanna-journey.webp"
            alt="Un lion, un phacochère et un suricate réunis sous un acacia."
            width="1536"
            height="1024"
            fetchPriority="high"
          />
        </div>
        <div className="page-container landing-search-wrap" id="commencer">
          <JobSearchBar onSubmit={search} buttonLabel="Trouver mon job" />
          <div className="landing-search-shortcuts">
            <span>À chaque envie, son chemin :</span>
            <Link to="/jobs?contract_type=permanent">CDI</Link>
            <Link to="/jobs?contract_type=apprenticeship">Alternance</Link>
            <Link to="/jobs?contract_type=internship">Stage</Link>
            <Link to="/jobs" className="landing-all-offers">
              Toutes les offres <UiIcon name="arrow" size={16} />
            </Link>
          </div>
        </div>
      </section>

      <section
        className="page-container landing-jobs landing-section"
        aria-labelledby="home-jobs-title"
      >
        <div className="landing-section-heading">
          <div>
            <h2 id="home-jobs-title">Et si c’était votre prochain poste ?</h2>
            <p>Des opportunités à découvrir, juste ici.</p>
          </div>
          <Link className="text-link" to="/jobs">
            Explorer toutes les offres <UiIcon name="arrow" size={19} />
          </Link>
        </div>
        {!content && (
          <p className="landing-content-status" role="status">
            Les dernières offres arrivent…
          </p>
        )}
        {content && !content.offers && (
          <div className="landing-content-status" role="status">
            <p>Les dernières offres sont momentanément indisponibles.</p>
            <button
              type="button"
              className="text-link"
              onClick={() => {
                setContent(null);
                setRetryKey((key) => key + 1);
              }}
            >
              Réessayer
            </button>
          </div>
        )}
        {content?.offers?.ads.length > 0 && (
          <div className="landing-job-grid">
            {content.offers.ads.map((ad, index) => (
              <JobCard key={ad.id} ad={ad} index={index} />
            ))}
          </div>
        )}
        {content?.offers?.ads.length === 0 && (
          <p className="landing-content-status">
            Les prochaines offres arrivent bientôt. Vous pouvez déjà préparer
            votre profil.
          </p>
        )}
      </section>

      {categories.length > 0 && (
        <section
          className="landing-domains"
          aria-labelledby="home-domains-title"
        >
          <div className="page-container landing-domains-inner">
            <h2 id="home-domains-title">
              Votre talent a<br />
              plus d’un terrain.
            </h2>
            <div className="landing-domain-links">
              {categories.map((category) => (
                <Link key={category.id} to={`/jobs?category_id=${category.id}`}>
                  <span>{category.name}</span>
                  <UiIcon name="arrow" size={20} />
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      <section
        className="page-container landing-section"
        aria-labelledby="home-profile-title"
      >
        <div className="landing-profile">
          <div className="landing-profile-copy">
            <h2 id="home-profile-title">
              Donnez du relief
              <br />à votre parcours.
            </h2>
            <p>
              Vos projets, vos expériences, ce que vous savez faire. Réunissez
              l’essentiel dans un profil, puis choisissez ce que vous partagez à
              chaque candidature.
            </p>
            <Link
              className="button button-primary"
              to="/register"
            >
              Créer mon profil
              <UiIcon name="arrow" size={19} />
            </Link>
            <p className="landing-profile-note">
              Vous décidez de rendre votre profil visible aux recruteurs.
            </p>
          </div>
          <div className="landing-profile-details">
            <h3>Tout ce qui fait votre différence.</h3>
            <Link to="/register">
              <UiIcon name="folder" size={27} />
              <div>
                <strong>Vos projets parlent pour vous.</strong>
                <span>Présentez vos réalisations, avec leurs liens.</span>
              </div>
              <UiIcon name="arrow" />
            </Link>
            <Link
              to="/register"
            >
              <UiIcon name="briefcase" size={27} />
              <div>
                <strong>Chaque expérience compte.</strong>
                <span>Racontez vos missions et votre évolution.</span>
              </div>
              <UiIcon name="arrow" />
            </Link>
            <Link to="/register">
              <UiIcon name="document" size={27} />
              <div>
                <strong>Le bon CV, pour la bonne offre.</strong>
                <span>Gardez plusieurs CV et choisissez celui à joindre.</span>
              </div>
              <UiIcon name="arrow" />
            </Link>
          </div>
        </div>
      </section>

      {content?.companies.length > 0 && (
        <section
          className="page-container landing-companies"
          aria-labelledby="home-companies-title"
        >
          <div className="landing-section-heading">
            <div>
              <h2 id="home-companies-title">
                Une entreprise. Une nouvelle rencontre.
              </h2>
              <p>
                Découvrez les offres des entreprises présentes dans la savane.
              </p>
            </div>
          </div>
          <div className="landing-company-list">
            {content.companies.map((company) => (
              <Link key={company.id} to={`/jobs?company_id=${company.id}`}>
                <CompanyLogo
                  name={company.name}
                  url={company.logo_url}
                  size={54}
                />
                <strong>{company.name}</strong>
                <span>{company.location || "Voir les offres"}</span>
                <UiIcon name="arrow" size={18} />
              </Link>
            ))}
          </div>
        </section>
      )}

      <section
        className="landing-recruiters"
        aria-labelledby="home-recruiters-title"
      >
        <div className="page-container landing-recruiters-inner">
          <div>
            <h2 id="home-recruiters-title">
              Votre prochaine recrue
              <br />
              est peut-être déjà ici.
            </h2>
            <p>
              Publiez vos offres, retrouvez les candidatures et découvrez les
              profils visibles depuis votre espace recruteur.
            </p>
          </div>
          <div className="landing-recruiter-action">
            <Link
              className="button"
              to="/login"
              state={{ from: "/company" }}
            >
              Accéder à mon espace recruteur
              <UiIcon name="arrow" size={19} />
            </Link>
            <p>L’accès recruteur est attribué par un administrateur.</p>
          </div>
        </div>
      </section>
    </div>
  );
}
