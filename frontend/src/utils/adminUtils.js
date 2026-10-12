export const contractLabels = {
  internship: "Stage",
  apprenticeship: "Alternance",
  permanent: "CDI",
  fixed_term: "CDD",
  other: "Autre",
};

export const workingTimeLabels = {
  full_time: "Temps plein",
  part_time: "Temps partiel",
};

export function isWebUrl(value) {
  try {
    return ["http:", "https:"].includes(new URL(value).protocol);
  } catch {
    return false;
  }
}

export function formatSalary(ad) {
  const { salary_min: min, salary_max: max, salary_period: period } = ad;
  if (min == null && max == null) {
    return "Salaire non renseigné";
  }

  const format = (value) => new Intl.NumberFormat("fr-FR").format(value);
  let amount;
  if (min == null) {
    amount = `Jusqu’à ${format(max)}`;
  } else if (max == null) {
    amount = `À partir de ${format(min)}`;
  } else if (min === max) {
    amount = format(min);
  } else {
    amount = `${format(min)} – ${format(max)}`;
  }

  let periodLabel = "an";
  if (period === "month") {
    periodLabel = "mois";
  }

  return `${amount} € bruts / ${periodLabel}`;
}

export function formatDate(value) {
  const date = new Date(value);
  const isValidDate = value && !Number.isNaN(date.getTime());
  if (!isValidDate) {
    return "Date non renseignée";
  }

  return new Intl.DateTimeFormat("fr-FR").format(date);
}
