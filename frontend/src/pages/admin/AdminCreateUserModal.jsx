import { useRef, useState } from "react";
import {
  AdminFeedback,
  AdminField,
  AdminModal,
} from "../../components/admin/adminUi";
import { adminRequest } from "../../services/adminApi";
import { generateSecurePassword } from "../../utils/securePassword";
import CustomSelect from "../../components/CustomSelect";

const EMPTY_FORM = {
  first_name: "",
  last_name: "",
  email: "",
  phone: "",
  role: "COMPANY",
  company_id: "",
  password: "",
};

export default function AdminCreateUserModal({
  companies,
  initialCompanyId = "",
  onClose,
  onCreated,
}) {
  const companyScoped = initialCompanyId !== "";
  const [form, setForm] = useState({
    ...EMPTY_FORM,
    company_id: initialCompanyId ? String(initialCompanyId) : "",
  });
  const [pending, setPending] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [credentials, setCredentials] = useState(null);
  const [copyMessage, setCopyMessage] = useState("");
  const lastGeneratedPassword = useRef("");

  function fillGeneratedPassword() {
    const password = generateSecurePassword(lastGeneratedPassword.current);
    lastGeneratedPassword.current = password;
    setForm((current) => ({ ...current, password }));
  }

  function updateField(event) {
    const { name, value } = event.target;
    setForm((current) => ({
      ...current,
      [name]: value,
      ...(name === "role" && value !== "COMPANY" ? { company_id: "" } : {}),
    }));
  }

  async function createUser(event) {
    event.preventDefault();
    setPending(true);
    setFeedback(null);
    try {
      const created = await adminRequest("/api/admin/users", {
        method: "POST",
        body: {
          ...form,
          phone: form.phone.trim() || null,
          company_id: form.role === "COMPANY" ? Number(form.company_id) : null,
        },
      });
      const createdAccount = {
        first_name: created.first_name,
        last_name: created.last_name,
        email: created.email,
        password: form.password,
      };
      onCreated?.(created);
      setCredentials(createdAccount);
    } catch (error) {
      setFeedback({ type: "error", message: error.message });
    } finally {
      setPending(false);
    }
  }

  async function copyCredentials() {
    if (!credentials) return;
    try {
      await navigator.clipboard.writeText(
        `E-mail : ${credentials.email}\nMot de passe initial : ${credentials.password}`,
      );
      setCopyMessage("Identifiants copiés.");
    } catch {
      setCopyMessage(
        "La copie automatique a échoué. Sélectionne les identifiants ci-dessous.",
      );
    }
  }

  if (credentials) {
    return (
      <AdminModal
        title="Compte créé"
        description="Copie et transmets ces identifiants. Le mot de passe ne sera plus affiché après fermeture."
        onClose={() => onClose?.()}
      >
        <div className="grid gap-3 p-5">
          <p><strong>Compte :</strong> {credentials.first_name} {credentials.last_name}</p>
          <p><strong>E-mail :</strong> <code>{credentials.email}</code></p>
          <p><strong>Mot de passe initial :</strong> <code>{credentials.password}</code></p>
          {copyMessage && <p role="status">{copyMessage}</p>}
          <div className="admin-actions flex flex-wrap gap-3">
            <button className="admin-button accent px-5 py-3 text-[13px] font-bold" type="button" onClick={copyCredentials}>Copier les identifiants</button>
            <button className="admin-button secondary px-5 py-3 text-[13px] font-bold" type="button" onClick={() => onClose?.()}>Fermer</button>
          </div>
        </div>
      </AdminModal>
    );
  }

  return (
    <AdminModal
      title="Créer un compte"
      description="Crée un compte candidat, employé d’entreprise ou administrateur."
      onClose={() => { if (!pending) onClose?.(); }}
    >
      <AdminFeedback feedback={feedback} />
      <form className="admin-form grid gap-5 p-[20px] sm:grid-cols-2" onSubmit={createUser}>
        <AdminField label="Prénom *" name="new-user-first-name">
          <input id="new-user-first-name" name="first_name" value={form.first_name} onChange={updateField} required maxLength={100} />
        </AdminField>
        <AdminField label="Nom *" name="new-user-last-name">
          <input id="new-user-last-name" name="last_name" value={form.last_name} onChange={updateField} required maxLength={100} />
        </AdminField>
        <AdminField label="E-mail *" name="new-user-email">
          <input id="new-user-email" name="email" type="email" value={form.email} onChange={updateField} required maxLength={255} />
        </AdminField>
        <AdminField label="Téléphone" name="new-user-phone">
          <input id="new-user-phone" name="phone" type="tel" value={form.phone} onChange={updateField} maxLength={30} />
        </AdminField>
        <AdminField label="Rôle *" name="new-user-role">
          <CustomSelect id="new-user-role" value={form.role} onChange={(value) => updateField({ target: { name: "role", value } })} disabled={companyScoped} options={[{ value: "COMPANY", label: "Employé d’entreprise" }, { value: "USER", label: "Candidat" }, { value: "ADMIN", label: "Administrateur" }]} />
        </AdminField>
        <AdminField
          label={form.role === "COMPANY" ? "Entreprise *" : "Entreprise"}
          name="new-user-company"
          helpClassName="min-h-[36px]"
          help="Sélectionne une entreprise pour les comptes employés."
        >
          <CustomSelect id="new-user-company" value={form.company_id} onChange={(value) => updateField({ target: { name: "company_id", value } })} required={form.role === "COMPANY"} disabled={companyScoped || form.role !== "COMPANY"} options={[{ value: "", label: companyScoped ? "Entreprise sélectionnée" : "Choisir une entreprise" }, ...companies.map((company) => ({ value: company.id, label: company.name }))]} />
        </AdminField>
        <AdminField label="Mot de passe initial *" name="new-user-password" help="Au moins 8 caractères. Il sera copiable après la création.">
          <div className="grid gap-2">
            <input id="new-user-password" name="password" type="password" autoComplete="new-password" value={form.password} onChange={updateField} minLength={8} required />
            <button className="admin-button secondary min-h-10 justify-center px-4 py-2 text-[13px] font-bold" type="button" onClick={fillGeneratedPassword}>
              Générer un mot de passe sécurisé
            </button>
          </div>
        </AdminField>
        <div className="admin-actions flex flex-wrap items-end gap-3">
          <button className="admin-button accent inline-flex min-h-10 items-center justify-center px-5 py-3 text-[13px] font-bold [border:1px_solid_var(--admin-ink)]" type="submit" disabled={pending}>
            {pending ? "Création…" : "Créer le compte"}
          </button>
          <button className="admin-button secondary inline-flex min-h-10 items-center justify-center px-5 py-3 text-[13px] font-bold [border:1px_solid_var(--admin-ink)]" type="button" onClick={() => onClose?.()} disabled={pending}>
            Annuler
          </button>
        </div>
      </form>
    </AdminModal>
  );
}
