import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import AuthLayout from "./AuthLayout";

function ProfilePage() {
  const [user, setUser] = useState(null);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    async function loadProfile() {
      try {
        const response = await fetch("/api/auth/me", {
          credentials: "same-origin",
        });
        const data = await response.json();

        if (response.status === 401) {
          navigate("/login", { replace: true });
          return;
        }

        if (!response.ok) {
          setError(data.error || "Impossible de charger le profil.");
          return;
        }

        setUser(data);
      } catch (error) {
        console.error("Error while fetching profile:", error);
        setError("Le serveur ne répond pas. Réessaie dans un instant.");
      } finally {
        setIsLoading(false);
      }
    }

    loadProfile();
  }, [navigate]);

  async function handleLogout() {
    setError("");
    setIsLoggingOut(true);

    try {
      const response = await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "same-origin",
      });

      if (!response.ok) {
        const data = await response.json();
        setError(data.error || "La déconnexion a échoué.");
        return;
      }

      navigate("/login", { replace: true });
    } catch (error) {
      console.error("Error while logging out:", error);
      setError("Le serveur ne répond pas. Réessaie dans un instant.");
    } finally {
      setIsLoggingOut(false);
    }
  }

  return (
    <AuthLayout
      title={user ? `Bonjour ${user.first_name}.` : "Mon profil."}
      description="Retrouve les informations de ton compte."
    >
      <div className="auth-form">
        {isLoading && <p role="status">Chargement du profil…</p>}

        {error && (
          <p className="auth-message auth-message-error" role="alert">
            {error}
          </p>
        )}

        {user && (
          <>
            <p>
              <strong>Nom :</strong> {user.first_name} {user.last_name}
            </p>
            <p>
              <strong>E-mail :</strong> {user.email}
            </p>
            <p>
              <strong>Rôle :</strong> {user.role}
            </p>

            <button
              className="auth-submit"
              type="button"
              onClick={handleLogout}
              disabled={isLoggingOut}
            >
              {isLoggingOut ? "Déconnexion…" : "Se déconnecter"}
            </button>
          </>
        )}
      </div>
    </AuthLayout>
  );
}

export default ProfilePage;