import { useEffect, useState } from "react";
import { Navigate, Outlet } from "react-router-dom";

function AdminRoute() {
  const [access, setAccess] = useState("loading");

  useEffect(() => {
    async function checkAccess() {
      try {
        const response = await fetch("/api/auth/me", {
          credentials: "same-origin",
        });

        if (response.status === 401) {
          setAccess("login");
          return;
        }

        const user = await response.json();

        if (!response.ok) {
          setAccess("error");
          return;
        }

        setAccess(user.role === "ADMIN" ? "allowed" : "forbidden");
      } catch (error) {
        console.error("Error while checking admin access:", error);
        setAccess("error");
      }
    }

    checkAccess();
  }, []);

  if (access === "loading") {
    return <p role="status">Vérification de l’accès…</p>;
  }

  if (access === "login") {
    return <Navigate to="/login" replace />;
  }

  if (access === "forbidden") {
    return <p>Cette page est réservée à l’administration.</p>;
  }

  if (access === "error") {
    return <p>Impossible de vérifier ton accès. Réessaie plus tard.</p>;
  }

  return <Outlet />;
}

export default AdminRoute;