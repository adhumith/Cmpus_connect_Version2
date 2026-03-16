import { createContext, useContext, useEffect, useState } from "react";
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut
} from "firebase/auth";
import { auth } from "../lib/firebase";
import api from "../lib/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (firebaseUser) => {
      console.log("Auth state changed:", firebaseUser?.email ?? "logged out");

      if (firebaseUser) {
        setUser(firebaseUser);
        try {
          const token = await firebaseUser.getIdToken(true);

          const payload = JSON.parse(atob(token.split('.')[1]));
          console.log("JWT UID:", payload.sub);
          console.log("JWT email:", payload.email);

          console.log("Token ready, fetching profile...");

          const res = await api.get("/auth/me", {
            headers: { Authorization: `Bearer ${token}` }
          });

          console.log("Status:", res.status);
          console.log("Profile role:", res.data.role);
          console.log("Profile name:", res.data.name);
          console.log("Full data:", JSON.stringify(res.data));
          setProfile(res.data);
        } catch (err) {
          console.error("Profile fetch failed:", err.response?.status, err.response?.data ?? err.message);
          setProfile(null);
        }
      } else {
        setUser(null);
        setProfile(null);
      }

      setLoading(false);
    });
    return unsub;
  }, []);

  const login = (email, password) =>
    signInWithEmailAndPassword(auth, email, password);

  const logout = async () => {
    await signOut(auth);
    setUser(null);
    setProfile(null);
  };

  return (
    <AuthContext.Provider value={{ user, profile, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);