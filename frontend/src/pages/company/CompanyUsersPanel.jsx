import { useEffect, useState } from "react";
import Modal from "../../components/ui/Modal";
import Pagination from "../../components/ui/Pagination";
import { adminRequest } from "../../services/adminApi";

const EMPTY_FORM = { first_name: "", last_name: "", email: "", phone: "", password: "" };

function endpoint(path, companyId, adminView) {
  if (!adminView) return path;
  const separator = path.includes("?") ? "&" : "?";
  return `${path}${separator}company_id=${encodeURIComponent(companyId)}`;
}

export default function CompanyUsersPanel({ companyId, adminView }) {
  const [users, setUsers] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [form, setForm] = useState(EMPTY_FORM);
  const [editing, setEditing] = useState(null);
  const [creating, setCreating] = useState(false);
  const [deleting, setDeleting] = useState(null);
  const [credentials, setCredentials] = useState(null);
  const [credentialsFeedback, setCredentialsFeedback] = useState("");
  const [query, setQuery] = useState("");
  const [pending, setPending] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [feedback, setFeedback] = useState("");
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    const params = new URLSearchParams({ page: String(page), page_size: "20" });
    if (query.trim()) params.set("q", query.trim());
    adminRequest(endpoint(`/api/company/users?${params}`, companyId, adminView), { signal: controller.signal })
      .then((result) => {
        setUsers(result.items || []);
        setTotal(result.total || 0);
        setTotalPages(result.total_pages || 0);
        setError("");
      })
      .catch((requestError) => {
        if (requestError.name !== "AbortError") setError(requestError.message);
      })
      .finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, [companyId, adminView, query, page, reloadKey]);

  function resetForm() {
    setEditing(null);
    setCreating(false);
    setForm(EMPTY_FORM);
  }

  async function saveUser(event) {
    event.preventDefault();
    setPending(true);
    setLoading(true);
    setError("");
    setFeedback("");
    try {
      const editableFields = { ...form };
      delete editableFields.password;
      const body = { ...(editing ? editableFields : form), phone: form.phone.trim() || null };
      const path = editing
        ? endpoint(`/api/company/users/${editing.id}`, companyId, adminView)
        : endpoint("/api/company/users", companyId, adminView);
      const user = await adminRequest(path, { method: editing ? "PATCH" : "POST", body });
      if (editing) {
        setFeedback("Le compte employé a été mis à jour.");
      } else {
        setCredentials({ email: user.email, password: form.password, name: `${user.first_name} ${user.last_name}` });
        setFeedback("Le compte employé a été créé.");
      }
      setReloadKey((key) => key + 1);
      resetForm();
    } catch (requestError) {
      setError(requestError.message);
      setLoading(false);
    } finally {
      setPending(false);
    }
  }

  async function removeUser() {
    setPending(true);
    setLoading(true);
    setError("");
    try {
      await adminRequest(endpoint(`/api/company/users/${deleting.id}`, companyId, adminView), { method: "DELETE" });
      setDeleting(null);
      setFeedback("Le compte employé a été supprimé.");
      setReloadKey((key) => key + 1);
    } catch (requestError) {
      setError(requestError.message);
      setLoading(false);
    } finally {
      setPending(false);
    }
  }

  async function copyCredentials() {
    try {
      await navigator.clipboard.writeText(`E-mail : ${credentials.email}\nMot de passe initial : ${credentials.password}`);
      setCredentialsFeedback("Identifiants copiés.");
    } catch {
      setCredentialsFeedback("La copie automatique a échoué. Sélectionne les identifiants affichés.");
    }
  }

  return (
    <section className="grid gap-5" aria-labelledby="company-users-title">
      <div className="company-list-toolbar">
        <div>
          <h2 id="company-users-title" className="text-2xl font-bold">Utilisateurs de l’entreprise</h2>
          <p>{total} compte{total !== 1 ? "s" : ""} employé{total !== 1 ? "s" : ""}</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <label className="grid gap-1 text-sm">Rechercher un employé
            <input className="rounded border border-ink bg-white p-2" type="search" value={query} onChange={(event) => { setLoading(true); setQuery(event.target.value); setPage(1); }} placeholder="Nom ou e-mail" />
          </label>
          <button className="button button-primary self-end" type="button" onClick={() => { resetForm(); setError(""); setCreating(true); }}>Créer un compte employé</button>
        </div>
      </div>
      {feedback && <p className="form-success" role="status">{feedback}</p>}
      {error && <p className="form-error" role="alert">{error}</p>}
      {loading ? <p role="status">Chargement des comptes…</p> : users.length === 0 ? (
        <p className="rounded border border-ink bg-white/60 p-6">Aucun compte employé pour cette entreprise.</p>
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {users.map((user) => (
            <article key={user.id} className="rounded border border-ink bg-white/60 p-5">
              <h3 className="text-xl font-bold">{user.first_name} {user.last_name}</h3>
              <a className="underline" href={`mailto:${user.email}`}>{user.email}</a>
              <p className="mt-1">{user.phone || "Téléphone non renseigné"}</p>
              <div className="mt-4 flex flex-wrap gap-4">
                <button className="underline" type="button" onClick={() => { setEditing(user); setForm({ first_name: user.first_name, last_name: user.last_name, email: user.email, phone: user.phone || "", password: "" }); }}>Modifier</button>
                <button className="underline" type="button" disabled={pending} onClick={() => setDeleting(user)}>Supprimer</button>
              </div>
            </article>
          ))}
        </div>
      )}
      {!loading && totalPages > 1 && <Pagination page={page} totalPages={totalPages} total={total} onPageChange={(nextPage) => { setLoading(true); setPage(nextPage); }} />}
      {creating && !editing && (
        <Modal title="Créer un compte employé" description="Le compte sera rattaché à cette entreprise." onClose={() => { if (!pending) resetForm(); }}>
          <EmployeeForm form={form} pending={pending} error={error} onChange={(event) => setForm((current) => ({ ...current, [event.target.name]: event.target.value }))} onSubmit={saveUser} onCancel={resetForm} creating />
        </Modal>
      )}
      {editing && (
        <Modal title="Modifier un compte employé" description="Les changements concernent uniquement ce compte d’entreprise." onClose={() => { if (!pending) resetForm(); }}>
          <EmployeeForm form={form} pending={pending} error={error} onChange={(event) => setForm((current) => ({ ...current, [event.target.name]: event.target.value }))} onSubmit={saveUser} onCancel={resetForm} />
        </Modal>
      )}
      {deleting && (
        <Modal title="Supprimer ce compte employé ?" description={`Le compte de ${deleting.first_name} ${deleting.last_name} sera supprimé.`} onClose={() => { if (!pending) setDeleting(null); }}>
          <div className="flex flex-wrap gap-3 p-5">
            <button className="button button-primary" type="button" disabled={pending} onClick={removeUser}>{pending ? "Suppression…" : "Confirmer la suppression"}</button>
            <button className="button button-secondary" type="button" disabled={pending} onClick={() => setDeleting(null)}>Annuler</button>
          </div>
        </Modal>
      )}
      {credentials && (
        <Modal title="Compte employé créé" description="Copie les identifiants et transmets-les à l’employé. Le mot de passe ne sera plus affiché après fermeture." onClose={() => { setCredentials(null); setCredentialsFeedback(""); }}>
          <div className="grid gap-3 p-5">
            <p><strong>Compte :</strong> {credentials.name}</p>
            <p><strong>E-mail :</strong> <code>{credentials.email}</code></p>
            <p><strong>Mot de passe initial :</strong> <code>{credentials.password}</code></p>
            {credentialsFeedback && <p role="status">{credentialsFeedback}</p>}
            <button className="button button-primary w-fit" type="button" onClick={copyCredentials}>Copier les identifiants</button>
          </div>
        </Modal>
      )}
    </section>
  );
}

