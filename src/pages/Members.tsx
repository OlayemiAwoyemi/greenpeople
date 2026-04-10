import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft, faUsers, faIdCard } from "@fortawesome/free-solid-svg-icons";
import AccessGate from "@/components/AccessGate";

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

  useEffect(() => {
    supabase.from("members").select("*").order("created_at", { ascending: false })
      .then(({ data }) => { if (data) setMembers(data); setLoading(false); });
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <div className="section-container py-8">
        <div className="flex items-center gap-3 mb-8">
          <Link to="/" className="text-muted-foreground hover:text-foreground transition-colors">
            <FontAwesomeIcon icon={faArrowLeft} className="w-4 h-4" />
          </Link>
          <h1 className="text-2xl font-bold text-foreground">Members</h1>
          <span className="bg-primary/10 text-primary text-xs font-semibold px-2.5 py-1 rounded-full ml-auto">
            {members.length} total
          </span>
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
                  <span className={`inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full ${
                    m.has_pvc === "Yes" ? "bg-primary/10 text-primary" : m.has_pvc === "In Progress" ? "bg-yellow-100 text-yellow-700" : "bg-destructive/10 text-destructive"
                  }`}>
                    <FontAwesomeIcon icon={faIdCard} className="w-3 h-3" />
                    PVC: {m.has_pvc}
                  </span>
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
