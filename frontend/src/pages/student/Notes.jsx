import { useQuery } from "@tanstack/react-query";
import api from "../../lib/api";
import { FolderOpen, FileText, Download } from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

export default function StudentNotes() {
  const { data: sections = [], isLoading } = useQuery({
    queryKey: ["note-sections"],
    queryFn: () => api.get("/notes/sections").then(r => r.data),
  });

  const handleDownload = async (sectionId, filename) => {
    try {
      const res = await api.get(
        `/notes/sections/${sectionId}/download/${encodeURIComponent(filename)}`,
        { responseType: "blob" }
      );
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch {
      alert("Failed to download file");
    }
  };

  if (isLoading) return (
    <div className="text-slate-500 text-sm">Loading notes...</div>
  );

  return (
    <div className="space-y-6">
      <h1 className="font-display text-3xl font-bold text-slate-100">Notes</h1>

      {sections.length === 0 && (
        <div className="card text-slate-500 text-sm text-center py-16">
          No notes available yet
        </div>
      )}

      <div className="grid gap-4">
        {sections.map((section) => (
          <div key={section._id} className="card hover:border-amber-500/30 transition-colors">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-amber-500/10 rounded-lg flex items-center justify-center shrink-0">
                <FolderOpen size={18} className="text-amber-400" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="font-semibold text-slate-100">{section.course_name}</h3>
                  <span className="badge border-[#1e3050] text-slate-400 font-mono">
                    {section.course_code}
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  {section.dept} · Semester {section.semester}
                </p>

                {section.files?.length > 0 ? (
                  <div className="mt-4 space-y-2">
                    {section.files.map((f, i) => (
                      <div
                        key={i}
                        className="flex items-center justify-between bg-[#070d1a] border border-[#1e3050] rounded-lg px-4 py-2.5 group"
                      >
                        <div className="flex items-center gap-2">
                          <FileText size={14} className="text-slate-500" />
                          <span className="text-sm text-slate-300">{f.filename}</span>
                        </div>
                        <button
                          onClick={() => handleDownload(section._id, f.filename)}
                          className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-amber-400 transition-colors opacity-0 group-hover:opacity-100"
                        >
                          <Download size={13} />
                          Download
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-600 mt-2">No files uploaded yet</p>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}