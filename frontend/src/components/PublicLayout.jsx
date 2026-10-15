import { Link, NavLink, Outlet } from "react-router-dom";
import { useEffect, useState } from "react";
import { Brand } from "../design-lab/components";

export default function PublicLayout() {
  const [role, setRole] = useState(null);
  useEffect(() => {
    const controller = new AbortController();
    fetch("/api/auth/me", { credentials: "same-origin", signal: controller.signal })
      .then((response) => response.ok ? response.json() : null)
      .then((user) => { if (!controller.signal.aborted) setRole(user?.role || "GUEST"); })
      .catch(() => { if (!controller.signal.aborted) setRole("GUEST"); });
    return () => controller.abort();
  }, []);
  return (
    <div id="top" className="flex min-h-[100svh] flex-col bg-paper font-brand text-[14px] leading-[1.55] text-ink">
      <a className="absolute -left-[10000px] top-3 z-20 bg-paper p-3 focus:left-[12px]" href="#main-content">
        Aller au contenu
      </a>
      <header className="bg-coral">
        <div className="mx-auto flex min-h-[82px] w-[calc(100%_-_112px)] max-w-[1280px] items-center justify-between gap-6 border-b border-ink max-[1200px]:w-[calc(100%_-_72px)] max-[760px]:w-[calc(100%_-_40px)] max-[760px]:min-h-[72px] max-[760px]:gap-3">
          <Brand tailwind />
          <nav className="flex flex-wrap items-center gap-6 text-sm max-[760px]:gap-3 max-[760px]:text-xs" aria-label="Navigation principale">
            <NavLink className="border-b border-transparent py-2.5 hover:underline hover:underline-offset-4 [&[aria-current=page]]:border-ink [&[aria-current=page]]:font-bold" to="/" end>Les offres</NavLink>
            {(role === "USER" || role === "GUEST") && <NavLink className="border-b border-transparent py-2.5 hover:underline hover:underline-offset-4 [&[aria-current=page]]:border-ink [&[aria-current=page]]:font-bold" to="/applications">Mes candidatures</NavLink>}
            {(role === "USER" || role === "GUEST") && <NavLink className="py-2.5 hover:underline hover:underline-offset-4" to="/profile">Mon compte</NavLink>}
            {role === "COMPANY" && <NavLink className="py-2.5 hover:underline hover:underline-offset-4" to="/company">Espace entreprise</NavLink>}
            {role === "ADMIN" && <Link className="py-2.5 hover:underline hover:underline-offset-4" to="/admin">Administration</Link>}
          </nav>
        </div>
      </header>
      <main id="main-content" className="flex-1">
        <Outlet />
      </main>
      <footer className="mt-12 flex-none border-t border-rule">
        <div className="mx-auto flex min-h-[68px] w-[calc(100%_-_112px)] max-w-[1280px] items-center justify-between gap-4 text-xs max-[1200px]:w-[calc(100%_-_72px)] max-[760px]:w-[calc(100%_-_40px)] max-[760px]:min-h-[60px]">
          <span>Welcome To My Savane</span>
          <a className="underline-offset-4 hover:underline" href="#top">Retour en haut ↑</a>
        </div>
      </footer>
    </div>
  );
}
