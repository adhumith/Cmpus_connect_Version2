import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../../lib/api";
import { useAuth } from "../../context/AuthContext";
import toast from "react-hot-toast";
import { PenLine, Trash2, ImagePlus, X } from "lucide-react";

const CATEGORIES = ["global", "dept", "clubs"];
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

export default function BlogsPage() {
  const { profile } = useAuth();
  const qc = useQueryClient();
  const [filter, setFilter] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    title: "", content: "", category: "global", dept: ""
  });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  const { data: blogs = [] } = useQuery({
    queryKey: ["blogs", filter],
    queryFn: () => api.get("/blogs/", {
      params: filter ? { category: filter } : {}
    }).then(r => r.data),
  });

  const createMutation = useMutation({
    mutationFn: (formData) => api.post("/blogs/", formData, {
      headers: { "Content-Type": "multipart/form-data" }
    }),
    onSuccess: () => {
      qc.invalidateQueries(["blogs"]);
      setShowForm(false);
      setForm({ title: "", content: "", category: "global", dept: "" });
      setImageFile(null);
      setImagePreview(null);
      toast.success("Blog posted!");
    },
    onError: () => toast.error("Failed to post"),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => api.delete(`/blogs/${id}`),
    onSuccess: () => { qc.invalidateQueries(["blogs"]); toast.success("Deleted"); },
  });

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleSubmit = () => {
    if (!form.title || !form.content) return toast.error("Title and content required");
    const fd = new FormData();
    fd.append("title", form.title);
    fd.append("content", form.content);
    fd.append("category", form.category);
    if (form.dept) fd.append("dept", form.dept);
    if (imageFile) fd.append("image", imageFile);
    createMutation.mutate(fd);
  };

  const handleDelete = (id) => {
    if (window.confirm("Delete this blog post?")) deleteMutation.mutate(id);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-3xl font-bold text-slate-100">Blogs</h1>
        <button
          className="btn-primary flex items-center gap-2"
          onClick={() => setShowForm(!showForm)}
        >
          <PenLine size={14} />
          Write a Post
        </button>
      </div>

      {/* Write form */}
      {showForm && (
        <div className="card space-y-4 border-amber-500/20">
          <h3 className="font-semibold text-slate-100">New Blog Post</h3>

          <input
            className="input"
            placeholder="Title"
            value={form.title}
            onChange={e => setForm({ ...form, title: e.target.value })}
          />

          <textarea
            className="input min-h-32 resize-none"
            placeholder="Write your post..."
            value={form.content}
            onChange={e => setForm({ ...form, content: e.target.value })}
          />

          <div className="flex gap-3">
            <select
              className="input"
              value={form.category}
              onChange={e => setForm({ ...form, category: e.target.value })}
            >
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            {form.category === "dept" && (
              <input
                className="input"
                placeholder="Department"
                value={form.dept}
                onChange={e => setForm({ ...form, dept: e.target.value })}
              />
            )}
          </div>

          {/* Image upload */}
          <div>
            {imagePreview ? (
              <div className="relative w-full">
                <img
                  src={imagePreview}
                  alt="preview"
                  className="w-full max-h-56 object-cover rounded-lg border border-navy-600"
                />
                <button
                  onClick={() => { setImageFile(null); setImagePreview(null); }}
                  className="absolute top-2 right-2 bg-navy-900 border border-navy-600 text-slate-400 hover:text-red-400 rounded-full p-1 transition-colors"
                >
                  <X size={14} />
                </button>
              </div>
            ) : (
              <label className="flex items-center gap-2 cursor-pointer text-sm text-slate-400 hover:text-amber-400 transition-colors border border-dashed border-navy-600 hover:border-amber-500/50 rounded-lg p-4 justify-center">
                <ImagePlus size={16} />
                Add cover image (optional)
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageChange}
                />
              </label>
            )}
          </div>

          <div className="flex gap-3">
            <button
              className="btn-primary"
              onClick={handleSubmit}
              disabled={createMutation.isPending}
            >
              {createMutation.isPending ? "Posting..." : "Publish"}
            </button>
            <button className="btn-ghost" onClick={() => {
              setShowForm(false);
              setImageFile(null);
              setImagePreview(null);
            }}>
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Filter tabs */}
      <div className="flex gap-2 flex-wrap">
        {["", ...CATEGORIES].map(cat => (
          <button
            key={cat}
            onClick={() => setFilter(cat)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all capitalize ${
              filter === cat
                ? "bg-amber-500 text-[#04070f]"
                : "text-slate-400 hover:text-slate-200 border border-[#1e3050]"
            }`}
          >
            {cat || "All"}
          </button>
        ))}
      </div>

      {/* Blog list */}
      <div className="space-y-4">
        {blogs.length === 0 && (
          <div className="card text-slate-500 text-sm text-center py-16">
            No blog posts yet
          </div>
        )}
        {blogs.map(blog => (
          <div key={blog._id} className="card hover:border-navy-500 transition-colors overflow-hidden p-0">
            {/* Cover image */}
            {blog.image_url && (
              <img
                src={`${API_URL}${blog.image_url}`}
                alt={blog.title}
                className="w-full max-h-64 object-cover"
              />
            )}
            <div className="p-6">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 flex-wrap mb-2">
                    <span className="badge border-amber-500/30 text-amber-400 bg-amber-500/5 capitalize">
                      {blog.category}
                    </span>
                    {blog.dept && (
                      <span className="badge border-[#1e3050] text-slate-500">
                        {blog.dept}
                      </span>
                    )}
                  </div>
                  <h3 className="font-semibold text-slate-100">{blog.title}</h3>
                  <p className="text-slate-400 text-sm mt-1 line-clamp-2">{blog.content}</p>
                  <p className="text-xs text-slate-600 mt-2 font-mono">
                    {blog.author_name} · {new Date(blog.created_at).toLocaleDateString()}
                  </p>
                </div>
                {(blog.author_uid === profile?.firebase_uid || profile?.role === "admin") && (
                  <button
                    onClick={() => handleDelete(blog._id)}
                    className="text-slate-600 hover:text-red-400 transition-colors mt-1 shrink-0"
                  >
                    <Trash2 size={14} />
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}