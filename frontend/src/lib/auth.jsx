import { createContext, useContext, useEffect, useState } from "react";
import { BASE, getToken } from "./api.js";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = getToken();
    if (!token) { setLoading(false); return; }
    fetch(`${BASE}/auth/me`, { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => (r.ok ? r.json() : null))
      .then(setUser)
      .catch(() => null)
      .finally(() => setLoading(false));
  }, []);

  function login(token, userData) {
    localStorage.setItem("cityeye_token", token);
    setUser(userData);
  }

  function logout() {
    localStorage.removeItem("cityeye_token");
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
