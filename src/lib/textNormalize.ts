// Text normalization helpers for member-submitted data.
// - Names: capitalize the first letter of each word (preserving hyphens, apostrophes, particles like "de", "van", etc. are still title-cased).
// - Free text: trim, collapse whitespace, capitalize the first letter of each sentence.

const SMALL_PARTICLES = new Set(["de", "del", "la", "van", "von", "der", "den", "di"]);

const titleCaseWord = (word: string): string => {
  if (!word) return word;
  // Handle hyphenated and apostrophe parts, e.g. "mary-jane", "o'connor"
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
  return raw
    .replace(/\s+/g, " ")
    .trim()
    .split(" ")
    .map(titleCaseWord)
    .join(" ");
};

export const normalizeSentence = (raw: string): string => {
  if (!raw) return "";
  const cleaned = raw.replace(/\s+/g, " ").trim();
  if (!cleaned) return "";
  // Capitalize first letter of each sentence; keep rest as-is so acronyms (PVC, INEC) stay uppercase.
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

// Generic phone digit-only key
export const phoneKey = (phone: string): string => phone.replace(/\D/g, "");
