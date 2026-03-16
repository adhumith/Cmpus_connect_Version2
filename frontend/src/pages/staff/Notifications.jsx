import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import api from "../../lib/api";
import toast from "react-hot-toast";
import { Send } from "lucide-react";

export default function Notifications() {
  const [form, setForm] = useState({ title: "", message: "", dept: "", semester: "", class_name: "" });

  const send = useMutation({
    mutationFn: (data) => api.post("/notifications/send", {
      ...data,
      semester: data.semester ? Number(data.semester) : null,
      dept: data.dept || null,
      class_name: data.class_name || null,
    }),
    onSuccess: () => { setForm({ title: "", message: "", dept: "", semester: "", class_name: "" }); toast.success("Notification sent!"); },
    onError: () => toast.error("Failed to send"),
  });

  const handleSend = () => {
    if (!form.title || !form.message) return toast.error("Title and message are required");
    if (window.confirm("Send this notification to students?")) send.mutate(form);
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <h1 className="font-display text-3xl font-bold text-slate-100">Send Notification</h1>
      <div className="card space-y-4">
        <p className="text-sm text-slate-500">Leave filters empty to broadcast to all students.</p>
        <input className="input" placeholder="Notification Title" value={form.title} onChange={e => setForm({...form, title: e.target.value})} />
        <textarea className="input min-h-28 resize-none" placeholder="Message..." value={form.message} onChange={e => setForm({...form, message: e.target.value})} />
        <div className="grid grid-cols-3 gap-3">
          <input className="input" placeholder="Dept (optional)" value={form.dept} onChange={e => setForm({...form, dept: e.target.value})} />
          <input className="input" type="number" placeholder="Semester" min={1} max={8} value={form.semester} onChange={e => setForm({...form, semester: e.target.value})} />
          <input className="input" placeholder="Class (optional)" value={form.class_name} onChange={e => setForm({...form, class_name: e.target.value})} />
        </div>
        <button className="btn-primary flex items-center gap-2" onClick={handleSend} disabled={send.isPending}>
          <Send size={14} />
          {send.isPending ? "Sending..." : "Send Notification"}
        </button>
      </div>
    </div>
  );
}