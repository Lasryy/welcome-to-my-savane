import { useState } from "react";
import { Link } from "react-router-dom";
import AuthLayout from "./AuthLayout";

function RegisterPage() {
  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  function handleChange(event) {
    const { name, value } = event.target;
    setForm({ ...form, [name]: value });
  }

  async function handleSubmit(event) {
    event.preventDefault();

    setError("");
    setSuccess("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "same-origin",
        body: JSON.stringify(form),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "La création du compte a échoué.");
        return;
      }

      setSuccess("Compte créé. Tu peux maintenant te connecter.");
    } catch (error) {
      console.error("Error while registering:", error);
      setError("Le serveur ne répond pas. Réessaie dans un instant.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <AuthLayout
      title="Créer un compte."
      description="Quelques informations pour commencer ton parcours."
      footer={
        <>
          Tu as déjà un compte ? <Link to="/login">Se connecter</Link>
        </>
      }
    >
      <form className="auth-form" onSubmit={handleSubmit}>
        <label className="auth-field">
          Prénom
          <input
            className="auth-input"
            type="text"
            name="first_name"
            autoComplete="given-name"
            value={form.first_name}
            onChange={handleChange}
            required
          />
        </label>

        <label className="auth-field">
          Nom
          <input
            className="auth-input"
            type="text"
            name="last_name"
            autoComplete="family-name"
            value={form.last_name}
            onChange={handleChange}
            required
          />
        </label>

        <label className="auth-field">
          Adresse e-mail
          <input
            className="auth-input"
            type="email"
            name="email"
            autoComplete="email"
            value={form.email}
            onChange={handleChange}
            required
          />
        </label>

        <label className="auth-field">
          Téléphone <span>(facultatif)</span>
          <input
            className="auth-input"
            type="tel"
            name="phone"
            autoComplete="tel"
            value={form.phone}
            onChange={handleChange}
          />
        </label>

        <label className="auth-field">
          Mot de passe
          <input
            className="auth-input"
            type="password"
            name="password"
            autoComplete="new-password"
            value={form.password}
            onChange={handleChange}
            minLength={8}
            required
          />
        </label>

        {error && (
          <p className="auth-message auth-message-error" role="alert">
            {error}
          </p>
        )}

        {success && (
          <p className="auth-message auth-message-success" role="status">
            {success}
          </p>
        )}

        <button className="auth-submit" type="submit" disabled={isLoading}>
          {isLoading ? "Création…" : "Créer mon compte"}
        </button>
      </form>
    </AuthLayout>
  );
}

export default RegisterPage;