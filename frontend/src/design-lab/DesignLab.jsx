import { useState, useEffect, useRef } from "react";
import {
  categories,
  directions,
  firstDirections,
  newDirections,
  selectedDirection,
  jobs,
  normalize,
} from "./data.js";
import Icon from "./Icon.jsx";
import CustomSelect from "../components/CustomSelect";
import { Editorial, Recruitment, Playful, Dark } from "./variants.jsx";
import {
  GrandAirTwo,
  SavanePop,
  CreativeEditorial,
  SelectedSavane,
} from "./round-two.jsx";
import "./design-lab.css";
import "./round-two.css";
import "./selected.css";

const variantComponents = {
  a: Editorial,
  b: Recruitment,
  c: Playful,
  d: Dark,
  air: GrandAirTwo,
  pop: SavanePop,
  editorial: CreativeEditorial,
  selected: SelectedSavane,
};

function Preview({ direction, onOpen }) {
  const ref = useRef(null);
  const [width, setWidth] = useState(480);
  useEffect(() => {
    const observer = new ResizeObserver(([entry]) =>
      setWidth(entry.contentRect.width),
    );
    observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);
  return (
    <div
      className="comparison-preview"
      ref={ref}
      style={{ "--preview-scale": width / 1440 }}
    >
      <iframe
        title={`Aperçu ${direction.name}`}
        src={`/design-lab/${direction.id}?embed=1`}
        tabIndex={-1}
      />
      <button aria-label={`Explorer ${direction.name}`} onClick={onOpen} />
    </div>
  );
}

function Comparison({ openDirection, items }) {
  const newRound = items[0].id === "air";
  return (
    <main className="comparison-page">
      <div className="comparison-intro">
        <h1>
          {newRound ? (
            <>
              Trois visions.
              <br />
              Une autre énergie.
            </>
          ) : (
            <>
              Un produit.
              <br />
              Quatre points de vue.
            </>
          )}
        </h1>
        <div>
          <p>
            Les mêmes offres, des regards vraiment différents. Retrouvez les
            explorations qui ont mené à la maquette retenue.
          </p>
          <span>
            Maquette choisie : Grand Air 2.0, Bricolage Grotesque et palette
            de référence.
          </span>
          <button
            className="comparison-choice-link"
            onClick={() => openDirection("selected")}
          >
            Voir la maquette retenue <Icon name="arrow" />
          </button>
        </div>
      </div>
      <div
        className={`comparison-grid ${newRound ? "comparison-grid-three" : ""}`}
      >
        {items.map((direction) => (
          <article key={direction.id} className="comparison-card">
            <div className="comparison-card-heading">
              <span className={`direction-letter swatch-${direction.id}`}>
                {direction.letter}
              </span>
              <div>
                <h2>{direction.name}</h2>
                <p>{direction.label}</p>
              </div>
            </div>
            <Preview
              direction={direction}
              onOpen={() => openDirection(direction.id)}
            />
            <p className="comparison-description">{direction.description}</p>
            <div className="palette-line">
              {direction.palette.map((color) => (
                <span
                  key={color}
                  style={{ background: color }}
                  aria-label={color}
                />
              ))}
              <span>{direction.type}</span>
            </div>
            <p className="comparison-layout">{direction.layout}</p>
            <dl className="direction-scores">
              {["Lisibilité", "Originalité", "Usabilité", "Impact"].map(
                (label, index) => (
                  <div key={label}>
                    <dt>{label}</dt>
                    <dd>
                      {direction.scores[index]}
                      <span>/5</span>
                    </dd>
                  </div>
                ),
              )}
            </dl>
            <h3>Du profil à l’administration</h3>
            <p>{direction.reach}</p>
            <h3>Point de vigilance</h3>
            <p>{direction.risk}</p>
            <button
              className="comparison-open"
              onClick={() => openDirection(direction.id)}
            >
              Explorer la direction {direction.letter}
              <Icon name="arrow" />
            </button>
          </article>
        ))}
      </div>
      <section className="comparison-recommendation">
        <h2>
          {newRound
            ? "La combinaison retenue."
            : "Notre recommandation : explorer A en priorité."}
        </h2>
        <p>
          {newRound
            ? "La composition de Grand Air 2.0, Bricolage Grotesque de Grand Air 1.0 et la palette de Savane Pop forment désormais la maquette choisie : un hero corail, des bandeaux bleu nuit, des accents jaunes et une grille de cartes bleu pastel et menthe."
            : "L’Éclaireur donne à la Savane une identité éditoriale ; Terrain privilégie l’efficacité. Grand Air est le plus expressif, Horizon le plus immersif. Ces premières pistes restent des archives de comparaison."}
        </p>
        <p>
          Ces notes sont une appréciation de design, pas les résultats d’un test
          utilisateur. Vous avez retenu la composition de Grand Air 2.0, la
          typographie de Grand Air 1.0 et les couleurs de Savane Pop pour la
          maquette.
        </p>
        <button onClick={() => openDirection(newRound ? "selected" : "a")}>
          {newRound ? "Voir la maquette retenue" : "Revoir L’Éclaireur"}{" "}
          <Icon name="arrow" />
        </button>
      </section>
    </main>
  );
}

const panelContent = {
  login: {
    title: "Retrouver votre espace",
    body: "Dans le MVP, la connexion permettra de retrouver votre profil, vos projets et votre historique de candidatures. L’authentification reste à développer.",
  },
  register: {
    title: "Votre parcours commence ici.",
    body: "Dans le MVP, vous pourrez créer votre compte, compléter votre profil et sélectionner vos projets et expériences pour chaque candidature. L’inscription reste à développer.",
  },
  about: {
    title: "Bienvenue dans votre Savane.",
    body: "Welcome To My Savane est un projet étudiant Epitech : une plateforme pour découvrir des opportunités et construire la suite de son parcours. Cette exploration présente quatre identités possibles.",
  },
  privacy: {
    title: "Vos données restent dans ce prototype.",
    body: "Aucun compte ni candidature n’est créé. Les recherches et favoris sont conservés uniquement dans la mémoire de cette page et disparaissent au rechargement. Aucun appel à l’API métier n’est effectué.",
  },
};

function InfoPanel({ panel, close }) {
  const ref = useRef(null);
  useEffect(() => {
    ref.current?.focus();
  }, []);
  const content = panelContent[panel];
  return (
    <section
      className="lab-info-panel"
      tabIndex={-1}
      ref={ref}
      onKeyDown={(event) => {
        if (event.key === "Escape") {
          close();
        }
      }}
      aria-label={
        panel === "companies" ? "Entreprises de démonstration" : content.title
      }
    >
      <div>
        <button
          className="info-close"
          aria-label="Fermer le panneau"
          onClick={close}
        >
          <Icon name="close" />
        </button>
      </div>
      {panel === "companies" ? (
        <>
          <h2>Les équipes à découvrir</h2>
          <p>
            Toutes ces entreprises sont fictives et servent à comparer les
            quatre directions.
          </p>
          <ul className="demo-companies">
            {jobs.map((job) => (
              <li key={job.id}>
                <strong>{job.company}</strong>
                <span>
                  {job.sector} · {job.city}
                </span>
              </li>
            ))}
          </ul>
        </>
      ) : (
        <>
          <h2>{content.title}</h2>
          <p>{content.body}</p>
          <p>
            Explorez les offres et comparez les directions avant la réalisation
            des autres écrans.
          </p>
        </>
      )}
    </section>
  );
}

export default function DesignLab() {
  const routeDirection = window.location.pathname.split("/")[2];
  const [direction, setDirection] = useState(
    directions.some((item) => item.id === routeDirection)
      ? routeDirection
      : "selected",
  );
  const [compare, setCompare] = useState(
    routeDirection?.startsWith("compare") || false,
  );
  const [archiveRound, setArchiveRound] = useState(
    routeDirection === "compare-1" ||
      firstDirections.some((item) => item.id === routeDirection),
  );
  const embedded =
    new URLSearchParams(window.location.search).get("embed") === "1";
  const [draftQuery, setDraftQuery] = useState("");
  const [draftCity, setDraftCity] = useState("");
  const [query, setQuery] = useState("");
  const [city, setCity] = useState("");
  const [selectedContracts, setContracts] = useState([]);
  const [category, setCategory] = useState("");
  const [remote, setRemote] = useState(false);
  const [sort, setSort] = useState("recent");
  const [saved, setSaved] = useState([]);
  const [onlySaved, setOnlySaved] = useState(false);
  const [expanded, setExpanded] = useState(null);
  const [selected, setSelected] = useState(jobs[0].id);
  const [applying, setApplying] = useState(null);
  const [state, setState] = useState("ready");
  const [panel, setPanel] = useState(null);
  const timer = useRef(null);
  const infoTrigger = useRef(null);

  useEffect(() => {
    const previousLang = document.documentElement.lang;
    document.documentElement.lang = "fr";
    return () => {
      clearTimeout(timer.current);
      document.documentElement.lang = previousLang;
    };
  }, []);

  useEffect(() => {
    const onPop = () => {
      const next = window.location.pathname.split("/")[2];
      const isKnownDirection = directions.some((item) => item.id === next);
      if (isKnownDirection) {
        setDirection(next);
      }
      setCompare(next?.startsWith("compare") || false);
      setArchiveRound(
        next === "compare-1" ||
          firstDirections.some((item) => item.id === next),
      );
      setPanel(null);
    };
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);

  const changeView = (id) => {
    setCompare(id.startsWith("compare"));
    setArchiveRound(
      id === "compare-1" || firstDirections.some((item) => item.id === id),
    );
    if (!id.startsWith("compare")) {
      setDirection(id);
    }
    setPanel(null);
    setExpanded(null);
    setApplying(null);
    window.history.pushState(null, "", `/design-lab/${id}`);
    window.scrollTo({ top: 0, behavior: "instant" });
  };

  const showPanel = (value) => {
    infoTrigger.current = document.activeElement;
    setPanel(value);
  };
  const closePanel = () => {
    setPanel(null);
    infoTrigger.current?.focus();
  };

  const search = (event) => {
    event.preventDefault();
    setQuery(draftQuery);
    setCity(draftCity);
    setState("loading");
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setState("ready"), 300);
  };
  const quickSearch = (term) => {
    setDraftQuery(term);
    setQuery(term);
    setState("ready");
  };
  const reset = () => {
    clearTimeout(timer.current);
    setDraftQuery("");
    setQuery("");
    setDraftCity("");
    setCity("");
    setContracts([]);
    setCategory("");
    setRemote(false);
    setOnlySaved(false);
    setState("ready");
  };
  const results = jobs
    .filter((job) => {
      const matchesQuery = normalize(
        `${job.title} ${job.company} ${job.description} ${job.contract} ${job.category} ${job.skills.join(" ")}`,
      ).includes(normalize(query));
      return (
        matchesQuery &&
        normalize(job.city).includes(normalize(city)) &&
        (!selectedContracts.length ||
          selectedContracts.includes(job.contract)) &&
        (!category || category === job.category) &&
        (!remote || job.remote) &&
        (!onlySaved || saved.includes(job.id))
      );
    })
    .sort((a, b) =>
      sort === "salary"
        ? (b.period === "an" ? b.salaryMax : b.salaryMax * 12) -
          (a.period === "an" ? a.salaryMax : a.salaryMax * 12)
        : sort === "company"
          ? a.company.localeCompare(b.company, "fr")
          : a.age - b.age,
    );

  const lab = {
    draftQuery,
    setDraftQuery,
    draftCity,
    setDraftCity,
    query,
    city,
    contracts: selectedContracts,
    setContracts,
    category,
    setCategory,
    remote,
    setRemote,
    sort,
    setSort,
    saved,
    onlySaved,
    setOnlySaved,
    expanded,
    setExpanded,
    selected,
    setSelected,
    applying,
    setApplying,
    state,
    setState,
    search,
    quickSearch,
    reset,
    results,
    setPanel: showPanel,
    toggleContract: (value) =>
      setContracts((values) =>
        values.includes(value)
          ? values.filter((item) => item !== value)
          : [...values, value],
      ),
    toggleSaved: (id) =>
      setSaved((values) =>
        values.includes(id)
          ? values.filter((item) => item !== id)
          : [...values, id],
      ),
    retry: () => {
      setState("loading");
      clearTimeout(timer.current);
      timer.current = setTimeout(() => setState("ready"), 300);
    },
    hasFilters: Boolean(
      query ||
      city ||
      selectedContracts.length ||
      category ||
      remote ||
      onlySaved,
    ),
  };
  const Variant = variantComponents[direction];
  const current = directions.find((item) => item.id === direction);
  const visibleDirections = archiveRound
    ? firstDirections
    : [...newDirections, selectedDirection];
  const compareRoute = archiveRound ? "compare-1" : "compare";

  return (
    <div className={`design-lab ${embedded ? "embedded" : ""}`}>
      {!embedded && (
        <>
          <a className="skip-link" href={compare ? "#comparison" : "#offers"}>
            Aller au contenu
          </a>
          <div className="lab-toolbar">
            <a
              className="lab-wordmark"
              href="/design-lab/compare"
              onClick={(event) => {
                event.preventDefault();
                changeView("compare");
              }}
            >
              Design lab<span>Welcome To My Savane</span>
            </a>
            <nav aria-label="Directions visuelles">
              {visibleDirections.map((item) => (
                <button
                  key={item.id}
                  aria-label={`${item.letter} ${item.name}`}
                  aria-pressed={!compare && direction === item.id}
                  className={!compare && direction === item.id ? "active" : ""}
                  onClick={() => changeView(item.id)}
                >
                  <span className={`direction-dot dot-${item.id}`}>
                    {item.letter}
                  </span>
                  <span>{item.name}</span>
                </button>
              ))}
            </nav>
            <button
              className={`compare-button ${compare ? "active" : ""}`}
              onClick={() => changeView(compareRoute)}
            >
              Comparer <Icon name="external" />
            </button>
            <CustomSelect
              className="archives-select"
              triggerClassName="lab-archives"
              ariaLabel="Autres explorations"
              value=""
              placeholder={archiveRound ? "Nouvelles pistes" : "Archives"}
              onChange={changeView}
              options={[
                { value: "compare", label: "Exploration 2" },
                { value: "compare-1", label: "Exploration 1" },
                ...firstDirections.map((item) => ({ value: item.id, label: `${item.letter} — ${item.name}` })),
              ]}
            />
            <details className="state-controls">
              <summary>
                États <Icon name="chevron" />
              </summary>
              <div>
                <label>
                  État des offres
                  <CustomSelect
                    ariaLabel="État des offres"
                    value={state}
                    onChange={(value) => {
                      clearTimeout(timer.current);
                      setState(value);
                    }}
                    options={[
                      { value: "ready", label: "Offres disponibles" },
                      { value: "loading", label: "Chargement" },
                      { value: "empty", label: "Aucun résultat" },
                      { value: "error", label: "Erreur" },
                    ]}
                  />
                </label>
              </div>
            </details>
          </div>
        </>
      )}
      {compare ? (
        <div id="comparison">
          <Comparison
            openDirection={changeView}
            items={archiveRound ? firstDirections : newDirections}
          />
        </div>
      ) : (
        <>
          <Variant lab={lab} />
          {!embedded && (
            <div className="lab-caption">
              <strong>
                {current.letter} / {current.name}
              </strong>
              <span>
                {current.label} · {categories.length} domaines · 6 annonces
                fictives · Maquette choisie : Grand Air 2.0 + police Grand Air
                1.0 + couleurs Savane Pop
              </span>
              <button onClick={() => changeView(compareRoute)}>
                Comparer les directions <Icon name="arrow" />
              </button>
            </div>
          )}
        </>
      )}
      {panel && <InfoPanel key={panel} panel={panel} close={closePanel} />}
    </div>
  );
}
