import { useEffect, useState, useRef } from 'react';
import {
  Bed, Calendar, Building2, Layers, Tag, CheckCircle2,
  Clock, AlertCircle, ClipboardList, Download, MapPin,
  ShieldCheck, Package, ListChecks, ChevronDown, ChevronUp,
  CreditCard, Key, Truck, ClipboardCheck, Star, Phone,
  Wifi, Zap, Droplets, Utensils, Lock,
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

interface Room {
  room_number: string;
  block: string;
  floor: number;
  type: string;
  price: number;
  image_url: string | null;
  description: string | null;
}

interface Booking {
  id: string;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  check_in: string | null;
  check_out: string | null;
  total_amount: number;
  created_at: string;
  rooms: Room;
}

const MOVE_IN_STEPS = [
  {
    icon: CreditCard,
    title: 'Complete Fee Payment',
    desc: 'Pay your full hostel fee via the Payments page. A Paystack confirmation will be sent to your email.',
    color: 'from-blue-500 to-indigo-600',
    done: (paid: boolean) => paid,
  },
  {
    icon: Download,
    title: 'Download Allocation Letter',
    desc: 'Print or save your allocation letter. You must present it at the hostel office on move-in day.',
    color: 'from-[#5C2200] to-[#8B3A1A]',
    done: (paid: boolean) => paid,
  },
  {
    icon: ClipboardCheck,
    title: 'Report to Hostel Office',
    desc: 'Visit the hostel administration office with your allocation letter, student ID, and payment receipt.',
    color: 'from-amber-500 to-orange-600',
    done: () => false,
  },
  {
    icon: Key,
    title: 'Collect Your Room Key',
    desc: 'After verification, the hostel warden will hand over your room key and bedding items.',
    color: 'from-emerald-500 to-green-600',
    done: () => false,
  },
  {
    icon: Truck,
    title: 'Move In!',
    desc: 'You can now move your belongings in. Welcome to your new home for the semester!',
    color: 'from-purple-500 to-pink-600',
    done: () => false,
  },
];

const PACKING_LIST = [
  { cat: 'Bedding & Linen',  icon: Bed,       items: ['Mattress protector', 'Bed sheets (2 sets)', 'Pillow & pillowcase', 'Blanket / duvet'] },
  { cat: 'Toiletries',       icon: Droplets,  items: ['Towels (2)', 'Toothbrush & paste', 'Soap / shower gel', 'Toilet paper rolls'] },
  { cat: 'Kitchen & Food',   icon: Utensils,  items: ['Plates & cutlery', 'Cup / mug', 'Kettle (if allowed)', 'Non-perishable snacks'] },
  { cat: 'Electronics',      icon: Zap,       items: ['Laptop & charger', 'Phone & charger', 'Extension cord (surge-protected)', 'Study lamp'] },
  { cat: 'Study Materials',  icon: ClipboardList, items: ['Textbooks', 'Stationery', 'Printer paper', 'File folders'] },
  { cat: 'Security',         icon: Lock,      items: ['Padlock (for locker)', 'Copies of key documents', 'Emergency contact list'] },
];

const HOSTEL_RULES = [
  'Quiet hours are 10 PM – 6 AM. Keep noise levels low during this time.',
  'No opposite-gender visitors allowed inside rooms.',
  'Cooking is only permitted in designated kitchen areas.',
  'Alcohol and illegal substances are strictly prohibited.',
  'Keep common areas clean. Dispose of waste in designated bins.',
  'Report maintenance issues through the Maintenance portal immediately.',
  'Always carry your student ID and room key within the hostel premises.',
  'Electrical appliances must be approved by hostel management.',
];

const FACILITIES = [
  { icon: Wifi,    label: 'Free Wi-Fi',        note: 'Shared high-speed broadband' },
  { icon: Droplets, label: '24/7 Water',        note: 'Running water guaranteed' },
  { icon: Zap,     label: 'Power Supply',       note: 'Includes backup generator' },
  { icon: ShieldCheck, label: 'Security',       note: 'CCTV & 24-hour guards' },
  { icon: Utensils, label: 'Kitchen',           note: 'Common kitchen per block' },
  { icon: Phone,   label: 'Emergency Helpline', note: '+234 800 HOSTEL' },
];

function Section({ title, children, icon: Icon }: { title: string; children: React.ReactNode; icon: React.ElementType }) {
  return (
    <div className="bg-white rounded-3xl border border-[#e8dcd7] shadow-sm overflow-hidden">
      <div className="px-6 py-4 border-b border-[#e8dcd7] flex items-center gap-3">
        <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#5C2200] to-[#8B3A1A] flex items-center justify-center">
          <Icon className="w-4 h-4 text-white" />
        </div>
        <h2 className="text-sm font-bold text-slate-900">{title}</h2>
      </div>
      <div className="p-6">{children}</div>
    </div>
  );
}

/* ── Printable Allocation Letter ── */
function AllocationLetter({ booking, userName }: { booking: Booking; userName: string }) {
  const letterRef = useRef<HTMLDivElement>(null);

  function printLetter() {
    const content = letterRef.current?.innerHTML;
    if (!content) return;
    const win = window.open('', '_blank');
    if (!win) return;
    win.document.write(`
      <html><head><title>Allocation Letter</title>
      <style>
        body { font-family: 'Georgia', serif; padding: 60px; color: #111; max-width: 700px; margin: 0 auto; }
        .header { text-align: center; border-bottom: 3px solid #5C2200; padding-bottom: 20px; margin-bottom: 30px; }
        .school { font-size: 22px; font-weight: bold; color: #5C2200; }
        .subtitle { font-size: 13px; color: #666; margin-top: 4px; }
        .title { font-size: 18px; font-weight: bold; margin: 20px 0 10px; text-decoration: underline; text-align: center; }
        table { width: 100%; border-collapse: collapse; margin: 20px 0; }
        td { padding: 8px 12px; border: 1px solid #ddd; font-size: 13px; }
        td:first-child { background: #fdf7f4; font-weight: bold; width: 35%; }
        .footer { margin-top: 40px; font-size: 12px; color: #555; text-align: center; border-top: 1px solid #ddd; padding-top: 16px; }
        .signature { margin-top: 60px; display: flex; justify-content: space-between; }
        .sig-line { border-top: 1px solid #333; width: 200px; text-align: center; padding-top: 6px; font-size: 12px; }
        .stamp { width: 100px; height: 100px; border: 3px solid #5C2200; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: #5C2200; font-weight: bold; font-size: 11px; text-align: center; }
      </style></head><body>${content}</body></html>
    `);
    win.document.close();
    win.print();
  }

  const ref = `${booking.id.split('-')[0].toUpperCase()}`;
  const today = new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
  const checkIn = booking.check_in
    ? new Date(booking.check_in).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
    : 'As soon as possible';
  const checkOut = booking.check_out
    ? new Date(booking.check_out).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
    : 'End of semester';

  return (
    <div>
      {/* Hidden printable letter */}
      <div ref={letterRef} style={{ display: 'none' }}>
        <div className="header">
          <div className="school">CUSTECH Hostel Management</div>
          <div className="subtitle">Students Affairs Division · Accommodation Services</div>
        </div>
        <div style={{ textAlign: 'right', fontSize: '13px', marginBottom: '10px' }}>Date: {today}</div>
        <div className="title">ROOM ALLOCATION LETTER</div>
        <p style={{ fontSize: '13px', marginBottom: '16px' }}>
          This is to confirm that the following student has been allocated a room in the CUSTECH Hostel for the current academic session.
        </p>
        <table>
          <tbody>
            <tr><td>Full Name</td><td>{userName}</td></tr>
            <tr><td>Reference No.</td><td>{ref}</td></tr>
            <tr><td>Block</td><td>{booking.rooms.block}</td></tr>
            <tr><td>Room Number</td><td>{booking.rooms.room_number}</td></tr>
            <tr><td>Floor</td><td>Floor {booking.rooms.floor}</td></tr>
            <tr><td>Room Type</td><td>{booking.rooms.type}</td></tr>
            <tr><td>Check-in Date</td><td>{checkIn}</td></tr>
            <tr><td>Check-out Date</td><td>{checkOut}</td></tr>
            <tr><td>Amount Paid</td><td>₦{booking.total_amount.toLocaleString()}</td></tr>
            <tr><td>Payment Status</td><td>FULLY PAID ✓</td></tr>
          </tbody>
        </table>
        <p style={{ fontSize: '13px' }}>
          The student is expected to report to the Hostel Administration Office with this letter and a valid Student ID card to collect room keys.
          This letter is only valid for the current academic session.
        </p>
        <div className="signature">
          <div><div className="sig-line">Student Signature</div></div>
          <div><div className="sig-line">Hostel Manager</div></div>
          <div><div className="sig-line">Date</div></div>
        </div>
        <div className="footer">
          CUSTECH Hostel Management · This letter was auto-generated on {today} · Ref: {ref}
        </div>
      </div>

      {/* Visible preview card */}
      <div className="bg-gradient-to-br from-[#fdf7f4] to-white border-2 border-[#e8dcd7] rounded-2xl p-6 relative overflow-hidden">
        <div className="absolute top-4 right-4 w-16 h-16 rounded-full border-2 border-[#5C2200]/20 flex items-center justify-center">
          <ShieldCheck className="w-7 h-7 text-[#5C2200]/40" />
        </div>
        <p className="text-[10px] font-bold text-[#b89080] uppercase tracking-widest mb-1">CUSTECH Hostel Management</p>
        <h3 className="text-lg font-black text-slate-900 mb-4">Room Allocation Letter</h3>
        <div className="grid grid-cols-2 gap-3 text-sm mb-4">
          {[
            ['Reference', ref],
            ['Block', booking.rooms.block],
            ['Room', booking.rooms.room_number],
            ['Floor', `Floor ${booking.rooms.floor}`],
            ['Type', booking.rooms.type],
            ['Check-in', checkIn],
            ['Fee', `₦${booking.total_amount.toLocaleString()}`],
            ['Status', 'FULLY PAID ✓'],
          ].map(([label, value]) => (
            <div key={label} className="bg-white rounded-xl border border-[#e8dcd7] px-3 py-2.5">
              <p className="text-[10px] text-[#b89080] font-bold uppercase tracking-widest">{label}</p>
              <p className="font-bold text-slate-900 text-xs mt-0.5 truncate">{value}</p>
            </div>
          ))}
        </div>
        <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-2.5 mb-4">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <p className="text-xs text-emerald-700 font-semibold">Fee fully paid · Present this letter at the hostel office</p>
        </div>
        <button
          onClick={printLetter}
          className="w-full flex items-center justify-center gap-2.5 py-3.5 bg-gradient-to-r from-[#5C2200] to-[#8B3A1A] text-white text-sm font-black rounded-2xl hover:from-[#7A3010] hover:to-[#A0471F] transition-all shadow-lg shadow-[#5C2200]/25 active:scale-95"
        >
          <Download className="w-4 h-4" /> Download / Print Allocation Letter
        </button>
      </div>
    </div>
  );
}

/* ── Packing Checklist ── */
function PackingChecklist() {
  const [checked, setChecked] = useState<Set<string>>(new Set());
  const [open, setOpen] = useState<Set<string>>(new Set(['Bedding & Linen']));

  function toggle(key: string) {
    setChecked(prev => {
      const n = new Set(prev);
      n.has(key) ? n.delete(key) : n.add(key);
      return n;
    });
  }
  function toggleCat(cat: string) {
    setOpen(prev => {
      const n = new Set(prev);
      n.has(cat) ? n.delete(cat) : n.add(cat);
      return n;
    });
  }

  const total = PACKING_LIST.flatMap(c => c.items).length;
  const done  = checked.size;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between mb-1">
        <p className="text-xs text-slate-500">{done} of {total} items packed</p>
        <div className="w-32 bg-slate-100 rounded-full h-2 overflow-hidden">
          <div className="h-full bg-gradient-to-r from-[#5C2200] to-orange-400 rounded-full transition-all duration-500"
            style={{ width: `${(done / total) * 100}%` }} />
        </div>
      </div>
      {PACKING_LIST.map(({ cat, icon: Icon, items }) => {
        const isOpen = open.has(cat);
        const catDone = items.filter(i => checked.has(`${cat}:${i}`)).length;
        return (
          <div key={cat} className="border border-[#e8dcd7] rounded-2xl overflow-hidden">
            <button
              onClick={() => toggleCat(cat)}
              className="w-full flex items-center justify-between px-4 py-3 bg-[#fdf7f4] hover:bg-[#f5ede8] transition-colors"
            >
              <div className="flex items-center gap-3">
                <Icon className="w-4 h-4 text-[#5C2200]" />
                <span className="text-sm font-bold text-slate-800">{cat}</span>
                <span className="text-[10px] text-slate-400 bg-white border border-slate-200 rounded-full px-2 py-0.5">
                  {catDone}/{items.length}
                </span>
              </div>
              {isOpen ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
            </button>
            {isOpen && (
              <div className="divide-y divide-[#f0e8e4]">
                {items.map(item => {
                  const key = `${cat}:${item}`;
                  const done = checked.has(key);
                  return (
                    <label key={item} className="flex items-center gap-3 px-5 py-2.5 cursor-pointer hover:bg-[#fdf7f4] transition-colors">
                      <div
                        onClick={() => toggle(key)}
                        className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all ${
                          done ? 'bg-emerald-500 border-emerald-500' : 'border-slate-300 bg-white'
                        }`}
                      >
                        {done && <CheckCircle2 className="w-3.5 h-3.5 text-white" />}
                      </div>
                      <span className={`text-sm transition-all ${done ? 'line-through text-slate-400' : 'text-slate-700'}`}>{item}</span>
                    </label>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

/* ── Main Page ── */
export default function StudentMyRoom() {
  const { user }   = useAuth();
  const navigate   = useNavigate();
  const [booking,  setBooking]  = useState<Booking | null>(null);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState('');
  const [hasPaid,  setHasPaid]  = useState(false);

  const userName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Student';

  useEffect(() => {
    if (!user) return;
    const fetch = async (silent = false) => {
      if (!silent) { setLoading(true); setError(''); }
      try {
        const { data, error: e } = await supabase
          .from('bookings')
          .select(`id,status,check_in,check_out,total_amount,created_at,
            rooms(room_number,block,floor,type,price,image_url,description)`)
          .eq('resident_id', user.id)
          .in('status', ['pending', 'confirmed', 'completed'])
          .order('created_at', { ascending: false })
          .limit(1).maybeSingle();
        if (e) throw e;
        setBooking(data as Booking | null);
        if (data) {
          const { data: pmts } = await supabase
            .from('student_payments').select('amount')
            .eq('resident_id', user.id).eq('status', 'completed');
          const paid = pmts?.reduce((s, p) => s + Number(p.amount), 0) ?? 0;
          setHasPaid(paid >= data.total_amount);
        }
      } catch (err: any) {
        if (!silent) setError(err.message || 'Failed to load room allocation.');
      } finally {
        if (!silent) setLoading(false);
      }
    };
    fetch();
    const channel = supabase.channel(`myroom-${user.id}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'bookings',         filter: `resident_id=eq.${user.id}` }, () => fetch(true))
      .on('postgres_changes', { event: '*', schema: 'public', table: 'student_payments', filter: `resident_id=eq.${user.id}` }, () => fetch(true))
      .subscribe();
    const iv = setInterval(() => fetch(true), 15000);
    return () => { supabase.removeChannel(channel); clearInterval(iv); };
  }, [user]);

  return (
    <div className="p-4 sm:p-6 space-y-5 max-w-4xl mx-auto">
      <style>{`
        @keyframes fadeIn { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
        .fade-in { animation: fadeIn 0.4s ease both; }
      `}</style>

      {/* ── Hero ── */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#5C2200] via-[#8B3A1A] to-[#C1560A] shadow-xl shadow-[#5C2200]/30">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 20% 50%, white 1px, transparent 1px)', backgroundSize: '24px 24px' }} />
        <div className="absolute -right-10 -top-10 w-48 h-48 rounded-full bg-white/5 blur-2xl" />
        <div className="relative px-8 py-8 flex items-center justify-between">
          <div>
            <p className="text-orange-200 text-xs font-bold uppercase tracking-widest mb-1">Accommodation</p>
            <h1 className="text-3xl font-black text-white">My Room</h1>
            <p className="mt-1.5 text-orange-100/80 text-sm">Your allocation details and move-in guide</p>
          </div>
          <div className="hidden sm:flex w-16 h-16 rounded-2xl bg-white/10 backdrop-blur-sm items-center justify-center border border-white/20">
            <Key className="w-8 h-8 text-white" />
          </div>
        </div>
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex flex-col items-center justify-center py-28 gap-4">
          <div className="relative w-12 h-12">
            <div className="absolute inset-0 rounded-full border-4 border-[#5C2200]/15" />
            <div className="absolute inset-0 rounded-full border-4 border-t-[#5C2200] animate-spin" />
          </div>
          <p className="text-slate-500 text-sm">Loading your room details...</p>
        </div>
      )}

      {/* Error */}
      {!loading && error && (
        <div className="rounded-2xl bg-rose-50 border border-rose-200 px-5 py-4 text-sm text-rose-700 flex items-center gap-3">
          <AlertCircle className="w-5 h-5 shrink-0" />{error}
        </div>
      )}

      {/* No booking */}
      {!loading && !error && !booking && (
        <div className="bg-white rounded-3xl border border-[#e8dcd7] shadow-sm p-14 flex flex-col items-center text-center">
          <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-[#fdf7f4] to-[#f0e0d8] border border-[#e8dcd7] flex items-center justify-center mb-6 shadow-inner">
            <Bed className="w-9 h-9 text-[#b89080]" />
          </div>
          <h2 className="text-xl font-black text-slate-900 mb-2">No Room Allocated Yet</h2>
          <p className="text-sm text-slate-500 max-w-sm leading-relaxed mb-7">
            Your room will appear here once an admin reviews and confirms your application.
          </p>
          <button
            onClick={() => navigate('/student-dashboard/apply')}
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#5C2200] to-[#8B3A1A] text-white text-sm font-bold rounded-2xl hover:from-[#7A3010] hover:to-[#A0471F] transition-all shadow-lg shadow-[#5C2200]/25"
          >
            <ClipboardList className="w-4 h-4" /> Apply for a Room
          </button>
        </div>
      )}

      {/* Booking found */}
      {!loading && !error && booking && (() => {
        const room = booking.rooms;
        const statusMap = {
          pending:   { label: 'Awaiting Admin Confirmation', badge: 'bg-amber-50 text-amber-700 border-amber-200',   icon: Clock        },
          confirmed: { label: 'Allocation Confirmed',        badge: 'bg-emerald-50 text-emerald-700 border-emerald-200', icon: CheckCircle2 },
          cancelled: { label: 'Booking Cancelled',           badge: 'bg-red-50 text-red-700 border-red-200',          icon: AlertCircle  },
          completed: { label: 'Completed',                   badge: 'bg-slate-50 text-slate-600 border-slate-200',    icon: CheckCircle2 },
        };
        const cfg = statusMap[booking.status];
        const CfgIcon = cfg.icon;

        return (
          <div className="space-y-5 fade-in">

            {/* Status pill */}
            <div className={`inline-flex items-center gap-2.5 rounded-2xl border px-4 py-2.5 text-sm font-bold ${cfg.badge}`}>
              <CfgIcon className="w-4 h-4" /> {cfg.label}
            </div>

            {/* ── Move-In Progress Steps ── */}
            <Section title="How to Move In" icon={MapPin}>
              <div className="space-y-4">
                {MOVE_IN_STEPS.map((step, i) => {
                  const StepIcon = step.icon;
                  const isDone = step.done(hasPaid);
                  return (
                    <div key={i} className={`flex gap-4 p-4 rounded-2xl border transition-all ${
                      isDone ? 'bg-emerald-50 border-emerald-200' : 'bg-[#fdf7f4] border-[#e8dcd7]'
                    }`}>
                      <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${step.color} flex items-center justify-center shrink-0 shadow-md`}>
                        <StepIcon className="w-5 h-5 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Step {i + 1}</span>
                          {isDone && (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-100 rounded-full px-2 py-0.5">
                              <CheckCircle2 className="w-3 h-3" /> Done
                            </span>
                          )}
                        </div>
                        <p className="text-sm font-bold text-slate-900 mt-0.5">{step.title}</p>
                        <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">{step.desc}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </Section>

            {/* Room card */}
            <Section title="Room Details" icon={Bed}>
              <div className="rounded-2xl overflow-hidden border border-[#e8dcd7]">
                <div className="h-48 relative overflow-hidden">
                  <img
                    src={room.image_url || 'https://images.pexels.com/photos/545012/pexels-photo-545012.jpeg?auto=compress&cs=tinysrgb&w=1200'}
                    alt={`Room ${room.room_number}`}
                    className="w-full h-full object-cover"
                  />
                  {!room.image_url && (
                    <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-2.5 py-1 rounded-lg shadow-sm">
                      <p className="text-[10px] font-bold text-slate-700 uppercase tracking-wide">Sample View</p>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                  <div className="absolute bottom-4 left-4">
                    <p className="text-white font-black text-xl drop-shadow">Room {room.room_number}</p>
                    <p className="text-white/80 text-sm">{room.block} · Floor {room.floor}</p>
                  </div>
                </div>
                <div className="p-5">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
                    {[
                      { icon: Building2, label: 'Block',    value: room.block },
                      { icon: Layers,    label: 'Floor',    value: `Floor ${room.floor}` },
                      { icon: Tag,       label: 'Type',     value: room.type },
                      { icon: Calendar,  label: 'Check-in', value: booking.check_in
                          ? new Date(booking.check_in).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
                          : 'TBD' },
                    ].map(({ icon: Icon, label, value }) => (
                      <div key={label} className="bg-[#fdf7f4] rounded-xl border border-[#e8dcd7] p-3">
                        <Icon className="w-4 h-4 text-[#b89080] mb-1.5" />
                        <p className="text-[10px] text-[#b89080] uppercase tracking-wide font-semibold">{label}</p>
                        <p className="text-sm font-bold text-slate-900 mt-0.5">{value}</p>
                      </div>
                    ))}
                  </div>
                  {room.description && (
                    <p className="text-sm text-slate-500 leading-relaxed border-t border-[#e8dcd7] pt-4">{room.description}</p>
                  )}
                  <div className="flex items-center justify-between border-t border-[#e8dcd7] pt-4 mt-2">
                    <p className="text-xs text-slate-400">
                      Booking Ref: <span className="font-mono font-bold text-slate-700">{booking.id.split('-')[0].toUpperCase()}</span>
                    </p>
                    <p className="text-lg font-black text-[#5C2200]">₦{booking.total_amount.toLocaleString()}<span className="text-xs font-medium text-slate-400">/sem</span></p>
                  </div>
                </div>
              </div>
            </Section>

            {/* Allocation letter — only when paid */}
            {hasPaid ? (
              <Section title="Allocation Letter" icon={Download}>
                <AllocationLetter booking={booking} userName={userName} />
              </Section>
            ) : (
              <div className="bg-gradient-to-r from-orange-50 to-amber-50 border border-orange-200 rounded-3xl p-6 flex flex-col sm:flex-row items-start sm:items-center gap-5">
                <div className="w-12 h-12 rounded-2xl bg-orange-100 border border-orange-200 flex items-center justify-center shrink-0">
                  <CreditCard className="w-6 h-6 text-orange-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-bold text-orange-900">Fee Payment Required to Move In</p>
                  <p className="text-xs text-orange-700 mt-1 leading-relaxed">
                    Pay your hostel fee to unlock your Allocation Letter and access the full move-in guide.
                  </p>
                </div>
                <button
                  onClick={() => navigate('/student-dashboard/payments')}
                  className="shrink-0 px-5 py-2.5 bg-gradient-to-r from-[#5C2200] to-[#8B3A1A] text-white text-sm font-black rounded-2xl hover:from-[#7A3010] hover:to-[#A0471F] transition-all shadow-lg shadow-[#5C2200]/20"
                >
                  Pay Now →
                </button>
              </div>
            )}

            {/* Packing checklist */}
            <Section title="Packing Checklist" icon={Package}>
              <PackingChecklist />
            </Section>

            {/* Facilities */}
            <Section title="Hostel Facilities" icon={Star}>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {FACILITIES.map(({ icon: Icon, label, note }) => (
                  <div key={label} className="bg-[#fdf7f4] rounded-2xl border border-[#e8dcd7] p-4">
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#5C2200] to-[#8B3A1A] flex items-center justify-center mb-3 shadow-md">
                      <Icon className="w-4 h-4 text-white" />
                    </div>
                    <p className="text-sm font-bold text-slate-900">{label}</p>
                    <p className="text-xs text-slate-500 mt-0.5">{note}</p>
                  </div>
                ))}
              </div>
            </Section>

            {/* Hostel rules */}
            <Section title="Hostel Rules & Regulations" icon={ListChecks}>
              <div className="space-y-2.5">
                {HOSTEL_RULES.map((rule, i) => (
                  <div key={i} className="flex gap-3 p-3 rounded-xl bg-[#fdf7f4] border border-[#e8dcd7]">
                    <span className="w-6 h-6 rounded-lg bg-gradient-to-br from-[#5C2200] to-[#8B3A1A] flex items-center justify-center text-white text-[10px] font-black shrink-0 mt-0.5">
                      {i + 1}
                    </span>
                    <p className="text-sm text-slate-700 leading-relaxed">{rule}</p>
                  </div>
                ))}
              </div>
            </Section>

          </div>
        );
      })()}
    </div>
  );
}
