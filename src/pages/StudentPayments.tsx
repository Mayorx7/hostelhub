import { useEffect, useState, useCallback } from 'react';
import {
  CreditCard, CheckCircle2, Clock, XCircle,
  AlertCircle, Bed, Shield, Lock,
  Copy, Check, X, ExternalLink, Loader2, PartyPopper,
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const PAYSTACK_PUBLIC_KEY = import.meta.env.VITE_PAYSTACK_PUBLIC_KEY as string;

type PaymentStatus = 'pending' | 'completed' | 'failed';

interface Payment {
  id: string;
  amount: number;
  status: PaymentStatus;
  reference: string | null;
  payment_date: string | null;
  description: string | null;
  created_at: string;
}

interface Booking {
  id: string;
  status: string;
  total_amount: number;
  rooms: { room_number: string; block: string; type: string };
}

const statusCfg: Record<PaymentStatus, { badge: string; icon: React.ElementType; label: string; dot: string }> = {
  completed: { badge: 'bg-emerald-50 text-emerald-700 border border-emerald-200', icon: CheckCircle2, label: 'Paid',    dot: 'bg-emerald-500' },
  pending:   { badge: 'bg-amber-50 text-amber-700 border border-amber-200',       icon: Clock,        label: 'Pending', dot: 'bg-amber-500'   },
  failed:    { badge: 'bg-red-50 text-red-700 border border-red-200',             icon: XCircle,      label: 'Failed',  dot: 'bg-red-500'     },
};

const fmt = (d: string | null) =>
  d ? new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : '—';

/* ─────────────────────────────────────────────
   Test Card Cheat-Sheet Modal
   Shows BEFORE the real Paystack popup opens
───────────────────────────────────────────── */
const TEST_CARDS = [
  {
    brand: 'Visa',
    number: '4084 0840 8408 4081',
    expiry: '01/30',
    cvv: '408',
    pin: '0000',
    otp: '123456',
    gradient: 'from-[#1a1f71] to-[#3b5bdb]',
    chip: true,
  },
  {
    brand: 'Mastercard',
    number: '5531 8866 5214 2950',
    expiry: '09/32',
    cvv: '564',
    pin: '3310',
    otp: '123456',
    gradient: 'from-slate-700 to-slate-900',
    chip: true,
  },
];

function CopyBtn({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      onClick={() => { navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 1500); }}
      className="ml-1.5 text-slate-400 hover:text-[#5C2200] transition-colors"
      title="Copy"
    >
      {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
    </button>
  );
}

function TestCardModal({
  amount,
  onClose,
  onProceed,
  paying,
}: {
  amount: number;
  onClose: () => void;
  onProceed: () => void;
  paying: boolean;
}) {
  const [selected, setSelected] = useState(0);
  const card = TEST_CARDS[selected];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backdropFilter: 'blur(8px)', backgroundColor: 'rgba(0,0,0,0.55)' }}
    >
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-slideUp">

        {/* Header */}
        <div className="bg-gradient-to-r from-[#5C2200] to-[#8B3A1A] px-6 py-5 flex items-center justify-between">
          <div>
            <p className="text-orange-200 text-[10px] font-bold uppercase tracking-widest">Test Mode</p>
            <h2 className="text-white text-lg font-black mt-0.5">Use a Test Card</h2>
            <p className="text-orange-200/80 text-xs mt-0.5">Paystack will open — enter the details below</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors">
            <X className="w-4 h-4 text-white" />
          </button>
        </div>

        {/* Card selector tabs */}
        <div className="flex border-b border-slate-100">
          {TEST_CARDS.map((c, i) => (
            <button
              key={i}
              onClick={() => setSelected(i)}
              className={`flex-1 py-2.5 text-xs font-bold transition-colors ${
                selected === i
                  ? 'text-[#5C2200] border-b-2 border-[#5C2200] bg-[#fdf7f4]'
                  : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              {c.brand}
            </button>
          ))}
        </div>

        <div className="p-5 space-y-4">
          {/* Visual card */}
          <div className={`bg-gradient-to-br ${card.gradient} rounded-2xl p-5 text-white shadow-xl relative overflow-hidden`}>
            <div className="absolute inset-0 opacity-10"
              style={{ backgroundImage: 'radial-gradient(circle at 15% 50%, white 1px, transparent 1px)', backgroundSize: '18px 18px' }} />
            <div className="flex justify-between items-start mb-6 relative z-10">
              <div className="w-9 h-6 rounded bg-gradient-to-br from-yellow-300 to-yellow-500 shadow-inner" />
              <span className="text-white/60 text-xs font-semibold">{card.brand.toUpperCase()}</span>
            </div>
            <p className="font-mono text-lg tracking-widest mb-4 relative z-10">{card.number}</p>
            <div className="flex gap-6 text-xs relative z-10">
              <div>
                <p className="text-white/50 uppercase tracking-widest text-[9px]">Expires</p>
                <p className="font-semibold">{card.expiry}</p>
              </div>
              <div>
                <p className="text-white/50 uppercase tracking-widest text-[9px]">CVV</p>
                <p className="font-semibold">{card.cvv}</p>
              </div>
              <div>
                <p className="text-white/50 uppercase tracking-widest text-[9px]">PIN</p>
                <p className="font-semibold">{card.pin}</p>
              </div>
            </div>
          </div>

          {/* Detail rows */}
          <div className="bg-slate-50 rounded-2xl border border-slate-100 divide-y divide-slate-100">
            {[
              { label: 'Card Number', value: card.number },
              { label: 'Expiry',      value: card.expiry  },
              { label: 'CVV',         value: card.cvv     },
              { label: 'PIN',         value: card.pin     },
              { label: 'OTP',         value: card.otp     },
            ].map(({ label, value }) => (
              <div key={label} className="flex items-center justify-between px-4 py-2.5">
                <span className="text-xs text-slate-500 font-medium w-24">{label}</span>
                <div className="flex items-center">
                  <span className="font-mono text-sm font-bold text-slate-800">{value}</span>
                  <CopyBtn text={value.replace(/\s/g, '')} />
                </div>
              </div>
            ))}
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <p className="text-xs text-amber-700 leading-relaxed">
              Paystack will open in a popup. Enter these test card details inside it. 
              No real money will be charged — this is <strong>test mode</strong>.
            </p>
          </div>

          {/* CTA */}
          <button
            onClick={onProceed}
            disabled={paying}
            className="w-full py-4 bg-gradient-to-r from-[#5C2200] to-[#8B3A1A] text-white font-black rounded-2xl hover:from-[#7A3010] hover:to-[#A0471F] disabled:opacity-60 disabled:cursor-not-allowed transition-all shadow-xl shadow-[#5C2200]/30 flex items-center justify-center gap-2.5 text-sm"
          >
            {paying ? (
              <><Loader2 className="w-4 h-4 animate-spin" /> Opening Paystack...</>
            ) : (
              <><ExternalLink className="w-4 h-4" /> Open Paystack · Pay ₦{amount.toLocaleString()}</>
            )}
          </button>
        </div>

        <div className="px-6 pb-4 flex items-center justify-center gap-3 text-slate-400">
          <Lock className="w-3 h-3" />
          <span className="text-[10px]">Secured by Paystack · 256-bit SSL</span>
          <Shield className="w-3 h-3" />
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   Main Page
───────────────────────────────────────────── */
export default function StudentPayments() {
  const { user }    = useAuth();
  const navigate    = useNavigate();
  const [booking,        setBooking]        = useState<Booking | null>(null);
  const [payments,       setPayments]       = useState<Payment[]>([]);
  const [pendingPayment, setPendingPayment] = useState<Payment | null>(null);
  const [loading,        setLoading]        = useState(true);
  const [error,          setError]          = useState('');
  const [paying,         setPaying]         = useState(false);
  const [showCheatSheet, setShowCheatSheet] = useState(false);
  const [paymentDone,    setPaymentDone]    = useState(false);   // instant paid overlay
  const [paidRef,        setPaidRef]        = useState('');       // reference from Paystack
  const [toast,          setToast]          = useState<{ type: 'success' | 'error'; msg: string } | null>(null);

  useEffect(() => { if (user) fetchData(); }, [user]);

  async function fetchData() {
    setLoading(true); setError('');
    try {
      const { data: b, error: bErr } = await supabase
        .from('bookings')
        .select('id, status, total_amount, rooms(room_number, block, type)')
        .eq('resident_id', user!.id)
        .in('status', ['confirmed', 'pending', 'completed'])
        .order('created_at', { ascending: false })
        .limit(1).maybeSingle();
      if (bErr) throw bErr;
      setBooking(b as Booking | null);

      const { data: p, error: pErr } = await supabase
        .from('student_payments')
        .select('id, amount, status, reference, payment_date, description, created_at')
        .eq('resident_id', user!.id)
        .order('created_at', { ascending: false });
      if (pErr) throw pErr;

      const all = (p as Payment[]) ?? [];
      setPayments(all);
      setPendingPayment(all.find(x => x.status === 'pending' && x.reference) ?? null);
    } catch (err: any) {
      setError(err.message || 'Failed to load payment information.');
    } finally {
      setLoading(false);
    }
  }

  /* Called when Paystack popup confirms payment */
  async function handlePaystackSuccess(reference: string, amount: number) {
    // ── 1. INSTANT optimistic UI flip ──────────────────────────────────────
    const now = new Date().toISOString();
    const optimisticPayment: Payment = {
      id:           pendingPayment?.id ?? `opt_${Date.now()}`,
      amount,
      status:       'completed',
      reference,
      payment_date: now,
      description:  `Hostel fee — Room ${booking!.rooms.room_number} (${booking!.rooms.block})`,
      created_at:   now,
    };

    // Replace pending row or prepend new completed row
    setPayments(prev =>
      pendingPayment
        ? prev.map(p => p.id === pendingPayment.id ? optimisticPayment : p)
        : [optimisticPayment, ...prev]
    );
    setPendingPayment(null);
    setPaidRef(reference);
    setPaymentDone(true);   // shows success overlay immediately

    // ── 2. Persist to DB in background ─────────────────────────────────────
    try {
      if (pendingPayment) {
        const { error } = await supabase
          .from('student_payments')
          .update({ status: 'completed', payment_date: now })
          .eq('id', pendingPayment.id);
        if (error) throw error;
      } else {
        const { error: insErr } = await supabase.from('student_payments').insert({
          resident_id:  user!.id,
          booking_id:   booking!.id,
          amount,
          status:       'completed',
          reference,
          payment_date: now,
          description:  `Hostel fee — Room ${booking!.rooms.room_number} (${booking!.rooms.block})`,
        });
        if (insErr) throw insErr;
      }
      // Refresh for authoritative data
      await fetchData();
    } catch (err: any) {
      showToast('error', 'Payment received but record update failed. Ref: ' + reference);
    }
  }

  /* Opens the real Paystack inline popup */
  async function launchPaystack() {
    if (!user || !booking || outstanding <= 0) return;
    setPaying(true);
    setShowCheatSheet(false);

    try {
      let ref: string;

      if (pendingPayment?.reference) {
        ref = pendingPayment.reference;
      } else {
        ref = `HOSTEL_${Date.now()}_${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
        const { data: inserted, error: insErr } = await supabase
          .from('student_payments')
          .insert({
            resident_id: user!.id,
            booking_id:  booking!.id,
            amount:      outstanding,
            status:      'pending',
            reference:   ref,
            description: `Hostel fee — Room ${booking!.rooms.room_number} (${booking!.rooms.block})`,
          })
          .select('id, amount, status, reference, payment_date, description, created_at')
          .single();
        if (insErr) throw insErr;
        setPendingPayment(inserted as Payment);
        setPayments(prev => [inserted as Payment, ...prev]);
      }

      const handler = PaystackPop.setup({
        key:      PAYSTACK_PUBLIC_KEY,
        email:    user.email!,
        amount:   Math.round(outstanding * 100), // kobo
        ref,
        currency: 'NGN',
        label:    `Hostel Fee — Room ${booking.rooms.room_number}`,
        metadata: {
          booking_id:  booking.id,
          user_id:     user.id,
          room_number: booking.rooms.room_number,
          block:       booking.rooms.block,
        },
        callback: (response) => {
          setPaying(false);
          handlePaystackSuccess(response.reference, outstanding);
        },
        onClose: () => {
          setPaying(false);
          showToast('error', 'Payment window closed. Click "Resume Payment" to continue where you left off.');
        },
      });

      handler.openIframe();
    } catch (err: any) {
      setPaying(false);
      showToast('error', err.message || 'Failed to initialise payment. Please try again.');
    }
  }

  function showToast(type: 'success' | 'error', msg: string) {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 8000);
  }

  const totalPaid   = payments.filter(p => p.status === 'completed').reduce((s, p) => s + p.amount, 0);
  const outstanding = booking ? Math.max(0, booking.total_amount - totalPaid) : 0;
  const isFullyPaid = booking !== null && outstanding === 0;
  const paidPercent = booking ? Math.min(100, (totalPaid / booking.total_amount) * 100) : 0;

  return (
    <>
      <style>{`
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(20px) scale(0.98); }
          to   { opacity: 1; transform: translateY(0)    scale(1);    }
        }
        .animate-slideUp { animation: slideUp 0.3s cubic-bezier(0.4,0,0.2,1) both; }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to   { opacity: 1; transform: translateY(0);    }
        }
        .animate-fadeIn { animation: fadeIn 0.4s ease both; }
        @keyframes popIn {
          0%   { transform: scale(0.4) rotate(-10deg); opacity: 0; }
          60%  { transform: scale(1.15) rotate(3deg);  opacity: 1; }
          80%  { transform: scale(0.95) rotate(-1deg); }
          100% { transform: scale(1)    rotate(0deg);  }
        }
        .animate-popIn { animation: popIn 0.6s cubic-bezier(0.34,1.56,0.64,1) both; }
        @keyframes confetti {
          0%   { transform: translateY(0) rotate(0deg);   opacity: 1; }
          100% { transform: translateY(80px) rotate(720deg); opacity: 0; }
        }
        .confetti-dot { animation: confetti 1.2s ease-out both; }
      `}</style>

      {/* ── Payment Success Overlay ── */}
      {paymentDone && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ backdropFilter: 'blur(6px)', backgroundColor: 'rgba(0,0,0,0.45)' }}
        >
          {/* Confetti dots */}
          {['#5C2200','#C1560A','#10b981','#f59e0b','#3b82f6','#ec4899'].map((color, i) => (
            <span
              key={i}
              className="confetti-dot absolute w-3 h-3 rounded-full pointer-events-none"
              style={{
                backgroundColor: color,
                top: `${30 + (i % 3) * 15}%`,
                left: `${15 + i * 12}%`,
                animationDelay: `${i * 0.1}s`,
              }}
            />
          ))}

          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm text-center overflow-hidden animate-slideUp">
            {/* Green top bar */}
            <div className="bg-gradient-to-r from-emerald-500 to-green-400 px-6 py-5">
              <div className="w-20 h-20 rounded-full bg-white/20 flex items-center justify-center mx-auto animate-popIn">
                <CheckCircle2 className="w-11 h-11 text-white" />
              </div>
            </div>

            <div className="px-7 py-6 space-y-4">
              <div>
                <h2 className="text-2xl font-black text-slate-900">Payment Successful!</h2>
                <p className="text-slate-500 text-sm mt-1">
                  Your hostel fee has been received and confirmed by Paystack.
                </p>
              </div>

              {/* Reference */}
              <div className="bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-left">
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1">Transaction Reference</p>
                <p className="font-mono text-xs text-slate-700 break-all">{paidRef}</p>
              </div>

              {/* Quick stats */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-emerald-50 rounded-2xl p-3 border border-emerald-100">
                  <p className="text-[10px] text-emerald-600 font-bold uppercase tracking-widest">Status</p>
                  <p className="text-sm font-black text-emerald-700 mt-0.5 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> PAID
                  </p>
                </div>
                <div className="bg-slate-50 rounded-2xl p-3 border border-slate-100">
                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Amount</p>
                  <p className="text-sm font-black text-slate-800 mt-0.5">₦{payments.filter(p=>p.status==='completed').reduce((s,p)=>s+p.amount,0).toLocaleString()}</p>
                </div>
              </div>

              <button
                onClick={() => setPaymentDone(false)}
                className="w-full py-3.5 bg-gradient-to-r from-[#5C2200] to-[#8B3A1A] text-white font-black rounded-2xl hover:from-[#7A3010] hover:to-[#A0471F] transition-all shadow-lg shadow-[#5C2200]/25 text-sm"
              >
                Done — View Receipt
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="p-4 sm:p-6 space-y-5 max-w-4xl mx-auto animate-fadeIn">

        {/* ── Hero Banner ── */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#5C2200] via-[#8B3A1A] to-[#C1560A] shadow-xl shadow-[#5C2200]/30">
          <div className="absolute inset-0 opacity-10"
            style={{ backgroundImage: 'radial-gradient(circle at 20% 50%, white 1px, transparent 1px)', backgroundSize: '24px 24px' }} />
          <div className="absolute -right-10 -top-10 w-48 h-48 rounded-full bg-white/5 blur-2xl" />
          <div className="absolute -left-5 -bottom-8 w-32 h-32 rounded-full bg-orange-400/10 blur-xl" />
          <div className="relative px-8 py-8 flex items-center justify-between">
            <div>
              <p className="text-orange-200 text-xs font-bold uppercase tracking-widest mb-1">Finance Portal</p>
              <h1 className="text-3xl font-black text-white">Fee Payments</h1>
              <p className="mt-1.5 text-orange-100/80 text-sm">Pay your hostel fee securely via Paystack</p>
            </div>
            <div className="hidden sm:flex w-16 h-16 rounded-2xl bg-white/10 backdrop-blur-sm items-center justify-center border border-white/20">
              <CreditCard className="w-8 h-8 text-white" />
            </div>
          </div>
        </div>

        {/* ── Toast ── */}
        {toast && (
          <div className={`flex items-start gap-3 rounded-2xl border px-4 py-3.5 text-sm font-medium animate-slideUp ${
            toast.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : 'bg-rose-50 border-rose-200 text-rose-700'
          }`}>
            {toast.type === 'success'
              ? <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5 text-emerald-500" />
              : <AlertCircle  className="w-5 h-5 shrink-0 mt-0.5 text-rose-500" />}
            <span>{toast.msg}</span>
          </div>
        )}

        {/* ── Loading ── */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-28 gap-4">
            <div className="relative w-12 h-12">
              <div className="absolute inset-0 rounded-full border-4 border-[#5C2200]/15" />
              <div className="absolute inset-0 rounded-full border-4 border-t-[#5C2200] animate-spin" />
            </div>
            <p className="text-slate-500 text-sm">Loading payment details...</p>
          </div>
        )}

        {/* ── Error ── */}
        {!loading && error && (
          <div className="rounded-2xl bg-rose-50 border border-rose-200 px-5 py-4 text-sm text-rose-700 flex items-center gap-3">
            <AlertCircle className="w-5 h-5 shrink-0" />
            {error}
          </div>
        )}

        {/* ── No Booking ── */}
        {!loading && !error && !booking && (
          <div className="bg-white rounded-3xl border border-[#e8dcd7] shadow-sm p-14 flex flex-col items-center text-center">
            <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-[#fdf7f4] to-[#f0e0d8] border border-[#e8dcd7] flex items-center justify-center mb-6 shadow-inner">
              <Bed className="w-9 h-9 text-[#b89080]" />
            </div>
            <h2 className="text-xl font-black text-slate-900 mb-2">No Active Booking</h2>
            <p className="text-sm text-slate-500 max-w-sm leading-relaxed mb-7">
              Payment records appear here once a room has been allocated to you by the admin.
            </p>
            <button
              onClick={() => navigate('/student-dashboard/apply')}
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#5C2200] to-[#8B3A1A] text-white text-sm font-bold rounded-2xl hover:from-[#7A3010] hover:to-[#A0471F] transition-all shadow-lg shadow-[#5C2200]/25"
            >
              <CreditCard className="w-4 h-4" /> Apply for Accommodation
            </button>
          </div>
        )}

        {/* ── Booking Found ── */}
        {!loading && !error && booking && (
          <div className="space-y-5">

            {/* Booking + Progress */}
            <div className="bg-white rounded-3xl border border-[#e8dcd7] shadow-sm p-6">
              <div className="flex items-start justify-between gap-4 flex-wrap mb-5">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#5C2200] to-[#8B3A1A] flex items-center justify-center shadow-md">
                    <Bed className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="text-xs text-[#b89080] uppercase tracking-wide font-semibold">Current Booking</p>
                    <h2 className="text-base font-black text-slate-900">
                      Room {booking.rooms.room_number} — Block {booking.rooms.block}
                    </h2>
                    <p className="text-sm text-[#b89080]">{booking.rooms.type}</p>
                  </div>
                </div>
                {isFullyPaid && (
                  <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-sm font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    <CheckCircle2 className="w-4 h-4" /> Fully Paid
                  </span>
                )}
              </div>
              <div>
                <div className="flex justify-between text-xs text-slate-500 mb-2">
                  <span className="font-semibold">Payment Progress</span>
                  <span className="font-bold text-[#5C2200]">{Math.round(paidPercent)}%</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-700"
                    style={{
                      width: `${paidPercent}%`,
                      background: paidPercent === 100
                        ? 'linear-gradient(90deg,#059669,#10b981)'
                        : 'linear-gradient(90deg,#5C2200,#C1560A)',
                    }}
                  />
                </div>
                <div className="flex justify-between text-xs text-slate-400 mt-1.5">
                  <span>₦{totalPaid.toLocaleString()} paid</span>
                  <span>₦{booking.total_amount.toLocaleString()} total</span>
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[
                { label: 'Total Fee',    value: booking.total_amount, gradient: 'from-[#5C2200] to-[#8B3A1A]',        icon: CreditCard   },
                { label: 'Amount Paid', value: totalPaid,             gradient: 'from-emerald-600 to-emerald-500',     icon: CheckCircle2 },
                { label: 'Outstanding', value: outstanding,           gradient: outstanding > 0 ? 'from-rose-600 to-rose-500' : 'from-slate-400 to-slate-500', icon: outstanding > 0 ? AlertCircle : CheckCircle2 },
              ].map(({ label, value, gradient, icon: Icon }) => (
                <div key={label} className="bg-white rounded-2xl border border-[#e8dcd7] shadow-sm p-5 hover:shadow-md transition-shadow">
                  <div className={`bg-gradient-to-br ${gradient} w-11 h-11 rounded-xl flex items-center justify-center mb-4 shadow-md`}>
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                  <p className="text-2xl font-black text-slate-900">₦{value.toLocaleString()}</p>
                  <p className="text-sm text-[#b89080] font-medium mt-0.5">{label}</p>
                </div>
              ))}
            </div>

            {/* Pay Now CTA */}
            {outstanding > 0 && (
              <div className="rounded-3xl bg-gradient-to-r from-orange-50 to-amber-50 border border-orange-200 p-5 sm:p-6 flex flex-col sm:flex-row gap-5 items-start sm:items-center justify-between">
                <div className="flex gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-orange-100 border border-orange-200 flex items-center justify-center shrink-0">
                    <AlertCircle className="w-5 h-5 text-orange-600" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-orange-900">Payment Required</p>
                    <p className="text-xs text-orange-700 mt-0.5">
                      Outstanding balance: <strong className="text-orange-900">₦{outstanding.toLocaleString()}</strong>
                    </p>
                    <p className="text-xs text-orange-600 mt-1 flex items-center gap-1">
                      <Lock className="w-3 h-3" /> Secured by Paystack · Bank-grade encryption
                    </p>
                  </div>
                </div>
                <button
                  id="pay-now-btn"
                  onClick={() => setShowCheatSheet(true)}
                  disabled={paying}
                  className="shrink-0 inline-flex items-center gap-2.5 px-7 py-3.5 bg-gradient-to-r from-[#5C2200] to-[#8B3A1A] text-white text-sm font-black rounded-2xl hover:from-[#7A3010] hover:to-[#A0471F] disabled:opacity-60 disabled:cursor-not-allowed transition-all shadow-xl shadow-[#5C2200]/30 active:scale-95"
                >
                  {paying ? (
                    <><Loader2 className="w-4 h-4 animate-spin" /> Opening Paystack...</>
                  ) : pendingPayment ? (
                    <><CreditCard className="w-4 h-4" /> Resume Payment</>
                  ) : (
                    <><CreditCard className="w-4 h-4" /> Pay ₦{outstanding.toLocaleString()}</>
                  )}
                </button>
              </div>
            )}

            {/* Fully Paid */}
            {isFullyPaid && (
              <div className="flex items-center gap-4 rounded-3xl bg-gradient-to-r from-emerald-50 to-green-50 border border-emerald-200 px-6 py-5">
                <div className="w-11 h-11 rounded-xl bg-emerald-100 border border-emerald-200 flex items-center justify-center shrink-0">
                  <CheckCircle2 className="w-6 h-6 text-emerald-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-bold text-emerald-900">All Fees Settled ✓</p>
                  <p className="text-xs text-emerald-700 mt-0.5">
                    Your hostel fee is fully paid. Visit <strong>My Room</strong> to download your allocation letter.
                  </p>
                </div>
                <button
                  onClick={() => navigate('/student-dashboard/my-room')}
                  className="shrink-0 text-xs font-bold text-emerald-700 bg-white border border-emerald-200 px-4 py-2 rounded-xl hover:bg-emerald-50 transition-colors"
                >
                  View Room →
                </button>
              </div>
            )}

            {/* Payment History */}
            <div className="bg-white rounded-3xl border border-[#e8dcd7] shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-[#e8dcd7] flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-900">Payment History</h3>
                <span className="text-xs text-slate-400 bg-slate-100 rounded-full px-2.5 py-0.5">
                  {payments.length} record{payments.length !== 1 ? 's' : ''}
                </span>
              </div>
              {payments.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-center px-4">
                  <div className="w-14 h-14 rounded-2xl bg-[#fdf7f4] border border-[#e8dcd7] flex items-center justify-center mb-4">
                    <CreditCard className="w-6 h-6 text-[#e8dcd7]" />
                  </div>
                  <p className="text-sm font-semibold text-slate-600">No payment records yet</p>
                  <p className="text-xs text-[#b89080] mt-1">Records appear here after you make a payment.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-[#fdf7f4] border-b border-[#e8dcd7]">
                      <tr>
                        {['Date', 'Description', 'Amount', 'Reference', 'Status'].map(h => (
                          <th key={h} className="px-5 py-3.5 text-left text-[10px] font-bold uppercase tracking-wider text-[#b89080]">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#f0e8e4]">
                      {payments.map(p => {
                        const cfg  = statusCfg[p.status];
                        const Icon = cfg.icon;
                        return (
                          <tr key={p.id} className="hover:bg-[#fdf7f4] transition-colors">
                            <td className="px-5 py-4 text-sm text-slate-600 whitespace-nowrap">{fmt(p.payment_date ?? p.created_at)}</td>
                            <td className="px-5 py-4 text-sm text-slate-700 max-w-[180px] truncate">{p.description ?? 'Hostel fee payment'}</td>
                            <td className="px-5 py-4 text-sm font-black text-slate-900 whitespace-nowrap">₦{p.amount.toLocaleString()}</td>
                            <td className="px-5 py-4 text-xs font-mono text-[#b89080] max-w-[130px] truncate">{p.reference ?? '—'}</td>
                            <td className="px-5 py-4">
                              <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${cfg.badge}`}>
                                <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
                                <Icon className="w-3 h-3" />{cfg.label}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* ── Test Card Cheat Sheet Modal → launches real Paystack ── */}
      {showCheatSheet && booking && outstanding > 0 && (
        <TestCardModal
          amount={outstanding}
          onClose={() => setShowCheatSheet(false)}
          onProceed={launchPaystack}
          paying={paying}
        />
      )}
    </>
  );
}
