import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { initialsAfterFirst } from "@/lib/textNormalize";
import { tierFor, TIERS } from "@/lib/greenSeeds";
import Navbar from "@/components/Navbar";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSeedling, faTrophy, faMedal } from "@fortawesome/free-solid-svg-icons";

type Row = {
  id: string;
  full_name: string;
  phone: string;
  state: string;
  points: number;
};

const Ranks = () => {
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const [{ data: members }, { data: clicks }, { data: reads }] = await Promise.all([
        supabase.from("members").select("id, full_name, phone, state"),
        supabase.from("social_clicks").select("member_id, points_awarded"),
        supabase.from("curriculum_reads").select("member_id, points_awarded"),
      ]);
      const totals = new Map<string, number>();
      (clicks ?? []).forEach((c) => totals.set(c.member_id, (totals.get(c.member_id) ?? 0) + (c.points_awarded ?? 0)));
      (reads ?? []).forEach((r) => totals.set(r.member_id, (totals.get(r.member_id) ?? 0) + (r.points_awarded ?? 0)));

      const ranked = (members ?? [])
        .map((m) => ({ ...m, points: totals.get(m.id) ?? 0 }))
        .sort((a, b) => b.points - a.points);
      setRows(ranked);
      setLoading(false);
    };
    load();
  }, []);

  const medal = (i: number) => {
    if (i === 0) return "text-yellow-500";
    if (i === 1) return "text-gray-400";
    if (i === 2) return "text-amber-700";
    return "text-muted-foreground";
  };

  return (
    <div className="min-h-screen bg-background pb-16">
      <Navbar />
      <div className="pt-24 max-w-3xl mx-auto px-5">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary text-xs font-semibold px-3 py-1.5 rounded-full mb-3">
            <FontAwesomeIcon icon={faSeedling} className="w-3 h-3" />
            GreenSeeds — public leaderboard
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">The Green Ladder</h1>
          <p className="text-muted-foreground text-sm max-w-md mx-auto">
            Every action plants a GreenSeed. Climb from Sapling to Forest by liking, sharing, and learning.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-6">
          {TIERS.map((t) => (
            <div key={t.name} className="bg-secondary/50 border border-border rounded-xl p-3 text-center">
              <div className={`font-bold text-sm ${t.color}`}>{t.name}</div>
              <div className="text-[10px] text-muted-foreground mt-0.5">{t.min}+ seeds</div>
            </div>
          ))}
        </div>

        <div className="bg-card border border-border rounded-2xl overflow-hidden">
          {loading ? (
            <div className="p-12 text-center text-muted-foreground text-sm">Loading…</div>
          ) : rows.length === 0 ? (
            <div className="p-12 text-center text-muted-foreground text-sm">No members yet.</div>
          ) : (
            <div className="divide-y divide-border">
              {rows.map((r, i) => {
                const tier = tierFor(r.points);
                return (
                  <Link
                    key={r.id}
                    to={`/${r.phone.replace(/\D/g, "")}`}
                    className="flex items-center gap-3 p-4 hover:bg-secondary/40 transition-colors"
                  >
                    <div className={`w-8 text-center font-bold ${medal(i)}`}>
                      {i < 3 ? <FontAwesomeIcon icon={i === 0 ? faTrophy : faMedal} className="w-4 h-4" /> : `#${i + 1}`}
                    </div>
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm flex-shrink-0">
                      {(r.full_name || "?").charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-sm text-foreground truncate">{initialsAfterFirst(r.full_name)}</div>
                      <div className="text-xs text-muted-foreground">{r.state} · <span className={tier.color}>{tier.name}</span></div>
                    </div>
                    <div className="text-right whitespace-nowrap">
                      <div className="font-bold text-foreground text-sm">{r.points.toLocaleString("en-NG")}</div>
                      <div className="text-[10px] text-muted-foreground">GreenSeeds</div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Ranks;
