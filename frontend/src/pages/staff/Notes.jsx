import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../../lib/api";
import toast from "react-hot-toast";
import { Plus, Upload, FolderOpen, Trash2, FileText } from "lucide-react";

export default function StaffNotes() {
  const qc = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ course_code: "", course_name: "", dept: "", semester: 1 });
  const [uploading, setUploading] = useState({});

  const { data: sections = [] } = useQuery({
    queryKey: ["staff-sections"],
    queryFn: () => api.get("/notes/sections").then(r => r.data),
  });

  const createSection = useMutation({
    mutationFn: (data) => api.post("/notes/sections", { ...data, semester: Number(data.semester) }),
    onSuccess: () => {
      qc.invalidateQueries(["staff-sections"]);
      setShowForm(false);
      toast.success("Section created");
    },
    onError: () => toast.error("Failed to create section"),
  });

  const deleteSection = useMutation({
    mutationFn: (id) => api.delete(`/notes/sections/${id}`),
    onSuccess: () => {
      qc.invalidateQueries(["staff-sections"]);
      toast.success("Deleted");
    },
  });

  const uploadFile = async (sectionId, file) => {
    setUploading(u => ({ ...u, [sectionId]: true }));
    const fd = new FormData();
    fd.append("file", file);
    try {
      await api.post(`/notes/sections/${sectionId}/upload`, fd);
      qc.invalidateQueries(["staff-sections"]);
      toast.success("File uploaded");
    } catch {
      toast.error("Upload failed");
    } finally {
      setUploading(u => ({ ...u, [sectionId]: false }));
    }
  };

  const deleteFile = async (sectionId, filename) => {
    if (!window.confirm(`Delete "${filename}"?`)) return;
    try {
      await api.delete(`/notes/sections/${sectionId}/files/${encodeURIComponent(filename)}`);
      qc.invalidateQueries(["staff-sections"]);
      toast.success("File deleted");
    } catch {
      toast.error("Failed to delete file");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-3xl font-bold text-slate-100">Notes</h1>
        <button
          className="btn-primary flex items-center gap-2"
          onClick={() => setShowForm(!showForm)}
        >
          <Plus size={14} /> New Section
        </button>
      </div>

      {showForm && (
        <div className="card border-amber-500/20 space-y-4">
          <h3 className="font-semibold text-slate-100">Create Course Section</h3>
          <div className="grid grid-cols-2 gap-3">
            <input
              className="input"
              placeholder="Course Code (e.g. CS301)"
              value={form.course_code}
              onChange={e => setForm({ ...form, course_code: e.target.value })}
            />
            <input
              className="input"
              placeholder="Course Name"
              value={form.course_name}
              onChange={e => setForm({ ...form, course_name: e.target.value })}
            />
            <input
              className="input"
              placeholder="Department"
              value={form.dept}
              onChange={e => setForm({ ...form, dept: e.target.value })}
            />
            <input
              className="input"
              type="number"
              placeholder="Semester"
              min={1}
              max={8}
              value={form.semester}
              onChange={e => setForm({ ...form, semester: e.target.value })}
            />
          </div>
          <div className="flex gap-3">
            <button
              className="btn-primary"
              onClick={() => createSection.mutate(form)}
              disabled={createSection.isPending}
            >
              {createSection.isPending ? "Creating..." : "Create"}
            </button>
            <button className="btn-ghost" onClick={() => setShowForm(false)}>
              Cancel
            </button>
          </div>
        </div>
      )}

      <div className="space-y-4">
        {sections.length === 0 && (
          <div className="card text-slate-500 text-sm text-center py-16">
            No sections yet. Create one to get started.
          </div>
        )}

        {sections.map(section => (
          <div key={section._id} className="card">
            <div className="flex items-start justify-between gap-4">
              <div className="flex gap-3 items-start flex-1">
                <div className="w-10 h-10 bg-amber-500/10 rounded-lg flex items-center justify-center shrink-0 mt-0.5">
                  <FolderOpen size={16} className="text-amber-400" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-slate-100">{section.course_name}</span>
                    <span className="badge border-[#1e3050] text-slate-500 font-mono text-xs">
                      {section.course_code}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {section.dept} · Semester {section.semester}
                  </p>

                  {/* Files list */}
                  {section.files?.length > 0 && (
                    <div className="mt-3 space-y-2">
                      {section.files.map((f, i) => (
                        <div
                          key={i}
                          className="flex items-center justify-between bg-[#070d1a] border border-[#1e3050] rounded-lg px-3 py-2 group"
                        >
                          <div className="flex items-center gap-2">
                            <FileText size={13} className="text-slate-500" />
                            <span className="text-xs text-slate-400 font-mono">{f.filename}</span>
                          </div>
                          <button
                            onClick={() => deleteFile(section._id, f.filename)}
                            className="text-slate-600 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100"
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Upload button */}
                  <label className="mt-3 inline-flex items-center gap-2 cursor-pointer text-xs text-amber-400 hover:text-amber-300 transition-colors">
                    <Upload size={12} />
                    {uploading[section._id] ? "Uploading..." : "Upload file"}
                    <input
                      type="file"
                      className="hidden"
                      onChange={e => e.target.files[0] && uploadFile(section._id, e.target.files[0])}
                    />
                  </label>
                </div>
              </div>

              {/* Delete section */}
              <button
                onClick={() => {
                  if (window.confirm("Delete this entire section and all its files?"))
                    deleteSection.mutate(section._id);
                }}
                className="text-slate-600 hover:text-red-400 transition-colors shrink-0"
              >
                <Trash2 size={14} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}