import { useEffect, useState, type FormEvent } from 'react';
import { Wrench, AlertTriangle, Clock, CheckCircle, Plus, X, Loader2 } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';

type Priority = 'high' | 'medium' | 'low';
type Status   = 'pending' | 'in-progress' | 'completed';

interface Request {
  id: string;
  ticket_number: string;
  room: string;
  issue: string;
  description: string;
  reported_date: string;
  priority: Priority;
  status: Status;
  assigned_to: string | null;
}

const priorityCfg: Record<Priority, { badge: string; dot: string; icon: React.ElementType }> = {
  high:   { badge: 'bg-red-100 text-red-700 border-red-200',         dot: '#C2410C', icon: AlertTriangle },
  medium: { badge: 'bg-orange-100 text-orange-700 border-orange-200', dot: '#B45309', icon: Clock        },
  low:    { badge: 'bg-green-100 text-green-700 border-green-200',    dot: '#15803D', icon: Wrench        },
};

const statusCfg: Record<Status, { badge: string; label: string }> = {
  pending:       { badge: 'bg-orange-100 text-orange-700', label: 'Pending'     },
  'in-progress': { badge: 'bg-[#e8dcd7] text-[#5C2200]',  label: 'In Progress' },
  completed:     { badge: 'bg-green-100 text-green-700',   label: 'Completed'   },
};

function genTicket() {
  const ts = Date.now().toString(36).toUpperCase().slice(-4);
  return `MAINT-${new Date().getFullYear()}-${ts}`;
}

const inputCls = 'w-full rounded-lg border border-[#e8dcd7] px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 outline-none focus:border-[#5C2200] focus:ring-2 focus:ring-[#5C2200]/10 transition-colors bg-white';
const labelCls = 'block text-sm font-medium text-slate-700 mb-1.5';

