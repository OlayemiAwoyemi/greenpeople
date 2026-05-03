// Text normalization helpers.

const SMALL_PARTICLES = new Set(["de", "del", "la", "van", "von", "der", "den", "di"]);

const titleCaseWord = (word: string): string => {
  if (!word) return word;
  return word
    .split(/([-'])/)
    .map((part) => {
      if (part === "-" || part === "'") return part;
      const lower = part.toLowerCase();
      if (SMALL_PARTICLES.has(lower)) return lower;
      return lower.charAt(0).toUpperCase() + lower.slice(1);
    })
    .join("");
};

export const normalizeName = (raw: string): string => {
  if (!raw) return "";
  return raw.replace(/\s+/g, " ").trim().split(" ").map(titleCaseWord).join(" ");
};

export const normalizeSentence = (raw: string): string => {
  if (!raw) return "";
  const cleaned = raw.replace(/\s+/g, " ").trim();
  if (!cleaned) return "";
  return cleaned.replace(/(^|[.!?]\s+)([a-z])/g, (_, p1, p2) => p1 + p2.toUpperCase());
};

// "Adamu Bola Tinubu" -> "Adamu B. T."
export const initialsAfterFirst = (fullName: string): string => {
  const parts = normalizeName(fullName).split(" ").filter(Boolean);
  if (parts.length === 0) return "";
  if (parts.length === 1) return parts[0];
  const first = parts[0];
  const rest = parts.slice(1).map((p) => `${p.charAt(0).toUpperCase()}.`).join(" ");
  return `${first} ${rest}`;
};

// Even more privacy-preserving: "Firstname I. I."
export const phoneKey = (phone: string): string => phone.replace(/\D/g, "");

// Heuristic name splitter: 2 words → first + surname, 3+ → first + middle + surname.
export type NameParts = { first: string; middle: string; surname: string };
export const splitName = (full: string): NameParts => {
  const parts = normalizeName(full).split(" ").filter(Boolean);
  if (parts.length === 0) return { first: "", middle: "", surname: "" };
  if (parts.length === 1) return { first: parts[0], middle: "", surname: "" };
  if (parts.length === 2) return { first: parts[0], middle: "", surname: parts[1] };
  return {
    first: parts[0],
    middle: parts.slice(1, -1).join(" "),
    surname: parts[parts.length - 1],
  };
};

export const joinName = (p: NameParts): string =>
  [p.first, p.middle, p.surname].filter(Boolean).join(" ").trim();
