import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";

export default function ApplicationForm({ adId, onCancel }) {
  const location = useLocation();
  const [user, setUser] = useState(null);
  const [isLoadingUser, setIsLoadingUser] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [needsLogin, setNeedsLogin] = useState(false);
  const [message, setMessage] = useState("");
  const [submitError, setSubmitError] = useState("");
  const [success, setSuccess] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const controller = new AbortController();

    // /me checks whether a session exists and returns the applicant's details.
    async function loadUser() {
      try {
        const response = await fetch("/api/auth/me", {
          credentials: "same-origin",
          signal: controller.signal,
        });
        const data = await response.json();

        if (response.status === 401) {
          setNeedsLogin(true);
          setLoadError("Connecte-toi pour accéder au formulaire de candidature.");
          return;
        }

        if (!response.ok) {
          throw new Error(data.error || "Impossible de charger ton compte.");
        }

        setUser(data);
      } catch (error) {
        if (error.name !== "AbortError") {
          setLoadError(error.message || "Le serveur ne répond pas.");
        }
      } finally {
        if (!controller.signal.aborted) {
          setIsLoadingUser(false);
        }
      }
    }

    loadUser();
    return () => controller.abort();
  }, []);

  async function handleSubmit(event) {
    event.preventDefault();
    setSubmitError("");
    setIsSubmitting(true);

    try {
      // The server gets person_id from the session; the form sends the offer ID and message.
      const response = await fetch("/api/applications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({ ad_id: Number(adId), message }),
      });
      const data = await response.json();

      if (!response.ok) {
        setSubmitError(data.error || "La candidature n’a pas pu être envoyée.");
        return;
      }

      setSuccess("Ta candidature a bien été envoyée.");
      setMessage("");
    } catch (error) {
      console.error("Error while sending application:", error);
      setSubmitError("Le serveur ne répond pas. Réessaie dans un instant.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section
      className="application-card"
      aria-labelledby="application-title"
    >
      <h2 id="application-title" className="application-title">
        Ta candidature
      </h2>
      <p className="application-description">
        Vérifie tes informations et ajoute un message de motivation.
      </p>

      {isLoadingUser && <p className="mt-6" role="status">Chargement de ton compte…</p>}

      {!isLoadingUser && loadError && (
        <div className="application-error" role="alert">
          <p>{loadError}</p>
          {needsLogin && (
            <div className="application-links">
              <Link
                to="/login"
                state={{ from: location.pathname, continueApplication: true }}
              >
                Se connecter
              </Link>
              <Link
                to="/register"
                state={{ from: location.pathname, continueApplication: true }}
              >
                Créer un compte
              </Link>
            </div>
          )}
        </div>
      )}

      {!isLoadingUser && user && !success && (
        <form className="application-form" onSubmit={handleSubmit}>
          <dl className="application-info">
            <div>
              <dt>Prénom</dt>
              <dd>{user.first_name}</dd>
            </div>
            <div>
              <dt>Nom</dt>
              <dd>{user.last_name}</dd>
            </div>
            <div className="application-info-email">
              <dt>E-mail</dt>
              <dd>{user.email}</dd>
            </div>
          </dl>

          <label className="form-field" htmlFor="application-message">
            Message de motivation
            <textarea
              id="application-message"
              className="application-message"
              value={message}
              onChange={(event) => setMessage(event.target.value)}
              maxLength={5000}
              required
              aria-describedby="application-message-count"
            />
          </label>
          <p id="application-message-count" className="application-counter">
            {message.length} / 5 000 caractères
          </p>

          {submitError && <p className="form-error" role="alert">{submitError}</p>}

          <div className="application-actions">
            <button className="primary-button" type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Envoi en cours…" : "Envoyer ma candidature"}
            </button>
            <button
              className="secondary-button"
              type="button"
              onClick={onCancel}
              disabled={isSubmitting}
            >
              Annuler
            </button>
          </div>
        </form>
      )}

      {success && (
        <p className="application-success" role="status">
          {success}
        </p>
      )}
    </section>
  );
}
