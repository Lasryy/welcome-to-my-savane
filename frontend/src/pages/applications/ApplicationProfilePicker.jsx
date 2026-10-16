import Modal from "../../components/ui/Modal";
import { useState } from "react";
import { requestJson } from "./applicationApi";

function normalizeSearchText(value) {
  return String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLocaleLowerCase("fr-FR");
}

function findItems(items, search, fields) {
  const keyword = normalizeSearchText(search.trim());
  if (!keyword) return items;

  return items.filter((item) =>
    fields.some((field) => normalizeSearchText(item[field]).includes(keyword)),
  );
}

function SearchableSelection({
  title,
  type,
  items,
  selectedIds,
  search,
  onSearchChange,
  onToggle,
  onShowDetails,
}) {
  const searchableFields =
    type === "project"
      ? ["title", "description", "project_url", "repository_url"]
      : ["job_title", "company_name", "description"];
  const visibleItems = findItems(items, search, searchableFields);

  return (
    <section
      className="application-selection"
      aria-labelledby={`${type}-selection-title`}
    >
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h3 id={`${type}-selection-title`} className="font-bold text-ink">
            {title}
          </h3>
          <p className="mt-1 text-sm text-ink/70">
            {selectedIds.length} sélectionné{selectedIds.length > 1 ? "s" : ""}
          </p>
        </div>
        <label className="form-field min-w-[min(100%,_260px)] flex-1 sm:max-w-[360px]">
          <span className="sr-only">Rechercher dans {title.toLowerCase()}</span>
          <input
            className="form-input"
            type="search"
            value={search}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder={
              type === "project"
                ? "Rechercher un projet…"
                : "Métier, entreprise, mot-clé…"
            }
          />
        </label>
      </div>

      {items.length === 0 ? (
        <p className="application-empty-selection">
          Aucun élément dans ton profil. Tu pourras postuler sans en
          sélectionner.
        </p>
      ) : visibleItems.length === 0 ? (
        <p className="application-empty-selection" role="status">
          Aucun résultat pour « {search} ». Essaie un autre mot-clé.
        </p>
      ) : (
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {visibleItems.map((item) => {
            const isSelected = selectedIds.includes(item.id);
            const primaryText =
              type === "project" ? item.title : item.job_title;
            const secondaryText =
              type === "project" ? item.description : item.company_name;

            return (
              <article
                className={`application-choice-card ${isSelected ? "application-choice-card-selected" : ""}`}
                key={item.id}
              >
                <h4 className="font-bold text-ink">{primaryText}</h4>
                <p className="mt-1 line-clamp-2 min-h-10 text-sm text-ink/75">
                  {secondaryText || "Aucune description renseignée."}
                </p>
                {type === "experience" && item.start_date && (
                  <p className="mt-2 text-sm font-semibold text-ink/70">
                    {String(item.start_date).slice(0, 4)} —{" "}
                    {item.end_date
                      ? String(item.end_date).slice(0, 4)
                      : "Aujourd’hui"}
                  </p>
                )}
                <div className="application-choice-actions">
                  <button
                    className="secondary-button"
                    type="button"
                    onClick={() => onShowDetails(item)}
                  >
                    Voir les détails
                  </button>
                  <button
                    className={
                      isSelected ? "primary-button" : "secondary-button"
                    }
                    type="button"
                    aria-pressed={isSelected}
                    onClick={() => onToggle(item.id)}
                  >
                    {isSelected ? "Retirer de la candidature" : "Choisir"}
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}

function ProfileItemDialog({ type, item, onClose, onSave }) {
  const isProject = type === "project";
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const [savedMessage, setSavedMessage] = useState("");
  const [form, setForm] = useState(() =>
    isProject
      ? {
          title: item.title || "",
          description: item.description || "",
          project_url: item.project_url || "",
          repository_url: item.repository_url || "",
        }
      : {
          company_name: item.company_name || "",
          job_title: item.job_title || "",
          description: item.description || "",
          start_date: item.start_date || "",
          end_date: item.end_date || "",
        },
  );

  function updateForm(event) {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  }

  async function saveChanges(event) {
    event.preventDefault();
    setError("");
    setSavedMessage("");
    setIsSaving(true);

    try {
      const endpoint = isProject ? "/api/projects" : "/api/experiences";
      const updatedItem = await requestJson(`${endpoint}/${item.id}`, {
        method: "PATCH",
        body: JSON.stringify(form),
      });
      onSave(updatedItem);
      setIsEditing(false);
      setSavedMessage(
        "Les modifications ont été enregistrées dans ton profil.",
      );
    } catch (requestError) {
      setError(
        requestError.message || "Impossible d’enregistrer cette modification.",
      );
    } finally {
      setIsSaving(false);
    }
  }

  const title = isProject ? item.title : item.job_title;
  return (
    <Modal
      title={title}
      description={isProject ? "Projet de ton profil" : item.company_name}
      onClose={onClose}
    >
      {isEditing ? (
        <form className="mt-6 space-y-4" onSubmit={saveChanges}>
          {isProject ? (
            <>
              <label className="form-field">
                Titre du projet
                <input
                  className="form-input"
                  name="title"
                  value={form.title}
                  onChange={updateForm}
                  maxLength={200}
                  required
                />
              </label>
              <label className="form-field">
                Description
                <textarea
                  className="form-input description-input"
                  name="description"
                  value={form.description}
                  onChange={updateForm}
                  maxLength={5000}
                />
              </label>
              <label className="form-field">
                Lien du projet
                <input
                  className="form-input"
                  name="project_url"
                  type="url"
                  value={form.project_url}
                  onChange={updateForm}
                  maxLength={500}
                />
              </label>
              <label className="form-field">
                Lien du dépôt
                <input
                  className="form-input"
                  name="repository_url"
                  type="url"
                  value={form.repository_url}
                  onChange={updateForm}
                  maxLength={500}
                />
              </label>
            </>
          ) : (
            <>
              <label className="form-field">
                Intitulé du poste
                <input
                  className="form-input"
                  name="job_title"
                  value={form.job_title}
                  onChange={updateForm}
                  maxLength={200}
                  required
                />
              </label>
              <label className="form-field">
                Entreprise
                <input
                  className="form-input"
                  name="company_name"
                  value={form.company_name}
                  onChange={updateForm}
                  maxLength={200}
                  required
                />
              </label>
              <label className="form-field">
                Description
                <textarea
                  className="form-input description-input"
                  name="description"
                  value={form.description}
                  onChange={updateForm}
                  maxLength={5000}
                />
              </label>
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="form-field">
                  Date de début
                  <input
                    className="form-input"
                    name="start_date"
                    type="date"
                    value={form.start_date}
                    onChange={updateForm}
                  />
                </label>
                <label className="form-field">
                  Date de fin
                  <input
                    className="form-input"
                    name="end_date"
                    type="date"
                    value={form.end_date}
                    onChange={updateForm}
                  />
                </label>
              </div>
            </>
          )}
          {error && (
            <p className="form-error" role="alert">
              {error}
            </p>
          )}
          <div className="application-choice-actions">
            <button
              className="primary-button"
              type="submit"
              disabled={isSaving}
            >
              {isSaving ? "Enregistrement…" : "Enregistrer"}
            </button>
            <button
              className="secondary-button"
              type="button"
              onClick={() => setIsEditing(false)}
              disabled={isSaving}
            >
              Annuler
            </button>
          </div>
        </form>
      ) : (
        <div className="mt-6 space-y-4">
          {!isProject && (
            <p className="text-sm text-ink/70">
              {item.start_date || "Date de début non renseignée"}
              {item.end_date
                ? ` — ${item.end_date}`
                : item.start_date
                  ? " — Aujourd’hui"
                  : ""}
            </p>
          )}
          <p className="whitespace-pre-wrap text-ink/85">
            {item.description || "Aucune description renseignée."}
          </p>
          {isProject && (item.project_url || item.repository_url) && (
            <div className="flex flex-wrap gap-4 font-semibold underline underline-offset-4">
              {item.project_url && (
                <a href={item.project_url} target="_blank" rel="noreferrer">
                  Voir le projet
                </a>
              )}
              {item.repository_url && (
                <a href={item.repository_url} target="_blank" rel="noreferrer">
                  Voir le dépôt
                </a>
              )}
            </div>
          )}
          {savedMessage && (
            <p className="text-sm font-semibold text-ink" role="status">
              {savedMessage}
            </p>
          )}
          <div className="application-choice-actions">
            <button
              className="primary-button"
              type="button"
              onClick={() => {
                setIsEditing(true);
                setSavedMessage("");
              }}
            >
              Modifier {isProject ? "le projet" : "l’expérience"}
            </button>
            <button
              className="secondary-button"
              type="button"
              onClick={onClose}
            >
              Terminé
            </button>
          </div>
        </div>
      )}
    </Modal>
  );
}

export default function ApplicationProfilePicker({
  projects,
  experiences,
  selectedProjectIds,
  selectedExperienceIds,
  onToggleProject,
  onToggleExperience,
  onProjectUpdate,
  onExperienceUpdate,
}) {
  const [projectSearch, setProjectSearch] = useState("");
  const [experienceSearch, setExperienceSearch] = useState("");
  const [activeItem, setActiveItem] = useState(null);

  return (
    <>
      <SearchableSelection
        title="Projets à présenter"
        type="project"
        items={projects}
        selectedIds={selectedProjectIds}
        search={projectSearch}
        onSearchChange={setProjectSearch}
        onToggle={onToggleProject}
        onShowDetails={(item) => setActiveItem({ type: "project", item })}
      />
      <SearchableSelection
        title="Expériences à présenter"
        type="experience"
        items={experiences}
        selectedIds={selectedExperienceIds}
        search={experienceSearch}
        onSearchChange={setExperienceSearch}
        onToggle={onToggleExperience}
        onShowDetails={(item) => setActiveItem({ type: "experience", item })}
      />
      {activeItem && (
        <ProfileItemDialog
          key={`${activeItem.type}-${activeItem.item.id}`}
          type={activeItem.type}
          item={activeItem.item}
          onClose={() => setActiveItem(null)}
          onSave={
            activeItem.type === "project" ? onProjectUpdate : onExperienceUpdate
          }
        />
      )}
    </>
  );
}
