import Icon from "./Icon.jsx";
import { categories, salary } from "./data.js";
import {
  Header,
  Search,
  FilterBar,
  ResultsHeading,
  ResultsState,
  Footer,
  CompanyMark,
  SaveButton,
  JobActions,
  Details,
  ApplicationNote,
} from "./components.jsx";
import studentCutout from "./assets/student-cutout.webp";
import teamPhoto from "./assets/creative-team.jpg";
import portraitPhoto from "./assets/young-portrait.jpg";

const intro =
  "Un stage, une alternance, un premier job. Trouvez une équipe où vos idées ont leur place.";

function HorizonSign() {
  return (
    <div className="horizon-sign" aria-hidden="true">
      <span className="horizon-sun" />
      <span className="horizon-field field-one" />
      <span className="horizon-field field-two" />
      <span className="horizon-line" />
      <span className="horizon-foot">le bon départ.</span>
    </div>
  );
}

function CategoryLine({ lab }) {
  return (
    <nav className="round-category-line" aria-label="Explorer les domaines">
      <button aria-pressed={!lab.category} onClick={() => lab.setCategory("")}>
        Tout explorer
      </button>
      {categories.map((category) => (
        <button
          key={category}
          aria-pressed={lab.category === category}
          onClick={() =>
            lab.setCategory(lab.category === category ? "" : category)
          }
        >
          {category}
          <Icon name="arrow" />
        </button>
      ))}
    </nav>
  );
}

function Opportunity({ job, lab, kind, index }) {
  return (
    <article className={`opportunity ${kind}-opportunity tone-${index % 6}`}>
      <div className="opportunity-head">
        <CompanyMark job={job} />
        <div className="opportunity-company">
          <span className="company-name">{job.company}</span>
          <span className="company-sector">{job.sector}</span>
        </div>
        <SaveButton job={job} lab={lab} />
      </div>
      <div className="opportunity-content">
        <div className="opportunity-contract">
          <span>
            {job.contract}
            {job.duration && ` · ${job.duration}`}
          </span>
          <span>{job.city}</span>
        </div>
        <h3>{job.title}</h3>
        <div className="opportunity-pay">
          {salary(job)}
          <span>{job.remote ? "Télétravail possible" : "Sur site"}</span>
        </div>
        <p className="job-description">{job.description}</p>
        <div className="opportunity-footer">
          <span className="posted-date">
            Publiée il y a {job.age} jour{job.age > 1 ? "s" : ""}
          </span>
          <JobActions job={job} lab={lab} />
        </div>
        {lab.expanded === job.id && <Details job={job} />}
        <ApplicationNote job={job} lab={lab} />
      </div>
    </article>
  );
}

function OfferSection({ lab, kind }) {
  return (
    <section
      className={`${kind}-offers`}
      id="offers"
      aria-labelledby="offers-title"
    >
      <CategoryLine lab={lab} />
      <div className="round-offers-controls">
        <div className="round-desktop-filters">
          <FilterBar lab={lab} />
        </div>
        <details className="round-mobile-filters">
          <summary>
            <Icon name="sliders" />
            Filtrer les offres{lab.hasFilters && <span>Filtres actifs</span>}
            <Icon name="chevron" />
          </summary>
          <FilterBar lab={lab} />
        </details>
        <ResultsHeading lab={lab} />
      </div>
      <ResultsState lab={lab}>
        <div className={`${kind}-offer-grid`}>
          {lab.results.map((job, index) => (
            <Opportunity
              key={job.id}
              job={job}
              lab={lab}
              kind={kind}
              index={index}
            />
          ))}
        </div>
      </ResultsState>
    </section>
  );
}

function Closing({ kind }) {
  return (
    <section
      className={`round-closing closing-${kind}`}
      aria-label="La suite de votre parcours"
    >
      <div>
        <h2>
          Pas besoin d’avoir
          <br />
          tout tracé pour <span>se lancer.</span>
        </h2>
        <p>
          Explorez les offres. Découvrez les équipes. Faites votre prochain pas.
        </p>
        <a className="button" href="#offers">
          Trouver ma prochaine piste <Icon name="arrow" />
        </a>
      </div>
      {kind === "editorial" ? (
        <figure>
          <img
            src={teamPhoto}
            alt="Des personnes travaillent ensemble autour d’une table et de leurs ordinateurs."
          />
          <figcaption>
            Photographie d’illustration · Annie Spratt / Unsplash
          </figcaption>
        </figure>
      ) : (
        <HorizonSign />
      )}
    </section>
  );
}

