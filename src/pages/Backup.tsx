import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import AccessGate from "@/components/AccessGate";
import Navbar from "@/components/Navbar";
import { useToast } from "@/hooks/use-toast";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faDownload, faDatabase, faShield } from "@fortawesome/free-solid-svg-icons";

const TABLES = [
  "members", "member_signup_log",
  "social_posts", "social_clicks",
  "curriculum_items", "curriculum_reads",
  "lesson_quizzes", "quiz_attempts",
  "finance_entries",
  "page_visits", "member_referrals",
  "blog_posts", "chat_conversations", "chat_messages",
] as const;

const BackupContent = () => {
  const { toast } = useToast();
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    (async () => {
      const out: Record<string, number> = {};
      for (const t of TABLES) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { count } = await (supabase as any).from(t).select("*", { count: "exact", head: true });
        out[t] = count ?? 0;
      }
      setCounts(out);
    })();
  }, []);

  const downloadAll = async () => {
    setBusy(true);
    try {
      const dump: Record<string, unknown[]> = {};
      for (const t of TABLES) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { data, error } = await (supabase as any).from(t).select("*");
        if (error) console.warn(t, error);
        dump[t] = data ?? [];
      }
      const meta = { exported_at: new Date().toISOString(), source: "greenpeople.ng", version: 1 };
      const blob = new Blob([JSON.stringify({ meta, data: dump }, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url; a.download = `green-people-backup-${new Date().toISOString().slice(0,10)}.json`; a.click();
      setTimeout(() => URL.revokeObjectURL(url), 2000);
      toast({ title: "Backup downloaded" });
    } catch (e) {
      toast({ title: "Backup failed", description: e instanceof Error ? e.message : "Unknown", variant: "destructive" });
    } finally { setBusy(false); }
  };

  const downloadTable = async (t: string) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (supabase as any).from(t).select("*");
    if (error || !data) return toast({ title: `Failed: ${t}`, variant: "destructive" });
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `${t}-${new Date().toISOString().slice(0,10)}.json`; a.click();
    setTimeout(() => URL.revokeObjectURL(url), 2000);
  };

  return (
    <div className="min-h-screen pt-20 pb-16 overflow-x-hidden">
      <Navbar />
      <div className="max-w-3xl mx-auto px-4 sm:px-5">
        <div className="flex items-center gap-2 mb-2">
          <FontAwesomeIcon icon={faShield} className="w-4 h-4 text-primary" />
          <h1 className="text-xl sm:text-2xl font-bold text-foreground">Backup Vault</h1>
        </div>
        <p className="text-xs sm:text-sm text-muted-foreground mb-6 break-words">
          Download a complete JSON snapshot of every table. Save it weekly. If anything breaks, we can restore.
        </p>

        <button onClick={downloadAll} disabled={busy} className="w-full sm:w-auto inline-flex items-center justify-center gap-2 btn-primary !min-h-10 !text-sm shadow-md disabled:opacity-50 mb-8 whitespace-nowrap">
          <FontAwesomeIcon icon={faDownload} className="w-4 h-4" />
          {busy ? "Bundling…" : "Download Full Backup (JSON)"}
        </button>

        <div className="glass overflow-hidden">
          <div className="p-3 sm:p-4 border-b border-pale font-semibold text-sm flex items-center gap-2">
            <FontAwesomeIcon icon={faDatabase} className="w-3.5 h-3.5" /> Tables
          </div>
          <div className="divide-y divide-pale">
            {TABLES.map((t) => (
              <div key={t} className="p-2.5 sm:p-3 flex items-center gap-2 min-w-0">
                <code className="text-[11px] sm:text-xs text-foreground/80 truncate flex-1 min-w-0">{t}</code>
                <span className="text-[10px] sm:text-xs text-muted-foreground whitespace-nowrap">{counts[t] ?? "—"}</span>
                <button onClick={() => downloadTable(t)} className="text-[10px] sm:text-xs font-semibold bg-secondary text-foreground px-2 py-1 rounded-md whitespace-nowrap">
                  <FontAwesomeIcon icon={faDownload} className="w-3 h-3 mr-1" />JSON
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

const Backup = () => <AccessGate><BackupContent /></AccessGate>;
export default Backup;
