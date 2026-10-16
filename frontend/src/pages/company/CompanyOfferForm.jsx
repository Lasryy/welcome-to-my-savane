import Modal from "../../components/ui/Modal";
import { contractLabels, workingTimeLabels } from "../../utils/adminUtils";

export default function CompanyOfferForm({
  form,
  categories,
  editing,
  pending,
  error,
  onChange,
  onSubmit,
  onClose,
}) {
  return (
    <Modal
      title={editing ? "Modifier une offre" : "Nouvelle offre"}
      description="Présente le poste et les conditions pour aider les candidats à se projeter."
      onClose={() => {
        if (!pending) onClose();
      }}
    >
      {error && (
        <p className="form-error mb-5" role="alert">
          {error}
        </p>
      )}
      <form className="form-stack" onSubmit={onSubmit}>
        <fieldset className="offer-form-section" disabled={pending}>
          <legend>Le poste</legend>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="form-field">
              Titre du poste *
              <input
                className="form-input"
                name="title"
                value={form.title}
                onChange={onChange}
                required
                maxLength={200}
              />
            </label>
            <label className="form-field">
              Lieu
              <input
                className="form-input"
                name="location"
                value={form.location}
                onChange={onChange}
                maxLength={255}
              />
            </label>
            <label className="form-field sm:col-span-2">
              Résumé
              <input
                className="form-input"
                name="short_description"
                value={form.short_description}
                onChange={onChange}
                maxLength={500}
              />
            </label>
            <label className="form-field sm:col-span-2">
              Description *
              <textarea
                className="form-input description-input"
                name="description"
                value={form.description}
                onChange={onChange}
                required
                rows={5}
              />
            </label>
          </div>
        </fieldset>
        <fieldset className="offer-form-section" disabled={pending}>
          <legend>Les conditions</legend>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="form-field sm:col-span-2">
              Domaine
              <select
                className="form-input"
                name="category_id"
                value={form.category_id}
                onChange={onChange}
              >
                <option value="">Non renseigné</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </label>
            <label className="form-field">
              Contrat
              <select
                className="form-input"
                name="contract_type"
                value={form.contract_type}
                onChange={onChange}
              >
                <option value="">Non renseigné</option>
                {Object.entries(contractLabels).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </label>
            <label className="form-field">
              Temps de travail
              <select
                className="form-input"
                name="working_time"
                value={form.working_time}
                onChange={onChange}
              >
                <option value="">Non renseigné</option>
                {Object.entries(workingTimeLabels).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </fieldset>
        <fieldset className="offer-form-section" disabled={pending}>
          <legend>
            La rémunération <span>(facultatif)</span>
          </legend>
          <div className="grid gap-4 sm:grid-cols-3">
            <label className="form-field">
              Minimum (€ bruts)
              <input
                className="form-input"
                name="salary_min"
                type="number"
                min="1"
                step="1"
                value={form.salary_min}
                onChange={onChange}
              />
            </label>
            <label className="form-field">
              Maximum (€ bruts)
              <input
                className="form-input"
                name="salary_max"
                type="number"
                min={form.salary_min || 1}
                step="1"
                value={form.salary_max}
                onChange={onChange}
              />
            </label>
            <label className="form-field">
              Période
              <select
                className="form-input"
                name="salary_period"
                value={form.salary_period}
                onChange={onChange}
              >
                <option value="year">Par an</option>
                <option value="month">Par mois</option>
              </select>
            </label>
          </div>
        </fieldset>
        <div className="dialog-actions">
          <label className="form-field">
            Visibilité de l’offre
            <select
              className="form-input"
              name="status"
              value={form.status}
              disabled={pending}
              onChange={onChange}
            >
              <option value="published">Publiée</option>
              <option value="closed">Fermée</option>
            </select>
          </label>
          <div className="flex flex-wrap gap-3">
            <button
              className="button button-primary"
              type="submit"
              disabled={pending}
            >
              {pending
                ? "Enregistrement…"
                : editing
                  ? "Enregistrer"
                  : "Créer l’offre"}
            </button>
            <button
              type="button"
              className="button button-secondary"
              onClick={onClose}
              disabled={pending}
            >
              Annuler
            </button>
          </div>
        </div>
      </form>
    </Modal>
  );
}
