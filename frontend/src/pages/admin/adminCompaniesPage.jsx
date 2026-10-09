import { useRef, useState } from "react";
import AdminCard from "../../components/admin/adminCard";
import { AdminDeleteConfirmation, AdminFeedback, AdminField, AdminListState } from "../../components/admin/adminUi";
import useAdminCollection from "../../hooks/useAdminCollection";
import { isWebUrl } from "../../utils/adminUtils";

const emptyCompany = { name: "", description: "", website: "", location: "", logo_url: "" };

function AdminCompaniesPage() {
  const { items, loading, error, pending, feedback, setFeedback, reload, mutate } = useAdminCollection("/api/companies");
  const [form, setForm] = useState(emptyCompany);
  const [editingId, setEditingId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const nameInput = useRef(null);

  function resetForm() {
    setForm(emptyCompany);
    setEditingId(null);
  }

  function editCompany(company) {
    setEditingId(company.id);
    setForm(Object.fromEntries(Object.keys(emptyCompany).map((key) => [key, company[key] || ""])));
    setFeedback(null);
    nameInput.current?.focus();
  }

  async function saveCompany(event) {
    event.preventDefault();
    const data = Object.fromEntries(Object.entries(form).map(([key, value]) => [key, value.trim() || null]));
    const nameIsMissing = !data.name;
    if (nameIsMissing) {
      setFeedback({ type: "error", message: "Le nom de l’entreprise est obligatoire." });
      return;
    }

    const hasInvalidUrl = [data.website, data.logo_url].some((url) => url && !isWebUrl(url));
    if (hasInvalidUrl) {
      setFeedback({ type: "error", message: "Les liens doivent commencer par https:// ou http://." });
      return;
    }

    const isCreating = editingId === null;
    let route = `/api/companies/${editingId}`;
    let method = "PUT";
    let successMessage = "L’entreprise a été mise à jour.";
    if (isCreating) {
      route = "/api/companies";
      method = "POST";
      successMessage = "L’entreprise a été créée.";
    }

    const saved = await mutate(route, method, data, successMessage);
    if (saved) {
      resetForm();
    }
  }

  async function deleteCompany(company) {
    const wasDeleted = await mutate(
      `/api/companies/${company.id}`,
      "DELETE",
      undefined,
      "L’entreprise a été supprimée.",
    );
    if (wasDeleted) {
      setDeletingId(null);
      if (editingId === company.id) {
        resetForm();
      }
    }
  }

  const update = (event) => setForm({ ...form, [event.target.name]: event.target.value });

  return (
    <>
      <AdminFeedback feedback={feedback} />
      <div className="admin-columns">
        <section className="admin-panel" aria-labelledby="company-form-title">
          <div className="admin-panel-title"><h2 id="company-form-title">{editingId === null ? "Créer une entreprise" : "Modifier l’entreprise"}</h2></div>
          <form className="admin-form" onSubmit={saveCompany}>
            <fieldset disabled={pending || loading} className="contents">
              <AdminField label="Nom de l’entreprise *" name="company-name">
                <input ref={nameInput} id="company-name" name="name" value={form.name} onChange={update} required maxLength={150} />
              </AdminField>
              <AdminField label="Description" name="company-description">
                <textarea id="company-description" name="description" rows={5} value={form.description} onChange={update} />
              </AdminField>
              <AdminField label="Ville ou localisation" name="company-location">
                <input id="company-location" name="location" value={form.location} onChange={update} maxLength={255} />
              </AdminField>
              <AdminField label="Site web" name="company-website">
                <input id="company-website" name="website" type="url" value={form.website} onChange={update} maxLength={255} placeholder="https://entreprise.fr" />
              </AdminField>
              <AdminField label="URL du logo" name="company-logo">
                <input id="company-logo" name="logo_url" type="url" value={form.logo_url} onChange={update} maxLength={500} />
              </AdminField>
              <div className="admin-actions">
                <button className="admin-button accent" type="submit">{pending ? "Enregistrement…" : editingId === null ? "Créer l’entreprise" : "Enregistrer les modifications"}</button>
                {editingId !== null && <button className="admin-button secondary" type="button" onClick={resetForm}>Annuler</button>}
              </div>
            </fieldset>
          </form>
        </section>
        <section className="min-w-0" aria-labelledby="companies-list-title">
          <div className="admin-toolbar">
            <h2 id="companies-list-title">Les équipes de la Savane</h2>
            <p aria-live="polite">{items.length} entreprise{items.length !== 1 ? "s" : ""}</p>
          </div>
          <AdminListState loading={loading} error={error} empty={!items.length} onRetry={reload}>
            <div className="grid items-start gap-[22px] xl:grid-cols-2">
              {[...items].sort((a, b) => a.name.localeCompare(b.name, "fr")).map((company, index) => (
                <AdminCard key={company.id} title={company.name} description={company.description} index={index}>
                  <p className="text-[13px]">{company.location || "Localisation non renseignée"}</p>
                  {isWebUrl(company.website) && <a href={company.website} target="_blank" rel="noopener noreferrer" className="break-all underline">Visiter le site de {company.name}</a>}
                  <div className="admin-actions">
                    <button type="button" className="admin-button primary" disabled={pending} onClick={() => editCompany(company)}>Modifier</button>
                    <button type="button" className="admin-button secondary" disabled={pending} onClick={() => setDeletingId(company.id)}>Supprimer</button>
                  </div>
                  {deletingId === company.id && <AdminDeleteConfirmation name={company.name} pending={pending} onConfirm={() => deleteCompany(company)} onCancel={() => setDeletingId(null)} />}
                </AdminCard>
              ))}
            </div>
          </AdminListState>
        </section>
      </div>
    </>
  );
}

export default AdminCompaniesPage;
