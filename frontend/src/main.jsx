import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

async function mountApp() {
  const currentPath = window.location.pathname;
  const isDesignLab = currentPath === "/design-lab" || currentPath.startsWith("/design-lab/");
  const { default: App } = isDesignLab
    ? await import("./design-lab/DesignLab.jsx")
    : await import("./App.jsx");

  if (!isDesignLab) {
    await import("./index.css");
  }

  createRoot(document.getElementById("root")).render(
    <StrictMode>
      <App />
    </StrictMode>,
  );
}

mountApp();
