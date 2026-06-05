import { useEffect, useState } from 'react';
import {
  ClipboardList, Bed, CreditCard, Wrench,
  CheckCircle2, Clock, AlertCircle, ArrowRight, BookOpen, X
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';

// ─── Quick links ──────────────────────────────────────────────────────────────

const quickLinks = [
  { label: 'Apply for Room',  desc: 'Submit your accommodation application', icon: ClipboardList, color: 'bg-[#5C2200]', path: '/student-dashboard/apply'       },
  { label: 'My Room',         desc: 'View your room allocation details',      icon: Bed,           color: 'bg-[#7A3010]', path: '/student-dashboard/my-room'     },
  { label: 'Fee Payments',    desc: 'Pay and track accommodation fees',        icon: CreditCard,    color: 'bg-[#5C2200]', path: '/student-dashboard/payments'    },
  { label: 'Maintenance',     desc: 'Report and track maintenance issues',     icon: Wrench,        color: 'bg-[#7A3010]', path: '/student-dashboard/maintenance' },
];

// ─── Timeline steps (static — progress driven by status data) ────────────────

const TIMELINE_STEPS = [
  { step: 1, label: 'Submit Application', desc: 'Fill in your accommodation form'       },
  { step: 2, label: 'Admin Review',        desc: 'Application reviewed within 48 hrs'   },
  { step: 3, label: 'Room Allocation',     desc: 'Room assigned. Proceed to pay fee'    },
  { step: 4, label: 'Pay Hostel Fee',      desc: 'Make payment via the payment portal'   },
  { step: 5, label: 'Move In',             desc: 'Collect key and allocation letter'     },
];

// ─── Types ────────────────────────────────────────────────────────────────────

interface StatusData {
  applicationStatus: string;
  bookingStatus: string;
  paymentStatus: string;
  doneSteps: number; // how many timeline steps are done
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function appBadge(status: string) {
  if (status === 'approved')  return 'bg-green-100 text-green-700';
  if (status === 'pending')   return 'bg-orange-100 text-orange-700';
  if (status === 'rejected')  return 'bg-red-100 text-red-700';
  return 'bg-[#e8dcd7] text-[#5C2200]';
}

function bookingBadge(status: string) {
  if (status === 'confirmed') return 'bg-green-100 text-green-700';
  if (status === 'pending')   return 'bg-orange-100 text-orange-700';
  return 'bg-[#e8dcd7] text-[#5C2200]';
}

function paymentBadge(status: string) {
  if (status === 'Paid')    return 'bg-green-100 text-green-700';
  if (status === 'Pending') return 'bg-orange-100 text-orange-700';
  return 'bg-red-100 text-red-700';
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function StudentDashboardHome() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [statusData, setStatusData] = useState<StatusData>({
    applicationStatus: 'Not Applied',
    bookingStatus: 'Not Allocated',
    paymentStatus: 'Not Paid',
    doneSteps: 0,
  });
  const [loadingStatus, setLoadingStatus] = useState(true);
  const [toastMsg, setToastMsg] = useState<{title: string, desc: string, action?: {label: string, path: string}} | null>(null);

  const firstName = (user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Student').split(' ')[0];

  useEffect(() => {
    if (!user) return;

    const fetchStatus = async (silent = false) => {
      if (!silent) setLoadingStatus(true);
      try {
        // 1. Fetch all applications for this user (newest first)
        const { data: apps } = await supabase
          .from('applications')
          .select('status')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        // 2. Latest booking (any status so we can detect confirmed)
        const { data: booking } = await supabase
          .from('bookings')
          .select('status')
          .eq('resident_id', user.id)
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();

        // 3. Latest payment
        const { data: payment } = await supabase
          .from('student_payments')
          .select('status')
          .eq('resident_id', user.id)
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();

        // Pick the most favourable application status:
        // approved > pending > rejected > Not Applied
        // This prevents a newer pending re-application from hiding an approved one.
        const allStatuses = (apps || []).map((a) => a.status);
        const appStatus = allStatuses.includes('approved')
          ? 'approved'
          : allStatuses.includes('pending')
          ? 'pending'
          : allStatuses.includes('rejected')
          ? 'rejected'
          : 'Not Applied';

        const bookStatus = booking?.status ?? 'Not Allocated';
        const payStatus  = payment?.status === 'completed' ? 'Paid'
                         : payment?.status === 'pending'   ? 'Pending'
                         : 'Not Paid';

        // Drive timeline progress
        let done = 0;
        if (appStatus !== 'Not Applied')                  done = 1;
        if (appStatus === 'approved')                     done = 2;
        if (bookStatus === 'confirmed' || bookStatus === 'pending' || bookStatus === 'completed') done = 3;
        if (payStatus === 'Paid')                         done = 4;
        if (bookStatus === 'completed')                   done = 5;

        setStatusData({
          applicationStatus: appStatus.charAt(0).toUpperCase() + appStatus.slice(1),
          bookingStatus: bookStatus === 'Not Allocated' ? 'Not Allocated'
                       : bookStatus.charAt(0).toUpperCase() + bookStatus.slice(1),
          paymentStatus: payStatus,
          doneSteps: done,
        });

        if (appStatus === 'Not Applied') {
          setToastMsg({
            title: 'No Room Allocated',
            desc: 'You currently have no room allocated. Would you like to apply now?',
            action: { label: 'Apply Now', path: '/student-dashboard/apply' }
          });
        } else if (appStatus === 'pending' || (appStatus === 'approved' && bookStatus !== 'confirmed')) {
          setToastMsg({
            title: 'Room Application Pending',
            desc: 'Your room application is currently pending review and allocation.'
          });
        }

        setTimeout(() => setToastMsg(null), 8000);
      } catch {
        // silently fall back to defaults — user will see "Not Applied" etc.
      } finally {
        if (!silent) setLoadingStatus(false);
      }
    };

    // Initial load
    fetchStatus();

    // ── Real-time: re-fetch whenever the admin approves/rejects ──────────────
    const channel = supabase
      .channel(`student-status-${user.id}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'bookings', filter: `resident_id=eq.${user.id}` },
        () => fetchStatus(true)
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'applications', filter: `user_id=eq.${user.id}` },
        () => fetchStatus(true)
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'student_payments', filter: `resident_id=eq.${user.id}` },
        () => fetchStatus(true)
      )
      .subscribe();

    // ── Polling fallback (every 15 s) ─────────────────────────────────────────
    const intervalId = setInterval(() => fetchStatus(true), 15000);

    return () => {
      supabase.removeChannel(channel);
      clearInterval(intervalId);
    };
  }, [user]);

  const stats = [
    { label: 'Application Status', value: statusData.applicationStatus, icon: ClipboardList, badge: appBadge(statusData.applicationStatus.toLowerCase())    },
    { label: 'Room Allocation',     value: statusData.bookingStatus,     icon: Bed,           badge: bookingBadge(statusData.bookingStatus.toLowerCase())    },
    { label: 'Payment Status',      value: statusData.paymentStatus,     icon: CreditCard,    badge: paymentBadge(statusData.paymentStatus)                  },
  ];

  return (
    <div className="p-6 space-y-6">

      {/* Welcome banner */}
      <div className="relative overflow-hidden rounded-2xl bg-[#5C2200]">
        <img src="https://images.pexels.com/photos/1438832/pexels-photo-1438832.jpeg?auto=compress&cs=tinysrgb&w=1200"
          alt="Hostel" className="absolute inset-0 w-full h-full object-cover opacity-15" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#5C2200]/90 via-[#5C2200]/70 to-transparent" />
        <div className="relative px-8 py-8">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-orange-200 ring-1 ring-white/20 mb-4">
            <BookOpen className="h-3.5 w-3.5" /> CUSTECH Student Hostel Portal
          </div>
          <h1 className="text-3xl font-extrabold text-white mb-1">Welcome back, {firstName}! 👋</h1>
          <p className="text-orange-100 text-sm max-w-md">
            Manage your accommodation, track payments, and submit maintenance requests — all in one place.
          </p>
        </div>
        <div className="absolute -right-8 -top-8 h-40 w-40 rounded-full bg-white/10 blur-2xl" />
      </div>

      {/* Live status cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {stats.map(s => {
          const Icon = s.icon;
          return (
            <div key={s.label} className="bg-white rounded-xl border border-[#e8dcd7] shadow-sm p-5 flex items-center gap-4">
              <div className="w-11 h-11 rounded-lg bg-[#fdf7f4] border border-[#e8dcd7] flex items-center justify-center shrink-0">
                <Icon className="w-5 h-5 text-[#5C2200]" />
              </div>
              <div>
                <p className="text-xs text-[#b89080]">{s.label}</p>
                {loadingStatus ? (
                  <div className="h-5 w-20 bg-[#e8dcd7] rounded-full animate-pulse mt-1" />
                ) : (
                  <span className={`mt-1 inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold ${s.badge}`}>
                    {s.value}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Quick links */}
      <div>
        <h2 className="text-base font-semibold text-slate-900 mb-3">Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickLinks.map(q => {
            const Icon = q.icon;
            return (
              <button key={q.label} onClick={() => navigate(q.path)}
                className="group bg-white rounded-xl border border-[#e8dcd7] shadow-sm p-5 text-left hover:shadow-md hover:border-[#5C2200]/30 transition-all">
                <div className={`${q.color} w-10 h-10 rounded-lg flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
                  <Icon className="w-5 h-5 text-white" />
                </div>
                <p className="text-sm font-semibold text-slate-900 mb-0.5">{q.label}</p>
                <p className="text-xs text-[#b89080] leading-relaxed">{q.desc}</p>
                <div className="mt-3 flex items-center gap-1 text-xs font-medium text-[#5C2200] opacity-0 group-hover:opacity-100 transition-opacity">
                  Go <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Application timeline */}
      <div className="bg-white rounded-xl border border-[#e8dcd7] shadow-sm p-6">
        <h2 className="text-base font-semibold text-slate-900 mb-5">Application Progress</h2>
        <ol className="relative">
          {TIMELINE_STEPS.map((t, i) => {
            const isDone   = t.step <= statusData.doneSteps;
            const isActive = t.step === statusData.doneSteps + 1;
            const isLast   = i === TIMELINE_STEPS.length - 1;
            return (
              <li key={t.step} className={`flex gap-4 ${isLast ? '' : 'pb-6'}`}>
                <div className="flex flex-col items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 border-2 ${
                    isDone   ? 'bg-[#5C2200] border-[#5C2200] text-white'
                    : isActive ? 'bg-orange-50 border-orange-400 text-orange-500'
                    : 'bg-white border-[#e8dcd7] text-[#b89080]'
                  }`}>
                    {isDone   ? <CheckCircle2 className="w-4 h-4" />
                    : isActive ? <Clock className="w-4 h-4" />
                    : <span className="text-xs font-bold">{t.step}</span>}
                  </div>
                  {!isLast && (
                    <div className={`w-0.5 flex-1 mt-1 ${isDone ? 'bg-[#5C2200]' : 'bg-[#e8dcd7]'}`} />
                  )}
                </div>
                <div className="pb-1">
                  <p className={`text-sm font-semibold ${isDone ? 'text-[#5C2200]' : isActive ? 'text-orange-600' : 'text-slate-500'}`}>
                    {t.label}
                  </p>
                  <p className="text-xs text-[#b89080] mt-0.5">{t.desc}</p>
                </div>
              </li>
            );
          })}
        </ol>
      </div>

      {/* Notice */}
      <div className="flex gap-3 rounded-xl bg-orange-50 border border-orange-100 p-4">
        <AlertCircle className="w-5 h-5 text-orange-500 shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-semibold text-orange-800">Important Notice</p>
          <p className="text-xs text-orange-700 mt-0.5 leading-relaxed">
            All applications must be submitted before the deadline. Ensure your matric number is correct.
            For help, contact{' '}
            <a href="mailto:hostel@custech.edu.ng" className="underline">hostel@custech.edu.ng</a>.
          </p>
        </div>
      </div>

      {/* Toast Notification */}
      {toastMsg && (
        <div className="fixed bottom-6 right-6 z-50 animate-in slide-in-from-bottom-5 fade-in duration-300">
          <div className="bg-white rounded-xl shadow-xl border border-[#e8dcd7] p-4 pr-12 max-w-sm relative">
            <button 
              onClick={() => setToastMsg(null)}
              className="absolute top-3 right-3 text-slate-400 hover:text-slate-600"
            >
              <X className="w-4 h-4" />
            </button>
            <div className="flex gap-3 items-start">
              <div className="w-8 h-8 rounded-full bg-orange-50 border border-orange-100 flex items-center justify-center shrink-0">
                <AlertCircle className="w-4 h-4 text-orange-500" />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-900">{toastMsg.title}</p>
                <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">{toastMsg.desc}</p>
                {toastMsg.action && (
                  <button 
                    onClick={() => navigate(toastMsg.action!.path)}
                    className="mt-3 inline-block px-3 py-1.5 bg-[#5C2200] text-white text-xs font-semibold rounded-lg hover:bg-[#7A3010] transition-colors"
                  >
                    {toastMsg.action.label}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
