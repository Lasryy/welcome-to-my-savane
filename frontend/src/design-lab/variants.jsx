import { copy, categories } from "./data.js";
import Icon from "./Icon.jsx";
import {
  Header,
  Search,
  ResponsiveFilters,
  FilterBar,
  ResultsHeading,
  ResultsState,
  JobRow,
  Footer,
  CompanyMark,
  SaveButton,
  JobMeta,
  JobActions,
  Details,
  ApplicationNote,
} from "./components.jsx";

export function Editorial({ lab }) {
  return (
    <div className="concept concept-a" id="top">
      <div className="page-wrap">
        <Header lab={lab} />
        <main>
          <section className="editorial-hero">
            <div>
              <h1>
                Votre prochain
                <br />
                <span>départ</span> commence ici.
              </h1>
              <p className="hero-intro">{copy.intro}</p>
            </div>
            <div className="editorial-aside">
              <span className="editorial-leaf" aria-hidden="true">
                <img src="/logo-welcome-to-my-savane.svg" alt="" />
              </span>
              <p>
                La bonne équipe.
                <br />
                Le bon départ.
              </p>
              <a href="#offers">
                Ouvrez le champ des possibles <Icon name="arrow" />
              </a>
            </div>
          </section>
          <Search lab={lab} />
          <div className="editorial-divider">
            <span>Un poste qui vous ressemble.</span>
            <span>Paris, Lyon, Nantes… et la suite.</span>
          </div>
          <section
            className="editorial-offers"
            id="offers"
            aria-labelledby="offers-title"
          >
            <div className="editorial-results">
              <ResultsHeading lab={lab} />
              <ResultsState lab={lab}>
                <div className="job-list">
                  {lab.results.map((job) => (
                    <JobRow key={job.id} job={job} lab={lab} editorial />
                  ))}
                </div>
              </ResultsState>
            </div>
            <ResponsiveFilters lab={lab} />
          </section>
        </main>
        <Footer lab={lab} />
      </div>
    </div>
  );
}

export function Recruitment({ lab }) {
  return (
    <div className="concept concept-b" id="top">
      <div className="page-wrap">
        <Header lab={lab} />
      </div>
      <main>
        <section className="saas-hero">
          <div className="page-wrap">
            <div className="saas-hero-text">
              <h1>{copy.headline}</h1>
              <p className="hero-intro">{copy.intro}</p>
            </div>
            <Search lab={lab} />
            <div className="popular-searches">
              <span>À explorer :</span>
              {["React", "Design", "Alternance"].map((term) => (
                <button key={term} onClick={() => lab.quickSearch(term)}>
                  {term} <Icon name="arrow" />
                </button>
              ))}
            </div>
          </div>
        </section>
        <section
          className="saas-offers page-wrap"
          id="offers"
          aria-labelledby="offers-title"
        >
          <ResponsiveFilters lab={lab} />
          <div className="saas-results">
            <ResultsHeading lab={lab} />
            <ResultsState lab={lab}>
              <div className="job-list">
                {lab.results.map((job) => (
                  <JobRow key={job.id} job={job} lab={lab} />
                ))}
              </div>
            </ResultsState>
          </div>
        </section>
      </main>
      <div className="page-wrap">
        <Footer lab={lab} />
      </div>
    </div>
  );
}

function PlayfulCard({ job, lab }) {
  return (
    <article className={`playful-card playful-${job.tone}`}>
      <div className="playful-card-top">
        <CompanyMark job={job} />
        <span className="company-name">{job.company}</span>
        <SaveButton job={job} lab={lab} />
      </div>
      <span className="company-sector">{job.sector}</span>
      <h3>{job.title}</h3>
      <JobMeta job={job} />
      <p className="job-description">{job.description}</p>
      <div className="playful-card-bottom">
        <span className="posted-date">
          Il y a {job.age} jour{job.age > 1 ? "s" : ""}
        </span>
        <JobActions job={job} lab={lab} />
      </div>
      {lab.expanded === job.id && <Details job={job} />}
      <ApplicationNote job={job} lab={lab} />
    </article>
  );
}

export function Playful({ lab }) {
  return (
    <div className="concept concept-c" id="top">
      <div className="page-wrap">
        <Header lab={lab} />
        <main>
          <section className="playful-hero">
            <div className="playful-hero-top">
              <h1>
                Votre prochain départ
                <br />
                <span>commence ici.</span>
              </h1>
              <div className="playful-hero-side">
                <div className="savanna-geometry" aria-hidden="true">
                  <span />
                  <span />
                  <span />
                </div>
                <p className="hero-intro">{copy.intro}</p>
              </div>
            </div>
            <Search lab={lab} />
          </section>
          <section
            className="playful-offers"
            id="offers"
            aria-labelledby="offers-title"
          >
            <div className="category-nav">
              <button
                className={!lab.category ? "active" : ""}
                aria-pressed={!lab.category}
                onClick={() => lab.setCategory("")}
              >
                Tous les domaines
              </button>
              {categories.map((category) => (
                <button
                  key={category}
                  className={lab.category === category ? "active" : ""}
                  aria-pressed={lab.category === category}
                  onClick={() => lab.setCategory(category)}
                >
                  {category} <Icon name="arrow" />
                </button>
              ))}
            </div>
            <FilterBar lab={lab} />
            <ResultsHeading lab={lab} />
            <ResultsState lab={lab}>
              <div className="playful-grid">
                {lab.results.map((job) => (
                  <PlayfulCard key={job.id} job={job} lab={lab} />
                ))}
              </div>
            </ResultsState>
          </section>
        </main>
        <Footer lab={lab} />
      </div>
    </div>
  );
}

