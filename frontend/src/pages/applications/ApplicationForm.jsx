import { useEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import ApplicationProfilePicker from "./ApplicationProfilePicker";
import { requestJson } from "./applicationApi";

function toggleId(currentIds, id) {
  return currentIds.includes(id)
    ? currentIds.filter((currentId) => currentId !== id)
    : [...currentIds, id];
}

export default function ApplicationForm({ ad, onCancel }) {
  const sectionRef = useRef(null);
  const location = useLocation();
  const [user, setUser] = useState(null);
  const [projects, setProjects] = useState([]);
  const [experiences, setExperiences] = useState([]);
  const [cvDocuments, setCvDocuments] = useState([]);
  const [selectedCvId, setSelectedCvId] = useState("");
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
        const [account, myProjects, myExperiences, count, myCvDocuments] =
          await Promise.all([
            requestJson("/api/people/me", options),
            requestJson("/api/projects", options),
            requestJson("/api/experiences", options),
            requestJson("/api/applications/today", options),
            requestJson("/api/cv-documents", options),
          ]);

        setUser(account);
        setProjects(myProjects);
        setExperiences(myExperiences);
        setCvDocuments(myCvDocuments);
        const defaultCv = myCvDocuments.find((document) => document.is_current);
        setSelectedCvId(String(defaultCv?.id || myCvDocuments[0]?.id || ""));
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
          cv_document_id: selectedCvId ? Number(selectedCvId) : null,
          message,
          project_ids: selectedProjectIds,
          experience_ids: selectedExperienceIds,
        }),
      });

      setTodayCount((count) => count + 1);
      setSuccess("Ta candidature a bien été envoyée.");
    } catch (error) {
      setSubmitError(
        error.message || "La candidature n’a pas pu être envoyée.",
      );
      setIsReviewing(false);
    } finally {
      setIsSubmitting(false);
    }
  }

  function updateProject(updatedProject) {
    setProjects((items) =>
      items.map((item) =>
        item.id === updatedProject.id ? updatedProject : item,
      ),
    );
  }

  function updateExperience(updatedExperience) {
    setExperiences((items) =>
      items.map((item) =>
        item.id === updatedExperience.id ? updatedExperience : item,
      ),
    );
  }

  const selectedProjects = projects.filter((project) =>
    selectedProjectIds.includes(project.id),
  );
  const selectedExperiences = experiences.filter((experience) =>
    selectedExperienceIds.includes(experience.id),
  );
  const selectedCv = cvDocuments.find(
    (document) => document.id === Number(selectedCvId),
  );

  useEffect(() => {
    if (!isLoading)
      sectionRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
  }, [isLoading, isReviewing]);

  return (
    <section
      ref={sectionRef}
      className="application-card"
      aria-labelledby="application-title"
    >
      <h2 id="application-title" className="application-title">
        Ta candidature
      </h2>
      {!success && (
        <ol className="application-steps" aria-label="Étapes de candidature">
          <li aria-current={!isReviewing ? "step" : undefined}>1. Préparer</li>
          <li aria-current={isReviewing ? "step" : undefined}>
            2. Vérifier et envoyer
          </li>
        </ol>
      )}
      <p className="application-description">
        Choisis les éléments de ton profil qui correspondent à cette offre.
      </p>

      {todayCount !== null && (
        <p className="application-daily-count">
          {todayCount} candidature{todayCount > 1 ? "s" : ""} envoyée
          {todayCount > 1 ? "s" : ""} aujourd’hui
        </p>
      )}

      {isLoading && (
        <p className="mt-6" role="status">
          Chargement de ton dossier…
        </p>
      )}

      {!isLoading && loadError && (
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
            <div>
              <dt>Prénom</dt>
              <dd>{user.first_name}</dd>
            </div>
            <div>
              <dt>Nom</dt>
              <dd>{user.last_name}</dd>
            </div>
            <div>
              <dt>E-mail</dt>
              <dd>{user.email}</dd>
            </div>
            <div>
              <dt>Téléphone</dt>
              <dd>{user.phone || "Non renseigné"}</dd>
            </div>
          </dl>

          <ApplicationProfilePicker
            projects={projects}
            experiences={experiences}
            selectedProjectIds={selectedProjectIds}
            selectedExperienceIds={selectedExperienceIds}
            onToggleProject={(id) =>
              setSelectedProjectIds((ids) => toggleId(ids, id))
            }
            onToggleExperience={(id) =>
              setSelectedExperienceIds((ids) => toggleId(ids, id))
            }
            onProjectUpdate={updateProject}
            onExperienceUpdate={updateExperience}
          />

          <section
            className="application-selection"
            aria-labelledby="application-cv-title"
          >
            <h3 id="application-cv-title" className="text-lg font-bold">
              CV à joindre
            </h3>
            <p className="mt-1 text-sm text-ink/75">
              Choisis un CV à joindre, ou continue sans CV.
            </p>
            {cvDocuments.length === 0 ? (
              <div className="application-empty-selection" role="status">
                <p>Tu peux postuler sans CV, ou en ajouter un à ton profil.</p>
                <Link
                  className="mt-3 inline-flex font-bold underline underline-offset-4"
                  to="/profile?section=cv"
                >
                  Ajouter un CV dans mon profil
                </Link>
              </div>
            ) : (
              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                <button
                  className={`application-choice-card text-left transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink ${!selectedCvId ? "application-choice-card-selected" : "hover:bg-paper"}`}
                  type="button"
                  aria-pressed={!selectedCvId}
                  onClick={() => setSelectedCvId("")}
                >
                  <span className="block font-bold">Ne pas joindre de CV</span>
                  <span className="mt-1 block text-sm text-ink/75">
                    Le CV est facultatif.
                  </span>
                </button>
                {cvDocuments.map((document) => {
                  const isSelected = document.id === Number(selectedCvId);
                  return (
                    <button
                      key={document.id}
                      className={`application-choice-card text-left transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink ${isSelected ? "application-choice-card-selected" : "hover:bg-paper"}`}
                      type="button"
                      aria-pressed={isSelected}
                      onClick={() => setSelectedCvId(String(document.id))}
                    >
                      <span className="block font-bold">
                        {document.original_name}
                      </span>
                      <span className="mt-1 block text-sm text-ink/75">
                        PDF ·{" "}
                        {(document.size_bytes / (1024 * 1024)).toLocaleString(
                          "fr-FR",
                          { maximumFractionDigits: 1 },
                        )}{" "}
                        Mo
                        {document.is_current ? " · CV par défaut" : ""}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}
          </section>

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

          {submitError && (
            <p className="form-error" role="alert">
              {submitError}
            </p>
          )}

          <div className="application-actions">
            <button className="primary-button" type="submit">
              Vérifier ma candidature
            </button>
            <button
              className="secondary-button"
              type="button"
              onClick={onCancel}
            >
              Annuler
            </button>
          </div>
        </form>
      )}

      {!isLoading && user && !success && isReviewing && (
        <div
          className="application-form"
          aria-labelledby="application-review-title"
        >
          <h3 id="application-review-title" className="text-xl font-bold">
            Récapitulatif
          </h3>
          <dl className="application-info">
            <div>
              <dt>Offre</dt>
              <dd>{ad.title}</dd>
            </div>
            <div>
              <dt>Entreprise</dt>
              <dd>{ad.company_name}</dd>
            </div>
            <div>
              <dt>Candidat</dt>
              <dd>
                {user.first_name} {user.last_name}
              </dd>
            </div>
            <div>
              <dt>E-mail</dt>
              <dd>{user.email}</dd>
            </div>
            <div>
              <dt>Téléphone</dt>
              <dd>{user.phone || "Non renseigné"}</dd>
            </div>
          </dl>
          <div className="application-review-section">
            <h4>CV joint</h4>
            {selectedCv ? (
              <p>
                <a
                  className="font-bold underline underline-offset-4"
                  href={selectedCv.file_url}
                  target="_blank"
                  rel="noreferrer"
                >
                  {selectedCv.original_name}
                </a>
              </p>
            ) : (
              <p>Aucun CV sélectionné</p>
            )}
          </div>
          <div className="application-review-section">
            <h4>Projets</h4>
            <p>
              {selectedProjects.map((project) => project.title).join(", ") ||
                "Aucun projet sélectionné"}
            </p>
          </div>
          <div className="application-review-section">
            <h4>Expériences</h4>
            <p>
              {selectedExperiences
                .map(
                  (experience) =>
                    `${experience.job_title} — ${experience.company_name}`,
                )
                .join(", ") || "Aucune expérience sélectionnée"}
            </p>
          </div>
          <div className="application-review-section">
            <h4>Message</h4>
            <p className="whitespace-pre-wrap">{message}</p>
          </div>
          {submitError && (
            <p className="form-error" role="alert">
              {submitError}
            </p>
          )}
          <div className="application-actions">
            <button
              className="primary-button"
              type="button"
              onClick={confirmApplication}
              disabled={isSubmitting}
            >
              {isSubmitting ? "Envoi en cours…" : "Confirmer l’envoi"}
            </button>
            <button
              className="secondary-button"
              type="button"
              onClick={() => setIsReviewing(false)}
              disabled={isSubmitting}
            >
              Modifier
            </button>
          </div>
        </div>
      )}

      {success && (
        <div className="application-success" role="status">
          <p>{success}</p>
          <Link className="button button-primary mt-4" to="/applications">
            Suivre mes candidatures
          </Link>
        </div>
      )}
    </section>
  );
}
