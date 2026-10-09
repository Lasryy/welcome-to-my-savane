import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";

async function mountApp() {
  const isDesignLab = /^\/design-lab(?:\/|$)/.test(window.location.pathname);
  const { default: App } = isDesignLab
    ? await import("./design-lab/DesignLab.jsx")
    : await import("./App.jsx");

  if (!isDesignLab) await import("./index.css");

  createRoot(document.getElementById("root")).render(
    <StrictMode>
      {isDesignLab ? (
        <App />
      ) : (
        <BrowserRouter>
          <App />
        </BrowserRouter>
      )}
    </StrictMode>,
  );
}

mountApp();
