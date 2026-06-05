import { type FormEvent, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { LogIn, Eye, EyeOff, ShieldCheck, BookOpen, CheckCircle2 } from 'lucide-react';
import logo from '../assets/logo.jpg';
import { supabase } from '../lib/supabase';

type Role = 'student' | 'admin';

const BRAND_POINTS = [
  'Apply for accommodation online — no queues',
  'Track your room allocation in real time',
  'Pay hostel fees securely via Paystack',
  'Submit and track maintenance requests',
];

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');

    if (!email.trim() || !password) {
      setError('Email and password are required.');
      return;
    }

    setLoading(true);
    try {
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (authError) throw authError;

      const role: Role = (data.user?.user_metadata?.role as Role) ?? 'student';
      navigate(role === 'admin' ? '/admin-dashboard' : '/student-dashboard');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Sign in failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen">
      {/* ── Left brand panel ── */}
      <div className="hidden lg:flex lg:w-[45%] flex-col justify-between bg-[#5C2200] px-12 py-10">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-3">
          <img src={logo} alt="CUSTECH" className="h-10 w-10 rounded-full object-cover ring-2 ring-white/20" />
          <div>
            <span className="block text-sm font-semibold text-white leading-tight">CUSTECH Hostel Portal</span>
            <span className="block text-[11px] text-orange-200 leading-tight">Confluence University of Science &amp; Technology</span>
          </div>
        </Link>

        {/* Headline */}
        <div>
          <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-orange-200 ring-1 ring-white/20 mb-6">
            <BookOpen className="h-3.5 w-3.5" />
            Official hostel management system
          </div>
          <h2 className="text-3xl font-extrabold text-white leading-snug">
            Everything you need,<br />in one place.
          </h2>
          <p className="mt-4 text-sm text-orange-200 leading-relaxed max-w-xs">
            The CUSTECH student hostel portal gives you full control of your accommodation — from application to check-out.
          </p>

          <ul className="mt-8 flex flex-col gap-3">
            {BRAND_POINTS.map((point) => (
              <li key={point} className="flex items-start gap-3 text-sm text-orange-100">
                <CheckCircle2 className="h-4 w-4 text-orange-300 flex-shrink-0 mt-0.5" />
                {point}
              </li>
            ))}
          </ul>
        </div>

        {/* Footer */}
        <p className="text-xs text-orange-400">
          © {new Date().getFullYear()} CUSTECH Hostel Portal. All rights reserved.
        </p>
      </div>

      {/* ── Right form panel ── */}
      <div className="flex flex-1 flex-col justify-center items-center bg-[#fdf7f4] px-6 py-12">
        {/* Mobile logo */}
        <div className="flex lg:hidden items-center gap-3 mb-10">
          <img src={logo} alt="CUSTECH" className="h-10 w-10 rounded-full object-cover" />
          <span className="text-sm font-semibold text-[#5C2200]">CUSTECH Hostel Portal</span>
        </div>

        <div className="w-full max-w-[400px]">
          {/* Heading */}
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-slate-900">Sign in to your account</h1>
            <p className="mt-1.5 text-sm text-slate-500">
              Don't have an account?{' '}
              <Link to="/register" className="font-semibold text-[#5C2200] hover:underline">
                Create one
              </Link>
            </p>
          </div>

          {/* Form card */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-1.5">
                Email address
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@custech.edu.ng"
                className="w-full rounded-xl border border-[#e8dcd7] bg-white px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 outline-none focus:border-[#5C2200] focus:ring-2 focus:ring-[#5C2200]/10 transition-all"
              />
            </div>

            {/* Password */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label htmlFor="password" className="block text-sm font-medium text-slate-700">
                  Password
                </label>
              </div>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-xl border border-[#e8dcd7] bg-white px-4 py-3 pr-11 text-sm text-slate-900 placeholder:text-slate-400 outline-none focus:border-[#5C2200] focus:ring-2 focus:ring-[#5C2200]/10 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="rounded-xl bg-rose-50 border border-rose-100 px-4 py-3 text-sm text-rose-700">
                {error}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#5C2200] px-4 py-3 text-sm font-semibold text-white hover:bg-[#7A3010] active:scale-[0.98] transition-all disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? (
                <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                </svg>
              ) : (
                <LogIn className="h-4 w-4" />
              )}
              {loading ? 'Signing in…' : 'Sign in'}
            </button>
          </form>

          {/* Divider */}
          <div className="my-6 flex items-center gap-3">
            <div className="flex-1 h-px bg-[#e8dcd7]" />
            <span className="text-xs text-slate-400">secure sign-in</span>
            <div className="flex-1 h-px bg-[#e8dcd7]" />
          </div>

          {/* Trust badge */}
          <div className="flex items-center justify-center gap-2 text-xs text-slate-400">
            <ShieldCheck className="h-4 w-4 text-[#5C2200]" />
            Your data is protected by Supabase Row Level Security
          </div>

          <p className="mt-8 text-center text-xs text-slate-400">
            Problems signing in?{' '}
            <a href="mailto:hostel@custech.edu.ng" className="text-[#5C2200] hover:underline">
              Contact support
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