export default function StudentMaintenance() {
  const { user } = useAuth();
  const [requests,    setRequests]    = useState<Request[]>([]);
  const [loading,     setLoading]     = useState(true);
  const [error,       setError]       = useState('');
  const [showForm,    setShowForm]    = useState(false);
  const [editingId,   setEditingId]   = useState<string | null>(null);
  const [submitting,  setSubmitting]  = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [form, setForm] = useState({ room: '', issue: '', description: '', priority: 'medium' as Priority });

  const closeForm = () => {
    setShowForm(false);
    setEditingId(null);
    setForm({ room: '', issue: '', description: '', priority: 'medium' });
    setSubmitError('');
  };

  const openEdit = (r: Request) => {
    setEditingId(r.id);
    setForm({ room: r.room, issue: r.issue, description: r.description, priority: r.priority });
    setShowForm(true);
  };

  const fetchRequests = async () => {
    if (!user) return;
    setLoading(true); setError('');
    try {
      const { data, error: err } = await supabase
        .from('maintenance_requests')
        .select('id, ticket_number, room, issue, description, reported_date, priority, status, assigned_to')
        .eq('user_id', user.id)
        .order('reported_date', { ascending: false });
      if (err) throw err;
      setRequests((data as Request[]) ?? []);
    } catch (e: any) {
      setError(e.message || 'Failed to load requests.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchRequests(); }, [user]);

  const set = (f: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm(prev => ({ ...prev, [f]: e.target.value }));

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSubmitError(''); setSubmitting(true);
    try {
      if (editingId) {
        const { error: err } = await supabase.from('maintenance_requests')
          .update({
            room: form.room,
            issue: form.issue,
            description: form.description,
            priority: form.priority,
          })
          .eq('id', editingId);
        if (err) throw err;
      } else {
        const { error: err } = await supabase.from('maintenance_requests').insert({
          ticket_number: genTicket(),
          room: form.room,
          issue: form.issue,
          description: form.description,
          priority: form.priority,
          reported_by: user.user_metadata?.full_name || user.email || 'Student',
          user_id: user.id,
        });
        if (err) throw err;
      }
      closeForm();
      await fetchRequests();
    } catch (e: any) {
      setSubmitError(e.message || 'Failed to submit request.');
    } finally {
      setSubmitting(false);
    }
  };

  const pending    = requests.filter(r => r.status === 'pending').length;
  const inProgress = requests.filter(r => r.status === 'in-progress').length;
  const completed  = requests.filter(r => r.status === 'completed').length;

  return (
    <div className="p-6 space-y-6">

      {/* Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-[#5C2200]">
        <img src="https://images.pexels.com/photos/5691608/pexels-photo-5691608.jpeg?auto=compress&cs=tinysrgb&w=1200"
          alt="Maintenance" className="absolute inset-0 w-full h-full object-cover opacity-15" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#5C2200]/90 via-[#5C2200]/70 to-[#5C2200]/50" />
        <div className="relative px-8 py-7">
          <p className="text-xs font-semibold uppercase tracking-widest text-orange-200 mb-1">Facilities</p>
          <h1 className="text-2xl font-extrabold text-white">Maintenance Requests</h1>
          <p className="mt-1 text-orange-100 text-sm">Report issues with your room or facilities.</p>
        </div>
        <div className="absolute -right-6 -top-6 h-28 w-28 rounded-full bg-white/10 blur-xl" />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Pending',     value: pending,    bg: 'bg-[#7A3010]', icon: Clock        },
          { label: 'In Progress', value: inProgress, bg: 'bg-[#5C2200]', icon: Wrench       },
          { label: 'Completed',   value: completed,  bg: 'bg-[#7A3010]', icon: CheckCircle  },
        ].map(({ label, value, bg, icon: Icon }) => (
          <div key={label} className="bg-white rounded-xl border border-[#e8dcd7] shadow-sm p-4">
            <div className={`${bg} w-9 h-9 rounded-lg flex items-center justify-center mb-3`}>
              <Icon className="w-4 h-4 text-white" />
            </div>
            <p className="text-xl font-bold text-slate-900">{loading ? '—' : value}</p>
            <p className="text-xs text-[#b89080] mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {/* Toolbar */}
      <div className="flex justify-between items-center">
        <h2 className="text-base font-semibold text-slate-900">My Requests</h2>
        <button onClick={() => setShowForm(true)}
          className="inline-flex items-center gap-2 px-4 py-2 bg-[#5C2200] text-white text-sm font-semibold rounded-xl hover:bg-[#7A3010] transition-colors shadow-sm">
          <Plus className="w-4 h-4" /> New Request
        </button>
      </div>

      {/* Submit form modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-lg bg-white rounded-2xl shadow-xl overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#e8dcd7]">
              <h3 className="font-semibold text-slate-900">{editingId ? 'Edit Request' : 'New Maintenance Request'}</h3>
              <button onClick={closeForm} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {submitError && (
                <div className="rounded-lg bg-rose-50 border border-rose-100 px-4 py-3 text-sm text-rose-700">{submitError}</div>
              )}
              <div>
                <label className={labelCls}>Room Number</label>
                <input type="text" required placeholder="e.g. 304B" value={form.room} onChange={set('room')} className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Issue Title</label>
                <input type="text" required placeholder="e.g. Air conditioning not working" value={form.issue} onChange={set('issue')} className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Description</label>
                <textarea required rows={3} placeholder="Describe the issue in detail…" value={form.description} onChange={set('description')} className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Priority</label>
                <select value={form.priority} onChange={set('priority')} className={inputCls}>
                  <option value="low">Low — Minor inconvenience</option>
                  <option value="medium">Medium — Affects daily use</option>
                  <option value="high">High — Urgent / Safety concern</option>
                </select>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={closeForm}
                  className="flex-1 py-2.5 border border-[#e8dcd7] text-slate-700 text-sm font-medium rounded-xl hover:bg-[#fdf7f4] transition-colors">
                  Cancel
                </button>
                <button type="submit" disabled={submitting}
                  className="flex-1 py-2.5 bg-[#5C2200] text-white text-sm font-semibold rounded-xl hover:bg-[#7A3010] transition-colors disabled:opacity-60 flex items-center justify-center gap-2">
                  {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : (editingId ? null : <Plus className="w-4 h-4" />)}
                  {submitting ? 'Saving…' : (editingId ? 'Save Changes' : 'Submit Request')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-7 h-7 text-[#5C2200] animate-spin" />
        </div>
      )}

      {/* Error */}
      {!loading && error && (
        <div className="rounded-xl bg-rose-50 border border-rose-100 px-4 py-3 text-sm text-rose-700">{error}</div>
      )}

      {/* Empty */}
      {!loading && !error && requests.length === 0 && (
        <div className="bg-white rounded-2xl border border-[#e8dcd7] shadow-sm p-12 flex flex-col items-center text-center">
          <div className="w-14 h-14 rounded-2xl bg-[#fdf7f4] border border-[#e8dcd7] flex items-center justify-center mb-4">
            <Wrench className="w-7 h-7 text-[#b89080]" />
          </div>
          <h3 className="text-base font-semibold text-slate-900 mb-1">No requests yet</h3>
          <p className="text-sm text-slate-500 max-w-xs">Submit a maintenance request if something in your room or block needs attention.</p>
        </div>
      )}

      {/* Cards */}
      {!loading && !error && requests.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {requests.map(r => {
            const pc = priorityCfg[r.priority];
            const sc = statusCfg[r.status];
            const PIcon = pc.icon;
            return (
              <div key={r.id} className="bg-white rounded-xl border border-[#e8dcd7] shadow-sm p-5 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-start gap-3">
                    <div className={`w-9 h-9 rounded-lg flex items-center justify-center border shrink-0 ${pc.badge}`}>
                      <PIcon className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-slate-900">{r.issue}</h3>
                      <p className="text-xs font-mono text-[#b89080] mt-0.5">{r.ticket_number}</p>
                    </div>
                  </div>
                  <div className="flex gap-2 items-center">
                    {r.status === 'pending' && (
                      <button onClick={() => openEdit(r)} className="px-2.5 py-0.5 bg-sky-100 border border-sky-200 rounded-full text-xs font-semibold text-[#5C2200] hover:bg-sky-200 transition-colors">
                        Edit
                      </button>
                    )}
                    <span className={`shrink-0 px-2.5 py-0.5 text-xs font-semibold rounded-full ${sc.badge}`}>{sc.label}</span>
                  </div>
                </div>
                <p className="text-sm text-slate-500 mb-4 leading-relaxed">{r.description}</p>
                <div className="grid grid-cols-2 gap-3 pb-3 mb-3 border-b border-[#e8dcd7] text-xs">
                  <div>
                    <p className="text-[#b89080] mb-1">Room</p>
                    <span className="px-2 py-0.5 bg-[#fdf7f4] text-[#5C2200] border border-[#e8dcd7] rounded font-semibold">{r.room}</span>
                  </div>
                  <div>
                    <p className="text-[#b89080] mb-1">Priority</p>
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded border font-semibold ${pc.badge}`}>
                      <span className="w-1.5 h-1.5 rounded-full" style={{ background: pc.dot }} />
                      {r.priority}
                    </span>
                  </div>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-[#b89080]">Reported:</span>
                  <span className="font-medium text-slate-700">{new Date(r.reported_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                </div>
                {r.assigned_to && (
                  <div className="flex justify-between text-sm mt-1">
                    <span className="text-[#b89080]">Assigned to:</span>
                    <span className="font-medium text-slate-700">{r.assigned_to}</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
