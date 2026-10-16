import { useEffect, useRef, useState } from "react";
import AdminCard from "../../components/admin/adminCard";
import {
  AdminDeleteConfirmation,
  AdminFeedback,
  AdminField,
  AdminListState,
  AdminModal,
} from "../../components/admin/adminUi";
import PersonAvatar from "../../components/PersonAvatar";
import AdminPagination from "../../components/admin/AdminPagination";
import { adminRequest } from "../../services/adminApi";
import AdminCreateUserModal from "./AdminCreateUserModal";
import { generateSecurePassword } from "../../utils/securePassword";

export default function AdminCompanyUsersModal({ company, onClose }) {
  const [users, setUsers] = useState([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [pending, setPending] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [reloadKey, setReloadKey] = useState(0);
  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ first_name: "", last_name: "", email: "", phone: "", password: "" });
  const [deleting, setDeleting] = useState(null);
  const lastGeneratedPassword = useRef("");

  useEffect(() => {
    const controller = new AbortController();
    adminRequest(`/api/admin/users?company_id=${company.id}&role=COMPANY&page=${page}&page_size=20`, {
      signal: controller.signal,
    }).then((result) => {
      if (!Array.isArray(result?.items)) throw new Error("Impossible de charger les comptes de cette entreprise.");
      setUsers(result.items);
      setTotal(result.total);
      setTotalPages(result.total_pages);
      setLoadError("");
    }).catch((error) => {
      if (!controller.signal.aborted) setLoadError(error.message || "Le serveur ne répond pas.");
    }).finally(() => {
      if (!controller.signal.aborted) setLoading(false);
    });
    return () => controller.abort();
  }, [company.id, page, reloadKey]);

  function startEdit(user) {
    setEditing(user);
    setForm({ first_name: user.first_name, last_name: user.last_name, email: user.email, phone: user.phone || "", password: "" });
    setFeedback(null);
  }

  async function saveUser(event) {
    event.preventDefault();
    if (!editing) return;
    setPending(true);
    setFeedback(null);
    try {
      const changes = { ...form, phone: form.phone.trim() || null };
      if (!changes.password) delete changes.password;
      const updated = await adminRequest(`/api/admin/users/${editing.id}`, {
        method: "PATCH",
        body: changes,
      });
      setUsers((current) => current.map((user) => user.id === updated.id ? updated : user));
      setEditing(null);
      setFeedback({ type: "success", message: "Le compte a été mis à jour." });
    } catch (error) {
      setFeedback({ type: "error", message: error.message });
    } finally {
      setPending(false);
    }
  }

  async function deleteUser() {
    if (!deleting) return;
    setPending(true);
    setFeedback(null);
    try {
      await adminRequest(`/api/admin/users/${deleting.id}`, { method: "DELETE" });
      setUsers((current) => current.filter((user) => user.id !== deleting.id));
      setDeleting(null);
      setFeedback({ type: "success", message: "Le compte a été supprimé." });
    } catch (error) {
      setFeedback({ type: "error", message: error.message });
    } finally {
      setPending(false);
    }
  }

  return (
    <>
      <AdminModal title={`Utilisateurs · ${company.name}`} description="Consulte et gère les comptes rattachés à cette entreprise." onClose={onClose}>
        <div className="p-5">
          <AdminFeedback feedback={feedback} />
          <div className="admin-toolbar mb-5 flex flex-wrap items-center justify-between gap-3">
            <p aria-live="polite">{total} compte{total !== 1 ? "s" : ""}</p>
            <button className="admin-button accent min-h-10 px-5 py-3 text-[13px] font-bold" type="button" onClick={() => setCreating(true)}>
              Créer un compte employé
            </button>
          </div>
          <AdminListState loading={loading} error={loadError} empty={!users.length} onRetry={() => { setLoading(true); setReloadKey((key) => key + 1); }}>
            <div className="grid gap-4">
              {users.map((user) => (
                <AdminCard key={user.id} title={`${user.first_name} ${user.last_name}`} description={user.email} header={<PersonAvatar person={user} size={38} />}>
                  <p>{user.phone || "Téléphone non renseigné"}</p>
                  <div className="admin-actions flex flex-wrap gap-3">
                    <button className="admin-button primary min-h-10 px-5 py-3 text-[13px] font-bold" type="button" onClick={() => startEdit(user)}>Modifier</button>
                    <button className="admin-button secondary min-h-10 px-5 py-3 text-[13px] font-bold" type="button" onClick={() => setDeleting(user)}>Supprimer</button>
                  </div>
                  {deleting?.id === user.id && <AdminDeleteConfirmation name={`${user.first_name} ${user.last_name}`} pending={pending} onConfirm={deleteUser} onCancel={() => setDeleting(null)} />}
                </AdminCard>
              ))}
            </div>
          </AdminListState>
          {!loading && !loadError && totalPages > 1 && (
            <AdminPagination page={page} totalPages={totalPages} total={total} onPageChange={(value) => { setLoading(true); setPage(value); }} />
          )}
        </div>
      </AdminModal>

      {creating && <AdminCreateUserModal companies={[company]} initialCompanyId={company.id} onClose={() => setCreating(false)} onCreated={() => { setPage(1); setLoading(true); setReloadKey((key) => key + 1); }} />}

      {editing && (
        <AdminModal title="Modifier un compte employé" description={`Compte rattaché à ${company.name}.`} onClose={() => { if (!pending) setEditing(null); }}>
          <AdminFeedback feedback={feedback?.type === "error" ? feedback : null} />
          <form className="admin-form grid gap-5 p-5 sm:grid-cols-2" onSubmit={saveUser}>
            <AdminField label="Prénom *" name="company-user-first-name"><input id="company-user-first-name" value={form.first_name} onChange={(event) => setForm({ ...form, first_name: event.target.value })} required maxLength={100} /></AdminField>
            <AdminField label="Nom *" name="company-user-last-name"><input id="company-user-last-name" value={form.last_name} onChange={(event) => setForm({ ...form, last_name: event.target.value })} required maxLength={100} /></AdminField>
            <AdminField label="E-mail *" name="company-user-email"><input id="company-user-email" type="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} required maxLength={255} /></AdminField>
            <AdminField label="Téléphone" name="company-user-phone"><input id="company-user-phone" type="tel" value={form.phone} onChange={(event) => setForm({ ...form, phone: event.target.value })} maxLength={30} /></AdminField>
            <AdminField label="Nouveau mot de passe" name="company-user-password" help="Laisse ce champ vide pour garder le mot de passe actuel.">
              <div className="grid gap-2">
                <input id="company-user-password" type="password" autoComplete="new-password" value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} minLength={8} />
                <button className="admin-button secondary min-h-10 justify-center px-4 py-2 text-[13px] font-bold" type="button" onClick={() => { const password = generateSecurePassword(lastGeneratedPassword.current); lastGeneratedPassword.current = password; setForm((current) => ({ ...current, password })); }}>
                  Générer un mot de passe sécurisé
                </button>
              </div>
            </AdminField>
            <div className="admin-actions flex flex-wrap items-end gap-3">
              <button className="admin-button accent min-h-10 px-5 py-3 text-[13px] font-bold" type="submit" disabled={pending}>{pending ? "Enregistrement…" : "Enregistrer"}</button>
              <button className="admin-button secondary min-h-10 px-5 py-3 text-[13px] font-bold" type="button" onClick={() => setEditing(null)} disabled={pending}>Annuler</button>
            </div>
          </form>
        </AdminModal>
      )}
    </>
  );
}
