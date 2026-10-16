import Pagination from "../../components/ui/Pagination";
import CompanyLayout from "./CompanyLayout";
import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { adminRequest } from "../../services/adminApi";
import PersonAvatar from "../../components/PersonAvatar";

const EMPTY_PAGE = { items: [], page: 1, total: 0, total_pages: 0 };

export default function CandidateDirectoryPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const query = searchParams.get("q") || "";
  const companyId = searchParams.get("company_id") || "";
  const page = Number(searchParams.get("page") || 1);
  const [results, setResults] = useState(EMPTY_PAGE);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    const controller = new AbortController();

    async function loadCandidates() {
      setLoading(true);
      const params = new URLSearchParams({
        page: String(page),
        page_size: "12",
      });
      if (query) params.set("q", query);
      if (companyId) params.set("company_id", companyId);

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
  }, [page, query, reloadKey, companyId]);

  function updateSearch(event) {
    event.preventDefault();
    const nextParams = new URLSearchParams(searchParams);
    const nextQuery = String(
      new FormData(event.currentTarget).get("q") || "",
    ).trim();
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
    <CompanyLayout
      title="Annuaire de candidats"
      description="Découvre les projets et les expériences des candidats ouverts aux recruteurs."
      companyId={companyId}
      adminView={Boolean(companyId)}
    >
      <div className="mx-auto max-w-6xl">
        <form
          key={query}
          className="mb-6 flex flex-wrap gap-3 rounded border border-ink bg-white/70 p-4"
          onSubmit={updateSearch}
        >
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
            <button
              className="rounded bg-ink px-5 py-3 font-bold text-paper"
              type="submit"
            >
              Rechercher
            </button>
            {query && (
              <button
                className="rounded border border-ink px-5 py-3"
                type="button"
                onClick={() => setSearchParams(companyId ? { company_id: companyId } : {})}
              >
                Effacer
              </button>
            )}
          </div>
        </form>

        {error && (
          <section
            className="mb-5 rounded border border-red-700 p-5"
            role="alert"
          >
            <p>{error}</p>
            <button
              className="mt-3 underline"
              onClick={() => setReloadKey((key) => key + 1)}
            >
              Réessayer
            </button>
          </section>
        )}
        {loading ? (
          <p role="status">Chargement des profils…</p>
        ) : !error && results.items.length === 0 ? (
          <p className="rounded border border-ink bg-white/70 p-6">
            Aucun profil visible ne correspond à cette recherche.
          </p>
        ) : (
          !error && (
            <>
              <p className="mb-4" aria-live="polite">
                {results.total} profil{results.total !== 1 ? "s" : ""} visible
                {results.total !== 1 ? "s" : ""}
              </p>
              <div className="grid gap-4 md:grid-cols-2">
                {results.items.map((candidate) => (
                  <article
                    key={candidate.id}
                    className="rounded border border-ink bg-white/70 p-5"
                  >
                    <div className="flex items-center gap-3">
                      <PersonAvatar person={candidate} size={48} forVisibleCandidate />
                      <h2 className="text-xl font-bold">{candidate.first_name} {candidate.last_name}</h2>
                    </div>
                    <p className="mt-2 text-sm">
                      {candidate.project_count} projet
                      {candidate.project_count !== 1 ? "s" : ""} ·{" "}
                      {candidate.experience_count} expérience
                      {candidate.experience_count !== 1 ? "s" : ""}
                    </p>
                    <Link
                      className="mt-4 inline-block rounded bg-ink px-4 py-2 font-bold text-paper"
                      to={`/company/candidates/${candidate.id}${searchParams.size ? `?${searchParams}` : ""}`}
                    >
                      Voir le profil
                    </Link>
                  </article>
                ))}
              </div>
              <Pagination
                page={results.page}
                totalPages={results.total_pages}
                total={results.total}
                label="Pagination des candidats"
                onPageChange={changePage}
              />
            </>
          )
        )}
      </div>
    </CompanyLayout>
  );
}
