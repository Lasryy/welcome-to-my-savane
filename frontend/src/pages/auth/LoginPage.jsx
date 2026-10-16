import PasswordInput from "../../components/ui/PasswordInput";
import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import AuthLayout from "./AuthLayout";

function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();

    setError("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "same-origin",
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Connexion impossible.");
        return;
      }

      const defaultPath =
        data.role === "ADMIN"
          ? "/admin"
          : data.role === "COMPANY"
            ? "/company"
            : "/jobs";
      const requestedPath = location.state?.from;
      const allowedReturnPath =
        requestedPath &&
        ((data.role === "ADMIN" && requestedPath.startsWith("/admin")) ||
          (data.role === "COMPANY" && requestedPath.startsWith("/company")) ||
          (data.role === "USER" &&
            !requestedPath.startsWith("/admin") &&
            !requestedPath.startsWith("/company")));
      const returnPath = allowedReturnPath ? requestedPath : defaultPath;
      const returnState =
        data.role === "USER" && location.state?.continueApplication
          ? { continueApplication: true }
          : null;

      navigate(returnPath, { replace: true, state: returnState });
    } catch (error) {
      console.error("Error while logging in:", error);
      setError("Le serveur ne répond pas. Réessayez dans un instant.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <AuthLayout
      variant="login"
      title="Bon retour."
      description="Retrouve ton profil et tes opportunités."
      footer={
        <>
          Pas encore de compte ?{" "}
          <Link to="/register" state={location.state}>
            Créer un compte
          </Link>
        </>
      }
    >
      <form className="form-stack" onSubmit={handleSubmit}>
        <label className="form-field">
          Adresse e-mail
          <input
            className="form-input"
            type="email"
            name="email"
            autoComplete="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
          />
        </label>

        <div className="form-field">
          <label htmlFor="login-password">Mot de passe</label>
          <PasswordInput
            id="login-password"
            className="form-input"
            name="password"
            autoComplete="current-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
          />
        </div>

        {error && (
          <p className="form-error" role="alert">
            {error}
          </p>
        )}

        <button
          className="primary-button mt-1"
          type="submit"
          disabled={isLoading}
        >
          {isLoading ? "Connexion…" : "Se connecter"}
        </button>
      </form>
    </AuthLayout>
  );
}

export default LoginPage;
