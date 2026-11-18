import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft, faComments } from "@fortawesome/free-solid-svg-icons";
import AccessGate from "@/components/AccessGate";

type Conversation = {
  id: string;
  visitor_name: string | null;
  created_at: string;
};

const ChatsContent = () => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [messages, setMessages] = useState<{ role: string; content: string; created_at: string }[]>([]);

  useEffect(() => {
    supabase.from("chat_conversations").select("*").order("created_at", { ascending: false })
      .then(({ data }) => { if (data) setConversations(data); });
  }, []);

  useEffect(() => {
    if (!selectedId) return;
    supabase.from("chat_messages").select("*").eq("conversation_id", selectedId)
      .order("created_at", { ascending: true })
      .then(({ data }) => { if (data) setMessages(data); });
  }, [selectedId]);

  return (
    <div className="min-h-screen">
      <div className="section-container py-8">
        <div className="flex items-center gap-3 mb-8">
          <Link to="/" className="text-muted-foreground hover:text-foreground transition-colors">
            <FontAwesomeIcon icon={faArrowLeft} className="w-4 h-4" />
          </Link>
          <h1 className="text-2xl font-bold text-foreground">Chat Conversations</h1>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          <div className="md:col-span-1 space-y-2 max-h-[70vh] overflow-y-auto">
            {conversations.length === 0 && (
              <p className="text-muted-foreground text-sm text-center py-8">No conversations yet</p>
            )}
            {conversations.map((c) => (
              <button key={c.id} onClick={() => setSelectedId(c.id)}
                className={`w-full text-left p-3 rounded-xl border transition-all ${
                  selectedId === c.id ? "bg-primary/10 border-primary" : "bg-secondary/50 border-border hover:border-primary/30"
                }`}>
                <div className="flex items-center gap-2">
                  <FontAwesomeIcon icon={faComments} className="w-3.5 h-3.5 text-primary" />
                  <span className="text-sm font-medium text-foreground">{c.visitor_name || "Visitor"}</span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {new Date(c.created_at).toLocaleDateString("en-NG", { dateStyle: "medium" })}
                </p>
              </button>
            ))}
          </div>

          <div className="md:col-span-2 glass p-6 max-h-[70vh] overflow-y-auto">
            {!selectedId ? (
              <p className="text-muted-foreground text-sm text-center py-16">Select a conversation to view</p>
            ) : (
              <div className="space-y-3">
                {messages.map((m, i) => (
                  <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                    <div className={`max-w-[80%] rounded-xl px-4 py-2.5 text-sm ${
                      m.role === "user" ? "bg-primary text-primary-foreground" : "bg-background border border-border text-foreground"
                    }`}>
                      {m.content}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const Chats = () => (
  <AccessGate>
    <ChatsContent />
  </AccessGate>
);

export default Chats;
