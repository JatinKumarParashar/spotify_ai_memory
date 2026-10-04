import React, { createContext, useContext, useState } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { LogOut, Sliders, Cpu } from "lucide-react";
import MemoryControls from "./MemoryControls";
import TraceConsole from "./TraceConsole";

const AuthContext = createContext(null);

function getClaims(token) {
  if (!token) return null;

  try {
    const encodedPayload = token.split(".")[1];
    const base64Payload = encodedPayload.replace(/-/g, "+").replace(/_/g, "/");
    const payload = JSON.parse(atob(base64Payload));
    if (!payload.id || (payload.exp && payload.exp <= Date.now() / 1000)) return null;
    return payload;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => {
    const storedToken = localStorage.getItem("token");
    if (getClaims(storedToken)) return storedToken;
    localStorage.removeItem("token");
    return null;
  });
  const [userName, setUserName] = useState(() => localStorage.getItem("userName") || "");

  const login = (newToken, newUserName) => {
    localStorage.setItem("token", newToken);
    if (newUserName) localStorage.setItem("userName", newUserName);
    setUserName(newUserName || "");
    setToken(newToken);
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userName");
    setToken(null);
    setUserName("");
  };

  const claims = getClaims(token);
  return (
    <AuthContext.Provider value={{ token, userId: claims?.id, userName: userName || claims?.userName || "Listener", isAuthenticated: Boolean(claims), login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
}

export function ProtectedRoute() {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />;
}

export function PublicOnlyRoute() {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <Navigate to="/" replace /> : <Outlet />;
}

export function UnknownRoute() {
  const { isAuthenticated } = useAuth();
  return <Navigate to={isAuthenticated ? "/" : "/login"} replace />;
}

export default function Layout() {
  const { userId, userName, logout } = useAuth();
  const [activeTab, setActiveTab] = useState("controls");

  return (
    <div className="min-h-screen bg-gray-950 text-white font-sans">
      <header className="border-b border-gray-800 bg-gray-900 px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse" />
          <span className="font-bold text-lg text-green-400">Spotify AI Memory System</span>
          <span className="text-xs bg-gray-800 border border-gray-700 px-2.5 py-1 rounded text-gray-300">
            User: <strong className="text-white">{userName}</strong>
            <span className="ml-2 text-gray-500">ID: {userId}</span>
          </span>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex bg-gray-800 p-1 rounded-lg border border-gray-700">
            <button
              onClick={() => setActiveTab("controls")}
              className={`flex items-center gap-2 px-4 py-1.5 rounded-md text-xs font-semibold transition ${
                activeTab === "controls" ? "bg-green-500 text-black" : "text-gray-400 hover:text-white"
              }`}
            >
              <Sliders className="w-3.5 h-3.5" /> Listener Controls
            </button>
            <button
              onClick={() => setActiveTab("trace")}
              className={`flex items-center gap-2 px-4 py-1.5 rounded-md text-xs font-semibold transition ${
                activeTab === "trace" ? "bg-green-500 text-black" : "text-gray-400 hover:text-white"
              }`}
            >
              <Cpu className="w-3.5 h-3.5" /> Trace Console
            </button>
          </div>
          <button
            type="button"
            onClick={logout}
            title="Log out"
            aria-label="Log out"
            className="p-2 rounded-md text-gray-300 hover:bg-gray-800 hover:text-white"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </header>

      <main className="py-6">
        {activeTab === "controls" ? (
          <MemoryControls userId={userId} />
        ) : (
          <TraceConsole userId={userId} />
        )}
      </main>
    </div>
  );
}
