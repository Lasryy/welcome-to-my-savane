import { useEffect, useState } from "react";
import AdminCard from "../../components/admin/adminCard";
import CustomSelect from "../../components/CustomSelect";
import { AdminFeedback, AdminListState } from "../../components/admin/adminUi";
import { adminRequest } from "../../services/adminApi";
import { formatDate } from "../../utils/adminUtils";

const STATUSES = [
  { value: "sent", label: "Envoyée" },
  { value: "in_progress", label: "En cours" },
  { value: "technical_test", label: "Test technique" },
  { value: "accepted", label: "Acceptée" },
  { value: "rejected", label: "Refusée" },
];

export default function AdminApplicationsPage() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [feedback, setFeedback] = useState(null);
  const [pendingId, setPendingId] = useState(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    const controller = new AbortController();

    async function loadApplications() {
      try {
        const data = await adminRequest("/api/admin/applications", { signal: controller.signal });
        if (!Array.isArray(data)) {
          throw new Error("La liste des candidatures reçue est invalide.");
        }
        if (!controller.signal.aborted) {
          setApplications(data);
          setError("");
        }
      } catch (requestError) {
        if (!controller.signal.aborted) {
          setError(requestError.message);
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    loadApplications();
    return () => controller.abort();
  }, [reloadKey]);

  async function changeStatus(application, status) {
    if (status === application.status) {
      return;
    }

    setPendingId(application.id);
    setFeedback(null);
    try {
      const updated = await adminRequest(`/api/admin/applications/${application.id}`, {
        method: "PATCH",
        body: { status },
      });
      setApplications((current) => current.map((item) =>
        item.id === updated.id ? { ...item, status: updated.status } : item,
      ));
      setFeedback({ type: "success", message: "Le statut de la candidature a été mis à jour." });
    } catch (requestError) {
      setFeedback({ type: "error", message: requestError.message });
    } finally {
      setPendingId(null);
    }
  }

  return (
    <>
      <AdminFeedback feedback={feedback} />
      <div className="admin-toolbar mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2>Suivi des candidatures</h2>
          <p aria-live="polite">{applications.length} candidature{applications.length !== 1 ? "s" : ""}</p>
        </div>
        <button
          className="admin-button secondary inline-flex min-h-10 items-center justify-center gap-2 px-5 py-3 text-[13px] font-bold [border:1px_solid_var(--admin-ink)] rounded-none"
          type="button"
          onClick={() => { setLoading(true); setReloadKey((key) => key + 1); }}
          disabled={loading}
        >
          Actualiser
        </button>
      </div>

      <AdminListState loading={loading} error={error} empty={!applications.length} onRetry={() => { setLoading(true); setReloadKey((key) => key + 1); }}>
        <div className="grid items-start gap-[22px] xl:grid-cols-2">
          {applications.map((application, index) => (
            <AdminCard key={application.id} title={application.title} description={application.company_name} index={index} overflowVisible>
              <p><strong>Candidat :</strong> {application.first_name} {application.last_name} · {application.email}</p>
              <p><strong>Envoyée le :</strong> {formatDate(application.created_at)}</p>
              <label className="admin-field grid max-w-[320px] gap-2" htmlFor={`application-status-${application.id}`}>
                Statut de la candidature
                <CustomSelect
                  id={`application-status-${application.id}`}
                  value={application.status}
                  onChange={(status) => changeStatus(application, status)}
                  options={STATUSES}
                  disabled={pendingId === application.id}
                />
              </label>
              {pendingId === application.id && <p role="status">Enregistrement du statut…</p>}
            </AdminCard>
          ))}
        </div>
      </AdminListState>
    </>
  );
}
