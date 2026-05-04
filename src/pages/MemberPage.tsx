import { useEffect, useMemo, useState, useCallback } from "react";
import { useParams, Link, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { initialsAfterFirst } from "@/lib/textNormalize";
import { tierFor, nextTier, POINTS_LABEL } from "@/lib/greenSeeds";
import {
  socialActionPoints, getVisitorHash, checkRateLimit,
  PAGE_VISIT_POINTS, HOST_MULTIPLIER, REFERRAL_BONUS, QUIZ_POINTS_PER_CORRECT, LESSON_BASE_POINTS,
} from "@/lib/scoring";
import Navbar from "@/components/Navbar";
import { useToast } from "@/hooks/use-toast";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faXTwitter, faInstagram, faFacebook, faYoutube } from "@fortawesome/free-brands-svg-icons";
import { faLandmark, faUpRightFromSquare, faCheck, faBookOpen, faShareNodes, faUserPlus, faArrowRight, faXmark } from "@fortawesome/free-solid-svg-icons";

type Platform = "x" | "instagram" | "facebook" | "youtube";
type Category = "leadership" | "politics" | "governance" | "life" | "civic_education";

const platformOrder: Platform[] = ["x", "instagram", "facebook", "youtube"];
const platformMeta: Record<Platform, { label: string; icon: typeof faXTwitter; color: string }> = {
  x: { label: "X", icon: faXTwitter, color: "bg-foreground text-background" },
  instagram: { label: "Instagram", icon: faInstagram, color: "bg-gradient-to-br from-pink-500 to-orange-400 text-white" },
  facebook: { label: "Facebook", icon: faFacebook, color: "bg-[#1877f2] text-white" },
  youtube: { label: "YouTube", icon: faYoutube, color: "bg-[#ff0000] text-white" },
};

type Post = { id: string; platform: Platform; url: string; title: string | null; points: number; created_at: string };
type Item = { id: string; title: string; description: string | null; content: string | null; url: string | null; category: Category };
type Quiz = { id: string; item_id: string; question: string; options: string[]; correct_index: number; position: number };

