// Tier ladder for the Green Ladder leaderboard
export type Tier = { name: string; min: number; color: string };

export const TIERS: Tier[] = [
  { name: "Sapling", min: 0, color: "text-emerald-500" },
  { name: "Sprout", min: 100, color: "text-green-500" },
  { name: "Tree", min: 500, color: "text-green-600" },
  { name: "Forest", min: 2000, color: "text-green-700" },
];

export const tierFor = (points: number): Tier => {
  let tier = TIERS[0];
  for (const t of TIERS) {
    if (points >= t.min) tier = t;
  }
  return tier;
};

export const nextTier = (points: number) => {
  for (const t of TIERS) {
    if (points < t.min) return t;
  }
  return null;
};
