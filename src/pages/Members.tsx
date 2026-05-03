import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft, faUsers, faIdCard, faDownload, faClockRotateLeft } from "@fortawesome/free-solid-svg-icons";
import AccessGate from "@/components/AccessGate";
import { useToast } from "@/hooks/use-toast";

const PVC_OPTIONS = ["Yes", "No", "In Progress"] as const;

const escapeCsv = (val: string | null | undefined) => {
  if (val == null) return "";
  const s = String(val);
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
};

const downloadCsv = (rows: Record<string, unknown>[], filename: string) => {
  if (rows.length === 0) return;
  const headers = Object.keys(rows[0]);
  const csv = [
    headers.join(","),
    ...rows.map((r) => headers.map((h) => escapeCsv(r[h] as string)).join(",")),
  ].join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
};

type Member = {
  id: string;
  full_name: string;
  phone: string;
  state: string;
  lga: string;
  age_group: string;
  gender: string;
  has_pvc: string;
  reason: string | null;
  created_at: string;
};

const MembersContent = () => {
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    supabase.from("members").select("*").order("created_at", { ascending: false })
      .then(({ data }) => { if (data) setMembers(data); setLoading(false); });
  }, []);

  const updatePvc = async (id: string, newStatus: string) => {
    setUpdatingId(id);
    const previous = members;
    setMembers((prev) => prev.map((m) => (m.id === id ? { ...m, has_pvc: newStatus } : m)));
    const { error } = await supabase.from("members").update({ has_pvc: newStatus }).eq("id", id);
    setUpdatingId(null);
    if (error) {
      setMembers(previous);
      toast({ title: "Could not update PVC status", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "PVC status updated" });
    }
  };

  const exportMembers = () => {
    if (members.length === 0) {
      toast({ title: "No members to export" });
      return;
    }
    downloadCsv(members as unknown as Record<string, unknown>[], `green-people-members-${new Date().toISOString().slice(0, 10)}.csv`);
    toast({ title: `Exported ${members.length} members` });
  };

  const exportSignupLog = async () => {
    const { data, error } = await supabase
      .from("member_signup_log")
      .select("*")
      .order("created_at", { ascending: false });
    if (error || !data || data.length === 0) {
      toast({ title: "No signup log entries to export", variant: error ? "destructive" : "default" });
      return;
    }
    downloadCsv(data as unknown as Record<string, unknown>[], `signup-log-backup-${new Date().toISOString().slice(0, 10)}.csv`);
    toast({ title: `Exported ${data.length} log entries (full backup)` });
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="section-container py-8">
        <div className="flex flex-wrap items-center gap-3 mb-8">
          <Link to="/" className="text-muted-foreground hover:text-foreground transition-colors">
            <FontAwesomeIcon icon={faArrowLeft} className="w-4 h-4" />
          </Link>
          <h1 className="text-2xl font-bold text-foreground">Members</h1>
          <span className="bg-primary/10 text-primary text-xs font-semibold px-2.5 py-1 rounded-full">
            {members.length} total
          </span>
          <div className="w-full sm:w-auto sm:ml-auto flex flex-wrap items-center justify-start gap-2">
            <Link
              to="/#join"
              className="inline-flex items-center gap-1.5 bg-accent text-accent-foreground text-xs font-semibold px-3 py-1.5 rounded-lg hover:opacity-90 transition-opacity whitespace-nowrap"
            >
              <FontAwesomeIcon icon={faUsers} className="w-3 h-3" />
              Join Green People
            </Link>
            <button
              onClick={exportMembers}
              className="inline-flex items-center gap-1.5 bg-primary text-primary-foreground text-xs font-semibold px-3 py-1.5 rounded-lg hover:opacity-90 transition-opacity whitespace-nowrap"
            >
              <FontAwesomeIcon icon={faDownload} className="w-3 h-3" />
              Export CSV
            </button>
            <button
              onClick={exportSignupLog}
              className="inline-flex items-center gap-1.5 bg-secondary text-foreground text-xs font-semibold px-3 py-1.5 rounded-lg hover:bg-secondary/80 transition-colors border border-border whitespace-nowrap"
              title="Download append-only backup log of every registration attempt"
            >
              <FontAwesomeIcon icon={faClockRotateLeft} className="w-3 h-3" />
              Full Backup Log
            </button>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-16 text-muted-foreground text-sm">Loading...</div>
        ) : members.length === 0 ? (
          <div className="text-center py-16">
            <FontAwesomeIcon icon={faUsers} className="w-8 h-8 text-muted-foreground/30 mb-3" />
            <p className="text-muted-foreground text-sm">No members yet</p>
          </div>
        ) : (
          <div className="space-y-3">
            {members.map((m) => (
              <div key={m.id} className="bg-card border border-border rounded-xl p-4 flex flex-col sm:flex-row sm:items-center gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold text-sm text-foreground truncate">{m.full_name}</span>
                    <span className="text-xs text-muted-foreground">· {m.gender}</span>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {m.state}, {m.lga} · {m.age_group} · {m.phone}
                  </div>
                  {m.reason && (
                    <p className="text-xs text-muted-foreground/70 mt-1 italic line-clamp-2">"{m.reason}"</p>
                  )}
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <div className="relative">
                    <select
                      value={m.has_pvc}
                      disabled={updatingId === m.id}
                      onChange={(e) => updatePvc(m.id, e.target.value)}
                      className={`appearance-none cursor-pointer text-xs font-medium pl-7 pr-7 py-1.5 rounded-full border-0 focus:outline-none focus:ring-2 focus:ring-primary/30 disabled:opacity-50 ${
                        m.has_pvc === "Yes" ? "bg-primary/10 text-primary" : m.has_pvc === "In Progress" ? "bg-yellow-100 text-yellow-700" : "bg-destructive/10 text-destructive"
                      }`}
                    >
                      {PVC_OPTIONS.map((opt) => (
                        <option key={opt} value={opt} className="text-foreground bg-background">{opt}</option>
                      ))}
                    </select>
                    <FontAwesomeIcon icon={faIdCard} className="w-3 h-3 absolute left-2 top-1/2 -translate-y-1/2 pointer-events-none opacity-70" />
                    <svg className="w-2.5 h-2.5 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none opacity-60" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 9l-7 7-7-7" /></svg>
                  </div>
                  <span className="text-[10px] text-muted-foreground">
                    {new Date(m.created_at).toLocaleDateString("en-NG", { dateStyle: "medium" })}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const Members = () => (
  <AccessGate>
    <MembersContent />
  </AccessGate>
);

export default Members;
