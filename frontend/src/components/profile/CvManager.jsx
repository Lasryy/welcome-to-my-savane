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

function CvManager() {
  const [currentCv, setCurrentCv] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isRemoving, setIsRemoving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const fileInput = useRef(null);

  useEffect(() => {
    let isMounted = true;

    requestJson("/api/cv-documents/current")
      .then((cv) => {
        if (isMounted) setCurrentCv(cv);
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
      setError("Choisis le fichier PDF à déposer.");
      setSuccess("");
      return;
    }
    if (file.size > MAX_CV_SIZE) {
      setError("Le CV ne peut pas dépasser 5 Mo.");
      setSuccess("");
      return;
    }
    if (currentCv && !window.confirm("Remplacer ton CV actuel ? Son ancienne version sera conservée.")) {
      return;
    }

    setIsSaving(true);
    setError("");
    setSuccess("");
    try {
      const form = new FormData();
      form.append("file", file);
      const savedCv = await requestJson("/api/cv-documents", {
        method: "POST",
        body: form,
      });
      setCurrentCv(savedCv);
      fileInput.current.value = "";
      setSuccess(currentCv ? "Ton CV a été remplacé." : "Ton CV a été enregistré.");
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setIsSaving(false);
    }
  }

  async function removeCv() {
    if (!window.confirm("Retirer le CV actuel de ton profil ? Le fichier est conservé.")) return;

    setIsRemoving(true);
    setError("");
    setSuccess("");
    try {
      await requestJson("/api/cv-documents/current", { method: "DELETE" });
      setCurrentCv(null);
      setSuccess("Ton CV a été retiré de ton profil.");
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setIsRemoving(false);
    }
  }

  return (
    <section className="profile-section" aria-labelledby="profile-cv-title" aria-busy={isLoading || isSaving || isRemoving}>
      <div className="profile-section-heading">
        <div>
          <h2 id="profile-cv-title">Mon CV</h2>
          <p>Dépose un PDF pour le garder à portée de tes candidatures. Tu peux le remplacer ou le retirer à tout moment.</p>
        </div>
      </div>

      {error && (
        <p className="form-error" role="alert">
          {error}{error === "Ta session a expiré. Reconnecte-toi." && <> <a href="/login">Se reconnecter</a></>}
        </p>
      )}
      {success && <p className="form-success" role="status">{success}</p>}
      {isLoading && <p role="status">Chargement du CV…</p>}

      {!isLoading && currentCv && (
        <article className="profile-record">
          <div>
            <h3>{currentCv.original_name}</h3>
            <p className="profile-record-dates">
              PDF · {(currentCv.size_bytes / (1024 * 1024)).toLocaleString("fr-FR", { maximumFractionDigits: 1 })} Mo
            </p>
            <p className="profile-record-dates">Déposé le {new Date(currentCv.created_at).toLocaleDateString("fr-FR")}</p>
          </div>
          <div className="profile-record-actions">
            <a className="secondary-button inline-flex items-center justify-center no-underline" href={currentCv.file_url} target="_blank" rel="noreferrer">
              Consulter
            </a>
            <button className="secondary-button" type="button" onClick={removeCv} disabled={isRemoving || isSaving}>
              {isRemoving ? "Retrait…" : "Retirer"}
            </button>
          </div>
        </article>
      )}

      {!isLoading && !currentCv && !error && (
        <p className="profile-empty">Tu n’as pas encore déposé de CV.</p>
      )}

      <form className="form-stack" onSubmit={saveCv}>
        <label className="form-field" htmlFor="candidate-cv-file">
          {currentCv ? "Choisir un nouveau CV" : "Choisir un CV PDF"}
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
            disabled={isLoading || isSaving || isRemoving}
            aria-describedby="candidate-cv-help"
          />
        </label>
        <p id="candidate-cv-help" className="text-sm text-ink/75">PDF uniquement, 5 Mo maximum.</p>
        <button className="primary-button" type="submit" disabled={isLoading || isSaving || isRemoving}>
          {isSaving ? "Enregistrement…" : currentCv ? "Remplacer mon CV" : "Déposer mon CV"}
        </button>
      </form>
    </section>
  );
}

export default CvManager;
