import { useState } from 'react';
import {
  Bed, Wifi, Wind, ShowerHead, Zap, Search,
  SlidersHorizontal, CheckCircle, AlertTriangle, XCircle, MapPin,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import PublicLayout from '../components/PublicLayout';
import { useAuth } from '../context/AuthContext';
import { blocks, rooms, ROOM_TYPE_CONFIG, type Room, type RoomType, type Gender } from '../data/hostel';

// ─── Types ────────────────────────────────────────────────────────────────────

type TypeFilter   = 'all' | RoomType;
type BlockFilter  = 'all' | string;
type StatusFilter = 'all' | 'available' | 'limited' | 'full';

const AMENITY_ICONS: Record<string, React.FC<{ className?: string }>> = {
  WiFi: Wifi, AC: Wind, 'En-suite': ShowerHead, Power: Zap,
};

// Stable amenities per type (public page — decorative)
const TYPE_AMENITIES: Record<RoomType, string[]> = {
  quad:   ['WiFi', 'Power'],
  double: ['WiFi', 'AC', 'Power'],
  single: ['WiFi', 'AC', 'Power', 'En-suite'],
};

// ─── Pill button ─────────────────────────────────────────────────────────────

function Pill({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap ${
        active
          ? 'bg-[#5C2200] text-white shadow-sm'
          : 'bg-white text-slate-600 border border-[#e8dcd7] hover:border-[#5C2200]/40 hover:text-[#5C2200]'
      }`}
    >
      {children}
    </button>
  );
}

// ─── Status badge ──────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: Room['status'] }) {
  if (status === 'available')
    return (
      <div className="absolute top-3 left-3 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-green-500 text-white">
        <CheckCircle className="w-3 h-3" /> Available
      </div>
    );
  if (status === 'limited')
    return (
      <div className="absolute top-3 left-3 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-500 text-white">
        <AlertTriangle className="w-3 h-3" /> Limited
      </div>
    );
  return (
    <div className="absolute top-3 left-3 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-700/80 text-white">
      <XCircle className="w-3 h-3" /> Full
    </div>
  );
}

// ─── Room card ────────────────────────────────────────────────────────────────

function RoomCard({ room }: { room: Room }) {
  const { user } = useAuth();
  const userGender = user?.user_metadata?.gender as Gender | undefined;
  const genderMismatch = !!user && !!userGender && room.gender !== userGender;
  const canApply = room.status !== 'full' && !genderMismatch;
  const amenities = TYPE_AMENITIES[room.type];

  return (
    <div className="group bg-white rounded-2xl border border-[#e8dcd7] shadow-sm overflow-hidden hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
      {/* Image */}
      <div className="relative h-48 overflow-hidden">
        <img
          src={room.image}
          alt={room.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <StatusBadge status={room.status} />
        {/* Block badge */}
        <div className="absolute top-3 right-3 bg-[#5C2200]/90 text-white text-xs font-bold px-2.5 py-1 rounded-full">
          Block {room.blockId}
        </div>
        {/* Price overlay */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent px-4 py-3">
          <span className="text-white font-extrabold text-lg">₦{room.price.toLocaleString()}</span>
          <span className="text-white/70 text-xs ml-1">/ semester</span>
        </div>
      </div>

      {/* Body */}
      <div className="p-5">
        <div className="mb-1">
          <h3 className="font-bold text-slate-900 text-base">{room.name}</h3>
          <div className="flex items-center gap-1 text-xs text-[#b89080] mt-0.5">
            <MapPin className="w-3 h-3" />
            {room.blockName} · {room.label}
          </div>
        </div>

        {/* Beds */}
        <div className="flex items-center gap-1.5 my-3">
          {Array.from({ length: room.beds }).map((_, i) => (
            <div key={i} className="flex items-center gap-1 bg-[#fdf7f4] border border-[#e8dcd7] rounded-md px-2 py-1">
              <Bed className="w-3 h-3 text-[#5C2200]" />
              <span className="text-[10px] font-medium text-[#5C2200]">Bed {i + 1}</span>
            </div>
          ))}
          <span className="text-xs text-[#b89080] ml-1">· {room.beds}-person</span>
        </div>

        {/* Amenities */}
        <div className="flex flex-wrap gap-1.5 mb-4">
          {amenities.map((a) => {
            const Icon = AMENITY_ICONS[a] || Zap;
            return (
              <span
                key={a}
                className="inline-flex items-center gap-1 bg-[#fdf7f4] border border-[#e8dcd7] rounded-full px-2.5 py-0.5 text-[11px] font-medium text-[#5C2200]"
              >
                <Icon className="w-3 h-3" />
                {a}
              </span>
            );
          })}
        </div>

        {/* CTA */}
        {canApply ? (
          <Link
            to={user ? `/student-dashboard/apply/${room.id}` : '/login'}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#5C2200] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#7A3010] transition-colors"
          >
            Apply for room
          </Link>
        ) : genderMismatch ? (
          <button
            disabled
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-slate-100 px-4 py-2.5 text-sm font-semibold text-slate-400 cursor-not-allowed"
          >
            Not available for your gender
          </button>
        ) : (
          <button
            disabled
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-slate-100 px-4 py-2.5 text-sm font-semibold text-slate-400 cursor-not-allowed"
          >
            Room Full
          </button>
        )}
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function RoomsPage() {
  const { user } = useAuth();
  const [search,       setSearch]  = useState('');
  const [typeFilter,   setType]    = useState<TypeFilter>('all');
  const [blockFilter,  setBlock]   = useState<BlockFilter>('all');
  const [statusFilter, setStatus]  = useState<StatusFilter>('all');
  const [showFilters,  setShowFilters] = useState(false);

  const filtered = rooms.filter((r) => {
    const matchSearch  = search === '' ||
      r.name.toLowerCase().includes(search.toLowerCase()) ||
      r.blockName.toLowerCase().includes(search.toLowerCase()) ||
      r.id.toLowerCase().includes(search.toLowerCase());
    const matchType    = typeFilter   === 'all' || r.type    === typeFilter;
    const matchBlock   = blockFilter  === 'all' || r.blockId === blockFilter;
    const matchStatus  = statusFilter === 'all' || r.status  === statusFilter;
    const userGender   = user?.user_metadata?.gender as Gender | undefined;
    const matchGender  = !user || !userGender || r.gender === userGender;
    return matchSearch && matchType && matchBlock && matchStatus && matchGender;
  });

  const availableCount = rooms.filter((r) => r.status === 'available').length;

  return (
    <PublicLayout>
      {/* ── Hero ── */}
      <section className="relative bg-[#5C2200] overflow-hidden">
        <img
          src="https://images.pexels.com/photos/271624/pexels-photo-271624.jpeg?auto=compress&cs=tinysrgb&w=1400"
          alt="Hostel rooms"
          className="absolute inset-0 w-full h-full object-cover opacity-10"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-[#5C2200] via-[#5C2200]/95 to-[#7A3010]/80" />
        <div className="relative mx-auto max-w-5xl px-6 py-16 text-center">
          <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-orange-200 ring-1 ring-white/20 mb-5">
            <Bed className="w-3.5 h-3.5" /> CUSTECH Hostel Rooms
          </span>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-white mb-4 leading-tight">
            Find Your Perfect Room
          </h1>
          <p className="text-orange-100 text-base max-w-xl mx-auto mb-8">
            Browse all available rooms across our four halls of residence. Filter by type, block, and status.
          </p>
          <div className="flex flex-wrap justify-center gap-6 text-sm">
            {[
              { label: 'Total Rooms',        value: `${rooms.length}` },
              { label: 'Available Now',       value: `${availableCount}` },
              { label: 'Halls of Residence', value: '4' },
              { label: 'Starting From',      value: '₦45,000' },
            ].map((s) => (
              <div key={s.label} className="text-center">
                <p className="text-2xl font-extrabold text-white">{s.value}</p>
                <p className="text-orange-200 text-xs mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Filter bar ── */}
      <section className="sticky top-16 z-40 bg-white border-b border-[#e8dcd7] shadow-sm">
        <div className="mx-auto max-w-7xl px-6 py-3">
          <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
            {/* Search */}
            <div className="flex items-center gap-2 bg-[#fdf7f4] border border-[#e8dcd7] rounded-xl px-3.5 py-2.5 w-full sm:w-72 focus-within:ring-2 focus-within:ring-[#5C2200]/20 focus-within:border-[#5C2200] transition-all">
              <Search className="w-4 h-4 text-[#b89080] shrink-0" />
              <input
                type="text"
                placeholder="Search room, hall, id…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="bg-transparent outline-none text-sm w-full text-slate-700 placeholder:text-[#b89080]"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
              {/* Type pills */}
              {(['all', 'quad', 'double', 'single'] as TypeFilter[]).map((t) => (
                <Pill key={t} active={typeFilter === t} onClick={() => setType(t)}>
                  {t === 'all' ? 'All Types' : ROOM_TYPE_CONFIG[t as RoomType]?.label ?? t}
                </Pill>
              ))}
              <button
                onClick={() => setShowFilters((v) => !v)}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium border transition-all whitespace-nowrap ${
                  showFilters
                    ? 'bg-[#5C2200] text-white border-[#5C2200]'
                    : 'bg-white text-slate-600 border-[#e8dcd7] hover:border-[#5C2200]/40'
                }`}
              >
                <SlidersHorizontal className="w-3.5 h-3.5" /> Filters
              </button>
            </div>
          </div>

          {/* Expanded filters */}
          {showFilters && (
            <div className="flex flex-wrap gap-3 mt-3 pt-3 border-t border-[#e8dcd7]">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-widest text-[#b89080] mb-1.5">Block</p>
                <div className="flex flex-wrap gap-1.5">
                  <Pill active={blockFilter === 'all'} onClick={() => setBlock('all')}>All Blocks</Pill>
                  {blocks.map((b) => (
                    <Pill key={b.id} active={blockFilter === b.id} onClick={() => setBlock(b.id)}>
                      Block {b.letter} – {b.name}
                    </Pill>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-widest text-[#b89080] mb-1.5">Availability</p>
                <div className="flex flex-wrap gap-1.5">
                  {(['all', 'available', 'limited', 'full'] as StatusFilter[]).map((s) => (
                    <Pill key={s} active={statusFilter === s} onClick={() => setStatus(s)}>
                      {s === 'all' ? 'All' : s.charAt(0).toUpperCase() + s.slice(1)}
                    </Pill>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* ── Results ── */}
      <section className="bg-[#fdf7f4] min-h-screen py-10">
        <div className="mx-auto max-w-7xl px-6">
          {/* Count + clear */}
          <div className="flex items-center justify-between mb-6">
            <p className="text-sm text-slate-600">
              Showing <span className="font-semibold text-slate-900">{filtered.length}</span> room{filtered.length !== 1 ? 's' : ''}
            </p>
            {(typeFilter !== 'all' || blockFilter !== 'all' || statusFilter !== 'all' || search) && (
              <button
                onClick={() => { setType('all'); setBlock('all'); setStatus('all'); setSearch(''); }}
                className="text-xs text-[#5C2200] font-medium hover:underline"
              >
                Clear filters
              </button>
            )}
          </div>

          {filtered.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {filtered.map((room) => <RoomCard key={room.id} room={room} />)}
            </div>
          ) : (
            <div className="flex flex-col items-center py-24 text-center">
              <div className="w-16 h-16 rounded-full bg-[#e8dcd7] flex items-center justify-center mb-4">
                <Bed className="w-7 h-7 text-[#5C2200]" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900 mb-1">No rooms found</h3>
              <p className="text-sm text-slate-500 max-w-xs">Try adjusting your filters or search term.</p>
              <button
                onClick={() => { setType('all'); setBlock('all'); setStatus('all'); setSearch(''); }}
                className="mt-4 px-4 py-2 bg-[#5C2200] text-white rounded-lg text-sm font-medium hover:bg-[#7A3010] transition-colors"
              >
                Reset filters
              </button>
            </div>
          )}
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="bg-[#5C2200] py-12 text-center">
        <h2 className="text-2xl font-extrabold text-white mb-2">Ready to apply?</h2>
        <p className="text-orange-200 text-sm mb-6 max-w-sm mx-auto">
          Create an account and submit your accommodation application in minutes.
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          <Link
            to="/register"
            className="inline-flex items-center gap-2 bg-white text-[#5C2200] rounded-xl px-6 py-3 text-sm font-bold hover:bg-orange-50 transition-colors"
          >
            Create Account &amp; Apply
          </Link>
          <Link
            to="/how-to-apply"
            className="inline-flex items-center gap-2 bg-white/10 text-white rounded-xl px-6 py-3 text-sm font-semibold hover:bg-white/20 transition-colors ring-1 ring-white/20"
          >
            How It Works
          </Link>
        </div>
      </section>
    </PublicLayout>
  );
}
