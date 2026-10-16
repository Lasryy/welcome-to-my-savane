import { Link } from "react-router-dom";
import "../../styles/request-state.css";

export default function RequestState({
  title,
  description,
  variant = "error",
  onRetry,
  children,
  className = "",
  illustration,
  illustrationAlt = "",
}) {
  const isLoading = variant === "loading";

  return (
    <section
      className={`request-state request-state--${variant} ${className}`.trim()}
      role={isLoading ? "status" : "alert"}
      aria-live={isLoading ? "polite" : "assertive"}
    >
      {illustration && (
        <img
          className="request-state__illustration"
          src={illustration}
          alt={illustrationAlt}
          loading="lazy"
        />
      )}
      <span className="request-state__mark" aria-hidden="true">
        {isLoading ? <span className="request-state__spinner" /> : "!"}
      </span>
      <div className="request-state__content">
        <h2>{title}</h2>
        {description && <p>{description}</p>}
        {(onRetry || children) && (
          <div className="request-state__actions">
            {onRetry && (
              <button
                className="button button-primary"
                type="button"
                onClick={onRetry}
              >
                Réessayer
              </button>
            )}
            {children}
          </div>
        )}
      </div>
    </section>
  );
}

export function StateLink({ to, children, state, variant = "secondary" }) {
  return (
    <Link className={`button button-${variant}`} to={to} state={state}>
      {children}
    </Link>
  );
}
