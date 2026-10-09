import React from "react";
import { Link } from "react-router-dom";

function JobCard({ ad }) {
  return (
    <div>
      <h2>{ad.title}</h2>
      <p>{ad.company_name}</p>
      <p>{ad.location}</p>
      <p>{ad.contract_type}</p>
      <p>{ad.salary}</p>

      <Link to={`/jobs/${ad.id}`}>
        Voir l'offre
    </Link>
    
    </div>

    
  );
}

export default JobCard;