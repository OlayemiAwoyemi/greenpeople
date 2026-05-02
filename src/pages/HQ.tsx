import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faXTwitter, faInstagram, faFacebook, faYoutube } from "@fortawesome/free-brands-svg-icons";
import { faPlus, faTrash, faChalkboard, faMoneyBillTrendUp, faShareNodes } from "@fortawesome/free-solid-svg-icons";
import AccessGate from "@/components/AccessGate";
import Navbar from "@/components/Navbar";

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

  // ---- Social state ----
  const [platform, setPlatform] = useState<Platform>("x");
  const [bulkLinks, setBulkLinks] = useState("");
  const [linkPoints, setLinkPoints] = useState(10);
  const [posts, setPosts] = useState<{ id: string; platform: Platform; url: string; title: string | null; points: number; active: boolean }[]>([]);

  // ---- Classroom ----
  const [cTitle, setCTitle] = useState("");
  const [cDesc, setCDesc] = useState("");
  const [cUrl, setCUrl] = useState("");
  const [cCat, setCCat] = useState<Category>("leadership");
  const [items, setItems] = useState<{ id: string; title: string; description: string | null; url: string | null; category: Category; active: boolean }[]>([]);

  // ---- Finance ----
  const [fKind, setFKind] = useState<"income" | "expenditure">("income");
  const [fDesc, setFDesc] = useState("");
  const [fAmt, setFAmt] = useState("");
  const [fParty, setFParty] = useState("");
  const [fDate, setFDate] = useState(new Date().toISOString().slice(0, 10));
  const [entries, setEntries] = useState<{ id: string; kind: string; description: string; amount_naira: number; source_or_payee: string | null; occurred_on: string }[]>([]);

  const refresh = async () => {
    const [s, c, f] = await Promise.all([
      supabase.from("social_posts").select("*").order("created_at", { ascending: false }),
      supabase.from("curriculum_items").select("*").order("created_at", { ascending: false }),
      supabase.from("finance_entries").select("*").order("occurred_on", { ascending: false }),
    ]);
    if (s.data) setPosts(s.data as typeof posts);
    if (c.data) setItems(c.data as typeof items);
    if (f.data) setEntries(f.data as typeof entries);
  };

  useEffect(() => { refresh(); }, []);

  const addBulkLinks = async () => {
    const lines = bulkLinks.split("\n").map((l) => l.trim()).filter(Boolean);
    if (lines.length === 0) {
      toast({ title: "Paste one or more links, one per line", variant: "destructive" });
      return;
    }
    const rows = lines.map((url) => ({ platform, url, points: linkPoints, active: true }));
    const { error } = await supabase.from("social_posts").insert(rows);
    if (error) return toast({ title: "Failed to save", description: error.message, variant: "destructive" });
    toast({ title: `Added ${rows.length} link${rows.length > 1 ? "s" : ""}` });
    setBulkLinks("");
    refresh();
  };

  const togglePost = async (id: string, active: boolean) => {
    await supabase.from("social_posts").update({ active: !active }).eq("id", id);
    refresh();
  };
  const deletePost = async (id: string) => {
    await supabase.from("social_posts").delete().eq("id", id);
    refresh();
  };

  const addCurriculum = async () => {
    if (!cTitle.trim()) return toast({ title: "Title required", variant: "destructive" });
    const { error } = await supabase.from("curriculum_items").insert({
      title: cTitle.trim(),
      description: cDesc.trim() || null,
      url: cUrl.trim() || null,
      category: cCat,
      active: true,
    });
    if (error) return toast({ title: "Failed", description: error.message, variant: "destructive" });
    toast({ title: "Added to Green Classroom" });
    setCTitle(""); setCDesc(""); setCUrl("");
    refresh();
  };
  const deleteItem = async (id: string) => {
    await supabase.from("curriculum_items").delete().eq("id", id);
    refresh();
  };

  const addFinance = async () => {
    if (!fDesc.trim() || !fAmt) return toast({ title: "Description and amount required", variant: "destructive" });
    const amount = parseFloat(fAmt);
    if (Number.isNaN(amount) || amount <= 0) return toast({ title: "Invalid amount", variant: "destructive" });
    const { error } = await supabase.from("finance_entries").insert({
      kind: fKind,
      description: fDesc.trim(),
      amount_naira: amount,
      source_or_payee: fParty.trim() || null,
      occurred_on: fDate,
    });
    if (error) return toast({ title: "Failed", description: error.message, variant: "destructive" });
    toast({ title: "Finance entry added" });
    setFDesc(""); setFAmt(""); setFParty("");
    refresh();
  };
  const deleteEntry = async (id: string) => {
    await supabase.from("finance_entries").delete().eq("id", id);
    refresh();
  };

  const tabClass = (t: typeof tab) =>
    `flex-1 px-4 py-3 rounded-xl text-sm font-semibold transition-all flex items-center justify-center gap-2 whitespace-nowrap ${
      tab === t ? "bg-primary text-primary-foreground shadow-md" : "bg-secondary text-foreground/60 hover:text-foreground"
    }`;

  return (
    <div className="min-h-screen bg-background pt-20 pb-16">
      <Navbar />
      <div className="max-w-5xl mx-auto px-5">
        <div className="mb-6">
          <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-1">HQ — Master Control</h1>
          <p className="text-muted-foreground text-sm">Manage social posts, Green Classroom, and finance records.</p>
        </div>

        <div className="flex gap-2 mb-8">
          <button onClick={() => setTab("social")} className={tabClass("social")}>
            <FontAwesomeIcon icon={faShareNodes} className="w-4 h-4" /> Social Posts
          </button>
          <button onClick={() => setTab("classroom")} className={tabClass("classroom")}>
            <FontAwesomeIcon icon={faChalkboard} className="w-4 h-4" /> Green Classroom
          </button>
          <button onClick={() => setTab("finance")} className={tabClass("finance")}>
            <FontAwesomeIcon icon={faMoneyBillTrendUp} className="w-4 h-4" /> Finance
          </button>
        </div>

        {tab === "social" && (
          <div className="space-y-6">
            <div className="bg-secondary/50 border border-border rounded-2xl p-6">
              <h3 className="font-semibold text-foreground mb-4">Add Social Post Links (Bulk)</h3>
              <div className="grid sm:grid-cols-3 gap-3 mb-3">
                <select value={platform} onChange={(e) => { const p = e.target.value as Platform; setPlatform(p); setLinkPoints(platformMeta[p].defaultPoints); }} className="bg-background border border-border rounded-xl px-3 py-2.5 text-sm">
                  {(Object.keys(platformMeta) as Platform[]).map((p) => (
                    <option key={p} value={p}>{platformMeta[p].label}</option>
                  ))}
                </select>
                <input type="number" value={linkPoints} onChange={(e) => setLinkPoints(parseInt(e.target.value) || 10)} placeholder="GreenSeeds per click" className="bg-background border border-border rounded-xl px-3 py-2.5 text-sm" />
                <button onClick={addBulkLinks} className="bg-primary text-primary-foreground rounded-xl px-4 py-2.5 text-sm font-semibold whitespace-nowrap inline-flex items-center justify-center gap-2">
                  <FontAwesomeIcon icon={faPlus} className="w-3.5 h-3.5" /> Add Links
                </button>
              </div>
              <textarea value={bulkLinks} onChange={(e) => setBulkLinks(e.target.value)} rows={5} placeholder={`Paste one URL per line:\nhttps://x.com/...\nhttps://x.com/...`} className="w-full bg-background border border-border rounded-xl px-3 py-2.5 text-sm font-mono" />
            </div>

            <div className="bg-card border border-border rounded-2xl overflow-hidden">
              <div className="p-4 border-b border-border font-semibold text-sm">All Posts ({posts.length})</div>
              <div className="divide-y divide-border max-h-[500px] overflow-y-auto">
                {posts.length === 0 && <div className="p-6 text-sm text-muted-foreground text-center">No posts yet.</div>}
                {posts.map((p) => (
                  <div key={p.id} className="p-3 flex items-center gap-3">
                    <FontAwesomeIcon icon={platformMeta[p.platform].icon} className="w-4 h-4 text-primary flex-shrink-0" />
                    <a href={p.url} target="_blank" rel="noopener noreferrer" className="text-xs text-foreground/80 truncate flex-1 hover:underline">{p.url}</a>
                    <span className="text-xs text-muted-foreground whitespace-nowrap">{p.points} seeds</span>
                    <button onClick={() => togglePost(p.id, p.active)} className={`text-xs px-2 py-1 rounded-md whitespace-nowrap ${p.active ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"}`}>{p.active ? "Active" : "Hidden"}</button>
                    <button onClick={() => deletePost(p.id)} className="text-destructive p-1.5 hover:bg-destructive/10 rounded-md">
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
            <div className="bg-secondary/50 border border-border rounded-2xl p-6">
              <h3 className="font-semibold text-foreground mb-4">Add Curriculum Item</h3>
              <div className="grid gap-3">
                <input value={cTitle} onChange={(e) => setCTitle(e.target.value)} placeholder="Title" className="bg-background border border-border rounded-xl px-3 py-2.5 text-sm" />
                <textarea value={cDesc} onChange={(e) => setCDesc(e.target.value)} rows={3} placeholder="Short description" className="bg-background border border-border rounded-xl px-3 py-2.5 text-sm" />
                <input value={cUrl} onChange={(e) => setCUrl(e.target.value)} placeholder="URL (optional)" className="bg-background border border-border rounded-xl px-3 py-2.5 text-sm" />
                <div className="grid sm:grid-cols-2 gap-3">
                  <select value={cCat} onChange={(e) => setCCat(e.target.value as Category)} className="bg-background border border-border rounded-xl px-3 py-2.5 text-sm capitalize">
                    {categories.map((c) => <option key={c} value={c}>{c.replace("_", " ")}</option>)}
                  </select>
                  <button onClick={addCurriculum} className="bg-primary text-primary-foreground rounded-xl px-4 py-2.5 text-sm font-semibold whitespace-nowrap inline-flex items-center justify-center gap-2">
                    <FontAwesomeIcon icon={faPlus} className="w-3.5 h-3.5" /> Add Item
                  </button>
                </div>
              </div>
            </div>

            <div className="bg-card border border-border rounded-2xl overflow-hidden">
              <div className="p-4 border-b border-border font-semibold text-sm">Curriculum ({items.length})</div>
              <div className="divide-y divide-border max-h-[500px] overflow-y-auto">
                {items.length === 0 && <div className="p-6 text-sm text-muted-foreground text-center">No items yet.</div>}
                {items.map((i) => (
                  <div key={i.id} className="p-3 flex items-start gap-3">
                    <span className="text-[10px] uppercase font-bold tracking-wider bg-primary/10 text-primary px-2 py-1 rounded whitespace-nowrap">{i.category.replace("_", " ")}</span>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm text-foreground">{i.title}</div>
                      {i.description && <div className="text-xs text-muted-foreground line-clamp-2">{i.description}</div>}
                      {i.url && <a href={i.url} target="_blank" rel="noopener noreferrer" className="text-[11px] text-primary truncate block hover:underline">{i.url}</a>}
                    </div>
                    <button onClick={() => deleteItem(i.id)} className="text-destructive p-1.5 hover:bg-destructive/10 rounded-md">
                      <FontAwesomeIcon icon={faTrash} className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {tab === "finance" && (
          <div className="space-y-6">
            <div className="bg-secondary/50 border border-border rounded-2xl p-6">
              <h3 className="font-semibold text-foreground mb-4">Add Finance Entry</h3>
              <div className="grid sm:grid-cols-2 gap-3 mb-3">
                <select value={fKind} onChange={(e) => setFKind(e.target.value as "income" | "expenditure")} className="bg-background border border-border rounded-xl px-3 py-2.5 text-sm">
                  <option value="income">Income</option>
                  <option value="expenditure">Expenditure</option>
                </select>
                <input type="date" value={fDate} onChange={(e) => setFDate(e.target.value)} className="bg-background border border-border rounded-xl px-3 py-2.5 text-sm" />
              </div>
              <input value={fDesc} onChange={(e) => setFDesc(e.target.value)} placeholder="Description (e.g. Donation from Lagos chapter)" className="w-full bg-background border border-border rounded-xl px-3 py-2.5 text-sm mb-3" />
              <div className="grid sm:grid-cols-2 gap-3 mb-3">
                <input type="number" step="0.01" value={fAmt} onChange={(e) => setFAmt(e.target.value)} placeholder="Amount in Naira" className="bg-background border border-border rounded-xl px-3 py-2.5 text-sm" />
                <input value={fParty} onChange={(e) => setFParty(e.target.value)} placeholder={fKind === "income" ? "Source (donor name)" : "Payee"} className="bg-background border border-border rounded-xl px-3 py-2.5 text-sm" />
              </div>
              <button onClick={addFinance} className="w-full bg-primary text-primary-foreground rounded-xl px-4 py-2.5 text-sm font-semibold whitespace-nowrap inline-flex items-center justify-center gap-2">
                <FontAwesomeIcon icon={faPlus} className="w-3.5 h-3.5" /> Save Entry
              </button>
            </div>

            <div className="bg-card border border-border rounded-2xl overflow-hidden">
              <div className="p-4 border-b border-border font-semibold text-sm">Entries ({entries.length})</div>
              <div className="divide-y divide-border max-h-[500px] overflow-y-auto">
                {entries.length === 0 && <div className="p-6 text-sm text-muted-foreground text-center">No entries yet.</div>}
                {entries.map((e) => (
                  <div key={e.id} className="p-3 flex items-center gap-3">
                    <span className={`text-[10px] uppercase font-bold tracking-wider px-2 py-1 rounded whitespace-nowrap ${e.kind === "income" ? "bg-emerald-500/10 text-emerald-600" : "bg-red-500/10 text-red-600"}`}>{e.kind}</span>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm text-foreground truncate">{e.description}</div>
                      <div className="text-xs text-muted-foreground">{e.occurred_on}{e.source_or_payee ? ` · ${e.source_or_payee}` : ""}</div>
                    </div>
                    <div className={`font-bold text-sm whitespace-nowrap ${e.kind === "income" ? "text-emerald-600" : "text-red-600"}`}>
                      ₦{Number(e.amount_naira).toLocaleString("en-NG")}
                    </div>
                    <button onClick={() => deleteEntry(e.id)} className="text-destructive p-1.5 hover:bg-destructive/10 rounded-md">
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

const HQ = () => (
  <AccessGate>
    <HQContent />
  </AccessGate>
);

export default HQ;
