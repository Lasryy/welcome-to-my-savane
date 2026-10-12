import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import AuthLayout from "./AuthLayout";

function RegisterPage() {
  const location = useLocation();
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
          Tu as déjà un compte ?{" "}
          <Link to="/login" state={location.state}>Se connecter</Link>
        </>
      }
    >
      <form className="form-stack" onSubmit={handleSubmit}>
        <label className="form-field">
          Prénom
          <input
            className="form-input"
            type="text"
            name="first_name"
            autoComplete="given-name"
            value={form.first_name}
            onChange={handleChange}
            required
          />
        </label>

        <label className="form-field">
          Nom
          <input
            className="form-input"
            type="text"
            name="last_name"
            autoComplete="family-name"
            value={form.last_name}
            onChange={handleChange}
            required
          />
        </label>

        <label className="form-field">
          Adresse e-mail
          <input
            className="form-input"
            type="email"
            name="email"
            autoComplete="email"
            value={form.email}
            onChange={handleChange}
            required
          />
        </label>

        <label className="form-field">
          Téléphone (facultatif)
          <input
            className="form-input"
            type="tel"
            name="phone"
            autoComplete="tel"
            value={form.phone}
            onChange={handleChange}
          />
        </label>

        <label className="form-field">
          Mot de passe
          <input
            className="form-input"
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
          <p className="form-error" role="alert">
            {error}
          </p>
        )}

        {success && (
          <p className="form-success" role="status">
            {success}
          </p>
        )}

        <button className="primary-button mt-1" type="submit" disabled={isLoading}>
          {isLoading ? "Création…" : "Créer mon compte"}
        </button>
      </form>
    </AuthLayout>
  );
}

export default RegisterPage;
