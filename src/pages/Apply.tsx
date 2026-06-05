import { type FormEvent, useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { CheckCircle2, ClipboardList, ArrowLeft, Building2, Bed, Users, ArrowRight } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { getRoomById, getApplicableRooms, ROOM_TYPE_CONFIG, type Gender } from '../data/hostel';

const LEVELS = ['100 Level', '200 Level', '300 Level', '400 Level', '500 Level'];

const inputClass =
  'w-full rounded-lg border border-[#e8dcd7] px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 outline-none focus:border-[#5C2200] focus:ring-2 focus:ring-[#5C2200]/10 transition-colors bg-white';
const labelClass = 'block text-sm font-medium text-slate-700 mb-1.5';

// ─── Success state ────────────────────────────────────────────────────────────

function SuccessState() {
  const navigate = useNavigate();
  return (
    <div className="flex flex-col items-center text-center py-16 px-6">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-50 ring-8 ring-green-50/50 mb-5">
        <CheckCircle2 className="h-8 w-8 text-green-600" />
      </div>
      <h2 className="text-2xl font-bold text-slate-900">Application submitted!</h2>
      <p className="mt-3 max-w-md text-sm text-slate-500 leading-relaxed">
        Your hostel application has been received. You can track its status directly on your dashboard.
      </p>
      <div className="mt-6 rounded-xl border border-[#e8dcd7] bg-[#fdf7f4] px-6 py-4 text-sm text-slate-600 max-w-sm text-left">
        <p className="font-semibold text-slate-900">What happens next?</p>
        <ol className="mt-2 list-decimal list-inside space-y-1">
          <li>Admin reviews your application</li>
          <li>You are assigned a room</li>
          <li>Pay hostel fee via Paystack</li>
          <li>Download allocation letter</li>
        </ol>
      </div>
      <button
        onClick={() => navigate('/student-dashboard')}
        className="mt-6 px-5 py-2.5 bg-[#5C2200] text-white rounded-lg text-sm font-semibold hover:bg-[#7A3010] transition-colors"
      >
        Back to dashboard
      </button>
    </div>
  );
}

// ─── Form ─────────────────────────────────────────────────────────────────────

function ApplyForm() {
  const { user }    = useAuth();
  const { roomId }  = useParams<{ roomId?: string }>();
  const navigate    = useNavigate();

  const [submitted, setSubmitted] = useState(false);
  const [loading,   setLoading]   = useState(false);
  const [error,     setError]     = useState('');

  const userGender = user?.user_metadata?.gender as Gender | undefined;

  // Pre-selected room (when arriving from ExploreRooms)
  const preSelectedRoom = roomId ? getRoomById(roomId) : undefined;

  const [form, setForm] = useState({
    fullName:    '',
    matricNumber: '',
    department:  '',
    level:       '',
    roomId:      preSelectedRoom?.id ?? '',
    message:     '',
  });

  // If roomId changes via URL, sync it into the form
  useEffect(() => {
    if (preSelectedRoom) {
      setForm((prev) => ({ ...prev, roomId: preSelectedRoom.id }));
    }
  }, [roomId]); // eslint-disable-line react-hooks/exhaustive-deps

  // Rooms available to this student (gender-filtered, not full)
  const availableRooms = userGender ? getApplicableRooms(userGender) : [];

  const set =
    (field: keyof typeof form) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
      setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!user) return;

    setError('');
    setLoading(true);

    try {
      const selectedRoom = getRoomById(form.roomId);
      const roomLabel = selectedRoom
        ? `${selectedRoom.name} — ${selectedRoom.label} — ${selectedRoom.blockName}`
        : form.roomId;

      const payload = {
        user_id:       user.id,
        full_name:     form.fullName.trim(),
        matric_number: form.matricNumber.trim(),
        department:    form.department.trim(),
        level:         form.level,
        room_type:     roomLabel,
        message:       form.message.trim() || '',
      };

      const { error: insertError } = await supabase
        .from('applications')
        .insert(payload);

      if (insertError) {
        console.error('Insert error details:', insertError);
        throw new Error(insertError.message || `Error ${insertError.code}: ${insertError.details}`);
      }

      setSubmitted(true);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to submit application.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  if (submitted) return <SuccessState />;

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {error && (
        <div className="rounded-lg bg-rose-50 border border-rose-100 px-4 py-3 text-sm text-rose-700">
          {error}
        </div>
      )}

      {/* Pre-selected room pill */}
      {preSelectedRoom && (
        <div className="flex items-center gap-3 rounded-xl bg-[#fdf7f4] border border-[#e8dcd7] px-4 py-3">
          <div className="w-9 h-9 rounded-lg bg-[#5C2200] flex items-center justify-center shrink-0">
            <Bed className="w-4 h-4 text-white" />
          </div>
          <div className="flex-1">
            <p className="text-xs text-[#b89080]">Selected Room</p>
            <p className="text-sm font-semibold text-slate-900">
              {preSelectedRoom.name} — {preSelectedRoom.label} — {preSelectedRoom.blockName}
            </p>
          </div>
          <button
            type="button"
            onClick={() => navigate('/student-dashboard/explore')}
            className="text-xs text-[#5C2200] font-medium hover:underline"
          >
            Change
          </button>
        </div>
      )}

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="fullName" className={labelClass}>Full name</label>
          <input
            id="fullName" type="text" required
            placeholder="e.g. Amina Okonkwo"
            value={form.fullName} onChange={set('fullName')}
            className={inputClass}
          />
        </div>
        <div>
          <label htmlFor="matricNumber" className={labelClass}>Matric number</label>
          <input
            id="matricNumber" type="text" required
            placeholder="e.g. CST/2022/001"
            value={form.matricNumber} onChange={set('matricNumber')}
            className={inputClass}
          />
        </div>
      </div>

      <div>
        <label htmlFor="applyEmail" className={labelClass}>Email address</label>
        <input
          id="applyEmail" type="email" readOnly
          value={user?.email || ''}
          className={`${inputClass} bg-slate-50 text-slate-500 cursor-not-allowed`}
        />
        <p className="mt-1 text-xs text-slate-400">Linked to your account — cannot be changed here.</p>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="department" className={labelClass}>Department / Faculty</label>
          <input
            id="department" type="text" required
            placeholder="e.g. Computer Engineering"
            value={form.department} onChange={set('department')}
            className={inputClass}
          />
        </div>
        <div>
          <label htmlFor="level" className={labelClass}>Current level</label>
          <select id="level" required value={form.level} onChange={set('level')} className={inputClass}>
            <option value="">Select level</option>
            {LEVELS.map((l) => <option key={l} value={l}>{l}</option>)}
          </select>
        </div>
      </div>

      {/* Room selection — pre-filled if coming from ExploreRooms, otherwise dropdown */}
      {!preSelectedRoom && (
        <div>
          <label htmlFor="roomId" className={labelClass}>Preferred room</label>
          <select id="roomId" required value={form.roomId} onChange={set('roomId')} className={inputClass}>
            <option value="">Select a room</option>
            {availableRooms.map((r) => (
              <option key={r.id} value={r.id}>
                {r.name} — {ROOM_TYPE_CONFIG[r.type].label} — {r.blockName} (₦{r.price.toLocaleString()})
              </option>
            ))}
          </select>
          <p className="mt-1 text-xs text-slate-400">
            Only rooms matching your gender and not fully booked are listed.{' '}
            <button
              type="button"
              onClick={() => navigate('/student-dashboard/explore')}
              className="text-[#5C2200] font-medium hover:underline"
            >
              Browse by block instead
            </button>
          </p>
        </div>
      )}

      <div>
        <label htmlFor="message" className={labelClass}>
          Additional notes <span className="text-slate-400 font-normal">(optional)</span>
        </label>
        <textarea
          id="message" rows={3}
          placeholder="Any special requirements or notes for the allocations team…"
          value={form.message} onChange={set('message')}
          className={inputClass}
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#5C2200] px-4 py-3 text-sm font-semibold text-white hover:bg-[#7A3010] transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
      >
        {loading ? (
          <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
          </svg>
        ) : (
          <ClipboardList className="h-4 w-4" />
        )}
        {loading ? 'Submitting…' : 'Submit application'}
      </button>
    </form>
  );
}