function EmployeeForm({ form, pending, error, onChange, onSubmit, onCancel, creating = false }) {
  return (
    <form className="grid gap-4 p-5 sm:grid-cols-2" onSubmit={onSubmit}>
      {[["first_name", "Prénom", 100], ["last_name", "Nom", 100], ["email", "E-mail", 255], ["phone", "Téléphone", 30]].map(([name, label, maxLength]) => (
        <label className="grid gap-2" key={name}>{label}{name === "email" ? (
          <input type="email" name={name} maxLength={maxLength} value={form[name]} onChange={onChange} required />
        ) : <input type={name === "phone" ? "tel" : "text"} name={name} maxLength={maxLength} value={form[name]} onChange={onChange} required={name !== "phone"} />}</label>
      ))}
      {creating && <label className="grid gap-2 sm:col-span-2">Mot de passe initial
        <input type="password" name="password" autoComplete="new-password" minLength={8} value={form.password} onChange={onChange} required />
        <span className="text-sm">Au moins 8 caractères. Il sera affiché une seule fois après la création.</span>
      </label>}
      {error && <p className="form-error sm:col-span-2" role="alert">{error}</p>}
      <div className="flex flex-wrap gap-3 sm:col-span-2">
        <button className="button button-primary" type="submit" disabled={pending}>{pending ? "Enregistrement…" : creating ? "Créer le compte" : "Enregistrer"}</button>
        <button className="button button-secondary" type="button" disabled={pending} onClick={onCancel}>Annuler</button>
      </div>
    </form>
  );
}
