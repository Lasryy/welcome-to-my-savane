import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";

async function mountApp() {
  const { default: App } = await import("./App.jsx");

  createRoot(document.getElementById("root")).render(
    <StrictMode>
      <App />
    </StrictMode>,
  );
}

mountApp();
