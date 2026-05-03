import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { initialsAfterFirst } from "@/lib/textNormalize";
import { tierFor, TIERS, POINTS_LABEL } from "@/lib/greenSeeds";
import { socialActionPoints, HOST_MULTIPLIER } from "@/lib/scoring";
import Navbar from "@/components/Navbar";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faLandmark, faTrophy, faMedal } from "@fortawesome/free-solid-svg-icons";

type Row = { id: string; full_name: string; phone: string; state: string; points: number };

const Ranks = () => {
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const [{ data: members }, { data: posts }, { data: clicks }, { data: reads }, { data: pv }, { data: hostClicks }, { data: refs }, { data: quiz }] = await Promise.all([
        supabase.from("members").select("id, full_name, phone, state"),
        supabase.from("social_posts").select("id, points, created_at"),
        supabase.from("social_clicks").select("member_id, post_id, points_awarded, created_at, host_member_id"),
        supabase.from("curriculum_reads").select("member_id, points_awarded"),
        supabase.from("page_visits").select("host_member_id, points_awarded"),
        supabase.from("social_clicks").select("host_member_id, points_awarded"),
        supabase.from("member_referrals").select("referrer_id, points_awarded"),
        supabase.from("quiz_attempts").select("member_id, points_awarded"),
      ]);

      const postMap = new Map((posts ?? []).map((p) => [p.id, p]));
      const totals = new Map<string, number>();
      const add = (id: string, n: number) => totals.set(id, (totals.get(id) ?? 0) + n);

      // Self-action points (with promptness recomputed retroactively)
      (clicks ?? []).forEach((c) => {
        if (c.host_member_id) return; // host-credited handled below
        const post = postMap.get(c.post_id);
        if (post) add(c.member_id, socialActionPoints(post.points, post.created_at, c.created_at));
        else add(c.member_id, c.points_awarded ?? 0);
      });
      (reads ?? []).forEach((r) => add(r.member_id, r.points_awarded ?? 0));
      (quiz ?? []).forEach((q) => add(q.member_id, q.points_awarded ?? 0));

      // Host bonus (visitor-driven)
      (pv ?? []).forEach((v) => add(v.host_member_id, Math.round((v.points_awarded ?? 0) * HOST_MULTIPLIER)));
      (hostClicks ?? []).forEach((c) => { if (c.host_member_id) add(c.host_member_id, Math.round((c.points_awarded ?? 0) * HOST_MULTIPLIER)); });
      (refs ?? []).forEach((r) => add(r.referrer_id, r.points_awarded ?? 0));

      const ranked = (members ?? [])
        .map((m) => ({ ...m, points: Math.round(totals.get(m.id) ?? 0) }))
        .sort((a, b) => b.points - a.points);
      setRows(ranked);
      setLoading(false);
    };
    load();
  }, []);

  const medal = (i: number) => i === 0 ? "text-yellow-500" : i === 1 ? "text-gray-400" : i === 2 ? "text-amber-700" : "text-muted-foreground";

  return (
    <div className="min-h-screen bg-background pb-16 overflow-x-hidden">
      <Navbar />
      <div className="pt-24 max-w-3xl mx-auto px-4 sm:px-5">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary text-xs font-semibold px-3 py-1.5 rounded-full mb-3">
            <FontAwesomeIcon icon={faLandmark} className="w-3 h-3" />
            {POINTS_LABEL} — public leaderboard
          </div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground mb-2">The People's Cabinet</h1>
          <p className="text-muted-foreground text-sm max-w-md mx-auto">
            Climb from Ward Leader to President by mobilising, learning, and bringing others in.
          </p>
        </div>

        <div className="grid grid-cols-3 sm:grid-cols-5 gap-1.5 mb-6">
          {TIERS.map((t) => (
            <div key={t.name} className="bg-secondary/50 border border-border rounded-lg p-2 text-center min-w-0">
              <div className={`font-bold text-[11px] truncate ${t.color}`}>{t.short}</div>
              <div className="text-[9px] text-muted-foreground mt-0.5">{t.min.toLocaleString()}+</div>
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
                  <Link key={r.id} to={`/${r.phone.replace(/\D/g, "")}`} className="flex items-center gap-2.5 sm:gap-3 p-3 sm:p-4 hover:bg-secondary/40 transition-colors min-w-0">
                    <div className={`w-7 sm:w-8 text-center font-bold ${medal(i)} flex-shrink-0`}>
                      {i < 3 ? <FontAwesomeIcon icon={i === 0 ? faTrophy : faMedal} className="w-4 h-4" /> : `#${i + 1}`}
                    </div>
                    <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm flex-shrink-0">
                      {(r.full_name || "?").charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-[13px] sm:text-sm text-foreground truncate">{initialsAfterFirst(r.full_name)}</div>
                      <div className="text-[10px] sm:text-xs text-muted-foreground truncate">{r.state} · <span className={tier.color}>{tier.short}</span></div>
                    </div>
                    <div className="text-right whitespace-nowrap flex-shrink-0">
                      <div className="font-bold text-foreground text-sm">{r.points.toLocaleString("en-NG")}</div>
                      <div className="text-[9px] text-muted-foreground">{POINTS_LABEL}</div>
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
