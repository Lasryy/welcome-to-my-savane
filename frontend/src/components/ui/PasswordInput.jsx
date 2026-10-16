import { useState } from "react";

export default function PasswordInput(props) {
  const [visible, setVisible] = useState(false);
  return (
    <span className="password-field">
      <input {...props} type={visible ? "text" : "password"} />
      <button
        type="button"
        aria-label={
          visible ? "Masquer le mot de passe" : "Afficher le mot de passe"
        }
        aria-pressed={visible}
        onClick={() => setVisible(!visible)}
      >
        {visible ? "Masquer" : "Afficher"}
      </button>
    </span>
  );
}
