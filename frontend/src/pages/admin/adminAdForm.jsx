import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link, useBeforeUnload, useBlocker, useNavigate } from "react-router-dom";
import CustomSelect from "../../components/CustomSelect";
import { AdminFeedback, AdminField, AdminModal } from "../../components/admin/adminUi";
import { adminRequest } from "../../services/adminApi";
import { contractLabels, workingTimeLabels } from "../../utils/adminUtils";

const contractOptions = Object.entries(contractLabels).map(([value, label]) => ({ value, label }));
const workOptions = Object.entries(workingTimeLabels).map(([value, label]) => ({ value, label }));

function emptyAd() {
  return {
    title: "", short_description: "", description: "", location: "", company_id: "", category_id: "",
    salary_min: "", salary_max: "", salary_period: "year", contract_type: "", working_time: "", status: "published",
  };
}

function formFromAd(ad) {
  const form = emptyAd();
  for (const field of Object.keys(form)) {
    form[field] = ad[field] ?? "";
  }
  return form;
}

function AdForm({ adId }) {
  const isEditing = adId !== undefined;
  const navigate = useNavigate();
  const [form, setForm] = useState(emptyAd);
  const [original, setOriginal] = useState("");
  const [companies, setCompanies] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(isEditing);
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  const [created, setCreated] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [showSaveChoices, setShowSaveChoices] = useState(false);
  const bypassBlockerRef = useRef(false);
  const createdRef = useRef(false);
  const isDirty = useMemo(() => Boolean(original) && JSON.stringify(form) !== original, [form, original]);
  const blocker = useBlocker(() => isDirty && !createdRef.current && !bypassBlockerRef.current);

  useBeforeUnload(useCallback((event) => {
    if (isDirty && !created) {
      event.preventDefault();
      event.returnValue = "";
    }
  }, [created, isDirty]));

  useEffect(() => {
    const controller = new AbortController();
    const requests = [
      adminRequest("/api/companies", { signal: controller.signal }),
      adminRequest("/api/categories", { signal: controller.signal }),
    ];
    if (isEditing) {
      requests.unshift(adminRequest(`/api/admin/ads/${encodeURIComponent(adId)}`, { signal: controller.signal }));
    }

    Promise.all(requests).then((results) => {
      let ad = null;
      if (isEditing) {
        ad = results.shift();
      }

      const [companyList, categoryList] = results;
      const companyListIsValid = Array.isArray(companyList);
      const categoryListIsValid = Array.isArray(categoryList);
      const adIsValid = !isEditing || (ad !== null && Boolean(ad.id));
      if (!companyListIsValid || !categoryListIsValid || !adIsValid) {
        throw new Error("Les données nécessaires au formulaire ne peuvent pas être affichées.");
      }
      if (controller.signal.aborted) {
        return;
      }

      let nextForm = emptyAd();
      if (ad) {
        nextForm = formFromAd(ad);
      }
      setForm(nextForm);
      setOriginal(JSON.stringify(nextForm));
      setCompanies(companyList);
      setCategories(categoryList);
      setError("");
    }).catch((requestError) => {
      if (!controller.signal.aborted) {
        setError(requestError.message);
      }
    }).finally(() => {
      if (!controller.signal.aborted) {
        setLoading(false);
      }
    });
    return () => controller.abort();
  }, [adId, isEditing]);

  function update(event) {
    setFeedback(null);
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
  }

  function updateSelect(name, value) {
    setFeedback(null);
    setForm((current) => ({ ...current, [name]: value }));
  }

  function toPayload() {
    const titleIsMissing = !form.title.trim();
    const descriptionIsMissing = !form.description.trim();
    const companyIsMissing = !form.company_id;
    if (titleIsMissing || descriptionIsMissing || companyIsMissing) {
      setFeedback({ type: "error", message: "Le titre, l’entreprise et la description sont obligatoires." });
      return null;
    }

    const min = form.salary_min === "" ? null : Number(form.salary_min);
    const max = form.salary_max === "" ? null : Number(form.salary_max);
    const minimumIsValid = min === null || (Number.isInteger(min) && min > 0 && min <= 2147483647);
    const maximumIsValid = max === null || (Number.isInteger(max) && max > 0 && max <= 2147483647);
    const minimumExceedsMaximum = min !== null && max !== null && min > max;
    if (!minimumIsValid || !maximumIsValid || minimumExceedsMaximum) {
      setFeedback({ type: "error", message: "Vérifiez la fourchette de salaire : montants entiers positifs et minimum inférieur ou égal au maximum." });
      return null;
    }
    return {
      ...form,
      title: form.title.trim(),
      short_description: form.short_description.trim() || null,
      description: form.description.trim(),
      location: form.location.trim() || null,
      company_id: Number(form.company_id),
      category_id: form.category_id === "" ? null : Number(form.category_id),
      salary_min: min,
      salary_max: max,
      contract_type: form.contract_type || null,
      working_time: form.working_time || null,
    };
  }

  async function saveAd(leaveAfterSave) {
    const payload = toPayload();
    if (!payload) {
      if (isEditing) {
        setShowSaveChoices(false);
      }
      return;
    }
    setPending(true);
    setFeedback(null);
    try {
      let requestPath = "/api/admin/ads";
      let requestMethod = "POST";
      if (isEditing) {
        requestPath = `/api/admin/ads/${encodeURIComponent(adId)}`;
        requestMethod = "PUT";
      }

      const savedAd = await adminRequest(requestPath, {
        method: requestMethod,
        body: payload,
      });
      let successMessage = "L’offre a été créée.";
      if (isEditing) {
        successMessage = "Les modifications ont été enregistrées.";
      }
      setFeedback({ type: "success", message: successMessage });
      if (isEditing && leaveAfterSave) {
        bypassBlockerRef.current = true;
        navigate("/admin/ads");
      } else if (isEditing) {
        const nextForm = formFromAd(savedAd);
        setForm(nextForm);
        setOriginal(JSON.stringify(nextForm));
        setShowSaveChoices(false);
      } else {
        createdRef.current = true;
        setCreated(true);
        window.setTimeout(() => navigate("/admin/ads"), 650);
      }
    } catch (requestError) {
      setFeedback({ type: "error", message: requestError.message });
      if (isEditing) {
        setShowSaveChoices(false);
      }
    } finally {
      setPending(false);
    }
  }

  const closeSaveChoices = useCallback(() => setShowSaveChoices(false), []);
  const formTitle = isEditing ? "Les informations de l’offre" : "Les informations du poste";
  let submitLabel = "Créer l’offre";
  if (isEditing) {
    submitLabel = "Enregistrer les modifications";
  }
  if (pending) {
    submitLabel = "Enregistrement…";
  }

  function handleFormSubmit(event) {
    event.preventDefault();
    if (created || pending) {
      return;
    }

    if (!isEditing) {
      saveAd(false);
      return;
    }

    if (!isDirty) {
      setFeedback({ type: "success", message: "Aucune modification à enregistrer." });
      return;
    }

    setShowSaveChoices(true);
  }

  function handleCancelClick(event) {
    if (pending || created) {
      event.preventDefault();
    }
  }

  if (loading) {
    return <p className="admin-state p-5 [border:1px_solid_var(--admin-rule)]" role="status">Chargement des données…</p>;
  }
  if (error) {
    return (
      <div className="admin-state p-5 [border:1px_solid_var(--admin-rule)]" role="alert">
        <p>{error}</p>
        <button className="admin-button secondary mt-4 inline-flex min-h-10 items-center justify-center gap-2 px-5 py-3 text-[13px] font-bold [border:1px_solid_var(--admin-ink)] rounded-none no-underline" type="button" onClick={() => window.location.reload()}>Réessayer</button>
      </div>
    );
  }

  return (
    <>
      <Link to="/admin/ads" className="admin-card-link mb-6 inline-flex items-center gap-3 pt-3 font-bold">← Retour aux offres</Link>
      <AdminFeedback feedback={feedback} />
      <section className="admin-panel [border:1px_solid_var(--admin-rule)] rounded-[0_18px_0_0] overflow-hidden [background:var(--admin-paper)]" aria-labelledby="ad-form-title">
        <div className="admin-panel-title p-[20px] [background:var(--admin-ink)] text-[var(--admin-paper)]"><h2 id="ad-form-title">{formTitle}</h2></div>
        <form className="admin-form grid gap-5 p-[20px]" onSubmit={handleFormSubmit}>
          <fieldset disabled={pending || created} className="contents">
            <AdminField label="Titre du poste *" name="ad-title"><input id="ad-title" name="title" required maxLength={200} value={form.title} onChange={update} /></AdminField>
            <div className="grid gap-5 md:grid-cols-2">
              <AdminField label="Entreprise *" name="ad-company">
                <CustomSelect id="ad-company" required value={form.company_id} onChange={(value) => updateSelect("company_id", value)} placeholder="Choisir une entreprise" options={companies.map((company) => ({ value: company.id, label: company.name }))} />
              </AdminField>
              <AdminField label="Catégorie" name="ad-category">
                <CustomSelect id="ad-category" value={form.category_id} onChange={(value) => updateSelect("category_id", value)} placeholder="Sans catégorie" options={categories.map((category) => ({ value: category.id, label: category.name }))} />
              </AdminField>
            </div>
            <AdminField label="Résumé" name="ad-summary" help="500 caractères maximum."><textarea id="ad-summary" name="short_description" rows={3} maxLength={500} aria-describedby="ad-summary-help" value={form.short_description} onChange={update} /></AdminField>
            <AdminField label="Description complète *" name="ad-description"><textarea id="ad-description" name="description" required rows={14} value={form.description} onChange={update} /></AdminField>
            <div className="grid gap-5 md:grid-cols-2">
              <AdminField label="Lieu" name="ad-location"><input id="ad-location" name="location" maxLength={255} value={form.location} onChange={update} /></AdminField>
              <AdminField label="Statut" name="ad-status">
                <CustomSelect id="ad-status" required value={form.status} onChange={(value) => updateSelect("status", value)} options={[{ value: "published", label: "Publiée" }, { value: "closed", label: "Fermée" }]} />
              </AdminField>
              <AdminField label="Contrat" name="ad-contract">
                <CustomSelect id="ad-contract" value={form.contract_type} onChange={(value) => updateSelect("contract_type", value)} placeholder="Non renseigné" options={contractOptions} />
              </AdminField>
              <AdminField label="Temps de travail" name="ad-working-time">
                <CustomSelect id="ad-working-time" value={form.working_time} onChange={(value) => updateSelect("working_time", value)} placeholder="Non renseigné" options={workOptions} />
              </AdminField>
            </div>
            <div className="grid gap-5 md:grid-cols-3">
              <AdminField label="Salaire brut minimum (€)" name="ad-salary-min"><input id="ad-salary-min" name="salary_min" type="number" min={1} max={2147483647} step={1} value={form.salary_min} onChange={update} /></AdminField>
              <AdminField label="Salaire brut maximum (€)" name="ad-salary-max"><input id="ad-salary-max" name="salary_max" type="number" min={1} max={2147483647} step={1} value={form.salary_max} onChange={update} /></AdminField>
              <AdminField label="Période du salaire" name="ad-salary-period">
                <CustomSelect id="ad-salary-period" required value={form.salary_period} onChange={(value) => updateSelect("salary_period", value)} options={[{ value: "year", label: "Annuel" }, { value: "month", label: "Mensuel" }]} />
              </AdminField>
            </div>
            <p className="admin-help text-[12px] leading-[1.5]">Laissez les montants vides si le salaire n’est pas renseigné.</p>
            <div className="admin-actions flex flex-wrap items-center gap-3">
              <button type="submit" className="admin-button accent inline-flex min-h-10 items-center justify-center gap-2 px-5 py-3 text-[13px] font-bold [border:1px_solid_var(--admin-ink)] rounded-none no-underline">{submitLabel}</button>
              <Link to="/admin/ads" className="admin-button secondary inline-flex min-h-10 items-center justify-center gap-2 px-5 py-3 text-[13px] font-bold [border:1px_solid_var(--admin-ink)] rounded-none no-underline" aria-disabled={pending || created} onClick={handleCancelClick}>Annuler</Link>
            </div>
          </fieldset>
        </form>
      </section>

      {isEditing && showSaveChoices && (
        <AdminModal title="Comment souhaitez-vous continuer ?" description="Vos modifications seront enregistrées avant de continuer." onClose={closeSaveChoices}>
          <div className="admin-modal-actions mt-6 flex flex-wrap gap-3">
            <button className="admin-button accent inline-flex min-h-10 items-center justify-center gap-2 px-5 py-3 text-[13px] font-bold [border:1px_solid_var(--admin-ink)] rounded-none no-underline" type="button" disabled={pending} onClick={() => saveAd(false)}>{pending ? "Enregistrement…" : "Enregistrer et rester"}</button>
            <button className="admin-button primary inline-flex min-h-10 items-center justify-center gap-2 px-5 py-3 text-[13px] font-bold [border:1px_solid_var(--admin-ink)] rounded-none no-underline" type="button" disabled={pending} onClick={() => saveAd(true)}>{pending ? "Enregistrement…" : "Enregistrer et quitter"}</button>
            <button className="admin-button secondary inline-flex min-h-10 items-center justify-center gap-2 px-5 py-3 text-[13px] font-bold [border:1px_solid_var(--admin-ink)] rounded-none no-underline" type="button" disabled={pending} onClick={closeSaveChoices}>Annuler</button>
          </div>
        </AdminModal>
      )}

      {blocker.state === "blocked" && (
        <AdminModal title="Modifications non enregistrées" description="Si vous quittez cette page, vos changements seront perdus." onClose={() => blocker.reset()}>
          <div className="admin-modal-actions mt-6 flex flex-wrap gap-3">
            <button className="admin-button primary inline-flex min-h-10 items-center justify-center gap-2 px-5 py-3 text-[13px] font-bold [border:1px_solid_var(--admin-ink)] rounded-none no-underline" type="button" onClick={() => blocker.proceed()}>Quitter sans enregistrer</button>
            <button className="admin-button secondary inline-flex min-h-10 items-center justify-center gap-2 px-5 py-3 text-[13px] font-bold [border:1px_solid_var(--admin-ink)] rounded-none no-underline" type="button" onClick={() => blocker.reset()}>Continuer à modifier</button>
          </div>
        </AdminModal>
      )}
    </>
  );
}

export default AdForm;