const MemberPage = () => {
  const { phone } = useParams<{ phone: string }>();
  const [searchParams] = useSearchParams();
  const referrer = searchParams.get("ref"); // referrer member id from shared link
  const { toast } = useToast();

  const [member, setMember] = useState<{ id: string; full_name: string; phone: string; state: string; lga: string } | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [items, setItems] = useState<Item[]>([]);
  const [quizzesByItem, setQuizzesByItem] = useState<Record<string, Quiz[]>>({});
  const [clickedAt, setClickedAt] = useState<Map<string, string>>(new Map()); // postId -> ISO
  const [readSet, setReadSet] = useState<Set<string>>(new Set());
  const [quizDoneSet, setQuizDoneSet] = useState<Set<string>>(new Set()); // item_ids
  const [hostBonus, setHostBonus] = useState(0); // total page-visit + visitor-driven points credited
  const [referralBonus, setReferralBonus] = useState(0);
  const [activeQuiz, setActiveQuiz] = useState<string | null>(null); // item id
  const [quizAnswers, setQuizAnswers] = useState<Record<string, number>>({}); // quiz id -> chosen
  const [openLesson, setOpenLesson] = useState<Item | null>(null);
  const [lessonStep, setLessonStep] = useState(0);
  const [loading, setLoading] = useState(true);

  const isOwnPage = useMemo(() => {
    if (typeof window === "undefined" || !member) return false;
    return localStorage.getItem("gp_member_id") === member.id;
  }, [member]);

  // Load member + activity
  useEffect(() => {
    const load = async () => {
      if (!phone) return;
      const digits = phone.replace(/\D/g, "");
      const { data: members } = await supabase.from("members").select("id, full_name, phone, state, lga");
      const m = (members ?? []).find((x) => x.phone.replace(/\D/g, "").endsWith(digits) || digits.endsWith(x.phone.replace(/\D/g, "")));
      if (!m) { setLoading(false); return; }
      setMember(m);

      const visitorHash = getVisitorHash();
      const isOwner = typeof window !== "undefined" && localStorage.getItem("gp_member_id") === m.id;

      // For "done" state we scope to the current viewer:
      //  - Owner: their own clicks/reads on this member row
      //  - Visitor: rows on this host scoped by their visitor_hash
      const myClicksQuery = isOwner
        ? supabase.from("social_clicks").select("post_id, created_at").eq("member_id", m.id).is("host_member_id", null)
        : supabase.from("social_clicks").select("post_id, created_at").eq("host_member_id", m.id).eq("visitor_hash", visitorHash);
      const myReadsQuery = isOwner
        ? supabase.from("curriculum_reads").select("item_id").eq("member_id", m.id).is("host_member_id", null)
        : supabase.from("curriculum_reads").select("item_id").eq("host_member_id", m.id).eq("visitor_hash", visitorHash);

      const [{ data: sp }, { data: ci }, { data: sc }, { data: cr }, { data: qa }, { data: hostClicks }, { data: pv }, { data: refs }] = await Promise.all([
        supabase.from("social_posts").select("*").eq("active", true).order("created_at", { ascending: false }),
        supabase.from("curriculum_items").select("*").eq("active", true).order("created_at", { ascending: false }),
        myClicksQuery,
        myReadsQuery,
        supabase.from("quiz_attempts").select("item_id, points_awarded").eq("member_id", m.id),
        supabase.from("social_clicks").select("points_awarded").eq("host_member_id", m.id),
        supabase.from("page_visits").select("points_awarded").eq("host_member_id", m.id),
        supabase.from("member_referrals").select("points_awarded").eq("referrer_id", m.id),
      ]);

      setPosts((sp ?? []) as Post[]);
      setItems((ci ?? []) as Item[]);

      const cMap = new Map<string, string>();
      (sc ?? []).forEach((c) => cMap.set(c.post_id, c.created_at));
      setClickedAt(cMap);
      setReadSet(new Set((cr ?? []).map((r) => r.item_id)));
      setQuizDoneSet(new Set((qa ?? []).map((q) => q.item_id)));

      const visitorPts = (pv ?? []).reduce((s, x) => s + (x.points_awarded ?? 0), 0);
      const hostClickPts = (hostClicks ?? []).reduce((s, x) => s + (x.points_awarded ?? 0), 0);
      setHostBonus(visitorPts + hostClickPts);
      setReferralBonus((refs ?? []).reduce((s, x) => s + (x.points_awarded ?? 0), 0));

      // Load quizzes
      const itemIds = (ci ?? []).map((x) => x.id);
      if (itemIds.length > 0) {
        const { data: quizzes } = await supabase.from("lesson_quizzes").select("*").in("item_id", itemIds).order("position");
        const byItem: Record<string, Quiz[]> = {};
        (quizzes ?? []).forEach((q) => {
          const opts = Array.isArray(q.options) ? (q.options as string[]) : [];
          (byItem[q.item_id] ||= []).push({ ...q, options: opts } as Quiz);
        });
        setQuizzesByItem(byItem);
      }

      // Award page-visit credit if visitor != owner
      if (!isOwner) {
        await supabase.from("page_visits").insert({
          host_member_id: m.id,
          visitor_hash: visitorHash,
          points_awarded: PAGE_VISIT_POINTS,
        }); // unique constraint silently ignores duplicate
      }
      setLoading(false);
    };
    load();
  }, [phone]);

  // Award referral if ?ref= is set, current viewer is a different known member
  useEffect(() => {
    const tryRef = async () => {
      if (!referrer || !member) return;
      if (referrer === member.id) return;
      // Just record (UNIQUE on referred_member_id prevents duplicates)
      await supabase.from("member_referrals").insert({
        referrer_id: referrer,
        referred_member_id: member.id,
        points_awarded: REFERRAL_BONUS,
      });
    };
    tryRef();
  }, [referrer, member]);

  // Earned points for own actions on posts (with promptness applied)
  const ownPostPoints = useMemo(() => {
    let total = 0;
    posts.forEach((p) => {
      const at = clickedAt.get(p.id);
      if (at) total += socialActionPoints(p.points, p.created_at, at);
    });
    return total;
  }, [posts, clickedAt]);

  const ownLessonPoints = readSet.size * LESSON_BASE_POINTS;
  const ownQuizPoints = useMemo(() => quizDoneSet.size * QUIZ_POINTS_PER_CORRECT * 5, [quizDoneSet]);

  const totalPoints = Math.round(ownPostPoints + ownLessonPoints + ownQuizPoints + hostBonus * HOST_MULTIPLIER + referralBonus);
  const tier = tierFor(totalPoints);
  const next = nextTier(totalPoints);
  const progress = next ? Math.min(100, ((totalPoints - tier.min) / (next.min - tier.min)) * 100) : 100;

  const handleSocialClick = useCallback(async (p: Post) => {
    if (!member) return;
    if (clickedAt.has(p.id)) {
      // Already done for this viewer — just open the link, no rate-limit, no insert.
      window.open(p.url, "_blank", "noopener,noreferrer");
      return;
    }
    if (!checkRateLimit()) {
      toast({ title: "Slow down 😊", description: "One click every 10 seconds keeps things fair.", variant: "destructive" });
      return;
    }
    const visitorHash = getVisitorHash();
    const isOwner = typeof window !== "undefined" && localStorage.getItem("gp_member_id") === member.id;
    const points = socialActionPoints(p.points, p.created_at);
    // Mark done immediately (optimistic) so the UI moves it to the bottom right away.
    setClickedAt((s) => new Map(s).set(p.id, new Date().toISOString()));
    window.open(p.url, "_blank", "noopener,noreferrer");
    if (isOwner) {
      const { error } = await supabase.from("social_clicks").insert({
        member_id: member.id, post_id: p.id, points_awarded: points, visitor_hash: visitorHash,
      });
      if (error) setClickedAt((s) => { const n = new Map(s); n.delete(p.id); return n; });
    } else {
      // Visitor on someone else's page — credits the host. Each unique visitor counts once per post.
      const { error } = await supabase.from("social_clicks").insert({
        member_id: member.id, post_id: p.id, points_awarded: points,
        host_member_id: member.id, visitor_hash: visitorHash,
      });
      if (error) setClickedAt((s) => { const n = new Map(s); n.delete(p.id); return n; });
      else setHostBonus((b) => b + points);
    }
  }, [member, clickedAt, toast]);

  const handleRead = async (it: Item) => {
    if (!member) return;
    if (readSet.has(it.id)) return;
    const visitorHash = getVisitorHash();
    const isOwner = typeof window !== "undefined" && localStorage.getItem("gp_member_id") === member.id;
    setReadSet((s) => new Set(s).add(it.id));
    const { error } = await supabase.from("curriculum_reads").insert({
      member_id: member.id, item_id: it.id, points_awarded: LESSON_BASE_POINTS,
      host_member_id: isOwner ? null : member.id,
      visitor_hash: isOwner ? null : visitorHash,
    });
    if (error) setReadSet((s) => { const n = new Set(s); n.delete(it.id); return n; });
    else if (!isOwner) setHostBonus((b) => b + LESSON_BASE_POINTS);
  };

  const submitQuiz = async (it: Item) => {
    if (!member) return;
    const list = quizzesByItem[it.id] || [];
    if (list.length === 0) return;
    let correct = 0;
    list.forEach((q) => { if (quizAnswers[q.id] === q.correct_index) correct += 1; });
    const points = correct * QUIZ_POINTS_PER_CORRECT;
    const { error } = await supabase.from("quiz_attempts").insert({
      member_id: member.id, item_id: it.id, score: correct, total: list.length, points_awarded: points,
    });
    if (error) {
      toast({ title: "Already attempted", description: "You can only take each quiz once.", variant: "destructive" });
    } else {
      toast({ title: `Score: ${correct}/${list.length}`, description: `+${points} ${POINTS_LABEL}` });
      setQuizDoneSet((s) => new Set(s).add(it.id));
    }
    setActiveQuiz(null);
  };

  // Split rich-text/html content into digestible bits.
  const lessonBits = useMemo(() => {
    if (!openLesson) return [] as string[];
    const raw = (openLesson.content && openLesson.content.trim()) || openLesson.description || "";
    if (!raw) return [];
    const looksHtml = /<\/?(p|h[1-6]|ul|ol|li|blockquote|div|br)/i.test(raw);
    if (looksHtml) {
      const chunks = raw
        .split(/(?=<(?:p|h[1-6]|ul|ol|blockquote)[\s>])/i)
        .map((s) => s.trim())
        .filter(Boolean);
      const out: string[] = [];
      let buf = "";
      for (const c of chunks) {
        if ((buf + c).length < 380) buf += c;
        else { if (buf) out.push(buf); buf = c; }
      }
      if (buf) out.push(buf);
      return out.length ? out : [raw];
    }
    const paras = raw.split(/\n{2,}/).map((s) => s.trim()).filter(Boolean);
    const out: string[] = [];
    let buf = "";
    for (const p of paras) {
      if ((buf + "\n\n" + p).length < 380) buf = buf ? buf + "\n\n" + p : p;
      else { if (buf) out.push(buf); buf = p; }
    }
    if (buf) out.push(buf);
    return out.length ? out : [raw];
  }, [openLesson]);

  const startLesson = (it: Item) => {
    setOpenLesson(it);
    setLessonStep(0);
    handleRead(it);
  };

  const sharePage = async () => {
    if (!member) return;
    const url = `${window.location.origin}/${member.phone.replace(/\D/g, "")}?ref=${member.id}`;
    const text = `I'm building a new Nigeria with the Green People movement. Visit my page, take action, and join us 🌱`;
    if (navigator.share) {
      try { await navigator.share({ title: "Green People", text, url }); return; } catch { /* fallthrough */ }
    }
    await navigator.clipboard.writeText(url);
    toast({ title: "Link copied!", description: "Share it anywhere." });
  };

  if (loading) return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <Navbar />
      <div className="text-muted-foreground text-sm">Loading…</div>
    </div>
  );
  if (!member) return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-32 text-center px-5">
        <h1 className="text-2xl font-bold mb-2">Member not found</h1>
        <p className="text-muted-foreground text-sm mb-6">No member matches that phone number.</p>
        <Link to="/ranks" className="text-primary text-sm font-semibold hover:underline">View the leaderboard →</Link>
      </div>
    </div>
  );

  // Sort: posts the member hasn't acted on first; acted-on at the bottom (per platform)
  const groupedPosts = platformOrder.map((plat) => {
    const list = posts.filter((x) => x.platform === plat);
    const undone = list.filter((p) => !clickedAt.has(p.id));
    const done = list.filter((p) => clickedAt.has(p.id));
    return { platform: plat, items: [...undone, ...done] };
  });

  return (
    <div className="min-h-screen bg-background pb-16 overflow-x-hidden">
      <Navbar />
      <div className="pt-24 max-w-3xl mx-auto px-4 sm:px-5">
        {/* Profile card */}
        <div className="bg-gradient-to-br from-primary/10 via-secondary/40 to-background border border-border rounded-2xl p-4 sm:p-6 mb-5">
          <div className="flex items-center gap-3 mb-4 min-w-0">
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-xl flex-shrink-0">
              {member.full_name.charAt(0)}
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-base sm:text-xl font-bold text-foreground truncate">{initialsAfterFirst(member.full_name)}</h1>
              <p className="text-muted-foreground text-[11px] sm:text-xs truncate">{member.lga}, {member.state}</p>
            </div>
            <button onClick={sharePage} aria-label="Share my page" className="flex-shrink-0 inline-flex items-center gap-1.5 bg-primary text-primary-foreground text-[11px] sm:text-xs font-semibold px-2.5 sm:px-3 py-1.5 rounded-lg shadow-sm hover:opacity-90 whitespace-nowrap">
              <FontAwesomeIcon icon={faShareNodes} className="w-3 h-3" /> Share
            </button>
          </div>

          <div className="flex items-center gap-3 mb-2 flex-wrap">
            <FontAwesomeIcon icon={faLandmark} className={`w-5 h-5 ${tier.color}`} />
            <span className="text-2xl font-bold text-foreground">{totalPoints.toLocaleString("en-NG")}</span>
            <span className="text-xs sm:text-sm text-muted-foreground">{POINTS_LABEL}</span>
            <span className={`ml-auto text-[11px] sm:text-xs font-bold ${tier.color} truncate max-w-[55%] text-right`}>{tier.name}</span>
          </div>
          <div className="w-full h-2 bg-secondary rounded-full overflow-hidden">
            <div className="h-full bg-primary transition-all" style={{ width: `${progress}%` }} />
          </div>
          {next ? (
            <p className="text-[10px] sm:text-[11px] text-muted-foreground mt-2 break-words">
              {(next.min - totalPoints).toLocaleString("en-NG")} more to <span className={`font-semibold ${next.color}`}>{next.name}</span>
            </p>
          ) : (
            <p className="text-[11px] text-primary mt-2 font-semibold">Top office reached. Keep mobilising.</p>
          )}

          <div className="grid grid-cols-3 gap-2 mt-4 text-center">
            <div className="bg-background/60 rounded-lg py-2 px-1">
              <div className="text-sm font-bold text-foreground">{Math.round(ownPostPoints)}</div>
              <div className="text-[9px] sm:text-[10px] text-muted-foreground">Actions</div>
            </div>
            <div className="bg-background/60 rounded-lg py-2 px-1">
              <div className="text-sm font-bold text-foreground">{Math.round(hostBonus * HOST_MULTIPLIER)}</div>
              <div className="text-[9px] sm:text-[10px] text-muted-foreground">Visitors</div>
            </div>
            <div className="bg-background/60 rounded-lg py-2 px-1">
              <div className="text-sm font-bold text-foreground">{referralBonus}</div>
              <div className="text-[9px] sm:text-[10px] text-muted-foreground">Referrals</div>
            </div>
          </div>
        </div>

        {/* Join CTA for visitors */}
        {!isOwnPage && (
          <Link to="/#join" className="flex items-center justify-center gap-2 mb-5 bg-accent text-accent-foreground rounded-xl px-4 py-3 text-sm font-bold shadow-md hover:opacity-90 whitespace-nowrap">
            <FontAwesomeIcon icon={faUserPlus} className="w-4 h-4" />
            Join Green People — Get Your Own Page
          </Link>
        )}

        {/* Social posts */}
        <section className="mb-8">
          <h2 className="text-[11px] sm:text-sm font-bold text-foreground uppercase tracking-widest mb-3">Subscribe · Like · Comment · Share</h2>
          {groupedPosts.every((g) => g.items.length === 0) && (
            <p className="text-sm text-muted-foreground bg-secondary/40 border border-border rounded-xl p-6 text-center">No social posts yet. Check back soon.</p>
          )}
          {groupedPosts.map(({ platform, items: list }) => list.length > 0 && (
            <div key={platform} className="mb-4">
              <div className="flex items-center gap-2 mb-2">
                <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${platformMeta[platform].color}`}>
                  <FontAwesomeIcon icon={platformMeta[platform].icon} className="w-3.5 h-3.5" />
                </div>
                <h3 className="font-semibold text-sm text-foreground">{platformMeta[platform].label}</h3>
              </div>
              <div className="grid gap-2">
                {list.map((p) => {
                  const done = clickedAt.has(p.id);
                  const promptPoints = socialActionPoints(p.points, p.created_at);
                  return (
                    <button
                      key={p.id}
                      onClick={() => handleSocialClick(p)}
                      className={`group text-left bg-card border rounded-xl p-3 flex items-center gap-2.5 sm:gap-3 hover:bg-secondary/50 transition-all min-w-0 ${done ? "border-primary/40 opacity-70" : "border-border"}`}
                    >
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${done ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"}`}>
                        <FontAwesomeIcon icon={done ? faCheck : faUpRightFromSquare} className="w-3.5 h-3.5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-[12px] sm:text-xs text-foreground truncate">{p.title || p.url}</div>
                        <div className="text-[10px] text-muted-foreground truncate">{p.url}</div>
                      </div>
                      <div className="text-right whitespace-nowrap flex-shrink-0">
                        <div className={`text-sm font-bold ${done ? "text-primary" : "text-foreground"}`}>+{promptPoints}</div>
                        <div className="text-[9px] text-muted-foreground">pts</div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </section>

        {/* Green Classroom */}
        <section>
          <div className="flex items-center gap-2 mb-3">
            <FontAwesomeIcon icon={faBookOpen} className="w-4 h-4 text-primary" />
            <h2 className="text-[11px] sm:text-sm font-bold text-foreground uppercase tracking-widest">Green Classroom</h2>
          </div>
          {items.length === 0 && (
            <p className="text-sm text-muted-foreground bg-secondary/40 border border-border rounded-xl p-6 text-center">No lessons yet. Check back soon.</p>
          )}
          <div className="grid gap-2">
            {items.map((it) => {
              const done = readSet.has(it.id);
              const quizDone = quizDoneSet.has(it.id);
              const list = quizzesByItem[it.id] || [];
              const isOpen = activeQuiz === it.id;
              return (
                <div key={it.id} className={`bg-card border rounded-xl ${done ? "border-primary/40" : "border-border"}`}>
                  <button onClick={() => handleRead(it)} className="w-full text-left p-3 flex items-start gap-2.5 sm:gap-3 hover:bg-secondary/50 rounded-xl min-w-0">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${done ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"}`}>
                      <FontAwesomeIcon icon={done ? faCheck : faBookOpen} className="w-3.5 h-3.5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-[13px] sm:text-sm text-foreground break-words">{it.title}</div>
                      {it.description && <div className="text-[11px] sm:text-xs text-muted-foreground line-clamp-2 mt-0.5 break-words">{it.description}</div>}
                    </div>
                    <div className="text-right whitespace-nowrap flex-shrink-0">
                      <div className={`text-sm font-bold ${done ? "text-primary" : "text-foreground"}`}>+5</div>
                      <div className="text-[9px] text-muted-foreground">pts</div>
                    </div>
                  </button>

                  {list.length > 0 && (
                    <div className="border-t border-border p-3">
                      {quizDone ? (
                        <div className="text-[11px] text-primary font-semibold inline-flex items-center gap-1.5">
                          <FontAwesomeIcon icon={faCheck} className="w-3 h-3" /> Quiz completed
                        </div>
                      ) : !isOpen ? (
                        <button
                          onClick={() => { setActiveQuiz(it.id); setQuizAnswers({}); }}
                          className="text-[11px] sm:text-xs font-semibold bg-primary/10 text-primary px-3 py-1.5 rounded-lg whitespace-nowrap"
                        >
                          Take the quiz · earn up to +{list.length * QUIZ_POINTS_PER_CORRECT} pts
                        </button>
                      ) : (
                        <div className="space-y-3">
                          {list.map((q, qi) => (
                            <div key={q.id} className="bg-secondary/40 rounded-lg p-3">
                              <div className="text-[12px] sm:text-sm font-semibold text-foreground mb-2 break-words">{qi + 1}. {q.question}</div>
                              <div className="grid gap-1.5">
                                {q.options.map((opt, idx) => (
                                  <label key={idx} className={`flex items-start gap-2 text-[11px] sm:text-xs cursor-pointer p-2 rounded-md border ${quizAnswers[q.id] === idx ? "border-primary bg-primary/5" : "border-border"}`}>
                                    <input type="radio" name={q.id} className="mt-0.5" checked={quizAnswers[q.id] === idx} onChange={() => setQuizAnswers((s) => ({ ...s, [q.id]: idx }))} />
                                    <span className="break-words flex-1 min-w-0">{opt}</span>
                                  </label>
                                ))}
                              </div>
                            </div>
                          ))}
                          <div className="flex gap-2">
                            <button onClick={() => submitQuiz(it)} className="flex-1 bg-primary text-primary-foreground rounded-lg py-2 text-xs font-semibold whitespace-nowrap">Submit</button>
                            <button onClick={() => setActiveQuiz(null)} className="px-3 bg-secondary text-foreground rounded-lg py-2 text-xs font-semibold whitespace-nowrap">Cancel</button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      </div>
    </div>
  );
};

export default MemberPage;
