import { useAuth } from "../../context/AuthContext";

export default function StaffHome() {
  const { profile } = useAuth();
  return (
    <div className="space-y-6">
      <h1 className="font-display text-3xl font-bold text-slate-100">
        Welcome, <span className="text-amber-400">{profile?.name?.split(" ")[0]}</span>
      </h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[["Name", profile?.name], ["Department", profile?.dept], ["Position", profile?.position]].map(([k, v]) => (
          <div key={k} className="card">
            <p className="text-xs font-mono text-slate-500 uppercase tracking-wider">{k}</p>
            <p className="text-lg font-semibold text-slate-100 mt-1">{v || "—"}</p>
          </div>
        ))}
      </div>
    </div>
  );
}