function DarkRow({ job, lab, selectedId }) {
  const selected = selectedId === job.id;
  return (
    <article className={`dark-row ${selected ? "selected" : ""}`}>
      <div className="dark-row-top">
        <CompanyMark job={job} />
        <div>
          <span className="company-name">{job.company}</span>
          <span className="company-sector">{job.sector}</span>
        </div>
        <SaveButton job={job} lab={lab} />
      </div>
      <button
        className="dark-job-title"
        aria-pressed={selected}
        onClick={() => lab.setSelected(job.id)}
      >
        <h3>{job.title}</h3>
        <Icon name="arrow" />
      </button>
      <JobMeta job={job} />
      <p className="job-description">{job.description}</p>
      <JobActions
        job={job}
        lab={lab}
        onDetails={() => lab.setSelected(job.id)}
      />
      <ApplicationNote job={job} lab={lab} />
    </article>
  );
}

export function Dark({ lab }) {
  const selectedJob =
    lab.results.find((job) => job.id === lab.selected) || lab.results[0];
  const selectJob = (id) => {
    lab.setSelected(id);
    if (window.matchMedia("(max-width: 760px)").matches) {
      const reduced = window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      ).matches;
      document
        .getElementById("reading-panel")
        ?.scrollIntoView({
          behavior: reduced ? "instant" : "smooth",
          block: "start",
        });
    }
  };
  const darkLab = { ...lab, setSelected: selectJob };
  return (
    <div className="concept concept-d" id="top">
      <div className="page-wrap">
        <Header lab={lab} />
        <main>
          <section className="dark-hero">
            <div>
              <h1>
                Votre prochain départ
                <br />
                <span>commence ici.</span>
              </h1>
              <p className="hero-intro">{copy.intro}</p>
            </div>
            <div className="dark-directory" aria-label="Explorer par domaine">
              {categories.map((category) => (
                <button
                  key={category}
                  aria-pressed={lab.category === category}
                  className={lab.category === category ? "active" : ""}
                  onClick={() =>
                    lab.setCategory(lab.category === category ? "" : category)
                  }
                >
                  {category}
                  <Icon name="arrow" />
                </button>
              ))}
            </div>
          </section>
          <Search lab={lab} />
          <section
            className="dark-offers"
            id="offers"
            aria-labelledby="offers-title"
          >
            <FilterBar lab={lab} />
            <ResultsHeading lab={lab} />
            <ResultsState lab={lab}>
              <div className="dark-results">
                <div className="dark-job-list">
                  {lab.results.map((job) => (
                    <DarkRow
                      key={job.id}
                      job={job}
                      lab={darkLab}
                      selectedId={selectedJob?.id}
                    />
                  ))}
                </div>
                {selectedJob && (
                  <aside
                    className="reading-panel"
                    id="reading-panel"
                    aria-label="Détail de l’offre sélectionnée"
                    key={selectedJob.id}
                  >
                    <div className="reading-panel-top">
                      <CompanyMark job={selectedJob} />
                      <SaveButton job={selectedJob} lab={lab} />
                    </div>
                    <span className="company-name">{selectedJob.company}</span>
                    <h2>{selectedJob.title}</h2>
                    <JobMeta job={selectedJob} />
                    <p>{selectedJob.description}</p>
                    <Details job={selectedJob} heading="Le poste, en détail" />
                    <button
                      className="button primary"
                      onClick={() =>
                        lab.setApplying(
                          lab.applying === selectedJob.id
                            ? null
                            : selectedJob.id,
                        )
                      }
                    >
                      Postuler à cette offre <Icon name="arrow" />
                    </button>
                    <ApplicationNote job={selectedJob} lab={lab} />
                    <div className="panel-colophon">
                      <img
                        src="/logo-welcome-to-my-savane.svg"
                        alt=""
                        width="38"
                        height="38"
                      />
                      <span>
                        La bonne équipe.
                        <br />
                        Le bon départ.
                      </span>
                    </div>
                  </aside>
                )}
              </div>
            </ResultsState>
          </section>
        </main>
        <Footer lab={lab} />
      </div>
    </div>
  );
}
