import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import api from "../../lib/api";
import toast from "react-hot-toast";
import { Upload, Trash2, Bot, User, Send } from "lucide-react";

export default function StaffChat() {
  const { profile } = useAuth();
  const [messages, setMessages] = useState([
    { role: "assistant", text: "Hello! I'm the campus AI assistant. Ask me anything about the college." }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [wiping, setWiping] = useState(false);

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

  const uploadDoc = async (file) => {
    setUploading(true);
    const fd = new FormData();
    fd.append("file", file);
    try {
      const res = await api.post("/rag/upload", fd);
      toast.success(res.data.message || "Document added to knowledge base!");
    } catch {
      toast.error("Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const wipeKnowledge = async () => {
    if (!window.confirm("⚠️ This will permanently delete ALL documents from the knowledge base. Are you sure?")) return;
    setWiping(true);
    try {
      await api.delete("/rag/wipe");
      toast.success("Knowledge base wiped successfully");
    } catch {
      toast.error("Failed to wipe knowledge base");
    } finally {
      setWiping(false);
    }
  };

  return (
    <div className="space-y-4 flex flex-col h-[calc(100vh-8rem)]">
      <h1 className="font-display text-3xl font-bold text-slate-100">AI Assistant</h1>

      {/* Controls panel for staff and admin */}
      <div className="card border-amber-500/20 flex items-center justify-between gap-4 shrink-0">
        <div>
          <p className="text-sm font-semibold text-slate-100">Knowledge Base</p>
          <p className="text-xs text-slate-500 mt-0.5">
            Upload PDF documents to expand the AI's knowledge
          </p>
        </div>
        <div className="flex items-center gap-3">
          {/* Wipe — admin only */}
          {profile?.role === "admin" && (
            <button
              onClick={wipeKnowledge}
              disabled={wiping}
              className="flex items-center gap-2 border border-red-500/40 text-red-400 hover:bg-red-500/10 px-4 py-2 rounded-lg text-sm transition-all disabled:opacity-50"
            >
              <Trash2 size={14} />
              {wiping ? "Wiping..." : "Wipe All"}
            </button>
          )}

          {/* Upload — staff and admin */}
          <label className="btn-primary flex items-center gap-2 cursor-pointer">
            <Upload size={14} />
            {uploading ? "Uploading..." : "Upload PDF"}
            <input
              type="file"
              accept=".pdf"
              className="hidden"
              onChange={e => e.target.files[0] && uploadDoc(e.target.files[0])}
            />
          </label>
        </div>
      </div>

      {/* Chat messages */}
      <div className="flex-1 overflow-y-auto space-y-4 pr-2">
        {messages.map((msg, i) => (
          <div key={i} className={`flex gap-3 ${msg.role === "user" ? "flex-row-reverse" : ""}`}>
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
              msg.role === "assistant" ? "bg-amber-500/10" : "bg-[#142038]"
            }`}>
              {msg.role === "assistant"
                ? <Bot size={14} className="text-amber-400" />
                : <User size={14} className="text-slate-400" />
              }
            </div>
            <div className={`max-w-2xl px-4 py-3 rounded-xl text-sm leading-relaxed ${
              msg.role === "assistant"
                ? "bg-[#0d1829] border border-[#1e3050] text-slate-200"
                : "bg-amber-500/10 border border-amber-500/20 text-slate-100"
            }`}>
              {msg.text}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex gap-3">
            <div className="w-8 h-8 bg-amber-500/10 rounded-lg flex items-center justify-center">
              <Bot size={14} className="text-amber-400" />
            </div>
            <div className="bg-[#0d1829] border border-[#1e3050] px-4 py-3 rounded-xl">
              <div className="flex gap-1">
                {[0, 1, 2].map(i => (
                  <div
                    key={i}
                    className="w-1.5 h-1.5 bg-amber-400 rounded-full animate-bounce"
                    style={{ animationDelay: `${i * 150}ms` }}
                  />
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <div className="flex gap-3 shrink-0">
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