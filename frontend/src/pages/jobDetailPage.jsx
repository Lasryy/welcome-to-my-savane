
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

function JobDetailPage() {
  const { id } = useParams();

  const [ad, setAd] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch(`/api/ads/${id}`)
      .then((response) => {
        if (!response.ok) {
          throw new Error("Annonce introuvable");
        }

        return response.json();
      })
      .then((data) => {
        setAd(data);
      })
      .catch((error) => {
        setError(error.message);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [id]);

  if (loading) {
    return <p>Chargement...</p>;
  }

  if (error) {
    return <p>{error}</p>;
  }

  return (
    <main className="max-w-4xl mx-auto p-6">

      <h1 className="text-3xl font-bold mb-2">
        {ad.title}
      </h1>

      <p className="text-xl mb-6">
        {ad.company_name}
      </p>

      <div className="flex gap-4 mb-6">
        <span>
            {ad.location}
        </span>

        <span>
            {ad.contract_type}
        </span>

        <span>
            {ad.working_time}
        </span>
      </div>

      <section className="mb-6">
        <h2 className="text-xl font-semibold mb-2">
          Description
        </h2>

        <p>
          {ad.description}
        </p>
      </section>

      <button
        className="bg-green-600 text-white px-6 py-3 rounded-lg"
      >
        Postuler
      </button>

    </main>
  );
}

export default JobDetailPage;