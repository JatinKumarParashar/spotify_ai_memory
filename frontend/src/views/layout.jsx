import React, { createContext, useContext, useState } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { Activity, AudioLines, Cpu, LogOut, Music2, Sliders } from "lucide-react";
import MemoryControls from "./MemoryControls";
import TraceConsole from "./TraceConsole";
import Recommandation from "./Recommandation";

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
  const currentView = {
    controls: "Listener Controls",
    trace: "Trace Console",
    recommendations: "Recommendations",
  }[activeTab];

  return (
    <div className="signal-shell">
      <aside className="signal-rail">
        <div className="signal-brand">
          <span className="signal-brand-mark"><AudioLines size={20} /></span>
          <span>
            <strong className="block text-sm font-bold tracking-wide text-white">SIGNAL ROOM</strong>
            <span className="signal-kicker text-[9px] text-gray-500">PERSONAL MEMORY</span>
          </span>
        </div>

        <p className="signal-nav-label">Workspace</p>
        <nav className="signal-nav space-y-1" aria-label="Main navigation">
          <button className="signal-nav-item" data-active={activeTab === "controls"} onClick={() => setActiveTab("controls")}>
            <Sliders size={17} /> <span>Memory Controls</span>
          </button>
          <button className="signal-nav-item" data-active={activeTab === "trace"} onClick={() => setActiveTab("trace")}>
            <Cpu size={17} /> <span>Trace Console</span>
          </button>
          <button className="signal-nav-item" data-active={activeTab === "recommendations"} onClick={() => setActiveTab("recommendations")}>
            <Music2 size={17} /> <span>Recommendations</span>
          </button>
        </nav>

        <div className="signal-rail-status">
          <span className="signal-status-dot" />
          <span>Memory workspace active</span>
        </div>
      </aside>

      <div className="signal-main">
        <header className="signal-topbar">
          <div className="flex min-w-0 items-center gap-3">
            <span className="signal-kicker hidden text-[10px] uppercase text-gray-500 sm:inline">Pilot workspace</span>
            <span className="hidden text-gray-700 sm:inline">/</span>
            <span className="truncate text-sm font-medium text-gray-200">{currentView}</span>
          </div>
          <div className="flex shrink-0 items-center gap-3">
            <span className="hidden items-center gap-2 text-xs text-gray-500 md:flex">
              <Activity size={14} className="text-cyan-300" /> Subject scoped
            </span>
            <span className="h-5 w-px bg-gray-700" />
            <div className="flex items-center gap-2">
              <span className="grid h-8 w-8 place-items-center rounded-full border border-cyan-300/20 bg-cyan-300/10 text-xs font-semibold text-cyan-200">
                {userName.slice(0, 1).toUpperCase()}
              </span>
              <span className="hidden max-w-36 truncate text-sm text-gray-200 sm:inline">{userName}</span>
            </div>
            <button
              type="button"
              onClick={logout}
              title="Log out"
              aria-label="Log out"
              className="rounded-md border border-gray-700 p-2 text-gray-400 transition hover:border-red-400/40 hover:text-red-300"
            >
              <LogOut size={15} />
            </button>
          </div>
        </header>

        <main className="signal-content">
          <div key={activeTab} className="signal-page-enter">
            {activeTab === "controls" && <MemoryControls userId={userId} />}
            {activeTab === "trace" && <TraceConsole userId={userId} />}
            {activeTab === "recommendations" && <Recommandation userId={userId} />}
          </div>
        </main>
      </div>
    </div>
  );
}
