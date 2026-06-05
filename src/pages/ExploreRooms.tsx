import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Bed, Building2, Users, ArrowRight, CheckCircle, AlertTriangle, XCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import {
  getBlockById,
  getRoomsByBlock,
  type Room,
  type Gender,
} from '../data/hostel';

// ─── Room status badge ────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: Room['status'] }) {
  if (status === 'available')
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-green-50 text-green-700 text-[11px] font-semibold">
        <CheckCircle className="w-3 h-3" /> Available
      </span>
    );
  if (status === 'limited')
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 text-[11px] font-semibold">
        <AlertTriangle className="w-3 h-3" /> Limited
      </span>
    );
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 text-[11px] font-semibold">
      <XCircle className="w-3 h-3" /> Full
    </span>
  );
}

// ─── Room card ────────────────────────────────────────────────────────────────

function RoomCard({ room }: { room: Room }) {
  const navigate  = useNavigate();
  const canApply  = room.status !== 'full';

  return (
    <div className="bg-white rounded-xl border border-[#e8dcd7] shadow-sm overflow-hidden">
      {/* Image */}
      <div className="relative h-36 overflow-hidden">
        <img
          src={room.image}
          alt={room.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
        <div className="absolute bottom-2 left-3">
          <span className="text-white font-extrabold text-base">
            ₦{room.price.toLocaleString()}
          </span>
          <span className="text-white/70 text-xs ml-1">/ semester</span>
        </div>
        <div className="absolute top-2 right-2">
          <StatusBadge status={room.status} />
        </div>
      </div>

      {/* Body */}
      <div className="p-4">
        <div className="flex items-start justify-between mb-2">
          <div>
            <p className="font-bold text-slate-900 text-sm">{room.name}</p>
            <p className="text-xs text-[#b89080] mt-0.5">{room.label} · {room.beds} bed{room.beds > 1 ? 's' : ''}</p>
          </div>
          <div className="flex items-center gap-0.5">
            {Array.from({ length: room.beds }).map((_, i) => (
              <Bed key={i} className="w-3.5 h-3.5 text-[#5C2200]" />
            ))}
          </div>
        </div>

        {canApply ? (
          <button
            id={`apply-btn-${room.id}`}
            onClick={() => navigate(`/student-dashboard/apply/${room.id}`)}
            className="mt-3 w-full flex items-center justify-center gap-1.5 bg-[#5C2200] text-white rounded-lg px-3 py-2 text-xs font-semibold hover:bg-[#7A3010] transition-colors"
          >
            Apply for this room <ArrowRight className="w-3.5 h-3.5" />
          </button>
        ) : (
          <button
            disabled
            className="mt-3 w-full flex items-center justify-center gap-1.5 bg-slate-100 text-slate-400 rounded-lg px-3 py-2 text-xs font-semibold cursor-not-allowed"
          >
            Room Full
          </button>
        )}
      </div>
    </div>
  );
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default function ExploreRooms() {
  const { blockId } = useParams<{ blockId: string }>();
  const navigate    = useNavigate();
  const { user }    = useAuth();

  const block       = blockId ? getBlockById(blockId) : undefined;
  const userGender  = user?.user_metadata?.gender as Gender | undefined;

  // Guard: block doesn't exist
  if (!block) {
    return (
      <div className="p-6 flex flex-col items-center py-24 text-center gap-3">
        <XCircle className="w-10 h-10 text-slate-400" />
        <p className="text-slate-600 font-medium">Block not found.</p>
        <button
          onClick={() => navigate('/student-dashboard/explore')}
          className="text-[#5C2200] text-sm font-semibold underline"
        >
          Back to blocks
        </button>
      </div>
    );
  }

  // Guard: gender mismatch — student cannot access opposite gender block
  if (userGender && block.gender !== userGender) {
    return (
      <div className="p-6 flex flex-col items-center py-24 text-center gap-3">
        <XCircle className="w-10 h-10 text-rose-400" />
        <p className="text-slate-900 font-semibold">Access Restricted</p>
        <p className="text-sm text-slate-500 max-w-xs">
          {block.name} is a {block.gender} block. You can only view blocks matching your gender.
        </p>
        <button
          onClick={() => navigate('/student-dashboard/explore')}
          className="mt-2 px-4 py-2 bg-[#5C2200] text-white text-sm font-semibold rounded-lg hover:bg-[#7A3010] transition-colors"
        >
          Back to my blocks
        </button>
      </div>
    );
  }

  const blockRooms = getRoomsByBlock(block.id);

  return (
    <div className="p-6 space-y-6">
      {/* ── Back + header ── */}
      <div>
        <button
          onClick={() => navigate('/student-dashboard/explore')}
          className="inline-flex items-center gap-1.5 text-sm text-[#b89080] hover:text-[#5C2200] transition-colors mb-4"
        >
          <ArrowLeft className="w-4 h-4" /> Back to blocks
        </button>

        <div className="relative overflow-hidden rounded-2xl bg-[#5C2200]">
          <div className="absolute inset-0 bg-gradient-to-r from-[#5C2200]/90 via-[#5C2200]/70 to-[#7A3010]/60" />
          <div className="relative px-8 py-7 flex items-start gap-5">
            <div className="w-16 h-16 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center shrink-0">
              <span className="text-3xl font-extrabold text-white">{block.letter}</span>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-orange-200 mb-0.5">
                Step 2 of 3 · Block {block.letter}
              </p>
              <h1 className="text-2xl font-extrabold text-white">{block.name}</h1>
              <p className="mt-1 text-orange-100 text-sm max-w-md">{block.description}</p>
            </div>
          </div>
          <div className="absolute -right-6 -top-6 h-28 w-28 rounded-full bg-white/10 blur-xl" />
        </div>
      </div>

      {/* ── Stats strip ── */}
      <div className="flex flex-wrap gap-4 text-sm">
        {[
          { label: 'Total Rooms',  value: blockRooms.length,                                      color: 'text-slate-700'  },
          { label: 'Available',    value: blockRooms.filter(r => r.status === 'available').length, color: 'text-green-700'  },
          { label: 'Limited',      value: blockRooms.filter(r => r.status === 'limited').length,   color: 'text-amber-700'  },
          { label: 'Full',         value: blockRooms.filter(r => r.status === 'full').length,      color: 'text-slate-500'  },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-xl border border-[#e8dcd7] px-4 py-3 flex items-center gap-2">
            <span className={`text-xl font-extrabold ${s.color}`}>{s.value}</span>
            <span className="text-xs text-[#b89080]">{s.label}</span>
          </div>
        ))}
      </div>

      {/* ── Room grid ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {blockRooms.map((room) => (
          <RoomCard key={room.id} room={room} />
        ))}
      </div>

      {/* ── Progress breadcrumb ── */}
      <div className="flex items-center gap-2 text-xs text-[#b89080]">
        <span className="flex items-center gap-1.5 cursor-pointer hover:text-[#5C2200]" onClick={() => navigate('/student-dashboard/explore')}>
          <Building2 className="w-3.5 h-3.5" />
          Choose Block
        </span>
        <ArrowRight className="w-3 h-3" />
        <span className="flex items-center gap-1.5 font-semibold text-[#5C2200]">
          <Bed className="w-3.5 h-3.5" />
          View Rooms
        </span>
        <ArrowRight className="w-3 h-3" />
        <span className="flex items-center gap-1.5">
          <Users className="w-3.5 h-3.5" />
          Apply
        </span>
      </div>
    </div>
  );
}
