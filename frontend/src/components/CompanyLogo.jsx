import { useState } from "react";

function makeCompanyLogoUrl(name = "Entreprise") {
  const seed = encodeURIComponent(`company-${name.trim() || "unknown"}`);
  const colors = "f09169,bedbc7,acbefa,f0e970";
  return `https://api.dicebear.com/10.x/shapes/svg?seed=${seed}&backgroundColor=${colors}`;
}

function companyInitials(name = "") {
  return name.trim().split(/\s+/).filter(Boolean).slice(0, 2)
    .map((word) => word[0]).join("").toLocaleUpperCase("fr") || "?";
}

export default function CompanyLogo({ name, url, size = 44, className = "" }) {
  const [imageFailed, setImageFailed] = useState(false);
  const imageUrl = url || makeCompanyLogoUrl(name);
  const style = { width: size, height: size };

  if (imageFailed) {
    return (
      <span className={`grid shrink-0 place-items-center rounded-lg bg-sun text-sm font-extrabold text-ink ${className}`} style={style} aria-hidden="true">
        {companyInitials(name)}
      </span>
    );
  }

  return (
    <img className={`shrink-0 rounded-lg bg-paper object-contain p-1 ${className}`} style={style} src={imageUrl} alt={`Logo de ${name || "l’entreprise"}`} loading="lazy" referrerPolicy="no-referrer" onError={() => setImageFailed(true)} />
  );
}
