import { useEffect, useState } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";

export default function CompanyRoute() {
  const location = useLocation();
  const [access, setAccess] = useState("loading");
  useEffect(() => {
    const controller = new AbortController();
    fetch("/api/auth/me", { credentials: "same-origin", signal: controller.signal })
      .then(async (response) => {
        if (response.status === 401) return "login";
        const user = await response.json();
        if (!response.ok) return "error";
        return user.role === "COMPANY" ? "allowed" : "forbidden";
      })
      .then((result) => { if (!controller.signal.aborted) setAccess(result); })
      .catch((error) => { if (error.name !== "AbortError") setAccess("error"); });
    return () => controller.abort();
  }, []);
  if (access === "loading") return <p role="status" className="mx-auto max-w-5xl p-10">Vérification de l’accès…</p>;
  if (access === "login") return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  if (access === "forbidden") return <Navigate to="/" replace />;
  if (access === "error") return <p role="alert" className="mx-auto max-w-5xl p-10">Impossible de vérifier ton accès.</p>;
  return <Outlet />;
}
