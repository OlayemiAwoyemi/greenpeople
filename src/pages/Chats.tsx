import { useEffect, useMemo, useState } from "react";
import { fetchAll } from "@/lib/fetchAll";
import { supabase } from "@/integrations/supabase/client";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft, faComments, faMagnifyingGlass, faRobot, faUser } from "@fortawesome/free-solid-svg-icons";
import AccessGate from "@/components/AccessGate";
import AdminShell, { EmptyState, ErrorState, Skeleton } from "@/components/admin/AdminShell";

type Conversation = { id: string; visitor_name: string | null; created_at: string };
type Message = { role: string; content: string; created_at: string };

const when = (iso: string) =>
  new Date(iso).toLocaleString("en-NG", { day: "numeric", month: "short", hour: "numeric", minute: "2-digit" });

const ChatsContent = () => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);
  const [reload, setReload] = useState(0);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loadingMsgs, setLoadingMsgs] = useState(false);
  const [query, setQuery] = useState("");

  useEffect(() => {
    setLoading(true); setFailed(false);
    fetchAll<Conversation>((a, b) => supabase.from("chat_conversations").select("*").order("created_at", { ascending: false }).range(a, b))
      .then(({ data, error }) => { if (error) setFailed(true); else setConversations(data); setLoading(false); });
  }, [reload]);

  useEffect(() => {
    if (!selectedId) return;
    setLoadingMsgs(true);
    supabase.from("chat_messages").select("role, content, created_at").eq("conversation_id", selectedId)
      .order("created_at", { ascending: true })
      .then(({ data }) => { setMessages(data ?? []); setLoadingMsgs(false); });
  }, [selectedId]);

  const today = new Date().toDateString();
  const todayCount = conversations.filter((c) => new Date(c.created_at).toDateString() === today).length;
  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return q ? conversations.filter((c) => (c.visitor_name || "visitor").toLowerCase().includes(q) || when(c.created_at).toLowerCase().includes(q)) : conversations;
  }, [conversations, query]);
  const selected = conversations.find((c) => c.id === selectedId);

  return (
    <AdminShell title="Chats" subtitle={`Conversations with the Green Guide · ${conversations.length.toLocaleString("en-NG")} total · ${todayCount} today`}>
      {loading ? <Skeleton rows={6} /> : failed ? <ErrorState onRetry={() => setReload((x) => x + 1)} /> : conversations.length === 0 ? (
        <EmptyState title="No conversations yet" hint="Chats from the Green Guide on the website will appear here." />
      ) : (
        <div className="grid md:grid-cols-[minmax(0,20rem)_1fr] gap-4">
          {/* list (hidden on phones while a chat is open) */}
          <aside className={`glass overflow-hidden ${selectedId ? "hidden md:block" : ""}`}>
            <div className="p-3 border-b border-pale">
              <label htmlFor="chat-search" className="sr-only">Search chats</label>
              <div className="relative">
                <FontAwesomeIcon icon={faMagnifyingGlass} className="w-3.5 h-3.5 absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input id="chat-search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search by name or date"
                  className="w-full bg-white/70 border border-pale rounded-full pl-9 pr-4 py-2.5 min-h-11 text-base sm:text-sm focus:outline-none focus:ring-[3px] focus:ring-primary/60" />
              </div>
            </div>
            <ul className="max-h-[65vh] overflow-y-auto divide-y divide-pale">
              {visible.map((c) => (
                <li key={c.id}>
                  <button onClick={() => setSelectedId(c.id)} aria-current={selectedId === c.id}
                    className={`w-full text-left px-4 py-3 flex items-center gap-3 transition-colors ${selectedId === c.id ? "bg-white/80" : "hover:bg-white/50"}`}>
                    <span className="w-9 h-9 rounded-full bg-pale flex items-center justify-center shrink-0">
                      <FontAwesomeIcon icon={faComments} className="w-3.5 h-3.5 text-olive" />
                    </span>
                    <span className="min-w-0">
                      <span className="block text-sm font-semibold text-foreground truncate">{c.visitor_name || "Visitor"}</span>
                      <span className="block text-xs text-muted-foreground">{when(c.created_at)}</span>
                    </span>
                  </button>
                </li>
              ))}
              {visible.length === 0 && <li className="p-6 text-sm text-center text-muted-foreground">No chats match that search.</li>}
            </ul>
          </aside>

          {/* thread */}
          <section className={`glass flex flex-col min-h-[50vh] max-h-[75vh] ${selectedId ? "" : "hidden md:flex"}`} aria-label="Conversation">
            {!selected ? (
              <div className="m-auto text-center p-10 text-muted-foreground">
                <FontAwesomeIcon icon={faComments} className="w-8 h-8 mb-3 text-olive/60" />
                <p>Pick a conversation to read it.</p>
              </div>
            ) : (
              <>
                <header className="px-4 py-3 border-b border-pale flex items-center gap-3">
                  <button onClick={() => setSelectedId(null)} className="md:hidden w-10 h-10 -ml-2 rounded-full flex items-center justify-center" aria-label="Back to all chats">
                    <FontAwesomeIcon icon={faArrowLeft} className="w-4 h-4" />
                  </button>
                  <div className="min-w-0">
                    <p className="font-semibold text-foreground truncate">{selected.visitor_name || "Visitor"}</p>
                    <p className="text-xs text-muted-foreground">Started {when(selected.created_at)} · {messages.length} messages</p>
                  </div>
                </header>
                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                  {loadingMsgs ? <p className="text-sm text-muted-foreground">Loading…</p> : messages.map((m, i) => {
                    const mine = m.role === "user";
                    return (
                      <div key={i} className={`flex gap-2 ${mine ? "justify-end" : "justify-start"}`}>
                        {!mine && <span className="w-7 h-7 rounded-full bg-deep text-lime flex items-center justify-center shrink-0 mt-1"><FontAwesomeIcon icon={faRobot} className="w-3 h-3" /></span>}
                        <div className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed whitespace-pre-wrap ${mine ? "bg-deep text-white rounded-br-md" : "bg-white/80 border border-white text-foreground rounded-bl-md"}`}>
                          {m.content}
                          <div className={`mt-1 text-[10px] ${mine ? "text-white/60" : "text-muted-foreground"}`}>{when(m.created_at)}</div>
                        </div>
                        {mine && <span className="w-7 h-7 rounded-full bg-pale text-foreground flex items-center justify-center shrink-0 mt-1"><FontAwesomeIcon icon={faUser} className="w-3 h-3" /></span>}
                      </div>
                    );
                  })}
                </div>
              </>
            )}
          </section>
        </div>
      )}
    </AdminShell>
  );
};

const Chats = () => (
  <AccessGate>
    <ChatsContent />
  </AccessGate>
);

export default Chats;
