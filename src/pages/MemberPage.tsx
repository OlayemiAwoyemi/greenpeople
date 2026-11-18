import { cleanHtml } from "@/lib/cleanHtml";
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
import { faLandmark, faUpRightFromSquare, faCheck, faBookOpen, faShareNodes, faUserPlus, faArrowRight, faXmark, faDownload, faAward, faShieldHalved } from "@fortawesome/free-solid-svg-icons";
import { saveMemberId } from "@/lib/drawMemberId";
import { ScaledMemberIdCard } from "@/components/MemberIdImage";
import { useRef } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { nigerianStates } from "@/data/nigerianLGAs";

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
  const referrer = searchParams.get("ref");
  const { toast } = useToast();

  const [member, setMember] = useState<{ id: string; full_name: string; member_number: number; state: string; lga: string; gender: string; has_pvc: string; joined_at?: string | null } | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [items, setItems] = useState<Item[]>([]);
  const [quizzesByItem, setQuizzesByItem] = useState<Record<string, Quiz[]>>({});
  const [clickedAt, setClickedAt] = useState<Map<string, string>>(new Map()); // postId -> ISO
  const [readSet, setReadSet] = useState<Set<string>>(new Set());
  const [trueClickedAt, setTrueClickedAt] = useState<Map<string, string>>(new Map());
  const [trueReadSet, setTrueReadSet] = useState<Set<string>>(new Set());
  const [quizDoneSet, setQuizDoneSet] = useState<Set<string>>(new Set()); // item_ids
  const [trueQuizDoneSet, setTrueQuizDoneSet] = useState<Set<string>>(new Set()); // item_ids
  const [hostBonus, setHostBonus] = useState(0); // total page-visit + visitor-driven points credited
  const [referralBonus, setReferralBonus] = useState(0);
  const [activeQuiz, setActiveQuiz] = useState<string | null>(null); // item id
  const [quizAnswers, setQuizAnswers] = useState<Record<string, number>>({}); // quiz id -> chosen
  const [openLesson, setOpenLesson] = useState<Item | null>(null);
  const [lessonStep, setLessonStep] = useState(0);
  const lessonBodyRef = useRef<HTMLDivElement>(null);
  useEffect(() => { lessonBodyRef.current?.scrollTo({ top: 0 }); }, [lessonStep, openLesson]);
  const [loading, setLoading] = useState(true);
  const [showVerifier, setShowVerifier] = useState(false);
  const [claimOpen, setClaimOpen] = useState(false);
  const [claimPhone, setClaimPhone] = useState("");
  const [claimBusy, setClaimBusy] = useState(false);
  const [claimError, setClaimError] = useState("");

  // A member on a new phone or browser proves the page is theirs with the
  // phone number they registered with. The check runs in the database, and
  // only a yes/no comes back.
  const claimPage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!member) return;
    const digits = claimPhone.replace(/\D/g, "");
    if (digits.length < 10) { setClaimError("Enter the full phone number you registered with."); return; }
    setClaimBusy(true); setClaimError("");
    const { data } = await supabase.rpc("get_member_page", { p_ref: digits });
    setClaimBusy(false);
    if (data?.[0]?.id === member.id) {
      try { localStorage.setItem("gp_member_id", member.id); } catch { /* ignore */ }
      window.location.reload();
    } else {
      setClaimError("That number doesn't match this page. Check it and try again.");
    }
  };
  const [verifier, setVerifier] = useState<{ q: string; options: string[]; ans: string } | null>(null);

  const isOwnPage = useMemo(() => {
    if (typeof window === "undefined" || !member) return false;
    return localStorage.getItem("gp_member_id") === member.id;
  }, [member]);

  // Load member + activity
  useEffect(() => {
    const load = async () => {
      if (!phone) return;
      
      const digits = phone.replace(/\D/g, "");
      
      // Prevent matching non-numeric paths or known static routes
      if (!digits) {
        setLoading(false);
        return;
      }

      // Looks up one member by member number or by the phone number in older links.
      // Phone numbers never come back to the browser.
      const { data: found } = await supabase.rpc("get_member_page", { p_ref: digits });
      const m = found?.[0];
      
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

      const hostTrueClicksQuery = !isOwner
        ? supabase.from("social_clicks").select("post_id, created_at").eq("member_id", m.id).is("host_member_id", null)
        : Promise.resolve({ data: null });
      const hostTrueReadsQuery = !isOwner
        ? supabase.from("curriculum_reads").select("item_id").eq("member_id", m.id).is("host_member_id", null)
        : Promise.resolve({ data: null });
      const hostTrueQuizzesQuery = !isOwner
        ? supabase.from("quiz_attempts").select("item_id, points_awarded").eq("member_id", m.id).is("host_member_id", null)
        : Promise.resolve({ data: null });

      const myQuizzesQuery = isOwner
        ? supabase.from("quiz_attempts").select("item_id").eq("member_id", m.id).is("host_member_id", null)
        : supabase.from("quiz_attempts").select("item_id").eq("host_member_id", m.id).eq("visitor_hash", visitorHash);

      const [{ data: sp }, { data: ci }, { data: sc }, { data: cr }, { data: qa }, { data: hostClicks }, { data: pv }, { data: refs }, { data: htc }, { data: htr }, { data: hostReads }, { data: htq }, { data: hostQuizzes }] = await Promise.all([
        supabase.from("social_posts").select("*").eq("active", true).order("created_at", { ascending: false }),
        supabase.from("curriculum_items").select("*").eq("active", true).order("created_at", { ascending: false }),
        myClicksQuery,
        myReadsQuery,
        myQuizzesQuery,
        supabase.from("social_clicks").select("points_awarded").eq("host_member_id", m.id),
        supabase.from("page_visits").select("points_awarded").eq("host_member_id", m.id),
        supabase.from("member_referrals").select("points_awarded").eq("referrer_id", m.id),
        hostTrueClicksQuery,
        hostTrueReadsQuery,
        supabase.from("curriculum_reads").select("points_awarded").eq("host_member_id", m.id),
        hostTrueQuizzesQuery,
        supabase.from("quiz_attempts").select("points_awarded").eq("host_member_id", m.id),
      ]);

      setPosts((sp ?? []) as Post[]);
      setItems((ci ?? []) as Item[]);

      const cMap = new Map<string, string>();
      (sc ?? []).forEach((c) => cMap.set(c.post_id, c.created_at));
      setClickedAt(cMap);
      setReadSet(new Set((cr ?? []).map((r) => r.item_id)));
      setQuizDoneSet(new Set((qa ?? []).map((q) => q.item_id)));

      const tCMap = new Map<string, string>();
      (isOwner ? (sc ?? []) : (htc ?? [])).forEach((c) => tCMap.set(c.post_id, c.created_at));
      setTrueClickedAt(tCMap);
      setTrueReadSet(new Set((isOwner ? (cr ?? []) : (htr ?? [])).map((r) => r.item_id)));
      setTrueQuizDoneSet(new Set((isOwner ? (qa ?? []) : (htq ?? [])).map((q) => q.item_id)));

      const visitorPts = (pv ?? []).reduce((s, x) => s + (x.points_awarded ?? 0), 0);
      const hostClickPts = (hostClicks ?? []).reduce((s, x) => s + (x.points_awarded ?? 0), 0);
      const hostReadPts = (hostReads ?? []).reduce((s, x) => s + (x.points_awarded ?? 0), 0);
      const hostQuizPts = (hostQuizzes ?? []).reduce((s, x) => s + (x.points_awarded ?? 0), 0);
      setHostBonus(visitorPts + hostClickPts + hostReadPts + hostQuizPts);
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
      const at = trueClickedAt.get(p.id);
      if (at) total += socialActionPoints(p.points, p.created_at, at);
    });
    return total;
  }, [posts, trueClickedAt]);

  const ownLessonPoints = trueReadSet.size * LESSON_BASE_POINTS;
  const ownQuizPoints = useMemo(() => trueQuizDoneSet.size * QUIZ_POINTS_PER_CORRECT * 5, [trueQuizDoneSet]);

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
      if (error) {
        setClickedAt((s) => { const n = new Map(s); n.delete(p.id); return n; });
      } else {
        setTrueClickedAt((s) => new Map(s).set(p.id, new Date().toISOString()));
      }
    } else {
      // Visitor on someone else's page — credits the host. Each unique visitor counts once per post.
      // We use a random UUID for member_id to avoid violating the (member_id, post_id) unique constraint 
      // if the host has already clicked this post. The (host_member_id, post_id, visitor_hash) 
      // constraint still prevents the same visitor from clicking multiple times.
      const visitorMemberId = crypto.randomUUID();
      const { error } = await supabase.from("social_clicks").insert({
        member_id: visitorMemberId, post_id: p.id, points_awarded: points,
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
    if (isOwner) setTrueReadSet((s) => new Set(s).add(it.id));
    const visitorMemberId = isOwner ? member.id : crypto.randomUUID();
    const { error } = await supabase.from("curriculum_reads").insert({
      member_id: visitorMemberId, item_id: it.id, points_awarded: LESSON_BASE_POINTS,
      host_member_id: isOwner ? null : member.id,
      visitor_hash: isOwner ? null : visitorHash,
    });
    if (error) {
      setReadSet((s) => { const n = new Set(s); n.delete(it.id); return n; });
      if (isOwner) setTrueReadSet((s) => { const n = new Set(s); n.delete(it.id); return n; });
    } else if (!isOwner) {
      setHostBonus((b) => b + LESSON_BASE_POINTS);
    }
  };

  const submitQuiz = async (it: Item) => {
    if (!member) return;
    const list = quizzesByItem[it.id] || [];
    if (list.length === 0) return;
    let correct = 0;
    list.forEach((q) => { if (quizAnswers[q.id] === q.correct_index) correct += 1; });
    const points = correct * QUIZ_POINTS_PER_CORRECT;
    
    const isOwner = typeof window !== "undefined" && localStorage.getItem("gp_member_id") === member.id;
    const visitorHash = getVisitorHash();
    const visitorMemberId = isOwner ? member.id : crypto.randomUUID();

    const { error } = await supabase.from("quiz_attempts").insert({
      member_id: visitorMemberId, 
      item_id: it.id, 
      score: correct, 
      total: list.length, 
      points_awarded: points,
      host_member_id: isOwner ? null : member.id,
      visitor_hash: isOwner ? null : visitorHash,
    });
    if (error) {
      toast({ title: "Already attempted", description: "You can only take each quiz once.", variant: "destructive" });
    } else {
      toast({ title: `Score: ${correct}/${list.length}`, description: `+${points} ${POINTS_LABEL}` });
      setQuizDoneSet((s) => new Set(s).add(it.id));
      if (isOwner) setTrueQuizDoneSet((s) => new Set(s).add(it.id));
      else setHostBonus((b) => b + points);
    }
    setActiveQuiz(null);
    setQuizAnswers({});
  };

  // Split rich-text/html content into digestible bits paragraph by paragraph
  const lessonBits = useMemo(() => {
    if (!openLesson) return [] as string[];
    // Pasted lessons often carry non-breaking spaces, justify alignment and
    // inline widths that push words off small screens. Clean them out.
    const raw = cleanHtml((openLesson.content && openLesson.content.trim()) || openLesson.description || "");
    if (!raw) return [];
    
    const looksHtml = /<\/?(p|h[1-6]|ul|ol|li|blockquote|div|br)/i.test(raw);
    if (looksHtml) {
      const chunks = raw
        .split(/(?=<(?:p|h[1-6]|ul|ol|blockquote)[\s>])/i)
        .map((s) => s.trim())
        .filter(Boolean);
      return chunks.length ? chunks : [raw];
    }
    
    const paras = raw.split(/\n{2,}/).map((s) => s.trim()).filter(Boolean);
    return paras.length ? paras : [raw];
  }, [openLesson]);

  const startLesson = (it: Item) => {
    setOpenLesson(it);
    setLessonStep(0);
    handleRead(it);
  };

  const sharePage = async () => {
    if (!member) return;
    const url = `${window.location.origin}/${member.member_number}?ref=${member.id}`;
    const text = `I'm building a new Nigeria with the Green People movement. Visit my page, take action, and join us 🌱`;
    if (navigator.share) {
      try { await navigator.share({ title: "Green People", text, url }); return; } catch { /* fallthrough */ }
    }
    await navigator.clipboard.writeText(url);
    toast({ title: "Link copied!", description: "Share it anywhere." });
  };

  // DEBUG: If you see this, it means MemberPage is being triggered for a static route.
  if (phone && ["test", "hq", "members", "ranks", "finance", "backup", "phonenumbers", "updates", "write", "chats"].includes(phone.toLowerCase())) {
    return (
      <div className="min-h-screen bg-red-950 text-white p-10 flex flex-col items-center justify-center text-center">
        <h1 className="text-4xl font-black mb-4">ROUTING ERROR</h1>
        <p className="mb-4">MemberPage was triggered for: <strong>{phone}</strong></p>
        <p className="text-sm opacity-60">This path should have been handled by a different component.</p>
        <a href="/" className="mt-8 bg-white text-black px-6 py-2 rounded-full font-bold">Back to Home</a>
      </div>
    );
  }

  const handleDownloadCard = useCallback(async () => {
    if (!member) return;

    if (!verifier) {
      const pools = [
        { 
          q: "Which state did you select during registration?", 
          ans: member.state,
          wrong: nigerianStates.filter(s => s !== member.state).sort(() => 0.5 - Math.random()).slice(0, 3)
        },
        { 
          q: "What is your gender?", 
          ans: member.gender,
          wrong: [member.gender === 'Male' ? 'Female' : 'Male']
        },
        { 
          q: "What was your PVC status during registration?", 
          ans: member.has_pvc,
          wrong: ["Yes", "No", "In Progress"].filter(o => o !== member.has_pvc)
        }
      ];
      const selected = pools[Math.floor(Math.random() * pools.length)];
      setVerifier({ ...selected, options: [selected.ans, ...selected.wrong].sort(() => 0.5 - Math.random()) });
      setShowVerifier(true);
      return;
    }

    try {
      await saveMemberId({
        fullName: member.full_name, gender: member.gender, state: member.state, lga: member.lga,
        memberNumber: member.member_number, issued: member.joined_at ? new Date(member.joined_at) : null,
      }, `GreenPeople-ID-${member.full_name.replace(/\s+/g, "_")}.png`);
      setShowVerifier(false);
      setVerifier(null);
    } catch {
      toast({ title: "Could not download card", description: "Please try again, or take a screenshot of your ID.", variant: "destructive" });
    }
  }, [member, toast, verifier]);

  const verifyAndDownload = (choice: string) => {
    if (choice === verifier?.ans) {
      handleDownloadCard();
    } else {
      toast({ title: "Incorrect answer", description: "Verification failed. Please try again.", variant: "destructive" });
      setShowVerifier(false);
      setVerifier(null);
    }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <Navbar />
      <div className="text-muted-foreground text-sm">Loading…</div>
    </div>
  );
  if (!member) return (
    <div className="min-h-screen">
      <Navbar />
      <div className="pt-32 text-center px-5">
        <h1 className="text-2xl font-bold mb-2">Member not found</h1>
        <p className="text-muted-foreground text-sm mb-6">No member matches that link.</p>
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
    <div className="min-h-screen pb-16 overflow-x-hidden">
      <Navbar />
      <div className="pt-24 max-w-3xl mx-auto px-4 sm:px-5">
        {/* Profile card */}
        <div className="glass-effect rounded-2xl p-4 sm:p-6 mb-5">
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
          <div className="w-full h-2 bg-white/20 rounded-full overflow-hidden">
            <div className="h-full bg-primary transition-all" style={{ width: `${progress}%` }} />
          </div>
          {next ? (
            <p className="text-[10px] sm:text-[11px] text-muted-foreground mt-2 break-words">
              {(next.min - totalPoints).toLocaleString("en-NG")} more to <span className={`font-semibold ${next.color}`}>{next.name}</span>
            </p>
          ) : (
            <p className="text-[11px] text-primary mt-2 font-semibold">Top office reached. Keep mobilising.</p>
          )}


          {isOwnPage && member && (
            <div className="mt-4 pt-4 border-t border-white/10">
              <div className="mb-3">
                <ScaledMemberIdCard data={{
                  fullName: member.full_name, gender: member.gender, state: member.state,
                  lga: member.lga, memberNumber: member.member_number,
                  issued: member.joined_at ? new Date(member.joined_at) : null,
                }} />
              </div>
              <button 
                onClick={handleDownloadCard}
                className="w-full bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20 px-4 py-3 rounded-xl text-xs font-bold inline-flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
              >
                <FontAwesomeIcon icon={faDownload} className="w-3.5 h-3.5" /> Download membership ID
              </button>
            </div>
          )}
        </div>


        {/* "Is this your page?" for members on another phone or browser */}
        {!isOwnPage && member && (
          <div className="glass p-4 sm:p-5 mb-4">
            {!claimOpen ? (
              <button type="button" onClick={() => setClaimOpen(true)} className="w-full flex items-center gap-3 text-left min-h-11">
                <span className="w-10 h-10 rounded-full bg-pale flex items-center justify-center shrink-0">
                  <FontAwesomeIcon icon={faShieldHalved} className="w-4 h-4 text-olive" />
                </span>
                <span className="flex-1 min-w-0">
                  <span className="block font-semibold text-foreground">Is this your page?</span>
                  <span className="block text-sm text-muted-foreground">Confirm your phone number to see and download your membership ID.</span>
                </span>
                <FontAwesomeIcon icon={faArrowRight} className="w-3.5 h-3.5 text-muted-foreground" />
              </button>
            ) : (
              <form onSubmit={claimPage}>
                <label htmlFor="claim-phone" className="block font-semibold text-foreground mb-1">Confirm it's you</label>
                <p className="text-sm text-muted-foreground mb-3">Enter the phone number you registered with. It isn't shown or stored on this page.</p>
                <div className="flex flex-col sm:flex-row gap-2">
                  <input id="claim-phone" type="tel" inputMode="tel" autoComplete="tel" autoFocus value={claimPhone}
                    onChange={(e) => { setClaimPhone(e.target.value); setClaimError(""); }} placeholder="e.g. 0803 123 4567"
                    aria-invalid={!!claimError} aria-describedby={claimError ? "claim-err" : undefined}
                    className={`flex-1 bg-white/70 border rounded-full px-4 py-3 min-h-11 text-base text-foreground placeholder:text-muted-foreground/70 focus:outline-none focus:ring-[3px] focus:ring-primary/60 ${claimError ? "border-destructive" : "border-pale"}`} />
                  <button type="submit" disabled={claimBusy} className="btn-primary !min-h-11 disabled:opacity-60">{claimBusy ? "Checking…" : "Show my ID"}</button>
                </div>
                <p id="claim-err" role="alert" className="text-destructive text-sm font-medium mt-2 min-h-5">{claimError}</p>
              </form>
            )}
          </div>
        )}

        {/* Join CTA for visitors */}
        {!isOwnPage && (
          <Link to="/#join" className="flex items-center justify-center gap-2 mb-5 btn-primary whitespace-nowrap">
            <FontAwesomeIcon icon={faUserPlus} className="w-4 h-4" />
            Join Green People — Get Your Own Page
          </Link>
        )}

        {/* Social posts */}
        <section className="mb-8">
          <h2 className="text-[11px] sm:text-sm font-bold text-foreground mb-3">Subscribe · Like · Comment · Share</h2>
          {groupedPosts.every((g) => g.items.length === 0) && (
            <p className="text-sm text-muted-foreground glass p-6 text-center">No social posts yet. Check back soon.</p>
          )}
          {groupedPosts.map(({ platform, items: list }) => list.length > 0 && (
            <div key={platform} className="mb-4">
              <div className="flex items-center gap-2 mb-2">
                <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${platformMeta[platform].color} shadow-sm`}>
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
                      className={`group text-left glass-card p-3 flex items-center gap-2.5 sm:gap-3 hover:bg-white/20 transition-all min-w-0 ${done ? "border-primary/40 opacity-70" : "border-white/10"}`}
                    >
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${done ? "bg-primary text-primary-foreground" : "bg-white/10 text-muted-foreground"}`}>
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
            <h2 className="text-[11px] sm:text-sm font-bold text-foreground">Green Classroom</h2>
          </div>
          {items.length === 0 && (
            <p className="text-sm text-muted-foreground glass p-6 text-center">No lessons yet. Check back soon.</p>
          )}
          <div className="grid gap-2">
            {items.map((it) => {
              const done = readSet.has(it.id);
              const quizDone = quizDoneSet.has(it.id);
              const list = quizzesByItem[it.id] || [];
              const isOpen = activeQuiz === it.id;
              return (
                <div key={it.id} className={`glass-card overflow-hidden ${done ? "border-primary/40" : "border-white/10"}`}>
                  <button onClick={() => startLesson(it)} className="w-full text-left p-3 flex items-start gap-2.5 sm:gap-3 hover:bg-white/20 transition-all min-w-0">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${done ? "bg-primary text-primary-foreground" : "bg-white/10 text-muted-foreground"}`}>
                      <FontAwesomeIcon icon={done ? faCheck : faBookOpen} className="w-3.5 h-3.5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-[13px] sm:text-sm text-foreground text-pretty">{it.title}</div>
                      {it.description && <div className="text-[11px] sm:text-xs text-muted-foreground line-clamp-2 mt-0.5 text-pretty">{it.description}</div>}
                    </div>
                    <div className="text-right whitespace-nowrap flex-shrink-0">
                      <div className={`text-sm font-bold ${done ? "text-primary" : "text-foreground"}`}>+5</div>
                      <div className="text-[9px] text-muted-foreground">pts</div>
                    </div>
                  </button>

                  {list.length > 0 && (
                    <div className="border-t border-pale p-3">
                      {quizDone ? (
                        <div className="text-[11px] text-primary font-semibold inline-flex items-center gap-1.5">
                          <FontAwesomeIcon icon={faCheck} className="w-3 h-3" /> Quiz completed
                        </div>
                      ) : !isOpen ? (
                        <button
                          onClick={() => { setActiveQuiz(it.id); setQuizAnswers({}); }}
                          className="text-[11px] sm:text-xs font-semibold bg-primary/20 text-primary px-3 py-1.5 rounded-lg whitespace-nowrap border border-primary/20"
                        >
                          Take the quiz · earn up to +{list.length * QUIZ_POINTS_PER_CORRECT} pts
                        </button>
                      ) : (
                        <div className="space-y-3">
                          {list.map((q, qi) => (
                            <div key={q.id} className="bg-white/10 rounded-lg p-3 border border-white/5">
                              <div className="text-[12px] sm:text-sm font-semibold text-foreground mb-2 text-pretty">{qi + 1}. {q.question}</div>
                              <div className="grid gap-1.5">
                                {q.options.map((opt, idx) => (
                                  <label key={idx} className={`flex items-start gap-2 text-[11px] sm:text-xs cursor-pointer p-2 rounded-md border transition-all ${quizAnswers[q.id] === idx ? "border-primary bg-primary/10" : "border-white/10 bg-white/5 hover:bg-white/10"}`}>
                                    <input type="radio" name={q.id} className="mt-0.5" checked={quizAnswers[q.id] === idx} onChange={() => setQuizAnswers((s) => ({ ...s, [q.id]: idx }))} />
                                    <span className="text-pretty flex-1 min-w-0">{opt}</span>
                                  </label>
                                ))}
                              </div>
                            </div>
                          ))}
                          <div className="flex gap-2">
                            <button onClick={() => submitQuiz(it)} className="flex-1 btn-primary !min-h-10 !text-sm whitespace-nowrap">Submit</button>
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

      {/* Lesson reader modal */}
      {openLesson && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-deep/30 backdrop-blur-sm p-0 sm:p-4" role="dialog" aria-modal="true">
          <div className="bg-background w-full sm:max-w-2xl sm:rounded-2xl rounded-t-2xl max-h-[90vh] flex flex-col border border-border shadow-2xl">
            <div className="flex items-start justify-between gap-3 p-4 sm:p-5 border-b border-pale">
              <div className="flex-1 min-w-0">
                <div className="text-[10px] font-bold text-primary mb-1">{openLesson.category.replace("_", " ")}</div>
                <h3 className="text-base sm:text-lg font-bold text-foreground break-words">{openLesson.title}</h3>
              </div>
              <button onClick={() => setOpenLesson(null)} className="text-muted-foreground hover:text-foreground p-2 -m-2 flex-shrink-0" aria-label="Close lesson">
                <FontAwesomeIcon icon={faXmark} className="w-4 h-4" />
              </button>
            </div>
            <div ref={lessonBodyRef} className="flex-1 overflow-y-auto overflow-x-hidden p-5 sm:p-8 custom-scrollbar">
              {lessonBits.length === 0 ? (
                <p className="text-sm text-muted-foreground">This lesson has no written content yet.</p>
              ) : (
                <article
                  className="prose prose-base max-w-none w-full min-w-0 text-foreground/90 leading-relaxed prose-headings:text-foreground prose-strong:text-foreground prose-a:text-olive prose-li:marker:text-primary [&_*]:!text-left [&_*]:!whitespace-normal [&_*]:!max-w-full [&_img]:!h-auto [&_img]:rounded-xl"
                  style={{ textAlign: "left", overflowWrap: "anywhere", wordBreak: "normal", hyphens: "manual" } as React.CSSProperties}
                  dangerouslySetInnerHTML={{ __html: lessonBits[lessonStep] }}
                />
              )}
              {openLesson.url && lessonStep === lessonBits.length - 1 && (
                <a href={openLesson.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 mt-6 text-xs font-semibold text-primary hover:underline">
                  <FontAwesomeIcon icon={faUpRightFromSquare} className="w-3 h-3" /> Open reference
                </a>
              )}
            </div>
            <div className="border-t border-pale p-3 sm:p-4 flex items-center gap-3">
              <div className="flex-1 h-1.5 bg-secondary rounded-full overflow-hidden">
                <div className="h-full bg-primary transition-all" style={{ width: `${((lessonStep + 1) / Math.max(1, lessonBits.length)) * 100}%` }} />
              </div>
              <div className="text-[11px] text-muted-foreground whitespace-nowrap font-medium">{lessonStep + 1} / {lessonBits.length}</div>
              {lessonStep < lessonBits.length - 1 ? (
                <button onClick={() => setLessonStep((s) => s + 1)} className="btn-primary !min-h-10 !text-sm inline-flex items-center gap-2 whitespace-nowrap">
                  Continue <FontAwesomeIcon icon={faArrowRight} className="w-3 h-3" />
                </button>
              ) : (
                <button onClick={() => setOpenLesson(null)} className="btn-primary !min-h-10 !text-sm whitespace-nowrap">
                  Done
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Verification Modal */}
      <Dialog open={showVerifier} onOpenChange={setShowVerifier}>
        <DialogContent className="max-w-sm bg-[#0a2e1a] border-white/10 text-white rounded-3xl">
          <div className="text-center py-4">
            <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-4 border border-primary/30">
              <FontAwesomeIcon icon={faShieldHalved} className="text-primary w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold mb-2">Security Verification</h3>
            <p className="text-white/60 text-xs mb-6">{verifier?.q}</p>
            <div className="grid gap-2">
              {verifier?.options.map((opt) => (
                <button
                  key={opt}
                  onClick={() => verifyAndDownload(opt)}
                  className="w-full bg-white/5 hover:bg-primary/20 border border-white/10 hover:border-primary/40 p-3 rounded-xl text-sm transition-all"
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MemberPage;
