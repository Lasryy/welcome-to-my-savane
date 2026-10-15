import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { adminRequest } from "../../services/adminApi";

const EMPTY_PAGE = { items: [], page: 1, total: 0, total_pages: 0 };

export default function CandidateDirectoryPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const query = searchParams.get("q") || "";
  const page = Number(searchParams.get("page") || 1);
  const [results, setResults] = useState(EMPTY_PAGE);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    const controller = new AbortController();

    async function loadCandidates() {
      setLoading(true);
      const params = new URLSearchParams({ page: String(page), page_size: "12" });
      if (query) params.set("q", query);

      try {
        const data = await adminRequest(`/api/company/candidates?${params}`, {
          signal: controller.signal,
        });
        setResults(data);
        setError("");
      } catch (requestError) {
        if (requestError.name !== "AbortError") setError(requestError.message);
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }

    loadCandidates();
    return () => controller.abort();
  }, [page, query, reloadKey]);

  function updateSearch(event) {
    event.preventDefault();
    const nextParams = new URLSearchParams(searchParams);
    const nextQuery = String(new FormData(event.currentTarget).get("q") || "").trim();
    if (nextQuery) nextParams.set("q", nextQuery);
    else nextParams.delete("q");
    nextParams.delete("page");
    setSearchParams(nextParams);
  }

  function changePage(nextPage) {
    const nextParams = new URLSearchParams(searchParams);
    if (nextPage === 1) nextParams.delete("page");
    else nextParams.set("page", String(nextPage));
    setSearchParams(nextParams);
  }

  return (
    <main className="min-h-[100svh] bg-paper px-5 py-8 text-ink">
      <div className="mx-auto max-w-6xl">
        <header className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <Link className="text-sm underline" to="/company">← Espace entreprise</Link>
            <h1 className="mt-3 text-3xl font-bold">Annuaire de candidats</h1>
            <p className="mt-2">Les profils affichés ont choisi d’être visibles par les recruteurs.</p>
          </div>
        </header>

        <form key={query} className="mb-6 flex flex-wrap gap-3 rounded border border-ink bg-white/70 p-4" onSubmit={updateSearch}>
          <label className="grid min-w-60 flex-1 gap-1">
            Rechercher un candidat, un projet ou une expérience
            <input
              className="rounded border border-ink bg-white p-3"
              name="q"
              type="search"
              defaultValue={query}
              maxLength={200}
              placeholder="Ex. développeur, portfolio, entreprise…"
            />
          </label>
          <div className="flex items-end gap-2">
            <button className="rounded bg-ink px-5 py-3 font-bold text-paper" type="submit">Rechercher</button>
            {query && <button className="rounded border border-ink px-5 py-3" type="button" onClick={() => setSearchParams({})}>Effacer</button>}
          </div>
        </form>

        {error && <section className="mb-5 rounded border border-red-700 p-5" role="alert">
          <p>{error}</p>
          <button className="mt-3 underline" onClick={() => setReloadKey((key) => key + 1)}>Réessayer</button>
        </section>}
        {loading ? <p role="status">Chargement des profils…</p> : !error && results.items.length === 0 ?
          <p className="rounded border border-ink bg-white/70 p-6">Aucun profil visible ne correspond à cette recherche.</p> :
          !error && <>
            <p className="mb-4" aria-live="polite">{results.total} profil{results.total !== 1 ? "s" : ""} visible{results.total !== 1 ? "s" : ""}</p>
            <div className="grid gap-4 md:grid-cols-2">
              {results.items.map((candidate) => (
                <article key={candidate.id} className="rounded border border-ink bg-white/70 p-5">
                  <h2 className="text-xl font-bold">{candidate.first_name} {candidate.last_name}</h2>
                  <p className="mt-2 text-sm">{candidate.project_count} projet{candidate.project_count !== 1 ? "s" : ""} · {candidate.experience_count} expérience{candidate.experience_count !== 1 ? "s" : ""}</p>
                  <Link
                    className="mt-4 inline-block rounded bg-ink px-4 py-2 font-bold text-paper"
                    to={`/company/candidates/${candidate.id}${searchParams.size ? `?${searchParams}` : ""}`}
                  >Voir le profil</Link>
                </article>
              ))}
            </div>
            {results.total_pages > 1 && <nav className="mt-6 flex items-center justify-between gap-4" aria-label="Pagination des candidats">
              <span aria-live="polite">Page {results.page} sur {results.total_pages}</span>
              <div className="flex gap-2">
                <button className="rounded border border-ink px-4 py-2 disabled:opacity-50" disabled={results.page <= 1} onClick={() => changePage(results.page - 1)}>Précédent</button>
                <button className="rounded border border-ink px-4 py-2 disabled:opacity-50" disabled={results.page >= results.total_pages} onClick={() => changePage(results.page + 1)}>Suivant</button>
              </div>
            </nav>}
          </>}
      </div>
    </main>
  );
}
