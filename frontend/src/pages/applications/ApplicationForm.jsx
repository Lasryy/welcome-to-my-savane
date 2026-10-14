import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import ApplicationProfilePicker from "./ApplicationProfilePicker";
import { requestJson } from "./applicationApi";

function toggleId(currentIds, id) {
  return currentIds.includes(id)
    ? currentIds.filter((currentId) => currentId !== id)
    : [...currentIds, id];
}

export default function ApplicationForm({ ad, onCancel }) {
  const location = useLocation();
  const [user, setUser] = useState(null);
  const [projects, setProjects] = useState([]);
  const [experiences, setExperiences] = useState([]);
  const [todayCount, setTodayCount] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [needsLogin, setNeedsLogin] = useState(false);
  const [message, setMessage] = useState("");
  const [selectedProjectIds, setSelectedProjectIds] = useState([]);
  const [selectedExperienceIds, setSelectedExperienceIds] = useState([]);
  const [submitError, setSubmitError] = useState("");
  const [success, setSuccess] = useState("");
  const [isReviewing, setIsReviewing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const controller = new AbortController();

    async function loadApplicationData() {
      try {
        const options = { signal: controller.signal };
        const [account, myProjects, myExperiences, count] = await Promise.all([
          requestJson("/api/people/me", options),
          requestJson("/api/projects", options),
          requestJson("/api/experiences", options),
          requestJson("/api/applications/today", options),
        ]);

        setUser(account);
        setProjects(myProjects);
        setExperiences(myExperiences);
        setTodayCount(count.count);
      } catch (error) {
        if (controller.signal.aborted) return;
        if (error.status === 401) setNeedsLogin(true);
        setLoadError(error.message || "Impossible de charger ton dossier.");
      } finally {
        if (!controller.signal.aborted) setIsLoading(false);
      }
    }

    loadApplicationData();
    return () => controller.abort();
  }, []);

  async function confirmApplication() {
    setSubmitError("");
    setIsSubmitting(true);

    try {
      await requestJson("/api/applications", {
        method: "POST",
        body: JSON.stringify({
          ad_id: Number(ad.id),
          message,
          project_ids: selectedProjectIds,
          experience_ids: selectedExperienceIds,
        }),
      });

      setTodayCount((count) => count + 1);
      setSuccess("Ta candidature a bien été envoyée.");
    } catch (error) {
      setSubmitError(error.message || "La candidature n’a pas pu être envoyée.");
      setIsReviewing(false);
    } finally {
      setIsSubmitting(false);
    }
  }

  function updateProject(updatedProject) {
    setProjects((items) => items.map((item) =>
      item.id === updatedProject.id ? updatedProject : item,
    ));
  }

  function updateExperience(updatedExperience) {
    setExperiences((items) => items.map((item) =>
      item.id === updatedExperience.id ? updatedExperience : item,
    ));
  }

  const selectedProjects = projects.filter((project) =>
    selectedProjectIds.includes(project.id),
  );
  const selectedExperiences = experiences.filter((experience) =>
    selectedExperienceIds.includes(experience.id),
  );

  return (
    <section className="application-card" aria-labelledby="application-title">
      <h2 id="application-title" className="application-title">Ta candidature</h2>
      <p className="application-description">
        Choisis les éléments de ton profil qui correspondent à cette offre.
      </p>

      {todayCount !== null && (
        <p className="application-daily-count">
          {todayCount} candidature{todayCount > 1 ? "s" : ""} envoyée{todayCount > 1 ? "s" : ""} aujourd’hui
        </p>
      )}

      {isLoading && <p className="mt-6" role="status">Chargement de ton dossier…</p>}

      {!isLoading && loadError && (
        <div className="application-error" role="alert">
          <p>{loadError}</p>
          {needsLogin && (
            <div className="application-links">
              <Link to="/login" state={{ from: location.pathname, continueApplication: true }}>Se connecter</Link>
              <Link to="/register" state={{ from: location.pathname, continueApplication: true }}>Créer un compte</Link>
            </div>
          )}
        </div>
      )}

      {!isLoading && user && !success && !isReviewing && (
        <form
          className="application-form"
          onSubmit={(event) => {
            event.preventDefault();
            setSubmitError("");
            setIsReviewing(true);
          }}
        >
          <dl className="application-info">
            <div><dt>Prénom</dt><dd>{user.first_name}</dd></div>
            <div><dt>Nom</dt><dd>{user.last_name}</dd></div>
            <div><dt>E-mail</dt><dd>{user.email}</dd></div>
            <div><dt>Téléphone</dt><dd>{user.phone || "Non renseigné"}</dd></div>
          </dl>

          <ApplicationProfilePicker
            projects={projects}
            experiences={experiences}
            selectedProjectIds={selectedProjectIds}
            selectedExperienceIds={selectedExperienceIds}
            onToggleProject={(id) => setSelectedProjectIds((ids) => toggleId(ids, id))}
            onToggleExperience={(id) => setSelectedExperienceIds((ids) => toggleId(ids, id))}
            onProjectUpdate={updateProject}
            onExperienceUpdate={updateExperience}
          />

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
            <button className="primary-button" type="submit">Vérifier ma candidature</button>
            <button className="secondary-button" type="button" onClick={onCancel}>Annuler</button>
          </div>
        </form>
      )}

      {!isLoading && user && !success && isReviewing && (
        <div className="application-form" aria-labelledby="application-review-title">
          <h3 id="application-review-title" className="text-xl font-bold">Récapitulatif</h3>
          <dl className="application-info">
            <div><dt>Offre</dt><dd>{ad.title}</dd></div>
            <div><dt>Entreprise</dt><dd>{ad.company_name}</dd></div>
            <div><dt>Candidat</dt><dd>{user.first_name} {user.last_name}</dd></div>
            <div><dt>E-mail</dt><dd>{user.email}</dd></div>
            <div><dt>Téléphone</dt><dd>{user.phone || "Non renseigné"}</dd></div>
          </dl>
          <div className="application-review-section">
            <h4>Projets</h4>
            <p>{selectedProjects.map((project) => project.title).join(", ") || "Aucun projet sélectionné"}</p>
          </div>
          <div className="application-review-section">
            <h4>Expériences</h4>
            <p>{selectedExperiences.map((experience) => `${experience.job_title} — ${experience.company_name}`).join(", ") || "Aucune expérience sélectionnée"}</p>
          </div>
          <div className="application-review-section">
            <h4>Message</h4>
            <p className="whitespace-pre-wrap">{message}</p>
          </div>
          {submitError && <p className="form-error" role="alert">{submitError}</p>}
          <div className="application-actions">
            <button className="primary-button" type="button" onClick={confirmApplication} disabled={isSubmitting}>
              {isSubmitting ? "Envoi en cours…" : "Confirmer l’envoi"}
            </button>
            <button className="secondary-button" type="button" onClick={() => setIsReviewing(false)} disabled={isSubmitting}>
              Modifier
            </button>
          </div>
        </div>
      )}

      {success && <p className="application-success" role="status">{success}</p>}
    </section>
  );
}
