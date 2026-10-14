import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import AuthLayout from "./AuthLayout";
import CvManager from "../../components/profile/CvManager";

const emptyProject = {
  title: "",
  description: "",
  project_url: "",
  repository_url: "",
};

const emptyExperience = {
  company_name: "",
  job_title: "",
  description: "",
  start_date: "",
  end_date: "",
};

async function requestJson(url, options = {}) {
  const response = await fetch(url, {
    credentials: "same-origin",
    ...options,
    headers: {
      ...(options.body ? { "Content-Type": "application/json" } : {}),
      ...options.headers,
    },
  });
  const data = response.status === 204 ? null : await response.json();

  if (!response.ok) {
    const error = new Error(data?.message || data?.error || "La demande a échoué.");
    error.status = response.status;
    throw error;
  }

  return data;
}

function FormField({ label, name, value, onChange, type = "text", required = false, ...props }) {
  return (
    <label className="form-field">
      {label}
      <input
        className="form-input"
        name={name}
        type={type}
        value={value ?? ""}
        onChange={onChange}
        required={required}
        {...props}
      />
    </label>
  );
}

function TextAreaField({ label, name, value, onChange }) {
  return (
    <label className="form-field">
      {label}
      <textarea
        className="form-input min-h-24 resize-y"
        name={name}
        value={value ?? ""}
        onChange={onChange}
        maxLength={5000}
      />
    </label>
  );
}

