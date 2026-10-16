import { useEffect, useState } from "react";
import AdminCard from "../../components/admin/adminCard";
import {
  AdminFeedback,
  AdminField,
  AdminListState,
  AdminModal,
} from "../../components/admin/adminUi";
import { adminRequest } from "../../services/adminApi";
import AdminPagination from "../../components/admin/AdminPagination";
import PersonAvatar from "../../components/PersonAvatar";
import AdminCreateUserModal from "./AdminCreateUserModal";

const EMPTY_FORM = {
  first_name: "",
  last_name: "",
  email: "",
  phone: "",
  role: "USER",
  company_id: "",
};
export default function AdminUsersPage() {
  const [users, setUsers] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [page, setPage] = useState(1);
  const [query, setQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [currentUserId, setCurrentUserId] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [editingId, setEditingId] = useState(null);
  const [deletingUser, setDeletingUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const [feedback, setFeedback] = useState(null);
  const [reloadKey, setReloadKey] = useState(0);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    const controller = new AbortController();

    async function loadData() {
      setLoading(true);
      try {
        const params = new URLSearchParams({
          page: String(page),
          page_size: "20",
        });
        if (query.trim()) params.set("q", query.trim());
        if (roleFilter !== "all") params.set("role", roleFilter);
        const [userList, companyList, response] = await Promise.all([
          adminRequest(`/api/admin/users?${params}`, {
            signal: controller.signal,
          }),
          adminRequest("/api/companies", { signal: controller.signal }),
          fetch("/api/auth/me", {
            credentials: "same-origin",
            signal: controller.signal,
          }),
        ]);
        const currentUser = await response.json();
        if (
          !Array.isArray(userList?.items) ||
          !Array.isArray(companyList) ||
          !response.ok
        ) {
          throw new Error("Impossible de charger les comptes utilisateurs.");
        }

        if (!controller.signal.aborted) {
          setUsers(userList.items);
          setCompanies(companyList);
          setTotal(userList.total);
          setTotalPages(userList.total_pages);
          setCurrentUserId(currentUser.id);
          setError("");
        }
      } catch (requestError) {
        if (!controller.signal.aborted) {
          setError(requestError.message || "Le serveur ne répond pas.");
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    loadData();
    return () => controller.abort();
  }, [reloadKey, page, query, roleFilter]);

  function editUser(user) {
    setEditingId(user.id);
    setForm({
      first_name: user.first_name,
      last_name: user.last_name,
      email: user.email,
      phone: user.phone || "",
      role: user.role,
      company_id: user.company_id ? String(user.company_id) : "",
    });
    setFeedback(null);
  }

  function resetForm() {
    setEditingId(null);
    setForm(EMPTY_FORM);
  }

  function updateField(event) {
    setForm({ ...form, [event.target.name]: event.target.value });
  }

  function updateListFilter(update) {
    setLoading(true);
    setPage(1);
    update();
  }

  async function saveUser(event) {
    event.preventDefault();
    if (editingId === null) {
      return;
    }

    setPending(true);
    setFeedback(null);
    try {
      const userChanges = {
        first_name: form.first_name,
        last_name: form.last_name,
        email: form.email,
        phone: form.phone.trim() || null,
      };
      if (editingId !== currentUserId) {
        userChanges.role = form.role;
        userChanges.company_id =
          form.role === "COMPANY" ? Number(form.company_id) : null;
      }

      const updatedUser = await adminRequest(`/api/admin/users/${editingId}`, {
        method: "PATCH",
        body: userChanges,
      });
      setUsers((current) =>
        current.map((user) =>
          user.id === updatedUser.id ? updatedUser : user,
        ),
      );
      setPage(1);
      setReloadKey((key) => key + 1);
      setFeedback({ type: "success", message: "Le compte a été mis à jour." });
      resetForm();
    } catch (requestError) {
      setFeedback({ type: "error", message: requestError.message });
    } finally {
      setPending(false);
    }
  }

  async function deleteUser() {
    if (!deletingUser) {
      return;
    }

    setPending(true);
    setFeedback(null);
    try {
      await adminRequest(`/api/admin/users/${deletingUser.id}`, {
        method: "DELETE",
      });
      setUsers((current) =>
        current.filter((user) => user.id !== deletingUser.id),
      );
      setPage(1);
      setReloadKey((key) => key + 1);
      if (editingId === deletingUser.id) {
        resetForm();
      }
      setDeletingUser(null);
      setFeedback({
        type: "success",
        message: "Le compte et ses données associées ont été supprimés.",
      });
    } catch (requestError) {
      setFeedback({ type: "error", message: requestError.message });
    } finally {
      setPending(false);
    }
  }

  return (
    <>
      <AdminFeedback feedback={feedback} />
      <div className="admin-toolbar mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2>Comptes utilisateurs</h2>
          <p aria-live="polite">
            {total} compte{total !== 1 ? "s" : ""}
          </p>
        </div>
        <button
          className="admin-button accent inline-flex min-h-10 items-center justify-center px-5 py-3 text-[13px] font-bold [border:1px_solid_var(--admin-ink)]"
          type="button"
          onClick={() => { setFeedback(null); setCreating(true); }}
        >
          Créer un compte
        </button>
      </div>

      {creating && (
        <AdminCreateUserModal
          companies={companies}
          onClose={() => setCreating(false)}
          onCreated={() => {
            setPage(1);
            setReloadKey((key) => key + 1);
            setFeedback({ type: "success", message: "Le compte a été créé." });
          }}
        />
      )}

      {editingId !== null && (
        <AdminModal
          title="Modifier un compte"
          description="Mets à jour les coordonnées et les droits d’accès de ce compte."
          onClose={() => {
            if (!pending) resetForm();
          }}
        >
          <AdminFeedback
            feedback={feedback?.type === "error" ? feedback : null}
          />
          <form
            className="admin-form grid gap-5 p-[20px] sm:grid-cols-2"
            onSubmit={saveUser}
          >
            <AdminField label="Prénom *" name="user-first-name">
              <input
                id="user-first-name"
                name="first_name"
                value={form.first_name}
                onChange={updateField}
                required
                maxLength={100}
              />
            </AdminField>
            <AdminField label="Nom *" name="user-last-name">
              <input
                id="user-last-name"
                name="last_name"
                value={form.last_name}
                onChange={updateField}
                required
                maxLength={100}
              />
            </AdminField>
            <AdminField label="E-mail *" name="user-email">
              <input
                id="user-email"
                name="email"
                type="email"
                value={form.email}
                onChange={updateField}
                required
                maxLength={255}
              />
            </AdminField>
            <AdminField label="Téléphone" name="user-phone">
              <input
                id="user-phone"
                name="phone"
                type="tel"
                value={form.phone}
                onChange={updateField}
                maxLength={30}
              />
            </AdminField>
            <AdminField label="Rôle" name="user-role">
              <select
                id="user-role"
                name="role"
                value={form.role}
                onChange={updateField}
                disabled={editingId === currentUserId}
              >
                <option value="USER">Candidat</option>
                <option value="COMPANY">Recruteur</option>
                <option value="ADMIN">Administrateur</option>
              </select>
              {editingId === currentUserId && (
                <p className="admin-help text-[12px]">
                  Tu ne peux pas modifier ton propre rôle.
                </p>
              )}
            </AdminField>
            {editingId !== currentUserId && form.role === "COMPANY" && (
              <AdminField label="Entreprise *" name="user-company">
                <select
                  id="user-company"
                  name="company_id"
                  value={form.company_id}
                  onChange={updateField}
                  required
                >
                  <option value="">Choisir une entreprise</option>
                  {companies.map((company) => (
                    <option key={company.id} value={company.id}>
                      {company.name}
                    </option>
                  ))}
                </select>
                <p className="admin-help text-[12px]">
                  Plusieurs comptes recruteur peuvent être rattachés à la même
                  entreprise.
                </p>
              </AdminField>
            )}
            <div className="admin-actions flex flex-wrap items-end gap-3">
              <button
                className="admin-button accent inline-flex min-h-10 items-center justify-center px-5 py-3 text-[13px] font-bold [border:1px_solid_var(--admin-ink)]"
                type="submit"
                disabled={pending}
              >
                {pending ? "Enregistrement…" : "Enregistrer"}
              </button>
              <button
                className="admin-button secondary inline-flex min-h-10 items-center justify-center px-5 py-3 text-[13px] font-bold [border:1px_solid_var(--admin-ink)]"
                type="button"
                onClick={resetForm}
                disabled={pending}
              >
                Annuler
              </button>
            </div>
          </form>
        </AdminModal>
      )}

      <section
        className="admin-filters mb-6 grid gap-4 p-5 [background:var(--admin-ink)] text-[var(--admin-paper)]"
        aria-label="Filtres des comptes"
      >
        <label className="admin-field grid gap-2" htmlFor="users-search">
          Recherche
          <input
            id="users-search"
            type="search"
            value={query}
            onChange={(event) =>
              updateListFilter(() => setQuery(event.target.value))
            }
            placeholder="Nom, e-mail, entreprise…"
          />
        </label>
        <label className="admin-field grid gap-2" htmlFor="users-role">
          Rôle
          <select
            id="users-role"
            value={roleFilter}
            onChange={(event) =>
              updateListFilter(() => setRoleFilter(event.target.value))
            }
          >
            <option value="all">Tous les rôles</option>
            <option value="USER">Candidats</option>
            <option value="COMPANY">Recruteurs</option>
            <option value="ADMIN">Administrateurs</option>
          </select>
        </label>
      </section>
      <AdminListState
        loading={loading}
        error={error}
        empty={!users.length}
        onRetry={() => {
          setLoading(true);
          setReloadKey((key) => key + 1);
        }}
      >
        <div className="grid items-start gap-[22px] xl:grid-cols-2">
          {users.map((user, index) => (
            <AdminCard
              key={user.id}
              title={`${user.first_name} ${user.last_name}`}
              description={user.email}
              index={index}
              header={<PersonAvatar person={user} size={42} />}
            >
              <p>{user.phone || "Téléphone non renseigné"}</p>
              <p>
                <strong>Rôle :</strong>{" "}
                {user.role === "ADMIN"
                  ? "Administrateur"
                  : user.role === "COMPANY"
                    ? `Recruteur · ${user.company_name}`
                    : "Candidat"}
              </p>
              <div className="admin-actions flex flex-wrap gap-3">
                <button
                  className="admin-button primary inline-flex min-h-10 items-center justify-center px-5 py-3 text-[13px] font-bold [border:1px_solid_var(--admin-ink)]"
                  type="button"
                  disabled={pending}
                  onClick={() => editUser(user)}
                >
                  Modifier
                </button>
                <button
                  className="admin-button secondary inline-flex min-h-10 items-center justify-center px-5 py-3 text-[13px] font-bold [border:1px_solid_var(--admin-ink)]"
                  type="button"
                  disabled={pending || user.id === currentUserId}
                  onClick={() => setDeletingUser(user)}
                >
                  Supprimer
                </button>
              </div>
            </AdminCard>
          ))}
        </div>
        <AdminPagination
          page={page}
          totalPages={totalPages}
          total={total}
          onPageChange={(value) => {
            setLoading(true);
            setPage(value);
          }}
        />
      </AdminListState>

      {deletingUser && (
        <AdminModal
          title={`Supprimer ${deletingUser.first_name} ${deletingUser.last_name} ?`}
          description="Cette action supprimera aussi ses candidatures, projets et expériences. Elle est définitive."
          onClose={() => {
            if (!pending) setDeletingUser(null);
          }}
        >
          <div className="admin-actions mt-6 flex flex-wrap gap-3">
            <button
              className="admin-button primary inline-flex min-h-10 items-center justify-center px-5 py-3 text-[13px] font-bold [border:1px_solid_var(--admin-ink)]"
              type="button"
              onClick={deleteUser}
              disabled={pending}
            >
              {pending ? "Suppression…" : "Supprimer le compte"}
            </button>
            <button
              className="admin-button secondary inline-flex min-h-10 items-center justify-center px-5 py-3 text-[13px] font-bold [border:1px_solid_var(--admin-ink)]"
              type="button"
              onClick={() => setDeletingUser(null)}
              disabled={pending}
            >
              Annuler
            </button>
          </div>
        </AdminModal>
      )}
    </>
  );
}
