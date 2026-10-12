function parseId(value) {
  const id = Number(value);
  if (!Number.isSafeInteger(id) || id <= 0) {
    return null;
  }

  return id;
}

function isRecord(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function stringField(value, field, { required = false, maxLength = Infinity, nullable = true } = {}) {
  if (value === undefined) {
    if (required) {
      return { error: `${field} est obligatoire.` };
    }

    return { value: undefined };
  }
  if (value === null && nullable && !required) {
    return { value: null };
  }
  if (typeof value !== "string") {
    return { error: `${field} doit être une chaîne de caractères.` };
  }

  const trimmed = value.trim();
  if (!trimmed && required) {
    return { error: `${field} est obligatoire.` };
  }
  if (trimmed.length > maxLength) {
    return { error: `${field} ne doit pas dépasser ${maxLength} caractères.` };
  }
  if (trimmed) {
    return { value: trimmed };
  }

  if (nullable) {
    return { value: null };
  }
  return { value: "" };
}

function nullablePositiveId(value, field, { required = false } = {}) {
  if (value === undefined || value === null || value === "") {
    if (required) {
      return { error: `${field} est obligatoire.` };
    }

    return { value: null };
  }
  const number = Number(value);
  const isPositiveInteger = Number.isSafeInteger(number) && number > 0;
  if (!isPositiveInteger) {
    return { error: `${field} doit être un identifiant entier positif.` };
  }
  return { value: number };
}

function nullableSalary(value, field) {
  if (value === undefined || value === null || value === "") {
    return { value: null };
  }
  const number = Number(value);
  const isPositiveInteger = Number.isInteger(number) && number > 0;
  const fitsInDatabaseInteger = number <= 2147483647;
  if (!isPositiveInteger || !fitsInDatabaseInteger) {
    return { error: `${field} doit être un entier positif inférieur ou égal à 2147483647.` };
  }
  return { value: number };
}

function webUrl(value, field) {
  if (value === undefined) {
    return null;
  }
  if (value === null) {
    return null;
  }
  try {
    const url = new URL(value);
    if (url.protocol === "http:" || url.protocol === "https:") {
      return null;
    }
  } catch (error) {
    // Invalid URLs are returned as a validation message below.
  }
  return `${field} doit être une URL HTTP ou HTTPS valide.`;
}

module.exports = { isRecord, nullablePositiveId, nullableSalary, parseId, stringField, webUrl };
