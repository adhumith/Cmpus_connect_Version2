import { useState, useRef, useEffect } from "react";
import api from "../../lib/api";
import { Send, Bot, User } from "lucide-react";

export default function ChatPage() {
  const [messages, setMessages] = useState([
    { role: "assistant", text: "Hello! I'm the campus AI assistant. Ask me anything about the college." }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  const send = async () => {
    if (!input.trim() || loading) return;
    const question = input.trim();
    setInput("");
    setMessages(m => [...m, { role: "user", text: question }]);
    setLoading(true);
    try {
      const res = await api.post("/rag/chat", { question });
      setMessages(m => [...m, { role: "assistant", text: res.data.answer }]);
    } catch {
      setMessages(m => [...m, { role: "assistant", text: "Sorry, something went wrong." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)]">
      <h1 className="font-display text-3xl font-bold text-slate-100 mb-6">AI Assistant</h1>
      
      <div className="flex-1 overflow-y-auto space-y-4 mb-4 pr-2">
        {messages.map((msg, i) => (
          <div key={i} className={`flex gap-3 ${msg.role === "user" ? "flex-row-reverse" : ""}`}>
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${msg.role === "assistant" ? "bg-amber-500/10" : "bg-navy-700"}`}>
              {msg.role === "assistant" ? <Bot size={14} className="text-amber-400" /> : <User size={14} className="text-slate-400" />}
            </div>
            <div className={`max-w-2xl px-4 py-3 rounded-xl text-sm leading-relaxed ${msg.role === "assistant" ? "bg-navy-800 border border-navy-600 text-slate-200" : "bg-amber-500/10 border border-amber-500/20 text-slate-100"}`}>
              {msg.text}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex gap-3">
            <div className="w-8 h-8 bg-amber-500/10 rounded-lg flex items-center justify-center">
              <Bot size={14} className="text-amber-400" />
            </div>
            <div className="bg-navy-800 border border-navy-600 px-4 py-3 rounded-xl">
              <div className="flex gap-1">
                {[0,1,2].map(i => <div key={i} className="w-1.5 h-1.5 bg-amber-400 rounded-full animate-bounce" style={{animationDelay: `${i*150}ms`}} />)}
              </div>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      <div className="flex gap-3">
        <input
          className="input flex-1"
          placeholder="Ask about courses, facilities, faculty..."
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === "Enter" && send()}
        />
        <button onClick={send} disabled={loading} className="btn-primary px-4">
          <Send size={16} />
        </button>
      </div>
    </div>
  );
}