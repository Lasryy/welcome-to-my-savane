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
    setForm({
      name: company.name || "",
      description: company.description || "",
      website: company.website || "",
      location: company.location || "",
      logo_url: company.logo_url || "",
    });
    setFeedback(null);
    nameInput.current?.focus();
  }

  async function saveCompany(event) {
    event.preventDefault();
    const data = {
      name: form.name.trim() || null,
      description: form.description.trim() || null,
      website: form.website.trim() || null,
      location: form.location.trim() || null,
      logo_url: form.logo_url.trim() || null,
    };
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

  function update(event) {
    const fieldName = event.target.name;
    const fieldValue = event.target.value;
    setForm({ ...form, [fieldName]: fieldValue });
  }

  let formTitle = "Créer une entreprise";
  let submitLabel = "Créer l’entreprise";
  if (editingId !== null) {
    formTitle = "Modifier l’entreprise";
    submitLabel = "Enregistrer les modifications";
  }
  if (pending) {
    submitLabel = "Enregistrement…";
  }

  return (
    <>
      <AdminFeedback feedback={feedback} />
      <div className="admin-columns grid items-start gap-[22px] [grid-template-columns:minmax(280px,_360px)_minmax(0,_1fr)] admin-max-1000:[grid-template-columns:1fr]">
        <section className="admin-panel [border:1px_solid_var(--admin-rule)] rounded-[0_18px_0_0] overflow-hidden [background:var(--admin-paper)]" aria-labelledby="company-form-title">
          <div className="admin-panel-title p-[20px] [background:var(--admin-ink)] text-[var(--admin-paper)]"><h2 id="company-form-title">{formTitle}</h2></div>
          <form className="admin-form grid gap-5 p-[20px]" onSubmit={saveCompany}>
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
              <div className="admin-actions flex flex-wrap items-center gap-3">
                <button className="admin-button accent inline-flex min-h-10 items-center justify-center gap-2 px-5 py-3 text-[13px] font-bold [border:1px_solid_var(--admin-ink)] rounded-none no-underline" type="submit">{submitLabel}</button>
                {editingId !== null && <button className="admin-button secondary inline-flex min-h-10 items-center justify-center gap-2 px-5 py-3 text-[13px] font-bold [border:1px_solid_var(--admin-ink)] rounded-none no-underline" type="button" onClick={resetForm}>Annuler</button>}
              </div>
            </fieldset>
          </form>
        </section>
        <section className="min-w-0" aria-labelledby="companies-list-title">
          <div className="admin-toolbar mb-6 flex flex-wrap items-center justify-between gap-4">
            <h2 id="companies-list-title">Les équipes de la Savane</h2>
            <p aria-live="polite">{items.length} entreprise{items.length !== 1 ? "s" : ""}</p>
          </div>
          <AdminListState loading={loading} error={error} empty={!items.length} onRetry={reload}>
            <div className="grid items-start gap-[22px] xl:grid-cols-2">
              {[...items].sort((a, b) => a.name.localeCompare(b.name, "fr")).map((company, index) => (
                <AdminCard key={company.id} title={company.name} description={company.description} index={index}>
                  <p className="text-[13px]">{company.location || "Localisation non renseignée"}</p>
                  {isWebUrl(company.website) && <a href={company.website} target="_blank" rel="noopener noreferrer" className="break-all underline">Visiter le site de {company.name}</a>}
                  <div className="admin-actions flex flex-wrap items-center gap-3">
                    <button type="button" className="admin-button primary inline-flex min-h-10 items-center justify-center gap-2 px-5 py-3 text-[13px] font-bold [border:1px_solid_var(--admin-ink)] rounded-none no-underline" disabled={pending} onClick={() => editCompany(company)}>Modifier</button>
                    <button type="button" className="admin-button secondary inline-flex min-h-10 items-center justify-center gap-2 px-5 py-3 text-[13px] font-bold [border:1px_solid_var(--admin-ink)] rounded-none no-underline" disabled={pending} onClick={() => setDeletingId(company.id)}>Supprimer</button>
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
