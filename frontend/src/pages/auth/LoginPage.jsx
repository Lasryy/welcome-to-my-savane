import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import AuthLayout from "./AuthLayout";

function LoginPage() {
  const navigate = useNavigate();
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

      navigate("/profile", { replace: true });
    } catch (error) {
      console.error("Error while logging in:", error);
      setError("Le serveur ne répond pas. Réessayez dans un instant.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <AuthLayout
      title="Bon retour."
      description="Connectez-vous pour retrouver votre parcours."
      footer={
        <>
          Pas encore de compte ? <Link to="/register">Créer un compte</Link>
        </>
      }
    >
      <form className="auth-form" onSubmit={handleSubmit}>
        <label className="auth-field">
          Adresse e-mail
          <input
            className="auth-input"
            type="email"
            name="email"
            autoComplete="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
          />
        </label>

        <label className="auth-field">
          Mot de passe
          <input
            className="auth-input"
            type="password"
            name="password"
            autoComplete="current-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
          />
        </label>

        {error && (
          <p className="auth-message auth-message-error" role="alert">
            {error}
          </p>
        )}

        <button className="auth-submit" type="submit" disabled={isLoading}>
          {isLoading ? "Connexion…" : "Se connecter"}
        </button>
      </form>
    </AuthLayout>
  );
}

export default LoginPage;
