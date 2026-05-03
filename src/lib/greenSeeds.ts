// Political rank ladder (Nigerian elective positions) — replaces GreenSeeds tiers.
// Points name remains a "Green" theme but is rendered as "Mandate Points" politically.

export type Tier = { name: string; min: number; color: string; short: string };

// 15 ranks: low → high, including deputies & federal speakers.
export const TIERS: Tier[] = [
  { name: "Ward Leader", min: 0, color: "text-[#a4d960]", short: "Ward Leader" },
  { name: "Councillor", min: 100, color: "text-[#8fc945]", short: "Councillor" },
  { name: "Vice Chairman", min: 300, color: "text-[#7cb43c]", short: "Vice Chair" },
  { name: "LG Chairman", min: 700, color: "text-[#6aa033]", short: "LG Chair" },
  { name: "State Assembly Member", min: 1400, color: "text-[#5d8e2d]", short: "State Rep" },
  { name: "Deputy Speaker (State)", min: 2400, color: "text-[#508027]", short: "Dep. Speaker" },
  { name: "Speaker (State)", min: 3700, color: "text-[#427022]", short: "Speaker" },
  { name: "House of Reps Member", min: 5400, color: "text-[#36621d]", short: "Rep" },
  { name: "Senator", min: 7600, color: "text-[#2c5519]", short: "Senator" },
  { name: "Speaker (Federal)", min: 10500, color: "text-[#255625]", short: "Fed. Speaker" },
  { name: "Senate President", min: 14000, color: "text-[#1f4a1f]", short: "Senate Pres." },
  { name: "Deputy Governor", min: 18500, color: "text-[#1a3f1a]", short: "Dep. Governor" },
  { name: "Governor", min: 24000, color: "text-[#163516]", short: "Governor" },
  { name: "Vice President", min: 32000, color: "text-[#102b10]", short: "Vice President" },
  { name: "President", min: 45000, color: "text-[#0a200a]", short: "President" },
];

export const tierFor = (points: number): Tier => {
  let tier = TIERS[0];
  for (const t of TIERS) if (points >= t.min) tier = t;
  return tier;
};

export const nextTier = (points: number): Tier | null => {
  for (const t of TIERS) if (points < t.min) return t;
  return null;
};

// Politically-themed point label
export const POINTS_LABEL = "Mandate Points";
export const POINTS_LABEL_SHORT = "MP";
