import { useState, useRef, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCommentDots, faXmark, faPaperPlane } from "@fortawesome/free-solid-svg-icons";
import { supabase } from "@/integrations/supabase/client";
import ReactMarkdown from "react-markdown";

type Msg = { role: "user" | "assistant"; content: string };

const GreenGuide = () => {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const send = async () => {
    if (!input.trim() || loading) return;
    const userMsg: Msg = { role: "user", content: input.trim() };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput("");
    setLoading(true);

    try {
      let convId = conversationId;
      if (!convId) {
        const { data } = await supabase.from("chat_conversations").insert({ visitor_name: "Visitor" }).select("id").single();
        convId = data?.id || null;
        setConversationId(convId);
      }

      if (convId) {
        await supabase.from("chat_messages").insert({ conversation_id: convId, role: "user", content: userMsg.content });
      }

      const resp = await supabase.functions.invoke("green-guide", {
        body: { messages: newMessages },
      });

      const assistantContent = resp.data?.reply || "I'm sorry, I couldn't respond right now. Please try again.";
      const assistantMsg: Msg = { role: "assistant", content: assistantContent };
      setMessages([...newMessages, assistantMsg]);

      if (convId) {
        await supabase.from("chat_messages").insert({ conversation_id: convId, role: "assistant", content: assistantContent });
      }
    } catch {
      setMessages([...newMessages, { role: "assistant", content: "Something went wrong. Please try again." }]);
    }
    setLoading(false);
  };

  return (
    <>
      {/* FAB */}
      <button
        onClick={() => setOpen(!open)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-primary text-primary-foreground shadow-lg hover:opacity-90 transition-all flex items-center justify-center"
      >
        <FontAwesomeIcon icon={open ? faXmark : faCommentDots} className="w-5 h-5" />
      </button>

      {/* Chat panel */}
      {open && (
        <div className="fixed bottom-24 right-6 z-50 w-[340px] max-h-[480px] bg-background border border-border rounded-2xl shadow-2xl flex flex-col overflow-hidden">
          <div className="bg-accent px-4 py-3 flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
              <span className="text-primary text-xs font-bold">GP</span>
            </div>
            <div>
              <div className="text-accent-foreground text-sm font-semibold">Green Guide</div>
              <div className="text-accent-foreground/50 text-[10px]">Ask me anything about the movement</div>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-3 space-y-3 min-h-[200px] max-h-[320px]">
            {messages.length === 0 && (
              <div className="text-center text-muted-foreground text-xs py-8">
                👋 Hi! I'm Green Guide. Ask me about voter registration, the movement, or anything else!
              </div>
            )}
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[80%] rounded-xl px-3 py-2 text-xs leading-relaxed ${
                  m.role === "user"
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary text-foreground"
                }`}>
                  {m.role === "assistant" ? (
                    <div className="prose prose-xs"><ReactMarkdown>{m.content}</ReactMarkdown></div>
                  ) : m.content}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-secondary rounded-xl px-3 py-2 text-xs text-muted-foreground">Thinking...</div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          <div className="border-t border-border p-2 flex gap-2">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && send()}
              placeholder="Type a message..."
              className="flex-1 bg-secondary/50 border border-border rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-primary/50"
            />
            <button onClick={send} disabled={loading || !input.trim()}
              className="bg-primary text-primary-foreground w-8 h-8 rounded-lg flex items-center justify-center hover:opacity-90 disabled:opacity-50">
              <FontAwesomeIcon icon={faPaperPlane} className="w-3 h-3" />
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default GreenGuide;
