import { useState, useEffect, useCallback } from "react";
import { jwtDecode } from "jwt-decode";
import { AuthContext } from "./AuthContext";

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem("token"));
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem("token");
    if (!stored) return null;
    try {
      return jwtDecode(stored);
    } catch {
      return null;
    }
  });
  const [showReAuth, setShowReAuth] = useState(false);

  const login = useCallback((newToken) => {
    localStorage.setItem("token", newToken);
    setToken(newToken);
    setUser(jwtDecode(newToken));
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem("token");
    setToken(null);
    setUser(null);
  }, []);

  useEffect(() => {
    const handle = () => setShowReAuth(true);
    window.addEventListener("auth:unauthorized", handle);
    return () => window.removeEventListener("auth:unauthorized", handle);
  }, []);

  return (
    <AuthContext.Provider value={{ token, user, login, logout, showReAuth, setShowReAuth }}>
      {children}
    </AuthContext.Provider>
  );
}