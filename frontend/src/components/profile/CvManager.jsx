import { useEffect, useRef, useState } from "react";

const MAX_CV_SIZE = 5 * 1024 * 1024;

async function requestJson(url, options = {}) {
  const response = await fetch(url, {
    credentials: "same-origin",
    ...options,
  });
  const data = response.status === 204 ? null : await response.json();

  if (!response.ok) {
    const message = data?.message || "La demande a échoué.";
    throw new Error(response.status === 401 ? "Ta session a expiré. Reconnecte-toi." : message);
  }

  return data;
}

function formatFileSize(sizeBytes) {
  return `${(sizeBytes / (1024 * 1024)).toLocaleString("fr-FR", { maximumFractionDigits: 1 })} Mo`;
}

function formatDate(date) {
  return new Date(date).toLocaleDateString("fr-FR");
}

function CvManager() {
  const [cvDocuments, setCvDocuments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const fileInput = useRef(null);

  useEffect(() => {
    let isMounted = true;

    requestJson("/api/cv-documents")
      .then((documents) => {
        if (isMounted) setCvDocuments(documents);
      })
      .catch((requestError) => {
        if (isMounted) setError(requestError.message);
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  async function saveCv(event) {
    event.preventDefault();
    const file = fileInput.current?.files?.[0];

    if (!file) {
      setError("Choisis le fichier PDF à ajouter.");
      setSuccess("");
      return;
    }
    if (file.size > MAX_CV_SIZE) {
      setError("Le CV ne peut pas dépasser 5 Mo.");
      setSuccess("");
      return;
    }

    setIsSaving(true);
    setError("");
    setSuccess("");

    try {
      const form = new FormData();
      form.append("file", file);
      await requestJson("/api/cv-documents", {
        method: "POST",
        body: form,
      });

      const documents = await requestJson("/api/cv-documents");
      setCvDocuments(documents);
      fileInput.current.value = "";
      setSuccess("Ce CV a été ajouté à ta bibliothèque.");
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setIsSaving(false);
    }
  }

  async function chooseDefaultCv(id) {
    setIsUpdating(true);
    setError("");
    setSuccess("");

    try {
      await requestJson(`/api/cv-documents/${id}/current`, { method: "PUT" });
      setCvDocuments((documents) => documents.map((document) => ({
        ...document,
        is_current: document.id === id,
      })));
      setSuccess("Ce CV est maintenant ton CV par défaut.");
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setIsUpdating(false);
    }
  }

  async function clearDefaultCv() {
    setIsUpdating(true);
    setError("");
    setSuccess("");

    try {
      await requestJson("/api/cv-documents/current", { method: "DELETE" });
      setCvDocuments((documents) => documents.map((document) => ({
        ...document,
        is_current: false,
      })));
      setSuccess("Tu n’as plus de CV par défaut. Tes fichiers restent disponibles pour tes candidatures.");
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setIsUpdating(false);
    }
  }

  return (
    <section className="profile-section profile-library" aria-labelledby="profile-cv-title" aria-busy={isLoading || isSaving || isUpdating}>
      <div className="profile-section-heading">
        <div>
          <h2 id="profile-cv-title">Mes CV</h2>
          <p>Ajoute plusieurs CV et choisis celui qui correspond le mieux à chaque candidature.</p>
        </div>
      </div>

      {error && (
        <p className="form-error" role="alert">
          {error}{error === "Ta session a expiré. Reconnecte-toi." && <> <a href="/login">Se reconnecter</a></>}
        </p>
      )}
      {success && <p className="form-success" role="status">{success}</p>}
      {isLoading && <p role="status">Chargement de tes CV…</p>}

      {!isLoading && cvDocuments.length === 0 && !error && (
        <div className="profile-empty-state">
          <img src="/illustrations/profile-cv-zebra.webp" alt="" aria-hidden="true" />
          <p className="profile-empty">Tu n’as pas encore ajouté de CV.</p>
        </div>
      )}

      {!isLoading && cvDocuments.length > 0 && (
        <div className="profile-record-list">
          {cvDocuments.map((document) => (
            <article className="profile-record" key={document.id}>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h3>{document.original_name}</h3>
                  {document.is_current && <span className="profile-role">CV par défaut</span>}
                </div>
                <p className="profile-record-dates">
                  PDF · {formatFileSize(document.size_bytes)} · Ajouté le {formatDate(document.created_at)}
                </p>
              </div>
              <div className="profile-record-actions">
                <a className="secondary-button inline-flex items-center justify-center no-underline" href={document.file_url} target="_blank" rel="noreferrer">
                  Consulter
                </a>
                {!document.is_current && (
                  <button className="secondary-button" type="button" onClick={() => chooseDefaultCv(document.id)} disabled={isUpdating || isSaving}>
                    Définir par défaut
                  </button>
                )}
              </div>
            </article>
          ))}
        </div>
      )}

      <form className="form-stack" onSubmit={saveCv}>
        <label className="form-field" htmlFor="candidate-cv-file">
          Ajouter un autre CV PDF
          <input
            ref={fileInput}
            id="candidate-cv-file"
            className="form-input"
            type="file"
            accept=".pdf,application/pdf"
            onChange={() => {
              setError("");
              setSuccess("");
            }}
            disabled={isLoading || isSaving || isUpdating}
            aria-describedby="candidate-cv-help"
          />
        </label>
        <p id="candidate-cv-help" className="text-sm text-ink/75">PDF uniquement, 5 Mo maximum. Les CV déjà ajoutés restent dans ta bibliothèque.</p>
        <div className="profile-actions">
          <button className="primary-button" type="submit" disabled={isLoading || isSaving || isUpdating}>
            {isSaving ? "Ajout en cours…" : "Ajouter ce CV"}
          </button>
          {cvDocuments.some((document) => document.is_current) && (
            <button className="secondary-button" type="button" onClick={clearDefaultCv} disabled={isSaving || isUpdating}>
              Retirer le CV par défaut
            </button>
          )}
        </div>
      </form>
    </section>
  );
}

export default CvManager;
