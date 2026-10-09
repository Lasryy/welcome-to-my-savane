import { useRef, useState } from "react";
import AdminCard from "../../components/admin/adminCard";
import { AdminDeleteConfirmation, AdminFeedback, AdminField, AdminListState } from "../../components/admin/adminUi";
import useAdminCollection from "../../hooks/useAdminCollection";

function AdminCategoriesPage() {
  const { items, loading, error, pending, feedback, setFeedback, reload, mutate } = useAdminCollection("/api/categories");
  const [name, setName] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const nameInput = useRef(null);

  function resetForm() {
    setName("");
    setEditingId(null);
  }

  function renameCategory(category) {
    setName(category.name);
    setEditingId(category.id);
    setFeedback(null);
    nameInput.current?.focus();
  }

  async function saveCategory(event) {
    event.preventDefault();
    if (!name.trim()) {
      setFeedback({ type: "error", message: "Le nom de la catégorie est obligatoire." });
      return;
    }

    const isCreating = editingId === null;
    let route = `/api/categories/${editingId}`;
    let method = "PUT";
    let successMessage = "La catégorie a été renommée.";
    if (isCreating) {
      route = "/api/categories";
      method = "POST";
      successMessage = "La catégorie a été créée.";
    }

    const wasSaved = await mutate(route, method, { name: name.trim() }, successMessage);
    if (wasSaved) {
      resetForm();
    }
  }

  async function deleteCategory(category) {
    const wasDeleted = await mutate(
      `/api/categories/${category.id}`,
      "DELETE",
      undefined,
      "La catégorie a été supprimée.",
    );
    if (wasDeleted) {
      setDeletingId(null);
      if (editingId === category.id) {
        resetForm();
      }
    }
  }

  return (
    <>
      <AdminFeedback feedback={feedback} />
      <div className="admin-columns">
        <section className="admin-panel" aria-labelledby="category-form-title">
          <div className="admin-panel-title"><h2 id="category-form-title">{editingId === null ? "Créer une catégorie" : "Renommer la catégorie"}</h2></div>
          <form onSubmit={saveCategory} className="admin-form">
            <fieldset disabled={pending || loading} className="contents">
              <AdminField label="Nom de la catégorie *" name="category-name">
                <input ref={nameInput} id="category-name" value={name} onChange={(event) => setName(event.target.value)} required maxLength={100} />
              </AdminField>
              <div className="admin-actions">
                <button type="submit" className="admin-button accent">{pending ? "Enregistrement…" : editingId === null ? "Créer la catégorie" : "Enregistrer le nom"}</button>
                {editingId !== null && <button type="button" className="admin-button secondary" onClick={resetForm}>Annuler</button>}
              </div>
            </fieldset>
          </form>
        </section>
        <section className="min-w-0" aria-labelledby="categories-list-title">
          <div className="admin-toolbar">
            <h2 id="categories-list-title">Les domaines de métiers</h2>
            <p aria-live="polite">{items.length} catégorie{items.length !== 1 ? "s" : ""}</p>
          </div>
          <AdminListState loading={loading} error={error} empty={!items.length} onRetry={reload}>
            <div className="grid items-start gap-[22px] xl:grid-cols-2">
              {[...items].sort((a, b) => a.name.localeCompare(b.name, "fr")).map((category, index) => (
                <AdminCard key={category.id} title={category.name} index={index}>
                  <div className="admin-actions">
                    <button type="button" className="admin-button primary" disabled={pending} onClick={() => renameCategory(category)}>Renommer</button>
                    <button type="button" className="admin-button secondary" disabled={pending} onClick={() => setDeletingId(category.id)}>Supprimer</button>
                  </div>
                  {deletingId === category.id && <AdminDeleteConfirmation name={category.name} pending={pending} onConfirm={() => deleteCategory(category)} onCancel={() => setDeletingId(null)} />}
                </AdminCard>
              ))}
            </div>
          </AdminListState>
        </section>
      </div>
    </>
  );
}

export default AdminCategoriesPage;
