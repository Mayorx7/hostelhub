import { type FormEvent, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { UserPlus, Eye, EyeOff, ShieldCheck, GraduationCap, Settings2 } from 'lucide-react';
import logo from '../assets/logo.jpg';
import { supabase } from '../lib/supabase';

type Role = 'student' | 'admin';

function PasswordStrength({ password }: { password: string }) {
  const checks = [
    { label: 'At least 8 characters', pass: password.length >= 8 },
    { label: 'Contains a number', pass: /\d/.test(password) },
    { label: 'Contains a letter', pass: /[a-zA-Z]/.test(password) },
  ];

  const score = checks.filter((c) => c.pass).length;
  const colors = ['bg-slate-200', 'bg-rose-400', 'bg-amber-400', 'bg-green-500'];
  const labels = ['', 'Weak', 'Fair', 'Strong'];

  if (!password) return null;

  return (
    <div className="mt-2 space-y-2">
      <div className="flex gap-1.5">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className={`h-1 flex-1 rounded-full transition-colors ${
              i <= score ? colors[score] : 'bg-slate-200'
            }`}
          />
        ))}
        <span className={`text-xs font-medium ml-1 ${
          score === 3 ? 'text-green-600' : score === 2 ? 'text-amber-600' : 'text-rose-500'
        }`}>
          {labels[score]}
        </span>
      </div>
      <ul className="flex flex-col gap-1">
        {checks.map((c) => (
          <li key={c.label} className={`flex items-center gap-1.5 text-xs ${c.pass ? 'text-green-600' : 'text-slate-400'}`}>
            <span className={`inline-block h-1.5 w-1.5 rounded-full flex-shrink-0 ${c.pass ? 'bg-green-500' : 'bg-slate-300'}`} />
            {c.label}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function Register() {
  const [role, setRole] = useState<Role>('student');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [gender, setGender] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setInfo('');

    if (!fullName.trim()) {
      setError('Full name is required.');
      return;
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (role === 'student' && !gender) {
      setError('Please select your gender.');
      return;
    }

    setLoading(true);
    try {
      const { data, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { role, full_name: fullName, ...(role === 'student' ? { gender } : {}) },
        },
      });
      if (authError) throw authError;

      if (!data.session) {
        // Email confirmation is enabled — inform user
        setInfo('Account created! Check your email to confirm your address, then sign in.');
        return;
      }

      // Auto-confirmed — redirect immediately
      navigate(role === 'admin' ? '/dashboard' : '/apply');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    'w-full rounded-xl border border-[#e8dcd7] bg-white px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 outline-none focus:border-[#5C2200] focus:ring-2 focus:ring-[#5C2200]/10 transition-all';

  const ROLES: { value: Role; icon: typeof GraduationCap; label: string; desc: string }[] = [
    {
      value: 'student',
      icon: GraduationCap,
      label: 'Student',
      desc: 'Apply for rooms and track your allocation',
    },
    {
      value: 'admin',
      icon: Settings2,
      label: 'Admin',
      desc: 'Manage rooms, students and reports',
    },
  ];

  return (
    <div className="flex min-h-screen">
      {/* ── Left brand panel ── */}
      <div className="hidden lg:flex lg:w-[45%] flex-col justify-between bg-[#5C2200] px-12 py-10">
        <Link to="/" className="flex items-center gap-3">
          <img src={logo} alt="CUSTECH" className="h-10 w-10 rounded-full object-cover ring-2 ring-white/20" />
          <div>
            <span className="block text-sm font-semibold text-white leading-tight">CUSTECH Hostel Portal</span>
            <span className="block text-[11px] text-orange-200 leading-tight">Confluence University of Science &amp; Technology</span>
          </div>
        </Link>

        <div>
          <h2 className="text-3xl font-extrabold text-white leading-snug">
            Join the portal<br />in minutes.
          </h2>
          <p className="mt-4 text-sm text-orange-200 leading-relaxed max-w-xs">
            Create your account and get immediate access to the CUSTECH hostel management system — from room applications to fee payments.
          </p>

          {/* Step preview */}
          <div className="mt-10 flex flex-col gap-4">
            {['Choose your role', 'Enter your details', 'Verify your email', 'Start your application'].map((step, i) => (
              <div key={step} className="flex items-center gap-4">
                <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-white/15 text-xs font-bold text-white">
                  {i + 1}
                </div>
                <span className="text-sm text-orange-100">{step}</span>
              </div>
            ))}
          </div>
        </div>

        <p className="text-xs text-orange-400">
          © {new Date().getFullYear()} CUSTECH Hostel Portal. All rights reserved.
        </p>
      </div>

      {/* ── Right form panel ── */}
      <div className="flex flex-1 flex-col justify-center items-center bg-[#fdf7f4] px-6 py-12 overflow-y-auto">
        {/* Mobile logo */}
        <div className="flex lg:hidden items-center gap-3 mb-8">
          <img src={logo} alt="CUSTECH" className="h-10 w-10 rounded-full object-cover" />
          <span className="text-sm font-semibold text-[#5C2200]">CUSTECH Hostel Portal</span>
        </div>

        <div className="w-full max-w-[420px]">
          {/* Heading */}
          <div className="mb-7">
            <h1 className="text-2xl font-bold text-slate-900">Create your account</h1>
            <p className="mt-1.5 text-sm text-slate-500">
              Already registered?{' '}
              <Link to="/login" className="font-semibold text-[#5C2200] hover:underline">
                Sign in
              </Link>
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Role selector */}
            <div>
              <p className="block text-sm font-medium text-slate-700 mb-2">I am a…</p>
              <div className="grid grid-cols-2 gap-3">
                {ROLES.map(({ value, icon: Icon, label, desc }) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setRole(value)}
                    className={`flex flex-col items-start gap-1.5 rounded-xl border-2 p-4 text-left transition-all ${
                      role === value
                        ? 'border-[#5C2200] bg-white shadow-sm'
                        : 'border-[#e8dcd7] bg-white hover:border-[#b89080]'
                    }`}
                  >
                    <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${
                      role === value ? 'bg-[#5C2200] text-white' : 'bg-slate-100 text-slate-500'
                    } transition-colors`}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <span className={`text-sm font-semibold ${role === value ? 'text-[#5C2200]' : 'text-slate-700'}`}>
                      {label}
                    </span>
                    <span className="text-xs text-slate-400 leading-snug">{desc}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Full name */}
            <div>
              <label htmlFor="fullName" className="block text-sm font-medium text-slate-700 mb-1.5">
                Full name
              </label>
              <input
                id="fullName"
                type="text"
                autoComplete="name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="e.g. Amina Okonkwo"
                className={inputClass}
                required
              />
            </div>

            {/* Gender — students only */}
            {role === 'student' && (
              <div>
                <label htmlFor="gender" className="block text-sm font-medium text-slate-700 mb-1.5">
                  Gender
                </label>
                <select
                  id="gender"
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                  className={inputClass}
                  required
                >
                  <option value="">Select gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                </select>
              </div>
            )}

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
                className={inputClass}
                required
              />
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-slate-700 mb-1.5">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Min. 8 characters"
                  className={`${inputClass} pr-11`}
                  required
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
              <PasswordStrength password={password} />
            </div>

            {/* Confirm password */}
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-slate-700 mb-1.5">
                Confirm password
              </label>
              <div className="relative">
                <input
                  id="confirmPassword"
                  type={showConfirm ? 'text' : 'password'}
                  autoComplete="new-password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter password"
                  className={`${inputClass} pr-11 ${
                    confirmPassword && confirmPassword !== password
                      ? 'border-rose-300 focus:border-rose-400 focus:ring-rose-100'
                      : confirmPassword && confirmPassword === password
                      ? 'border-green-300 focus:border-green-400 focus:ring-green-100'
                      : ''
                  }`}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm((v) => !v)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                  tabIndex={-1}
                >
                  {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {confirmPassword && confirmPassword !== password && (
                <p className="mt-1 text-xs text-rose-500">Passwords do not match</p>
              )}
              {confirmPassword && confirmPassword === password && (
                <p className="mt-1 text-xs text-green-600">Passwords match ✓</p>
              )}
            </div>

            {/* Error / Info */}
            {error && (
              <div className="rounded-xl bg-rose-50 border border-rose-100 px-4 py-3 text-sm text-rose-700">
                {error}
              </div>
            )}
            {info && (
              <div className="rounded-xl bg-green-50 border border-green-100 px-4 py-3 text-sm text-green-700">
                {info}{' '}
                <Link to="/login" className="font-semibold underline">Sign in</Link>
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
                <UserPlus className="h-4 w-4" />
              )}
              {loading ? 'Creating account…' : 'Create account'}
            </button>
          </form>

          {/* Trust badge */}
          <div className="mt-6 flex items-center justify-center gap-2 text-xs text-slate-400">
            <ShieldCheck className="h-4 w-4 text-[#5C2200]" />
            Your data is protected by Supabase Row Level Security
          </div>
        </div>
      </div>
    </div>
  );
}
