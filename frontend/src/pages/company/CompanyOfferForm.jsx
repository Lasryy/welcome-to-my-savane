import Modal from "../../components/ui/Modal";
import CustomSelect from "../../components/CustomSelect";
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
              <CustomSelect
                value={form.category_id}
                onChange={(value) => onChange({ target: { name: "category_id", value } })}
                options={[
                  { value: "", label: "Non renseigné" },
                  ...categories.map((category) => ({ value: category.id, label: category.name })),
                ]}
              />
            </label>
            <label className="form-field">
              Contrat
              <CustomSelect
                value={form.contract_type}
                onChange={(value) => onChange({ target: { name: "contract_type", value } })}
                options={[
                  { value: "", label: "Non renseigné" },
                  ...Object.entries(contractLabels).map(([value, label]) => ({ value, label })),
                ]}
              />
            </label>
            <label className="form-field">
              Temps de travail
              <CustomSelect
                value={form.working_time}
                onChange={(value) => onChange({ target: { name: "working_time", value } })}
                options={[
                  { value: "", label: "Non renseigné" },
                  ...Object.entries(workingTimeLabels).map(([value, label]) => ({ value, label })),
                ]}
              />
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
              <CustomSelect
                value={form.salary_period}
                onChange={(value) => onChange({ target: { name: "salary_period", value } })}
                options={[{ value: "year", label: "Par an" }, { value: "month", label: "Par mois" }]}
              />
            </label>
          </div>
        </fieldset>
        <div className="dialog-actions">
          <label className="form-field">
            Visibilité de l’offre
            <CustomSelect
              value={form.status}
              disabled={pending}
              onChange={(value) => onChange({ target: { name: "status", value } })}
              options={[{ value: "published", label: "Publiée" }, { value: "closed", label: "Fermée" }]}
            />
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
