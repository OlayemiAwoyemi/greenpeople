import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faXTwitter, faInstagram, faFacebook, faYoutube } from "@fortawesome/free-brands-svg-icons";
import { faPlus, faTrash, faChalkboard, faMoneyBillTrendUp, faShareNodes, faWandMagicSparkles, faCircleNotch } from "@fortawesome/free-solid-svg-icons";
import AccessGate from "@/components/AccessGate";
import Navbar from "@/components/Navbar";
import { POINTS_LABEL_SHORT } from "@/lib/greenSeeds";

type Platform = "x" | "instagram" | "facebook" | "youtube";
type Category = "leadership" | "politics" | "governance" | "life" | "civic_education";

const platformMeta: Record<Platform, { label: string; icon: typeof faXTwitter; defaultPoints: number }> = {
  x: { label: "X (Twitter)", icon: faXTwitter, defaultPoints: 10 },
  instagram: { label: "Instagram", icon: faInstagram, defaultPoints: 10 },
  facebook: { label: "Facebook", icon: faFacebook, defaultPoints: 10 },
  youtube: { label: "YouTube", icon: faYoutube, defaultPoints: 15 },
};

const categories: Category[] = ["leadership", "politics", "governance", "life", "civic_education"];

const HQContent = () => {
  const { toast } = useToast();
  const [tab, setTab] = useState<"social" | "classroom" | "finance">("social");

  const [platform, setPlatform] = useState<Platform>("x");
  const [bulkLinks, setBulkLinks] = useState("");
  const [linkPoints, setLinkPoints] = useState(10);
  const [posts, setPosts] = useState<{ id: string; platform: Platform; url: string; title: string | null; points: number; active: boolean }[]>([]);

  const [cTitle, setCTitle] = useState("");
  const [cDesc, setCDesc] = useState("");
  const [cUrl, setCUrl] = useState("");
  const [cCat, setCCat] = useState<Category>("leadership");
  const [autoGen, setAutoGen] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [items, setItems] = useState<{ id: string; title: string; description: string | null; url: string | null; category: Category; active: boolean }[]>([]);
  const [quizCounts, setQuizCounts] = useState<Record<string, number>>({});

  const [fKind, setFKind] = useState<"income" | "expenditure">("income");
  const [fDesc, setFDesc] = useState("");
  const [fAmt, setFAmt] = useState("");
  const [fParty, setFParty] = useState("");
  const [fDate, setFDate] = useState(new Date().toISOString().slice(0, 10));
  const [entries, setEntries] = useState<{ id: string; kind: string; description: string; amount_naira: number; source_or_payee: string | null; occurred_on: string }[]>([]);

  const refresh = async () => {
    const [s, c, f, q] = await Promise.all([
      supabase.from("social_posts").select("*").order("created_at", { ascending: false }),
      supabase.from("curriculum_items").select("*").order("created_at", { ascending: false }),
      supabase.from("finance_entries").select("*").order("occurred_on", { ascending: false }),
      supabase.from("lesson_quizzes").select("item_id"),
    ]);
    if (s.data) setPosts(s.data as typeof posts);
    if (c.data) setItems(c.data as typeof items);
    if (f.data) setEntries(f.data as typeof entries);
    if (q.data) {
      const counts: Record<string, number> = {};
      q.data.forEach((row) => { counts[row.item_id] = (counts[row.item_id] ?? 0) + 1; });
      setQuizCounts(counts);
    }
  };

  useEffect(() => { refresh(); }, []);

  const addBulkLinks = async () => {
    const lines = bulkLinks.split("\n").map((l) => l.trim()).filter(Boolean);
    if (lines.length === 0) { toast({ title: "Paste one or more links, one per line", variant: "destructive" }); return; }
    const rows = lines.map((url) => ({ platform, url, points: linkPoints, active: true }));
    const { error } = await supabase.from("social_posts").insert(rows);
    if (error) return toast({ title: "Failed to save", description: error.message, variant: "destructive" });
    toast({ title: `Added ${rows.length} link${rows.length > 1 ? "s" : ""}` });
    setBulkLinks(""); refresh();
  };

  const togglePost = async (id: string, active: boolean) => { await supabase.from("social_posts").update({ active: !active }).eq("id", id); refresh(); };
  const deletePost = async (id: string) => { await supabase.from("social_posts").delete().eq("id", id); refresh(); };

  const generateQuizForItem = async (itemId: string, title: string, description: string | null, url: string | null) => {
    const { data, error } = await supabase.functions.invoke("generate-quiz", {
      body: { title, description, url },
    });
    if (error || !data?.questions) {
      toast({ title: "Quiz generation failed", description: error?.message ?? "Try again", variant: "destructive" });
      return;
    }
    const rows = (data.questions as { question: string; options: string[]; correct_index: number }[]).slice(0, 5).map((q, idx) => ({
      item_id: itemId, question: q.question, options: q.options, correct_index: q.correct_index, position: idx,
    }));
    if (rows.length > 0) {
      // Replace existing quiz
      await supabase.from("lesson_quizzes").delete().eq("item_id", itemId);
      const { error: insErr } = await supabase.from("lesson_quizzes").insert(rows);
      if (insErr) toast({ title: "Saved lesson, quiz failed", description: insErr.message, variant: "destructive" });
    }
  };

  const addCurriculum = async () => {
    if (!cTitle.trim()) return toast({ title: "Title required", variant: "destructive" });
    if (cDesc.trim().length < 60 && autoGen) {
      return toast({ title: "Add a longer description", description: "Lessons need ≥ 60 characters for the quiz generator to work well.", variant: "destructive" });
    }
    const { data, error } = await supabase.from("curriculum_items").insert({
      title: cTitle.trim(),
      description: cDesc.trim() || null,
      url: cUrl.trim() || null,
      category: cCat,
      active: true,
    }).select("id").maybeSingle();
    if (error || !data) return toast({ title: "Failed", description: error?.message ?? "", variant: "destructive" });

    if (autoGen) {
      setGenerating(true);
      try { await generateQuizForItem(data.id, cTitle.trim(), cDesc.trim() || null, cUrl.trim() || null); }
      finally { setGenerating(false); }
    }
    toast({ title: "Lesson added to Green Classroom" });
    setCTitle(""); setCDesc(""); setCUrl("");
    refresh();
  };

  const regenerate = async (id: string, title: string, description: string | null, url: string | null) => {
    setGenerating(true);
    try { await generateQuizForItem(id, title, description, url); toast({ title: "Quiz regenerated" }); }
    finally { setGenerating(false); refresh(); }
  };

  const deleteItem = async (id: string) => {
    await supabase.from("lesson_quizzes").delete().eq("item_id", id);
    await supabase.from("curriculum_items").delete().eq("id", id);
    refresh();
  };

  const addFinance = async () => {
    if (!fDesc.trim() || !fAmt) return toast({ title: "Description and amount required", variant: "destructive" });
    const amount = parseFloat(fAmt);
    if (Number.isNaN(amount) || amount <= 0) return toast({ title: "Invalid amount", variant: "destructive" });
    const { error } = await supabase.from("finance_entries").insert({
      kind: fKind, description: fDesc.trim(), amount_naira: amount,
      source_or_payee: fParty.trim() || null, occurred_on: fDate,
    });
    if (error) return toast({ title: "Failed", description: error.message, variant: "destructive" });
    toast({ title: "Finance entry added" });
    setFDesc(""); setFAmt(""); setFParty(""); refresh();
  };
  const deleteEntry = async (id: string) => { await supabase.from("finance_entries").delete().eq("id", id); refresh(); };

  const tabClass = (t: typeof tab) =>
    `flex-1 px-2 sm:px-4 py-2.5 sm:py-3 rounded-xl text-[11px] sm:text-sm font-semibold transition-all flex items-center justify-center gap-1.5 sm:gap-2 whitespace-nowrap min-w-0 ${
      tab === t ? "bg-primary text-primary-foreground shadow-md" : "bg-secondary text-foreground/60 hover:text-foreground"
    }`;

  const inputCls = "w-full bg-background border border-border rounded-xl px-3 py-2.5 text-sm min-w-0";

  return (
    <div className="min-h-screen bg-background pt-20 pb-16 overflow-x-hidden">
      <Navbar />
      <div className="max-w-5xl mx-auto px-4 sm:px-5">
        <div className="mb-6">
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-foreground mb-1">HQ — Master Control</h1>
          <p className="text-muted-foreground text-xs sm:text-sm break-words">Manage social posts, Green Classroom, and finance records.</p>
        </div>

        <div className="flex gap-1.5 sm:gap-2 mb-6 sm:mb-8">
          <button onClick={() => setTab("social")} className={tabClass("social")}>
            <FontAwesomeIcon icon={faShareNodes} className="w-3 h-3 sm:w-4 sm:h-4" />
            <span className="truncate">Social</span>
          </button>
          <button onClick={() => setTab("classroom")} className={tabClass("classroom")}>
            <FontAwesomeIcon icon={faChalkboard} className="w-3 h-3 sm:w-4 sm:h-4" />
            <span className="truncate">Classroom</span>
          </button>
          <button onClick={() => setTab("finance")} className={tabClass("finance")}>
            <FontAwesomeIcon icon={faMoneyBillTrendUp} className="w-3 h-3 sm:w-4 sm:h-4" />
            <span className="truncate">Finance</span>
          </button>
        </div>

        {tab === "social" && (
          <div className="space-y-6">
            <div className="bg-secondary/50 border border-border rounded-2xl p-4 sm:p-6">
              <h3 className="font-semibold text-foreground mb-4 text-sm sm:text-base">Add Social Post Links (Bulk)</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3 mb-3">
                <select value={platform} onChange={(e) => { const p = e.target.value as Platform; setPlatform(p); setLinkPoints(platformMeta[p].defaultPoints); }} className={inputCls}>
                  {(Object.keys(platformMeta) as Platform[]).map((p) => <option key={p} value={p}>{platformMeta[p].label}</option>)}
                </select>
                <input type="number" value={linkPoints} onChange={(e) => setLinkPoints(parseInt(e.target.value) || 10)} placeholder={`${POINTS_LABEL_SHORT}/click`} className={inputCls} />
                <button onClick={addBulkLinks} className="col-span-2 sm:col-span-1 bg-primary text-primary-foreground rounded-xl px-4 py-2.5 text-sm font-semibold whitespace-nowrap inline-flex items-center justify-center gap-2">
                  <FontAwesomeIcon icon={faPlus} className="w-3.5 h-3.5" /> Add Links
                </button>
              </div>
              <textarea value={bulkLinks} onChange={(e) => setBulkLinks(e.target.value)} rows={5} placeholder={`Paste one URL per line:\nhttps://x.com/...`} className={`${inputCls} font-mono text-xs`} />
            </div>

            <div className="bg-card border border-border rounded-2xl overflow-hidden">
              <div className="p-3 sm:p-4 border-b border-border font-semibold text-sm">All Posts ({posts.length})</div>
              <div className="divide-y divide-border max-h-[500px] overflow-y-auto">
                {posts.length === 0 && <div className="p-6 text-sm text-muted-foreground text-center">No posts yet.</div>}
                {posts.map((p) => (
                  <div key={p.id} className="p-2.5 sm:p-3 flex items-center gap-2 min-w-0">
                    <FontAwesomeIcon icon={platformMeta[p.platform].icon} className="w-4 h-4 text-primary flex-shrink-0" />
                    <a href={p.url} target="_blank" rel="noopener noreferrer" className="text-[11px] sm:text-xs text-foreground/80 truncate flex-1 min-w-0 hover:underline">{p.url}</a>
                    <span className="text-[10px] sm:text-xs text-muted-foreground whitespace-nowrap flex-shrink-0">{p.points} {POINTS_LABEL_SHORT}</span>
                    <button onClick={() => togglePost(p.id, p.active)} className={`text-[10px] sm:text-xs px-2 py-1 rounded-md whitespace-nowrap flex-shrink-0 ${p.active ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"}`}>{p.active ? "On" : "Off"}</button>
                    <button onClick={() => deletePost(p.id)} className="text-destructive p-1.5 hover:bg-destructive/10 rounded-md flex-shrink-0">
                      <FontAwesomeIcon icon={faTrash} className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {tab === "classroom" && (
          <div className="space-y-6">
            <div className="bg-secondary/50 border border-border rounded-2xl p-4 sm:p-6">
              <h3 className="font-semibold text-foreground mb-4 text-sm sm:text-base">Add Lesson (Byte-sized)</h3>
              <div className="grid gap-3">
                <input value={cTitle} onChange={(e) => setCTitle(e.target.value)} placeholder="Lesson title" className={inputCls} />
                <textarea value={cDesc} onChange={(e) => setCDesc(e.target.value)} rows={8} placeholder="Write the full byte-sized lesson here. The quiz generator will read this content. Aim for 100–600 words — clear, focused, easy to score." className={`${inputCls} resize-y min-h-[180px]`} />
                <input value={cUrl} onChange={(e) => setCUrl(e.target.value)} placeholder="Optional reference URL (e.g. video link)" className={inputCls} />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <select value={cCat} onChange={(e) => setCCat(e.target.value as Category)} className={`${inputCls} capitalize`}>
                    {categories.map((c) => <option key={c} value={c}>{c.replace("_", " ")}</option>)}
                  </select>
                  <label className="flex items-center gap-2 text-xs text-foreground bg-background border border-border rounded-xl px-3 py-2.5 cursor-pointer">
                    <input type="checkbox" checked={autoGen} onChange={(e) => setAutoGen(e.target.checked)} />
                    <FontAwesomeIcon icon={faWandMagicSparkles} className="w-3.5 h-3.5 text-primary" />
                    <span className="truncate">Auto-generate 5 quiz questions</span>
                  </label>
                </div>
                <button onClick={addCurriculum} disabled={generating} className="bg-primary text-primary-foreground rounded-xl px-4 py-2.5 text-sm font-semibold whitespace-nowrap inline-flex items-center justify-center gap-2 disabled:opacity-50">
                  {generating ? <FontAwesomeIcon icon={faCircleNotch} className="w-3.5 h-3.5 animate-spin" /> : <FontAwesomeIcon icon={faPlus} className="w-3.5 h-3.5" />}
                  {generating ? "Generating quiz…" : "Save Lesson"}
                </button>
              </div>
            </div>

            <div className="bg-card border border-border rounded-2xl overflow-hidden">
              <div className="p-3 sm:p-4 border-b border-border font-semibold text-sm">Lessons ({items.length})</div>
              <div className="divide-y divide-border max-h-[500px] overflow-y-auto">
                {items.length === 0 && <div className="p-6 text-sm text-muted-foreground text-center">No lessons yet.</div>}
                {items.map((i) => (
                  <div key={i.id} className="p-2.5 sm:p-3 flex flex-col sm:flex-row sm:items-start gap-2 sm:gap-3 min-w-0">
                    <span className="text-[9px] sm:text-[10px] uppercase font-bold tracking-wider bg-primary/10 text-primary px-2 py-1 rounded whitespace-nowrap self-start flex-shrink-0">{i.category.replace("_", " ")}</span>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-[13px] sm:text-sm text-foreground break-words">{i.title}</div>
                      {i.description && <div className="text-[11px] sm:text-xs text-muted-foreground line-clamp-2 break-words">{i.description}</div>}
                      <div className="text-[10px] text-muted-foreground mt-1">Quiz: {quizCounts[i.id] ?? 0}/5 questions</div>
                    </div>
                    <div className="flex items-center gap-1 flex-shrink-0">
                      <button onClick={() => regenerate(i.id, i.title, i.description, i.url)} className="text-primary p-1.5 hover:bg-primary/10 rounded-md" title="Regenerate quiz">
                        <FontAwesomeIcon icon={faWandMagicSparkles} className="w-3 h-3" />
                      </button>
                      <button onClick={() => deleteItem(i.id)} className="text-destructive p-1.5 hover:bg-destructive/10 rounded-md">
                        <FontAwesomeIcon icon={faTrash} className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {tab === "finance" && (
          <div className="space-y-6">
            <div className="bg-secondary/50 border border-border rounded-2xl p-4 sm:p-6">
              <h3 className="font-semibold text-foreground mb-4 text-sm sm:text-base">Add Finance Entry</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
                <select value={fKind} onChange={(e) => setFKind(e.target.value as "income" | "expenditure")} className={inputCls}>
                  <option value="income">Income</option>
                  <option value="expenditure">Expenditure</option>
                </select>
                <input type="date" value={fDate} onChange={(e) => setFDate(e.target.value)} className={inputCls} />
              </div>
              <input value={fDesc} onChange={(e) => setFDesc(e.target.value)} placeholder="Description (e.g. Donation from Lagos chapter)" className={`${inputCls} mb-3`} />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
                <input type="number" step="0.01" value={fAmt} onChange={(e) => setFAmt(e.target.value)} placeholder="Amount in Naira" className={inputCls} />
                <input value={fParty} onChange={(e) => setFParty(e.target.value)} placeholder={fKind === "income" ? "Source (donor name)" : "Payee"} className={inputCls} />
              </div>
              <button onClick={addFinance} className="w-full bg-primary text-primary-foreground rounded-xl px-4 py-2.5 text-sm font-semibold whitespace-nowrap inline-flex items-center justify-center gap-2">
                <FontAwesomeIcon icon={faPlus} className="w-3.5 h-3.5" /> Save Entry
              </button>
            </div>

            <div className="bg-card border border-border rounded-2xl overflow-hidden">
              <div className="p-3 sm:p-4 border-b border-border font-semibold text-sm">Entries ({entries.length})</div>
              <div className="divide-y divide-border max-h-[500px] overflow-y-auto">
                {entries.length === 0 && <div className="p-6 text-sm text-muted-foreground text-center">No entries yet.</div>}
                {entries.map((e) => (
                  <div key={e.id} className="p-2.5 sm:p-3 flex items-center gap-2 min-w-0">
                    <span className={`text-[9px] sm:text-[10px] uppercase font-bold tracking-wider px-2 py-1 rounded whitespace-nowrap flex-shrink-0 ${e.kind === "income" ? "bg-primary/10 text-primary" : "bg-destructive/10 text-destructive"}`}>{e.kind}</span>
                    <div className="flex-1 min-w-0">
                      <div className="text-[12px] sm:text-sm text-foreground truncate">{e.description}</div>
                      <div className="text-[10px] sm:text-xs text-muted-foreground truncate">{e.occurred_on}{e.source_or_payee ? ` · ${e.source_or_payee}` : ""}</div>
                    </div>
                    <div className={`font-bold text-[12px] sm:text-sm whitespace-nowrap flex-shrink-0 ${e.kind === "income" ? "text-primary" : "text-destructive"}`}>
                      ₦{Number(e.amount_naira).toLocaleString("en-NG")}
                    </div>
                    <button onClick={() => deleteEntry(e.id)} className="text-destructive p-1.5 hover:bg-destructive/10 rounded-md flex-shrink-0">
                      <FontAwesomeIcon icon={faTrash} className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const HQ = () => <AccessGate><HQContent /></AccessGate>;
export default HQ;
