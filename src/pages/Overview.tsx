import {
  ArrowRight,
  ShieldCheck,
  Wifi,
  Droplets,
  Zap,
  Users,
  Home,
  BookOpen,
  CheckCircle2,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import PublicLayout from '../components/PublicLayout';
import hero1 from '../assets/hero1.png';
import hero2 from '../assets/hero2.png';

// ─── Data ─────────────────────────────────────────────────────────────────────

const stats = [
  { value: '4', label: 'Hostel blocks' },
  { value: '480', label: 'Total rooms' },
  { value: '68', label: 'Rooms available' },
  { value: '24 hrs', label: 'Support response' },
];

const features = [
  {
    icon: Wifi,
    title: 'High-speed Wi-Fi',
    desc: 'Campus-wide wireless internet on every floor, available 24 hours a day.',
  },
  {
    icon: ShieldCheck,
    title: '24-hour security',
    desc: 'Security personnel at all entrances with CCTV coverage of common areas.',
  },
  {
    icon: Droplets,
    title: 'Reliable water supply',
    desc: 'Borehole-sourced water with overhead tanks ensuring constant availability.',
  },
  {
    icon: Zap,
    title: 'Power backup',
    desc: 'Generator-powered backup covering essential services during outages.',
  },
  {
    icon: Users,
    title: 'Common rooms',
    desc: 'Furnished common rooms in each block for study and social activities.',
  },
  {
    icon: Home,
    title: 'Multiple room types',
    desc: '4-bed shared and single-occupancy rooms across four residential blocks.',
  },
];

const roomTypes = [
  {
    name: '4-Bed Shared',
    price: '₦45,000',
    period: '/ session',
    desc: 'Affordable shared accommodation. Ideal for students on a budget.',
    tag: 'Most popular',
    tagColor: '#5C2200',
    available: true,
  },
  {
    name: 'Single Room',
    price: '₦85,000',
    period: '/ session',
    desc: 'Private single-occupancy room with dedicated study space.',
    tag: 'Limited rooms',
    tagColor: '#2563eb',
    available: true,
  },
  {
    name: 'Premium Single',
    price: '₦110,000',
    period: '/ session',
    desc: 'Premium private room in Block D with enhanced furnishing.',
    tag: 'Block D only',
    tagColor: '#7c3aed',
    available: false,
  },
];

const blocks = [
  { name: 'Block A — Kogi Hall', type: 'Male · 4-bed shared', rooms: 120 },
  { name: 'Block B — Confluence Hall', type: 'Female · 4-bed shared', rooms: 120 },
  { name: 'Block C — Osara Hall', type: 'Mixed · 4-bed shared', rooms: 120 },
  { name: 'Block D — Okene Hall', type: 'Mixed · single & shared', rooms: 120 },
];

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function Overview() {
  return (
    <PublicLayout>
      {/* ── Hero ── */}
      <section className="relative overflow-hidden bg-[#5C2200]">
        <div className="pointer-events-none absolute -left-20 -top-20 h-96 w-96 rounded-full bg-white/5 blur-3xl" />
        <div className="pointer-events-none absolute bottom-0 right-0 h-80 w-80 rounded-full bg-white/5 blur-3xl" />

        <div className="relative mx-auto max-w-7xl px-6 py-20 lg:py-28">
          <div className="flex flex-col gap-12 lg:flex-row lg:items-center lg:gap-16">
            {/* Left */}
            <div className="flex-1">
              <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-sm font-medium text-orange-200 ring-1 ring-white/20">
                <BookOpen className="h-4 w-4" />
                CUSTECH Hostel Management System
              </div>
              <h1 className="mt-5 text-4xl font-extrabold leading-tight tracking-tight text-white sm:text-5xl">
                Student hostel<br className="hidden sm:block" /> management portal
              </h1>
              <p className="mt-4 max-w-xl text-lg leading-relaxed text-orange-100">
                Apply for accommodation, track your room allocation, pay fees, and
                submit maintenance requests — all in one place built for CUSTECH students.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link
                  to="/apply"
                  className="inline-flex items-center gap-2 rounded-lg bg-white px-5 py-2.5 text-sm font-semibold text-[#5C2200] shadow hover:bg-orange-50 transition-colors"
                >
                  Apply for accommodation
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  to="/how-to-apply"
                  className="inline-flex items-center gap-2 rounded-lg border border-white/30 px-5 py-2.5 text-sm font-semibold text-white hover:bg-white/10 transition-colors"
                >
                  How it works
                </Link>
              </div>
              <div className="mt-6 flex flex-wrap gap-5 text-sm text-orange-200">
                <span className="flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4" /> Secure payments
                </span>
                <span className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4" /> Instant confirmation
                </span>
              </div>
            </div>

            {/* Right: images */}
            <div className="relative hidden lg:block lg:flex-shrink-0">
              <div className="relative h-[370px] w-[580px]">
                <img
                  src={hero1}
                  alt="CUSTECH hostel building"
                  className="absolute left-0 top-0 h-[300px] w-[500px] rounded-2xl object-cover opacity-70 shadow-xl"
                />
                <img
                  src={hero2}
                  alt="CUSTECH students"
                  className="absolute bottom-0 right-0 h-[165px] w-[340px] rounded-2xl object-cover shadow-2xl ring-4 ring-white/25"
                />
              </div>
            </div>
          </div>

          {/* Stats bar */}
          <div className="mt-14 grid grid-cols-2 gap-px overflow-hidden rounded-xl bg-white/15 sm:grid-cols-4">
            {stats.map((s) => (
              <div key={s.label} className="bg-white/5 px-6 py-5 text-center backdrop-blur-sm">
                <div className="text-2xl font-bold text-white">{s.value}</div>
                <div className="mt-1 text-xs text-orange-200">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Accommodation overview ── */}
      <section className="border-b border-[#e8dcd7] bg-[#fdf7f4] py-16">
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
            <div>
              <p className="label-eyebrow">About the hostels</p>
              <h2 className="mt-3 text-3xl font-bold text-slate-900">
                Managed accommodation at CUSTECH
              </h2>
              <p className="mt-5 text-base leading-relaxed text-slate-600">
                The <strong className="text-slate-800">CUSTECH Student Hostels</strong> are
                officially managed by the university's Student Affairs Division. All four
                on-campus blocks provide a secure, study-friendly residential environment
                for undergraduate and postgraduate students.
              </p>
              <p className="mt-3 text-base leading-relaxed text-slate-600">
                Room allocations are processed through this online portal, ensuring a
                transparent and fair system for all eligible students. Applications are
                reviewed on a first-come, first-served basis by academic level.
              </p>
              <Link
                to="/how-to-apply"
                className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-[#5C2200] hover:underline"
              >
                See how to apply <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            {/* Blocks grid */}
            <div className="grid gap-4 sm:grid-cols-2">
              {blocks.map((block) => (
                <div
                  key={block.name}
                  className="rounded-xl border border-[#e8dcd7] bg-white p-5 shadow-sm"
                >
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#5C2200]/10 text-[#5C2200] mb-3">
                    <Home className="h-4 w-4" />
                  </div>
                  <h3 className="text-sm font-semibold text-slate-900">{block.name}</h3>
                  <p className="mt-1 text-xs text-slate-500">{block.type}</p>
                  <span className="mt-2 inline-flex items-center rounded-full bg-[#5C2200]/10 px-2.5 py-0.5 text-xs font-semibold text-[#5C2200]">
                    {block.rooms} rooms
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Key features ── */}
      <section className="py-16">
        <div className="mx-auto max-w-7xl px-6">
          <p className="label-eyebrow">What's included</p>
          <h2 className="mt-2 text-2xl font-bold text-slate-900">Hostel facilities</h2>

          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((f) => {
              const Icon = f.icon;
              return (
                <div
                  key={f.title}
                  className="group rounded-xl border border-[#e8dcd7] bg-white p-6 shadow-sm transition-shadow hover:shadow-md"
                >
                  <div className="inline-flex rounded-xl bg-[#fdf7f4] p-3 text-[#5C2200] ring-1 ring-[#e8dcd7] transition-colors group-hover:bg-[#5C2200] group-hover:text-white">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="mt-4 text-sm font-semibold text-slate-900">{f.title}</h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-slate-500">{f.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Room type preview ── */}
      <section className="border-y border-[#e8dcd7] bg-[#fdf7f4] py-16">
        <div className="mx-auto max-w-7xl px-6">
          <p className="label-eyebrow">Room types</p>
          <div className="mt-2 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
            <h2 className="text-2xl font-bold text-slate-900">Choose your room</h2>
            <Link
              to="/fees"
              className="text-sm font-semibold text-[#5C2200] hover:underline flex items-center gap-1"
            >
              See full pricing <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="mt-10 grid gap-5 sm:grid-cols-3">
            {roomTypes.map((room) => (
              <div
                key={room.name}
                className="relative flex flex-col rounded-2xl border border-[#e8dcd7] bg-white p-6 shadow-sm"
              >
                <span
                  className="absolute -top-3 left-5 rounded-full px-3 py-1 text-xs font-semibold text-white"
                  style={{ background: room.tagColor }}
                >
                  {room.tag}
                </span>
                <h3 className="mt-2 text-base font-bold text-slate-900">{room.name}</h3>
                <p className="mt-1 text-sm text-slate-500">{room.desc}</p>
                <div className="mt-5 flex items-baseline gap-1">
                  <span className="text-3xl font-extrabold text-[#5C2200]">{room.price}</span>
                  <span className="text-xs text-slate-400">{room.period}</span>
                </div>
                <div className="mt-auto pt-5">
                  <Link
                    to={room.available ? '/apply' : '/login'}
                    className={`block w-full rounded-lg py-2.5 text-center text-sm font-semibold transition-colors ${
                      room.available
                        ? 'bg-[#5C2200] text-white hover:bg-[#7A3010]'
                        : 'bg-slate-100 text-slate-400 cursor-not-allowed pointer-events-none'
                    }`}
                  >
                    {room.available ? 'Apply for this room' : 'Currently unavailable'}
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA band ── */}
      <section className="py-14">
        <div className="mx-auto max-w-7xl px-6">
          <div className="relative overflow-hidden rounded-2xl bg-[#5C2200] p-8 shadow-lg md:p-12">
            <div className="absolute -right-6 -top-6 h-32 w-32 rounded-full bg-white/10 blur-xl" />
            <div className="absolute bottom-0 right-10 h-28 w-28 rounded-full bg-white/10 blur-xl" />
            <div className="relative z-10 grid items-center gap-8 md:grid-cols-2">
              <div>
                <h3 className="text-2xl font-bold text-white">
                  Ready to secure your accommodation?
                </h3>
                <p className="mt-2 text-orange-200">
                  Sign in and complete your room application in minutes.
                </p>
                <div className="mt-4 flex flex-wrap gap-4 text-sm text-orange-200">
                  <span className="flex items-center gap-2">
                    <ShieldCheck className="h-4 w-4" /> Secure payments
                  </span>
                  <span className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4" /> CUSTECH verified
                  </span>
                </div>
              </div>
              <div className="md:text-right">
                <Link
                  to="/apply"
                  className="inline-flex items-center gap-2 rounded-lg bg-white px-6 py-3 text-sm font-semibold text-[#5C2200] shadow hover:bg-orange-50 transition-colors"
                >
                  Apply now
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}
