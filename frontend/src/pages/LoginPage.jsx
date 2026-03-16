import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";
import { GraduationCap } from "lucide-react";

export default function LoginPage() {
  const { login, profile } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    console.log("Profile in LoginPage:", profile?.role);
    if (profile?.role === "student") navigate("/student", { replace: true });
    if (profile?.role === "staff")   navigate("/staff",   { replace: true });
    if (profile?.role === "admin")   navigate("/admin",   { replace: true });
  }, [profile]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(email, password);
    } catch (err) {
      const msg =
        err.code === "auth/invalid-credential" ? "Invalid email or password" :
        err.code === "auth/user-not-found"     ? "No account found" :
        err.code === "auth/wrong-password"     ? "Wrong password" :
        "Login failed";
      toast.error(msg);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#04070f] flex items-center justify-center relative overflow-hidden">
      <div
        className="absolute inset-0 opacity-5"
        style={{
          backgroundImage: "linear-gradient(#fbbf24 1px, transparent 1px), linear-gradient(90deg, #fbbf24 1px, transparent 1px)",
          backgroundSize: "60px 60px"
        }}
      />
      <div className="relative w-full max-w-md px-8">
        <div className="text-center mb-10">
          <div className="inline-flex w-16 h-16 bg-amber-500 rounded-2xl items-center justify-center mb-5 shadow-lg shadow-amber-500/20">
            <GraduationCap size={30} className="text-[#04070f]" />
          </div>
          <h1
            className="text-3xl font-bold text-slate-100"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            Campus Portal
          </h1>
          <p className="text-slate-500 mt-2 text-sm">Sign in with your institutional email</p>
        </div>

        <form onSubmit={handleLogin} className="card space-y-4">
          <div>
            <label className="block text-xs font-mono text-slate-500 uppercase tracking-wider mb-1.5">
              Email
            </label>
            <input
              type="email"
              className="input"
              placeholder="you@college.edu"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
          </div>
          <div>
            <label className="block text-xs font-mono text-slate-500 uppercase tracking-wider mb-1.5">
              Password
            </label>
            <input
              type="password"
              className="input"
              placeholder="••••••••"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              autoComplete="current-password"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full text-center disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        <p className="text-center text-xs text-slate-600 mt-6">
          Contact your administrator if you need access
        </p>
      </div>
    </div>
  );
}