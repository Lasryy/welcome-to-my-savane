import React, { useEffect, useState } from "react";
import JobCard from "../components/jobCard";

function JobBoardPage() {
  const [ads, setAds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch("/api/ads")
      .then((response) => {
        if (!response.ok) {
          throw new Error("Erreur lors du chargement des annonces");
        }

        return response.json();
      })
      .then((data) => {
        setAds(data);
      })
      .catch((error) => {
        console.error(error);
        setError(error.message);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  if (loading) {
    return <p>Chargement...</p>;
  }

  if (error) {
    return <p>{error}</p>;
  }

  return (
    <div>
      <h1>Les offres</h1>

      {ads.map((ad) => (
        <JobCard key={ad.id} ad={ad} />
      ))}
    </div>
  );
}

export default JobBoardPage;