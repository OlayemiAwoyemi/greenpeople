import { useEffect, useMemo, useState } from "react";
import { Skeleton, EmptyState, ErrorState, Initials } from "@/components/admin/AdminShell";
import { Link } from "react-router-dom";
import { fetchAll } from "@/lib/fetchAll";
import { supabase } from "@/integrations/supabase/client";
import { initialsAfterFirst } from "@/lib/textNormalize";
import { tierFor, TIERS, POINTS_LABEL } from "@/lib/greenSeeds";
import { socialActionPoints, HOST_MULTIPLIER, LESSON_BASE_POINTS, QUIZ_POINTS_PER_CORRECT } from "@/lib/scoring";
import Navbar from "@/components/Navbar";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faLandmark, faTrophy, faMedal } from "@fortawesome/free-solid-svg-icons";

type Row = { id: string; full_name: string; member_number: number; state: string; points: number };

const Ranks = () => {
  const [rows, setRows] = useState<Row[]>([]);
  const [tierCounts, setTierCounts] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);
  const [reload, setReload] = useState(0);
  const [query, setQuery] = useState("");
  const [sortBy, setSortBy] = useState<"points" | "name" | "state">("points");

  useEffect(() => {
    const load = async () => {
      setLoading(true); setFailed(false);
      const [
        membersResult,
        postsResult,
        clicksResult,
        readsResult,
        visitsResult,
        hostClicksResult,
        referralsResult,
        quizResult,
        hostReadsResult,
        hostQuizzesResult,
      ] = await Promise.all([
        fetchAll((a, b) => supabase.rpc("public_member_directory").order("id").range(a, b)),
        fetchAll((a, b) => supabase.from("social_posts").select("id, points, created_at").eq("active", true).order("id").range(a, b)),
        fetchAll((a, b) => supabase.from("social_clicks").select("member_id, post_id, created_at").is("host_member_id", null).order("id").range(a, b)),
        fetchAll((a, b) => supabase.from("curriculum_reads").select("member_id, item_id").is("host_member_id", null).order("id").range(a, b)),
        fetchAll((a, b) => supabase.from("page_visits").select("host_member_id, points_awarded").order("id").range(a, b)),
        fetchAll((a, b) => supabase.from("social_clicks").select("host_member_id, points_awarded").not("host_member_id", "is", null).order("id").range(a, b)),
        fetchAll((a, b) => supabase.from("member_referrals").select("referrer_id, points_awarded").order("id").range(a, b)),
        fetchAll((a, b) => supabase.from("quiz_attempts").select("member_id, item_id").is("host_member_id", null).order("id").range(a, b)),
        fetchAll((a, b) => supabase.from("curriculum_reads").select("host_member_id, points_awarded").not("host_member_id", "is", null).order("id").range(a, b)),
        fetchAll((a, b) => supabase.from("quiz_attempts").select("host_member_id, points_awarded").not("host_member_id", "is", null).order("id").range(a, b)),
      ]);
      if (membersResult.error) { setFailed(true); setLoading(false); return; }
      const { data: members } = membersResult;
      const { data: posts } = postsResult;
      const { data: clicks } = clicksResult;
      const { data: reads } = readsResult;
      const { data: pv } = visitsResult;
      const { data: hostClicks } = hostClicksResult;
      const { data: refs } = referralsResult;
      const { data: quiz } = quizResult;
      const { data: hostReads } = hostReadsResult;
      const { data: hostQuizzes } = hostQuizzesResult;

      const postMap = new Map((posts ?? []).map((p) => [p.id, p]));
      
      const readsMap = new Map<string, Set<string>>();
      const quizMap = new Map<string, Set<string>>();
      const ownPostPoints = new Map<string, number>();
      const hostBonusMap = new Map<string, number>();
      const referralBonusMap = new Map<string, number>();

      (clicks ?? []).forEach((c) => {
        const post = postMap.get(c.post_id);
        if (post) {
          const pts = socialActionPoints(post.points, post.created_at, c.created_at);
          ownPostPoints.set(c.member_id, (ownPostPoints.get(c.member_id) ?? 0) + pts);
        }
      });

      (reads ?? []).forEach((r) => {
        if (!readsMap.has(r.member_id)) readsMap.set(r.member_id, new Set());
        readsMap.get(r.member_id)!.add(r.item_id);
      });

      (quiz ?? []).forEach((q) => {
        if (!quizMap.has(q.member_id)) quizMap.set(q.member_id, new Set());
        quizMap.get(q.member_id)!.add(q.item_id);
      });

      (pv ?? []).forEach((v) => {
        if (v.host_member_id) {
          hostBonusMap.set(v.host_member_id, (hostBonusMap.get(v.host_member_id) ?? 0) + (v.points_awarded ?? 0));
        }
      });

      (hostClicks ?? []).forEach((c) => {
        if (c.host_member_id) {
          hostBonusMap.set(c.host_member_id, (hostBonusMap.get(c.host_member_id) ?? 0) + (c.points_awarded ?? 0));
        }
      });

      (hostReads ?? []).forEach((r) => {
        if (r.host_member_id) {
          hostBonusMap.set(r.host_member_id, (hostBonusMap.get(r.host_member_id) ?? 0) + (r.points_awarded ?? 0));
        }
      });

      (hostQuizzes ?? []).forEach((q) => {
        if (q.host_member_id) {
          hostBonusMap.set(q.host_member_id, (hostBonusMap.get(q.host_member_id) ?? 0) + (q.points_awarded ?? 0));
        }
      });

      (refs ?? []).forEach((r) => {
        if (r.referrer_id) {
          referralBonusMap.set(r.referrer_id, (referralBonusMap.get(r.referrer_id) ?? 0) + (r.points_awarded ?? 0));
        }
      });

      const ranked = (members ?? [])
        .map((m) => {
          const postPts = ownPostPoints.get(m.id) ?? 0;
          const lessonPts = (readsMap.get(m.id)?.size ?? 0) * LESSON_BASE_POINTS;
          const quizPts = (quizMap.get(m.id)?.size ?? 0) * QUIZ_POINTS_PER_CORRECT * 5;
          const hostBonus = hostBonusMap.get(m.id) ?? 0;
          const refBonus = referralBonusMap.get(m.id) ?? 0;

          const total = Math.round(postPts + lessonPts + quizPts + hostBonus * HOST_MULTIPLIER + refBonus);
          return { ...m, points: total };
        })
        .sort((a, b) => b.points - a.points);

      const counts: Record<string, number> = {};
      ranked.forEach((r) => {
        const t = tierFor(r.points);
        counts[t.name] = (counts[t.name] || 0) + 1;
      });

      setRows(ranked);
      setTierCounts(counts);
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
            <div key={t.name} className="field rounded-2xl p-2 text-center min-w-0">
              <div className="text-[15px] font-extrabold text-foreground tabular-nums leading-none mb-1">{tierCounts[t.name] || 0}</div>
              <div className={`font-bold text-[11px] truncate ${t.color}`}>{t.short}</div>
              <div className="text-[9px] text-muted-foreground mt-0.5">{t.min.toLocaleString()}+</div>
            </div>
          ))}
        </div>

        <div className="glass p-3 mb-4 flex flex-col sm:flex-row gap-2">
          <label htmlFor="r-search" className="sr-only">Search the leaderboard</label>
          <input id="r-search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search by name or state"
            className="flex-1 field rounded-2xl px-4 min-h-11 text-[15px] focus:outline-none focus:ring-0" />
          <label htmlFor="r-sort" className="sr-only">Sort by</label>
          <select id="r-sort" value={sortBy} onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
            className="field rounded-2xl px-4 min-h-11 text-[15px] focus:outline-none focus:ring-0">
            <option value="points">Sort: highest points</option><option value="name">Sort: name A–Z</option><option value="state">Sort: state</option>
          </select>
        </div>

        {loading ? <Skeleton rows={8} /> : failed ? <ErrorState onRetry={() => setReload((x) => x + 1)} /> : rows.length === 0 ? <EmptyState title="No members yet" /> : visible.length === 0 ? <EmptyState title="No one matches that search" /> : (
        <div className="glass overflow-hidden">
          {(
            <div className="divide-y divide-pale/50">
              {visible.map((r) => { const i = r.rank;
                const tier = tierFor(r.points);
                return (
                  <Link key={r.id} to={`/${r.member_number}`} className="flex items-center gap-2.5 sm:gap-3 p-3 sm:p-4 odd:bg-mist/50 hover:bg-white/80 transition-colors min-w-0">
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
