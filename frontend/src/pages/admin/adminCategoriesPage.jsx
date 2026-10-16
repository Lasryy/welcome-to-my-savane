import Modal from "../../components/ui/Modal";
import Pagination from "../../components/ui/Pagination";
import { useRef, useState } from "react";
import AdminCard from "../../components/admin/adminCard";
import {
  AdminDeleteConfirmation,
  AdminFeedback,
  AdminField,
  AdminListState,
} from "../../components/admin/adminUi";
import useAdminCollection from "../../hooks/useAdminCollection";

function AdminCategoriesPage() {
  const {
    items,
    loading,
    error,
    pending,
    feedback,
    setFeedback,
    reload,
    mutate,
  } = useAdminCollection("/api/categories");
  const [name, setName] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const nameInput = useRef(null);
  const [showForm, setShowForm] = useState(false);
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const filteredItems = items
    .filter((item) =>
      item.name.toLocaleLowerCase("fr").includes(query.toLocaleLowerCase("fr")),
    )
    .sort((a, b) => a.name.localeCompare(b.name, "fr"));
  const totalPages = Math.max(1, Math.ceil(filteredItems.length / 10));
  const currentPage = Math.min(page, totalPages);
  const visibleItems = filteredItems.slice(
    (currentPage - 1) * 10,
    currentPage * 10,
  );

  function resetForm() {
    setShowForm(false);
    setName("");
    setEditingId(null);
  }

  function renameCategory(category) {
    setShowForm(true);
    setName(category.name);
    setEditingId(category.id);
    setFeedback(null);
    nameInput.current?.focus();
  }

  async function saveCategory(event) {
    event.preventDefault();
    if (!name.trim()) {
      setFeedback({
        type: "error",
        message: "Le nom de la catégorie est obligatoire.",
      });
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

    const wasSaved = await mutate(
      route,
      method,
      { name: name.trim() },
      successMessage,
    );
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

  let formTitle = "Créer une catégorie";
  let submitLabel = "Créer la catégorie";
  if (editingId !== null) {
    formTitle = "Renommer la catégorie";
    submitLabel = "Enregistrer le nom";
  }
  if (pending) {
    submitLabel = "Enregistrement…";
  }

  return (
    <>
      <AdminFeedback feedback={feedback} />
      <div>
        {showForm && (
          <Modal
            title={formTitle}
            onClose={() => {
              if (!pending) resetForm();
            }}
          >
            <AdminFeedback
              feedback={feedback?.type === "error" ? feedback : null}
            />
            <form
              onSubmit={saveCategory}
              className="admin-form grid gap-5 p-[20px]"
            >
              <fieldset disabled={pending || loading} className="contents">
                <AdminField label="Nom de la catégorie *" name="category-name">
                  <input
                    autoFocus
                    ref={nameInput}
                    id="category-name"
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    required
                    maxLength={100}
                  />
                </AdminField>
                <div className="admin-actions flex flex-wrap items-center gap-3">
                  <button
                    type="submit"
                    className="admin-button accent inline-flex min-h-10 items-center justify-center gap-2 px-5 py-3 text-[13px] font-bold [border:1px_solid_var(--admin-ink)] rounded-none no-underline"
                  >
                    {submitLabel}
                  </button>
                  {showForm && (
                    <button
                      type="button"
                      className="admin-button secondary inline-flex min-h-10 items-center justify-center gap-2 px-5 py-3 text-[13px] font-bold [border:1px_solid_var(--admin-ink)] rounded-none no-underline"
                      onClick={resetForm}
                    >
                      Annuler
                    </button>
                  )}
                </div>
              </fieldset>
            </form>
          </Modal>
        )}
        <section className="min-w-0" aria-labelledby="categories-list-title">
          <div className="admin-toolbar mb-6 flex flex-wrap items-center justify-between gap-4">
            <h2 id="categories-list-title">Les domaines de métiers</h2>
            <p aria-live="polite">
              {items.length} catégorie{items.length !== 1 ? "s" : ""}
            </p>
          </div>
          <div className="catalogue-toolbar mb-6">
            <label className="form-field">
              Rechercher
              <input
                className="form-input"
                type="search"
                value={query}
                onChange={(event) => {
                  setQuery(event.target.value);
                  setPage(1);
                }}
                placeholder="Rechercher par nom…"
              />
            </label>
            <button
              className="button button-primary"
              onClick={() => {
                resetForm();
                setFeedback(null);
                setShowForm(true);
              }}
            >
              Nouvelle catégorie
            </button>
          </div>
          <AdminListState
            loading={loading}
            error={error}
            empty={!filteredItems.length}
            onRetry={reload}
          >
            <div className="grid items-start gap-[22px] xl:grid-cols-2">
              {visibleItems.map((category, index) => (
                <AdminCard
                  key={category.id}
                  title={category.name}
                  index={index}
                >
                  <div className="admin-actions flex flex-wrap items-center gap-3">
                    <button
                      type="button"
                      className="admin-button primary inline-flex min-h-10 items-center justify-center gap-2 px-5 py-3 text-[13px] font-bold [border:1px_solid_var(--admin-ink)] rounded-none no-underline"
                      disabled={pending}
                      onClick={() => renameCategory(category)}
                    >
                      Renommer
                    </button>
                    <button
                      type="button"
                      className="admin-button secondary inline-flex min-h-10 items-center justify-center gap-2 px-5 py-3 text-[13px] font-bold [border:1px_solid_var(--admin-ink)] rounded-none no-underline"
                      disabled={pending}
                      onClick={() => setDeletingId(category.id)}
                    >
                      Supprimer
                    </button>
                  </div>
                  {deletingId === category.id && (
                    <AdminDeleteConfirmation
                      name={category.name}
                      pending={pending}
                      onConfirm={() => deleteCategory(category)}
                      onCancel={() => setDeletingId(null)}
                    />
                  )}
                </AdminCard>
              ))}
            </div>
          </AdminListState>
          {!loading && !error && (
            <Pagination
              page={currentPage}
              totalPages={totalPages}
              total={filteredItems.length}
              onPageChange={setPage}
            />
          )}
        </section>
      </div>
    </>
  );
}

export default AdminCategoriesPage;
