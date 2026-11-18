import { useEffect, useMemo, useState } from "react";
import { Skeleton, EmptyState, ErrorState, Initials } from "@/components/admin/AdminShell";
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
  const [failed, setFailed] = useState(false);
  const [reload, setReload] = useState(0);
  const [query, setQuery] = useState("");
  const [sortBy, setSortBy] = useState<"points" | "name" | "state">("points");

  useEffect(() => {
    const load = async () => {
      setLoading(true); setFailed(false);
      const results = await Promise.all([
        supabase.from("members").select("id, full_name, phone, state"),
        supabase.from("social_posts").select("id, points, created_at"),
        supabase.from("social_clicks").select("member_id, post_id, points_awarded, created_at, host_member_id"),
        supabase.from("curriculum_reads").select("member_id, points_awarded"),
        supabase.from("page_visits").select("host_member_id, points_awarded"),
        supabase.from("social_clicks").select("host_member_id, points_awarded"),
        supabase.from("member_referrals").select("referrer_id, points_awarded"),
        supabase.from("quiz_attempts").select("member_id, points_awarded"),
      ]);
      if (results[0].error) { setFailed(true); setLoading(false); return; }
      const [{ data: members }, { data: posts }, { data: clicks }, { data: reads }, { data: pv }, { data: hostClicks }, { data: refs }, { data: quiz }] = results;

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
  }, [reload]);

  const ranked = useMemo(() => rows.map((r, i) => ({ ...r, rank: i })), [rows]);
  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = ranked.filter((r) => !q || r.full_name.toLowerCase().includes(q) || r.state.toLowerCase().includes(q));
    if (sortBy === "name") return [...list].sort((a, b) => a.full_name.localeCompare(b.full_name));
    if (sortBy === "state") return [...list].sort((a, b) => a.state.localeCompare(b.state) || a.rank - b.rank);
    return list;
  }, [ranked, query, sortBy]);

  const medal = (i: number) => i === 0 ? "text-primary" : i === 1 ? "text-olive" : i === 2 ? "text-sage" : "text-muted-foreground";

  return (
    <div className="min-h-screen pb-16 overflow-x-hidden">
      <Navbar />
      <div className="pt-24 max-w-3xl mx-auto px-4 sm:px-5">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 glass !rounded-full text-foreground text-sm font-semibold px-4 py-1.5 mb-3">
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
            <div key={t.name} className="bg-white/70 border border-pale rounded-2xl p-2 text-center min-w-0">
              <div className={`font-bold text-[11px] truncate ${t.color}`}>{t.short}</div>
              <div className="text-[9px] text-muted-foreground mt-0.5">{t.min.toLocaleString()}+</div>
            </div>
          ))}
        </div>

        <div className="glass p-3 mb-4 flex flex-col sm:flex-row gap-2">
          <label htmlFor="r-search" className="sr-only">Search the leaderboard</label>
          <input id="r-search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search by name or state"
            className="flex-1 bg-white/70 border border-pale rounded-2xl px-4 min-h-11 text-[15px] focus:outline-none focus:ring-[3px] focus:ring-primary/60" />
          <label htmlFor="r-sort" className="sr-only">Sort by</label>
          <select id="r-sort" value={sortBy} onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
            className="bg-white/70 border border-pale rounded-2xl px-4 min-h-11 text-[15px] focus:outline-none focus:ring-[3px] focus:ring-primary/60">
            <option value="points">Sort: highest points</option><option value="name">Sort: name A–Z</option><option value="state">Sort: state</option>
          </select>
        </div>

        {loading ? <Skeleton rows={8} /> : failed ? <ErrorState onRetry={() => setReload((x) => x + 1)} /> : rows.length === 0 ? <EmptyState title="No members yet" /> : visible.length === 0 ? <EmptyState title="No one matches that search" /> : (
        <div className="glass overflow-hidden">
          {(
            <div className="divide-y divide-pale">
              {visible.map((r) => { const i = r.rank;
                const tier = tierFor(r.points);
                return (
                  <Link key={r.id} to={`/${r.phone.replace(/\D/g, "")}`} className="flex items-center gap-2.5 sm:gap-3 p-3 sm:p-4 odd:bg-mist/50 hover:bg-white/80 transition-colors min-w-0">
                    <div className={`w-7 sm:w-8 text-center font-bold ${medal(i)} flex-shrink-0`}>
                      {i < 3 ? <FontAwesomeIcon icon={i === 0 ? faTrophy : faMedal} className="w-4 h-4" /> : `#${i + 1}`}
                    </div>
                    <Initials name={r.full_name || "?"} />
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-[13px] sm:text-sm text-foreground truncate">{initialsAfterFirst(r.full_name)}</div>
                      <div className="text-xs text-muted-foreground truncate flex items-center gap-1.5">{r.state} <span className="bg-pale text-foreground font-semibold rounded-full px-2 py-0.5">{tier.short}</span></div>
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
        )}
      </div>
    </div>
  );
};

export default Ranks;
