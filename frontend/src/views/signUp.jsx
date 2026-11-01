import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AudioLines, Radio } from 'lucide-react';

const SignUp = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    userName: '',
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setIsSubmitting(true);
    try {
      const response = await fetch('http://localhost:3000/v3/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        navigate('/login', { replace: true, state: { message: 'Account created. Please log in.' } });
      } else {
        const data = await response.json();
        setError(data.message || 'Unable to create account. Please try again.');
      }
    } catch (error) {
      setError(error.message || 'Unable to reach the registration service.');
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
          <p className="signal-kicker mb-3 flex items-center gap-2 text-[10px] uppercase text-lime-300"><Radio size={13} /> Listener profile</p>
          <h1 className="text-3xl font-semibold leading-tight text-white">Build a profile<br /><span className="text-cyan-200">that listens back.</span></h1>
          <p className="mt-4 max-w-sm text-sm leading-6 text-gray-400">Create an account to keep your music preferences and listening context together.</p>
        </div>
        <div className="signal-auth-readout signal-mono"><span>PROFILE SETUP</span><span className="text-cyan-200">NEW SUBJECT</span></div>
      </aside>

      <main className="signal-auth-main">
        <section className="signal-auth-form">
          <p className="signal-kicker mb-2 text-[10px] uppercase text-cyan-300">Account / Registration</p>
          <h2 className="text-2xl font-semibold text-white">Create your account</h2>
          <p className="mt-1 text-sm text-gray-500">A few details to set up your listener profile.</p>
          {error && <p role="alert" className="mt-5 border border-red-400/20 bg-red-400/5 p-3 text-sm text-red-200">{error}</p>}
          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div>
              <label className="mb-2 block text-xs font-medium text-gray-300" htmlFor="userName">Username</label>
              <input
                className="signal-input"
                id="userName"
                type="text"
                autoComplete="username"
                required
                placeholder="Enter your username"
                value={formData.userName}
                onChange={(e) => setFormData({ ...formData, userName: e.target.value })}
              />
            </div>
            <div>
              <label className="mb-2 block text-xs font-medium text-gray-300" htmlFor="email">Email</label>
              <input
                className="signal-input"
                id="email"
                type="email"
                autoComplete="email"
                required
                placeholder="name@example.com"
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
                autoComplete="new-password"
                required
                minLength={8}
                placeholder="At least 8 characters"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              />
            </div>
            <button className="signal-primary-button w-full" type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Creating profile...' : 'Create account'}
            </button>
          </form>
          <p className="mt-6 border-t border-gray-800 pt-5 text-sm text-gray-500">
            Already registered? <Link className="font-medium text-cyan-200 hover:text-lime-200" to="/login">Sign in</Link>
          </p>
        </section>
      </main>
    </div>
  );
};

export default SignUp;