import { useEffect, useState } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import RequestState, { StateLink } from "../../components/ui/RequestState";

export default function CompanyRoute() {
  const location = useLocation();
  const [access, setAccess] = useState("loading");
  const [retryKey, setRetryKey] = useState(0);

  useEffect(() => {
    const controller = new AbortController();

    async function checkAccess() {
      try {
        const response = await fetch("/api/auth/me", {
          credentials: "same-origin",
          signal: controller.signal,
        });

        if (controller.signal.aborted) return;
        if (response.status === 401) {
          setAccess("login");
          return;
        }
        if (!response.ok) throw new Error("Vérification indisponible");

        const user = await response.json();
        setAccess(user.role === "COMPANY" || user.role === "ADMIN" ? "allowed" : "forbidden");
      } catch (error) {
        if (error.name !== "AbortError") setAccess("error");
      }
    }

    checkAccess();
    return () => controller.abort();
  }, [retryKey]);

  if (access === "loading") {
    return (
      <RequestState
        variant="loading"
        title="Vérification de l’accès recruteur"
        description="On vérifie le rattachement de cette session à une entreprise."
      />
    );
  }

  if (access === "login") {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  if (access === "forbidden") {
    return (
      <RequestState
        variant="forbidden"
        title="Accès réservé aux recruteurs"
        description="Ce compte n’est pas rattaché à un espace entreprise."
      >
        <StateLink to="/jobs">Retour aux offres</StateLink>
      </RequestState>
    );
  }

  if (access === "error") {
    return (
      <RequestState
        title="Impossible de vérifier ton accès"
        description="La vérification n’a pas abouti. Réessaie dans un instant."
        onRetry={() => {
          setAccess("loading");
          setRetryKey((key) => key + 1);
        }}
      />
    );
  }

  return <Outlet />;
}
