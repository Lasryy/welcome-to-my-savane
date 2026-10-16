import { useEffect, useState } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import RequestState, { StateLink } from "../../components/ui/RequestState";

export default function AdminRoute() {
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
        setAccess(user.role === "ADMIN" ? "allowed" : "forbidden");
      } catch (error) {
        if (error.name !== "AbortError") {
          console.error("Error while checking admin access:", error);
          setAccess("error");
        }
      }
    }

    checkAccess();
    return () => controller.abort();
  }, [retryKey]);

  if (access === "loading") {
    return (
      <RequestState
        variant="loading"
        title="Vérification de l’accès admin"
        description="On vérifie les droits associés à cette session."
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
        className="request-state--admin-access"
        title="Accès réservé à l’administration"
        description="Ce compte ne dispose pas des droits nécessaires pour consulter cette page."
        illustration="/illustrations/admin-mandrill-guardian.webp"
        illustrationAlt="Un mandrill garde le passage près d’un acacia où est dessiné un lionceau."
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
