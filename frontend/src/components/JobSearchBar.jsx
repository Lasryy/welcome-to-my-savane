import UiIcon from "./ui/UiIcon";
import "../styles/job-search.css";

/** One search bar for the homepage and the complete job board. */
export default function JobSearchBar({
  onSubmit,
  keyword,
  location,
  onKeywordChange,
  onLocationChange,
  buttonLabel = "Rechercher",
}) {
  return (
    <form
      className="job-search-bar"
      onSubmit={onSubmit}
      role="search"
      aria-label="Trouver une offre d’emploi"
    >
      <label>
        <span>Quel métier vous fait envie ?</span>
        <span className="job-search-bar-input">
          <UiIcon name="search" />
          <input
            name="q"
            type="search"
            maxLength={255}
            value={keyword}
            onChange={(event) => onKeywordChange?.(event.target.value)}
            placeholder="Métier, compétence ou mot-clé"
          />
        </span>
      </label>
      <label>
        <span>Et où ?</span>
        <span className="job-search-bar-input">
          <UiIcon name="location" />
          <input
            name="location"
            type="search"
            maxLength={255}
            value={location}
            onChange={(event) => onLocationChange?.(event.target.value)}
            placeholder="Ville ou télétravail"
          />
        </span>
      </label>
      <button type="submit" className="button button-primary">
        {buttonLabel}
        <UiIcon name="arrow" size={19} />
      </button>
    </form>
  );
}
