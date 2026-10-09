import React from 'react'
import { useEffect, useState } from "react";

function jobCard() {
  const [ads, setAds] = useState([]);

  useEffect(() => {
    fetch("/api/ads")
      .then((response) => response.json())
      .then((data) => {
        setAds(data);
      })
      .catch((error) => {
        console.error("Erreur :", error);
      });
  }, []);

  return (
    <div>
      {ads.map((ad) => (
        <div key={ad.id}>
          <h2>{ad.title}</h2>
          <p>{ad.company_name}</p>
          <p>{ad.location}</p>
        </div>
      ))}
    </div>
  );
}

export default jobCard;