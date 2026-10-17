import { StateLink } from "../components/ui/RequestState";
import "../styles/not-found.css";

export default function NotFoundPage() {
  return (
    <div className="not-found-scene">
      <section className="page-container not-found-page">
        <div className="not-found-page__content">
          <p className="not-found-page__number" aria-hidden="true">
            404
          </p>
          <p className="not-found-page__eyebrow">Mauvaise piste</p>
          <h1>Cette page n’existe pas.</h1>
          <p>Le lien a peut-être changé. Reprends le chemin depuis les offres.</p>
          <div className="not-found-page__actions">
            <StateLink to="/jobs" variant="primary">Voir les offres</StateLink>
            <StateLink to="/">Accueil</StateLink>
          </div>
        </div>
        <div className="not-found-page__illustration" aria-hidden="true">
          <img
            src="/illustrations/not-found-reaction.webp"
            alt=""
            width="1536"
            height="1024"
          />
        </div>
      </section>
      <div className="not-found-scene__foreground" aria-hidden="true">
        <img
          className="not-found-scene__hyena not-found-scene__hyena--left"
          src="/illustrations/not-found-hyena-left.webp"
          alt=""
          width="640"
          height="640"
          decoding="async"
          draggable={false}
        />
        <img
          className="not-found-scene__hyena not-found-scene__hyena--center"
          src="/illustrations/not-found-hyena-center.webp"
          alt=""
          width="640"
          height="700"
          decoding="async"
          draggable={false}
        />
        <img
          className="not-found-scene__hyena not-found-scene__hyena--right"
          src="/illustrations/not-found-hyena-right.webp"
          alt=""
          width="640"
          height="640"
          decoding="async"
          draggable={false}
        />
      </div>
    </div>
  );
}
