import { useState } from "react";

function getInitials(firstName = "", lastName = "") {
  return `${firstName.trim().charAt(0)}${lastName.trim().charAt(0)}`.toLocaleUpperCase("fr") || "?";
}

function getAdminAvatarUrl(person) {
  if (person?.role !== "ADMIN") return null;

  const email = (person.email || "").trim().toLowerCase();
  if (email === "lasry.admin@example.com") return "/avatars/lasry-admin.webp";
  if (email === "admin@jobboard.example.com") return "/avatars/denis-admin.webp";

  return null;
}

function getIllustratedAvatarUrl(person, forVisibleCandidate) {
  const isDemoAccount = /@example\.com$/i.test(person?.email || "");
  if (!isDemoAccount && !forVisibleCandidate) return null;

  const accountId = Number(person?.person_id ?? person?.id);
  if (!Number.isSafeInteger(accountId) || accountId <= 0 || accountId % 4 === 0) return null;

  const seed = encodeURIComponent(`demo-person-${accountId}`);
  return `https://api.dicebear.com/10.x/lorelei/svg?seed=${seed}&backgroundColor=bedbc7,acbefa,f0e970`;
}

export default function PersonAvatar({ person, size = 44, className = "", forVisibleCandidate = false }) {
  const [imageFailed, setImageFailed] = useState(false);
  const imageUrl = getAdminAvatarUrl(person) || person?.avatar_url || getIllustratedAvatarUrl(person, forVisibleCandidate);
  const style = { width: size, height: size };
  const initials = getInitials(person?.first_name, person?.last_name);

  if (!imageUrl || imageFailed) {
    return <span className={`grid shrink-0 place-items-center rounded-full bg-mint text-sm font-bold text-ink ${className}`} style={style} aria-hidden="true">{initials}</span>;
  }

  return <img className={`shrink-0 rounded-full bg-mint object-cover ${className}`} style={style} src={imageUrl} alt={`Photo de profil de ${person.first_name || ""} ${person.last_name || ""}`.trim()} loading="lazy" referrerPolicy="no-referrer" onError={() => setImageFailed(true)} />;
}