export function GrandAirTwo({ lab, selectedTheme = false }) {
  return (
    <div
      className={`concept concept-air ${selectedTheme ? "concept-selected" : ""}`}
      id="top"
    >
      <div className="air-cover">
        <div className="page-wrap">
          <Header lab={lab} />
          <div>
            <section className="air-hero">
              <div className="air-hero-copy">
                <h1>
                  Votre talent mérite
                  <br />
                  <span>du terrain.</span>
                </h1>
                <p className="hero-intro">{intro}</p>
              </div>
              <HorizonSign />
            </section>
          </div>
        </div>
        <div className="air-search-band">
          <div className="page-wrap">
            <Search lab={lab} />
            <span>Vos idées ont de l’avenir. À vous de trouver où.</span>
          </div>
        </div>
      </div>
      <div className="page-wrap">
        <main>
          <OfferSection lab={lab} kind="air" />
          <Closing kind="air" />
        </main>
        <Footer lab={lab} />
      </div>
    </div>
  );
}

export function SelectedSavane({ lab }) {
  return <GrandAirTwo lab={lab} selectedTheme />;
}

export function SavanePop({ lab }) {
  return (
    <div className="concept concept-pop" id="top">
      <div className="pop-cover">
        <div className="page-wrap">
          <Header lab={lab} />
          <div>
            <section className="pop-hero">
              <div className="pop-hero-copy">
                <h1>
                  Votre talent
                  <br />
                  mérite <span>du terrain.</span>
                </h1>
                <p className="hero-intro">{intro}</p>
              </div>
              <figure className="pop-portrait">
                <div className="portrait-mint" aria-hidden="true" />
                <img
                  src={studentCutout}
                  alt="Un jeune professionnel souriant tient son ordinateur portable."
                />
                <div className="pop-sticker" aria-hidden="true">
                  La suite,
                  <br />
                  c’est vous.
                  <Icon name="arrow" />
                </div>
                <figcaption>
                  Photographie d’illustration · détourage assisté
                </figcaption>
              </figure>
            </section>
            <Search lab={lab} />
          </div>
          <div className="pop-cover-foot">
            <span>Le bon départ. Sans le costume.</span>
            <a href="#offers">
              Explorer les opportunités <Icon name="arrow" />
            </a>
          </div>
        </div>
      </div>
      <div className="page-wrap">
        <main>
          <OfferSection lab={lab} kind="pop" />
          <Closing kind="pop" />
        </main>
        <Footer lab={lab} />
      </div>
    </div>
  );
}

export function CreativeEditorial({ lab }) {
  return (
    <div className="concept concept-creative" id="top">
      <div className="page-wrap">
        <Header lab={lab} />
        <main>
          <section className="creative-hero">
            <div className="creative-hero-copy">
              <h1>
                Votre talent
                <br />
                <span>mérite du terrain.</span>
              </h1>
              <p className="hero-intro">{intro}</p>
              <div className="creative-hero-rule">
                <span>Des équipes à découvrir.</span>
                <span>Un parcours à écrire.</span>
              </div>
            </div>
            <figure className="creative-cover">
              <div className="cover-sun" aria-hidden="true" />
              <img
                className="cover-team"
                src={teamPhoto}
                alt="Une équipe échange et développe des projets autour d’une table."
              />
              <img
                className="cover-portrait"
                src={portraitPhoto}
                alt="Portrait d’une jeune professionnelle souriante."
              />
              <span className="cover-caption">
                Place aux
                <br />
                <strong>premiers élans.</strong>
              </span>
              <figcaption>Photographies d’illustration</figcaption>
            </figure>
          </section>
          <Search lab={lab} />
          <OfferSection lab={lab} kind="creative" />
          <Closing kind="editorial" />
        </main>
        <Footer lab={lab} />
      </div>
    </div>
  );
}
