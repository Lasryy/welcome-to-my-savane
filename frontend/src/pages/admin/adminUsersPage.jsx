import { useEffect, useState } from "react";
import AdminCard from "../../components/admin/adminCard";
import { AdminFeedback, AdminField, AdminListState, AdminModal } from "../../components/admin/adminUi";
import { adminRequest } from "../../services/adminApi";

const EMPTY_FORM = { first_name: "", last_name: "", email: "", phone: "", role: "USER" };

export default function AdminUsersPage() {
  const [users, setUsers] = useState([]);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [editingId, setEditingId] = useState(null);
  const [deletingUser, setDeletingUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const [feedback, setFeedback] = useState(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    const controller = new AbortController();

    async function loadData() {
      try {
        const [userList, response] = await Promise.all([
          adminRequest("/api/admin/users", { signal: controller.signal }),
          fetch("/api/auth/me", { credentials: "same-origin", signal: controller.signal }),
        ]);
        const currentUser = await response.json();
        if (!Array.isArray(userList) || !response.ok) {
          throw new Error("Impossible de charger les comptes utilisateurs.");
        }

        if (!controller.signal.aborted) {
          setUsers(userList);
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
  }, [reloadKey]);

  function editUser(user) {
    setEditingId(user.id);
    setForm({
      first_name: user.first_name,
      last_name: user.last_name,
      email: user.email,
      phone: user.phone || "",
      role: user.role,
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
      }

      const updatedUser = await adminRequest(`/api/admin/users/${editingId}`, {
        method: "PATCH",
        body: userChanges,
      });
      setUsers((current) => current.map((user) => user.id === updatedUser.id ? updatedUser : user));
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
      await adminRequest(`/api/admin/users/${deletingUser.id}`, { method: "DELETE" });
      setUsers((current) => current.filter((user) => user.id !== deletingUser.id));
      if (editingId === deletingUser.id) {
        resetForm();
      }
      setDeletingUser(null);
      setFeedback({ type: "success", message: "Le compte et ses données associées ont été supprimés." });
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
        <div><h2>Comptes utilisateurs</h2><p aria-live="polite">{users.length} compte{users.length !== 1 ? "s" : ""}</p></div>
      </div>

      {editingId !== null && (
        <section className="admin-panel mb-8 overflow-hidden [border:1px_solid_var(--admin-rule)] [background:var(--admin-paper)]" aria-labelledby="user-form-title">
          <div className="admin-panel-title p-[20px] [background:var(--admin-ink)] text-[var(--admin-paper)]"><h2 id="user-form-title">Modifier un compte</h2></div>
          <form className="admin-form grid gap-5 p-[20px] sm:grid-cols-2" onSubmit={saveUser}>
            <AdminField label="Prénom *" name="user-first-name">
              <input id="user-first-name" name="first_name" value={form.first_name} onChange={updateField} required maxLength={100} />
            </AdminField>
            <AdminField label="Nom *" name="user-last-name">
              <input id="user-last-name" name="last_name" value={form.last_name} onChange={updateField} required maxLength={100} />
            </AdminField>
            <AdminField label="E-mail *" name="user-email">
              <input id="user-email" name="email" type="email" value={form.email} onChange={updateField} required maxLength={255} />
            </AdminField>
            <AdminField label="Téléphone" name="user-phone">
              <input id="user-phone" name="phone" type="tel" value={form.phone} onChange={updateField} maxLength={30} />
            </AdminField>
            <AdminField label="Rôle" name="user-role">
              <select id="user-role" name="role" value={form.role} onChange={updateField} disabled={editingId === currentUserId}>
                <option value="USER">USER · Candidat</option>
                <option value="ADMIN">ADMIN · Administrateur</option>
              </select>
              {editingId === currentUserId && <p className="admin-help text-[12px]">Tu ne peux pas modifier ton propre rôle.</p>}
            </AdminField>
            <div className="admin-actions flex flex-wrap items-end gap-3">
              <button className="admin-button accent inline-flex min-h-10 items-center justify-center px-5 py-3 text-[13px] font-bold [border:1px_solid_var(--admin-ink)]" type="submit" disabled={pending}>
                {pending ? "Enregistrement…" : "Enregistrer"}
              </button>
              <button className="admin-button secondary inline-flex min-h-10 items-center justify-center px-5 py-3 text-[13px] font-bold [border:1px_solid_var(--admin-ink)]" type="button" onClick={resetForm} disabled={pending}>Annuler</button>
            </div>
          </form>
        </section>
      )}

      <AdminListState
        loading={loading}
        error={error}
        empty={!users.length}
        onRetry={() => { setLoading(true); setReloadKey((key) => key + 1); }}
      >
        <div className="grid items-start gap-[22px] xl:grid-cols-2">
          {users.map((user, index) => (
            <AdminCard key={user.id} title={`${user.first_name} ${user.last_name}`} description={user.email} index={index}>
              <p>{user.phone || "Téléphone non renseigné"}</p>
              <p><strong>Rôle :</strong> {user.role === "ADMIN" ? "Administrateur" : "Candidat"}</p>
              <div className="admin-actions flex flex-wrap gap-3">
                <button className="admin-button primary inline-flex min-h-10 items-center justify-center px-5 py-3 text-[13px] font-bold [border:1px_solid_var(--admin-ink)]" type="button" disabled={pending} onClick={() => editUser(user)}>Modifier</button>
                <button className="admin-button secondary inline-flex min-h-10 items-center justify-center px-5 py-3 text-[13px] font-bold [border:1px_solid_var(--admin-ink)]" type="button" disabled={pending || user.id === currentUserId} onClick={() => setDeletingUser(user)}>Supprimer</button>
              </div>
            </AdminCard>
          ))}
        </div>
      </AdminListState>

      {deletingUser && (
        <AdminModal
          title={`Supprimer ${deletingUser.first_name} ${deletingUser.last_name} ?`}
          description="Cette action supprimera aussi ses candidatures, projets et expériences. Elle est définitive."
          onClose={() => { if (!pending) setDeletingUser(null); }}
        >
          <div className="admin-actions mt-6 flex flex-wrap gap-3">
            <button className="admin-button primary inline-flex min-h-10 items-center justify-center px-5 py-3 text-[13px] font-bold [border:1px_solid_var(--admin-ink)]" type="button" onClick={deleteUser} disabled={pending}>
              {pending ? "Suppression…" : "Supprimer le compte"}
            </button>
            <button className="admin-button secondary inline-flex min-h-10 items-center justify-center px-5 py-3 text-[13px] font-bold [border:1px_solid_var(--admin-ink)]" type="button" onClick={() => setDeletingUser(null)} disabled={pending}>Annuler</button>
          </div>
        </AdminModal>
      )}
    </>
  );
}
