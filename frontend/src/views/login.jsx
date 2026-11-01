import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "./layout";
import { AudioLines, Radio } from "lucide-react";

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);
    try {
      const response = await fetch("http://localhost:3000/v3/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });
      const data = await response.json();
      if (!response.ok || !data.token) {
        throw new Error(data.message || "Login failed. Check your email and password.");
      }
      login(data.token, data.result?.userName);
      navigate("/", { replace: true });
    } catch (error) {
      setError(error.message || "Unable to reach the login service.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="signal-auth-layout">
      <aside className="signal-auth-aside">
        <div className="signal-auth-brand">
          <span className="signal-brand-mark"><AudioLines size={20} /></span>
          <span><strong className="block text-sm tracking-wide">SIGNAL ROOM</strong><span className="signal-kicker text-[9px] text-gray-500">PERSONAL MEMORY</span></span>
        </div>
        <div className="signal-auth-intro">
          <p className="signal-kicker mb-3 flex items-center gap-2 text-[10px] uppercase text-lime-300"><Radio size={13} /> Secure listener access</p>
          <h1 className="text-3xl font-semibold leading-tight text-white">Your listening context,<br /><span className="text-cyan-200">carried forward.</span></h1>
          <p className="mt-4 max-w-sm text-sm leading-6 text-gray-400">Sign in to review the preferences and exclusions connected to your AI listening experience.</p>
        </div>
        <div className="signal-auth-readout signal-mono"><span>IDENTITY GATE</span><span className="text-lime-300">TOKEN REQUIRED</span></div>
      </aside>

      <main className="signal-auth-main">
        <section className="signal-auth-form">
          <p className="signal-kicker mb-2 text-[10px] uppercase text-cyan-300">Account / Sign in</p>
          <h2 className="text-2xl font-semibold text-white">Welcome back</h2>
          <p className="mt-1 text-sm text-gray-500">Enter your account details to continue.</p>
          {location.state?.message && <p className="mt-5 border border-lime-300/20 bg-lime-300/5 p-3 text-sm text-lime-200">{location.state.message}</p>}
          {error && <p role="alert" className="mt-5 border border-red-400/20 bg-red-400/5 p-3 text-sm text-red-200">{error}</p>}
          <form onSubmit={handleSubmit} className="mt-6 space-y-5">
            <div>
              <label className="mb-2 block text-xs font-medium text-gray-300" htmlFor="email">Email</label>
              <input
                className="signal-input"
                id="email"
                type="email"
                autoComplete="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>
            <div>
              <label className="mb-2 block text-xs font-medium text-gray-300" htmlFor="password">Password</label>
              <input
                className="signal-input"
                id="password"
                type="password"
                autoComplete="current-password"
                required
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              />
            </div>
            <button type="submit" disabled={isSubmitting} className="signal-primary-button w-full">
              {isSubmitting ? "Connecting..." : "Sign in"}
            </button>
          </form>
          <p className="mt-6 border-t border-gray-800 pt-5 text-sm text-gray-500">
            New to Signal Room? <Link className="font-medium text-cyan-200 hover:text-lime-200" to="/signup">Create an account</Link>
          </p>
        </section>
      </main>
    </div>
  );
};

export default Login;