// ─── Page wrapper ──────────────────────────────────────────────────────────────

export default function Apply() {
  const { roomId } = useParams<{ roomId?: string }>();
  const navigate   = useNavigate();
  const fromRoom   = !!roomId;

  return (
    <div className="p-6 space-y-6">
      {/* Back link when arriving from a room card */}
      {fromRoom && (
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-1.5 text-sm text-[#b89080] hover:text-[#5C2200] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to rooms
        </button>
      )}

      {/* Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-[#5C2200]">
        <img
          src="https://images.pexels.com/photos/1438832/pexels-photo-1438832.jpeg?auto=compress&cs=tinysrgb&w=1200"
          alt="Apply for accommodation"
          className="absolute inset-0 w-full h-full object-cover opacity-15"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#5C2200]/90 via-[#5C2200]/70 to-[#5C2200]/50" />
        <div className="relative px-8 py-7">
          <p className="text-xs font-semibold uppercase tracking-widest text-orange-200 mb-1">
            Step 3 of 3 · Room Application
          </p>
          <h1 className="text-2xl font-extrabold text-white">Apply for Accommodation</h1>
          <p className="mt-1 text-orange-100 text-sm">
            Complete the form below. Applications are reviewed within 48 hours.
          </p>
        </div>
        <div className="absolute -right-6 -top-6 h-28 w-28 rounded-full bg-white/10 blur-xl" />
      </div>

      {/* Form card */}
      <div className="max-w-2xl">
        <div className="bg-white rounded-xl border border-[#e8dcd7] shadow-sm p-6">
          <ApplyForm />
        </div>
      </div>

      {/* Progress breadcrumb */}
      <div className="flex items-center gap-2 text-xs text-[#b89080]">
        <span
          className="flex items-center gap-1.5 cursor-pointer hover:text-[#5C2200]"
          onClick={() => navigate('/student-dashboard/explore')}
        >
          <Building2 className="w-3.5 h-3.5" /> Choose Block
        </span>
        <ArrowRight className="w-3 h-3" />
        <span
          className="flex items-center gap-1.5 cursor-pointer hover:text-[#5C2200]"
          onClick={() => navigate(-1)}
        >
          <Bed className="w-3.5 h-3.5" /> View Rooms
        </span>
        <ArrowRight className="w-3 h-3" />
        <span className="flex items-center gap-1.5 font-semibold text-[#5C2200]">
          <Users className="w-3.5 h-3.5" /> Apply
        </span>
      </div>
    </div>
  );
}