function ProfilePage() {
  const [user, setUser] = useState(null);
  const [projects, setProjects] = useState([]);
  const [experiences, setExperiences] = useState([]);
  const [profileForm, setProfileForm] = useState(null);
  const [projectForm, setProjectForm] = useState(emptyProject);
  const [experienceForm, setExperienceForm] = useState(emptyExperience);
  const [editingProjectId, setEditingProjectId] = useState(null);
  const [editingExperienceId, setEditingExperienceId] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [saving, setSaving] = useState("");
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    async function loadProfile() {
      try {
        const [account, myProjects, myExperiences] = await Promise.all([
          requestJson("/api/people/me"),
          requestJson("/api/projects"),
          requestJson("/api/experiences"),
        ]);
        setUser(account);
        setProfileForm({
          first_name: account.first_name,
          last_name: account.last_name,
          email: account.email,
          phone: account.phone ?? "",
        });
        setProjects(myProjects);
        setExperiences(myExperiences);
      } catch (requestError) {
        if (requestError.status === 401) {
          navigate("/login", { replace: true });
          return;
        }
        console.error("Error while loading candidate profile:", requestError);
        setError(requestError.message || "Impossible de charger le profil.");
      } finally {
        setIsLoading(false);
      }
    }

    loadProfile();
  }, [navigate]);

  function updateForm(setForm, event) {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  }

  function showRequestError(requestError) {
    if (requestError.status === 401) {
      navigate("/login", { replace: true });
      return;
    }
    setError(requestError.message || "La demande a échoué.");
    setSuccess("");
  }

  async function saveProfile(event) {
    event.preventDefault();
    setError("");
    setSuccess("");
    setSaving("profile");
    try {
      const updatedUser = await requestJson("/api/people/me", {
        method: "PATCH",
        body: JSON.stringify(profileForm),
      });
      setUser(updatedUser);
      setSuccess("Tes informations ont été enregistrées.");
    } catch (requestError) {
      showRequestError(requestError);
    } finally {
      setSaving("");
    }
  }

  async function saveProject(event) {
    event.preventDefault();
    setError("");
    setSuccess("");
    setSaving("project");
    const isEditing = editingProjectId !== null;
    try {
      const project = await requestJson(
        isEditing ? `/api/projects/${editingProjectId}` : "/api/projects",
        {
          method: isEditing ? "PATCH" : "POST",
          body: JSON.stringify(projectForm),
        },
      );
      setProjects((current) =>
        isEditing
          ? current.map((item) => (item.id === project.id ? project : item))
          : [project, ...current],
      );
      cancelProjectEdit();
      setSuccess(isEditing ? "Projet modifié." : "Projet ajouté.");
    } catch (requestError) {
      showRequestError(requestError);
    } finally {
      setSaving("");
    }
  }

  async function deleteProject(project) {
    if (!window.confirm(`Supprimer le projet « ${project.title} » ?`)) return;
    setError("");
    setSuccess("");
    setSaving(`delete-project-${project.id}`);
    try {
      await requestJson(`/api/projects/${project.id}`, { method: "DELETE" });
      setProjects((current) => current.filter((item) => item.id !== project.id));
      setSuccess("Projet supprimé.");
    } catch (requestError) {
      showRequestError(requestError);
    } finally {
      setSaving("");
    }
  }

  function editProject(project) {
    setEditingProjectId(project.id);
    setProjectForm({
      title: project.title ?? "",
      description: project.description ?? "",
      project_url: project.project_url ?? "",
      repository_url: project.repository_url ?? "",
    });
    setError("");
    setSuccess("");
  }

  function cancelProjectEdit() {
    setEditingProjectId(null);
    setProjectForm(emptyProject);
  }

  async function saveExperience(event) {
    event.preventDefault();
    setError("");
    setSuccess("");
    setSaving("experience");
    const isEditing = editingExperienceId !== null;
    try {
      const experience = await requestJson(
        isEditing ? `/api/experiences/${editingExperienceId}` : "/api/experiences",
        {
          method: isEditing ? "PATCH" : "POST",
          body: JSON.stringify({
            ...experienceForm,
            start_date: experienceForm.start_date || null,
            end_date: experienceForm.end_date || null,
          }),
        },
      );
      setExperiences((current) =>
        isEditing
          ? current.map((item) => (item.id === experience.id ? experience : item))
          : [experience, ...current],
      );
      cancelExperienceEdit();
      setSuccess(isEditing ? "Expérience modifiée." : "Expérience ajoutée.");
    } catch (requestError) {
      showRequestError(requestError);
    } finally {
      setSaving("");
    }
  }

  async function deleteExperience(experience) {
    if (!window.confirm(`Supprimer l’expérience chez « ${experience.company_name} » ?`)) return;
    setError("");
    setSuccess("");
    setSaving(`delete-experience-${experience.id}`);
    try {
      await requestJson(`/api/experiences/${experience.id}`, { method: "DELETE" });
      setExperiences((current) => current.filter((item) => item.id !== experience.id));
      setSuccess("Expérience supprimée.");
    } catch (requestError) {
      showRequestError(requestError);
    } finally {
      setSaving("");
    }
  }

  function editExperience(experience) {
    setEditingExperienceId(experience.id);
    setExperienceForm({
      company_name: experience.company_name ?? "",
      job_title: experience.job_title ?? "",
      description: experience.description ?? "",
      start_date: experience.start_date ? String(experience.start_date).slice(0, 10) : "",
      end_date: experience.end_date ? String(experience.end_date).slice(0, 10) : "",
    });
    setError("");
    setSuccess("");
  }

  function cancelExperienceEdit() {
    setEditingExperienceId(null);
    setExperienceForm(emptyExperience);
  }

  async function handleLogout() {
    setError("");
    setIsLoggingOut(true);
    try {
      await requestJson("/api/auth/logout", { method: "POST" });
      navigate("/login", { replace: true });
    } catch (requestError) {
      showRequestError(requestError);
    } finally {
      setIsLoggingOut(false);
    }
  }

  return (
    <AuthLayout
      wide
      title={user ? `Bonjour ${user.first_name}.` : "Mon profil."}
      description="Gère tes informations, ton CV, tes projets et tes expériences professionnelles."
    >
      {isLoading && <p role="status">Chargement du profil…</p>}
      {error && <p className="form-error mb-5" role="alert">{error}</p>}
      {success && <p className="form-success mb-5" role="status">{success}</p>}

      {profileForm && (
        <div className="grid gap-8">
          <section className="profile-section" aria-labelledby="profile-account-title">
            <div className="profile-section-heading">
              <div>
                <h2 id="profile-account-title">Mes informations</h2>
                <p>Ces informations servent à te contacter au sujet de tes candidatures.</p>
              </div>
              <span className="profile-role">Rôle : {user.role}</span>
            </div>
            <form className="form-stack sm:grid-cols-2" onSubmit={saveProfile}>
              <FormField label="Prénom" name="first_name" value={profileForm.first_name} onChange={(event) => updateForm(setProfileForm, event)} required maxLength={100} />
              <FormField label="Nom" name="last_name" value={profileForm.last_name} onChange={(event) => updateForm(setProfileForm, event)} required maxLength={100} />
              <FormField label="Adresse e-mail" name="email" type="email" value={profileForm.email} onChange={(event) => updateForm(setProfileForm, event)} required maxLength={255} />
              <FormField label="Téléphone" name="phone" type="tel" value={profileForm.phone} onChange={(event) => updateForm(setProfileForm, event)} maxLength={30} />
              <button className="primary-button sm:col-span-2" type="submit" disabled={saving === "profile"}>
                {saving === "profile" ? "Enregistrement…" : "Enregistrer mes informations"}
              </button>
            </form>
          </section>

          <CvManager />

          <section className="profile-section" aria-labelledby="profile-projects-title">
            <div className="profile-section-heading">
              <div>
                <h2 id="profile-projects-title">Mes projets</h2>
                <p>Ajoute des réalisations que tu pourras présenter aux recruteurs.</p>
              </div>
            </div>
            <form className="form-stack" onSubmit={saveProject}>
              <FormField label="Titre du projet" name="title" value={projectForm.title} onChange={(event) => updateForm(setProjectForm, event)} required maxLength={200} />
              <TextAreaField label="Description" name="description" value={projectForm.description} onChange={(event) => updateForm(setProjectForm, event)} />
              <div className="grid gap-4 sm:grid-cols-2">
                <FormField label="Lien du projet" name="project_url" type="url" value={projectForm.project_url} onChange={(event) => updateForm(setProjectForm, event)} maxLength={500} />
                <FormField label="Lien du dépôt de code" name="repository_url" type="url" value={projectForm.repository_url} onChange={(event) => updateForm(setProjectForm, event)} maxLength={500} />
              </div>
              <div className="profile-actions">
                <button className="primary-button" type="submit" disabled={saving === "project"}>
                  {saving === "project" ? "Enregistrement…" : editingProjectId ? "Enregistrer les modifications" : "Ajouter le projet"}
                </button>
                {editingProjectId && <button className="secondary-button" type="button" onClick={cancelProjectEdit}>Annuler</button>}
              </div>
            </form>
            <div className="profile-record-list">
              {projects.length === 0 && <p className="profile-empty">Tu n’as pas encore ajouté de projet.</p>}
              {projects.map((project) => (
                <article className="profile-record" key={project.id}>
                  <div>
                    <h3>{project.title}</h3>
                    {project.description && <p>{project.description}</p>}
                    <div className="profile-record-links">
                      {project.project_url && <a href={project.project_url} target="_blank" rel="noreferrer">Voir le projet</a>}
                      {project.repository_url && <a href={project.repository_url} target="_blank" rel="noreferrer">Voir le code</a>}
                    </div>
                  </div>
                  <div className="profile-record-actions">
                    <button className="secondary-button" type="button" onClick={() => editProject(project)}>Modifier</button>
                    <button className="secondary-button" type="button" onClick={() => deleteProject(project)} disabled={saving === `delete-project-${project.id}`}>Supprimer</button>
                  </div>
                </article>
              ))}
            </div>
          </section>

          <section className="profile-section" aria-labelledby="profile-experiences-title">
            <div className="profile-section-heading">
              <div>
                <h2 id="profile-experiences-title">Mes expériences</h2>
                <p>Renseigne tes emplois, stages ou formations en entreprise.</p>
              </div>
            </div>
            <form className="form-stack" onSubmit={saveExperience}>
              <div className="grid gap-4 sm:grid-cols-2">
                <FormField label="Entreprise" name="company_name" value={experienceForm.company_name} onChange={(event) => updateForm(setExperienceForm, event)} required maxLength={200} />
                <FormField label="Poste occupé" name="job_title" value={experienceForm.job_title} onChange={(event) => updateForm(setExperienceForm, event)} required maxLength={200} />
              </div>
              <TextAreaField label="Description" name="description" value={experienceForm.description} onChange={(event) => updateForm(setExperienceForm, event)} />
              <div className="grid gap-4 sm:grid-cols-2">
                <FormField label="Date de début" name="start_date" type="date" value={experienceForm.start_date} onChange={(event) => updateForm(setExperienceForm, event)} />
                <FormField label="Date de fin" name="end_date" type="date" value={experienceForm.end_date} onChange={(event) => updateForm(setExperienceForm, event)} />
              </div>
              <div className="profile-actions">
                <button className="primary-button" type="submit" disabled={saving === "experience"}>
                  {saving === "experience" ? "Enregistrement…" : editingExperienceId ? "Enregistrer les modifications" : "Ajouter l’expérience"}
                </button>
                {editingExperienceId && <button className="secondary-button" type="button" onClick={cancelExperienceEdit}>Annuler</button>}
              </div>
            </form>
            <div className="profile-record-list">
              {experiences.length === 0 && <p className="profile-empty">Tu n’as pas encore ajouté d’expérience.</p>}
              {experiences.map((experience) => (
                <article className="profile-record" key={experience.id}>
                  <div>
                    <h3>{experience.job_title} — {experience.company_name}</h3>
                    <p className="profile-record-dates">
                      {experience.start_date ? String(experience.start_date).slice(0, 10) : "Date de début non renseignée"}
                      {" → "}
                      {experience.end_date ? String(experience.end_date).slice(0, 10) : "En cours"}
                    </p>
                    {experience.description && <p>{experience.description}</p>}
                  </div>
                  <div className="profile-record-actions">
                    <button className="secondary-button" type="button" onClick={() => editExperience(experience)}>Modifier</button>
                    <button className="secondary-button" type="button" onClick={() => deleteExperience(experience)} disabled={saving === `delete-experience-${experience.id}`}>Supprimer</button>
                  </div>
                </article>
              ))}
            </div>
          </section>

          <button className="secondary-button w-full" type="button" onClick={handleLogout} disabled={isLoggingOut}>
            {isLoggingOut ? "Déconnexion…" : "Se déconnecter"}
          </button>
        </div>
      )}
    </AuthLayout>
  );
}

export default ProfilePage;
