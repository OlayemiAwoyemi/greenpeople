// Dynamic anti-gaming scoring engine.
// - Time-decay: action within 1h of post = 3x; halves every 24h thereafter; floor at 1x.
// - Uniqueness: enforced at DB level (UNIQUE on member_id+post_id, member_id+item_id, host+visitor_hash).
// - Visitor-driven page actions (host_member_id) award the host at half rate.
// - Referral bonus: +50 when a new member joins via shared link.
// - Quiz: 5 MCQs per lesson; +2 per correct answer (max 10). Lesson read base = 5.
// - Page visit (unique visitor): +1 to host (capped 1 per visitor per host forever).
// - All values applied retroactively in client-side aggregation when older rows have
//   `points_awarded` columns; the engine adjusts on display so old records don't need rewrite.

export const REFERRAL_BONUS = 50;
export const PAGE_VISIT_POINTS = 1;
export const QUIZ_POINTS_PER_CORRECT = 2;
export const QUIZ_MAX_QUESTIONS = 5;
export const LESSON_BASE_POINTS = 5;
export const HOST_MULTIPLIER = 0.5; // visitor-driven actions credit host at half

const MS_PER_HOUR = 60 * 60 * 1000;
const MS_PER_DAY = 24 * MS_PER_HOUR;

// Promptness multiplier: 3x within 1h, decays by half every 24h, min 1.
export const promptnessMultiplier = (postCreatedAt: string | Date, actionAt: string | Date = new Date()): number => {
  const post = new Date(postCreatedAt).getTime();
  const act = new Date(actionAt).getTime();
  const dt = Math.max(0, act - post);
  if (dt <= MS_PER_HOUR) return 3;
  const days = (dt - MS_PER_HOUR) / MS_PER_DAY;
  const decayed = 3 * Math.pow(0.5, days);
  return Math.max(1, decayed);
};

export const socialActionPoints = (basePoints: number, postCreatedAt: string | Date, actionAt: string | Date = new Date()): number => {
  return Math.round(basePoints * promptnessMultiplier(postCreatedAt, actionAt));
};

// Visitor hash: stable per browser, no PII. Stored only in localStorage.
const VISITOR_KEY = "gp_visitor_hash";
export const getVisitorHash = (): string => {
  if (typeof window === "undefined") return "ssr";
  let h = localStorage.getItem(VISITOR_KEY);
  if (!h) {
    h = crypto.randomUUID();
    localStorage.setItem(VISITOR_KEY, h);
  }
  return h;
};

// Rate-limit gate (1 click per 10 seconds per visitor).
const RATE_KEY = "gp_last_click_at";
export const RATE_LIMIT_MS = 10 * 1000;
export const checkRateLimit = (): boolean => {
  if (typeof window === "undefined") return true;
  const last = parseInt(localStorage.getItem(RATE_KEY) || "0", 10);
  if (Date.now() - last < RATE_LIMIT_MS) return false;
  localStorage.setItem(RATE_KEY, String(Date.now()));
  return true;
};
