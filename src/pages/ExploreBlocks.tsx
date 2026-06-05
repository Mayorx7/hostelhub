import { Building2, Users, Bed, ArrowRight, ShieldCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { blocks, rooms, type Gender } from '../data/hostel';

export default function ExploreBlocks() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const userGender = user?.user_metadata?.gender as Gender | undefined;

  // Students see all blocks, but non-matching genders are blurred and inaccessible
  const visibleBlocks = blocks;

  return (
    <div className="p-6 space-y-6">
      {/* ── Header banner ── */}
      <div className="relative overflow-hidden rounded-2xl bg-[#5C2200]">
        <div className="absolute inset-0 bg-gradient-to-r from-[#5C2200]/90 via-[#5C2200]/70 to-[#7A3010]/60" />
        <div className="relative px-8 py-7">
          <p className="text-xs font-semibold uppercase tracking-widest text-orange-200 mb-1">
            Step 1 of 3
          </p>
          <h1 className="text-2xl font-extrabold text-white">Choose a Block</h1>
          <p className="mt-1 text-orange-100 text-sm">
            Select a hall of residence to browse available rooms.
          </p>
        </div>
        <div className="absolute -right-6 -top-6 h-28 w-28 rounded-full bg-white/10 blur-xl" />
      </div>

      {/* ── Gender notice ── */}
      {userGender && (
        <div className="flex items-center gap-2.5 rounded-xl bg-orange-50 border border-orange-100 px-4 py-3">
          <ShieldCheck className="w-4 h-4 text-orange-500 shrink-0" />
          <p className="text-sm text-orange-800">
            Showing{' '}
            <span className="font-semibold capitalize">{userGender}</span> halls only — blocks are gender-restricted.
          </p>
        </div>
      )}

      {/* ── Block cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {visibleBlocks.map((block) => {
          const isAccessible   = !userGender || block.gender === userGender;
          const blockRooms    = rooms.filter((r) => r.blockId === block.id);
          const availableCount = blockRooms.filter((r) => r.status === 'available').length;
          const limitedCount   = blockRooms.filter((r) => r.status === 'limited').length;
          const fullCount      = blockRooms.filter((r) => r.status === 'full').length;

          return (
            <div key={block.id} className="relative h-full">
              <button
                id={`block-card-${block.id}`}
                onClick={() => isAccessible && navigate(`/student-dashboard/explore/${block.id}`)}
                disabled={!isAccessible}
                className={`w-full h-full group bg-white rounded-2xl border border-[#e8dcd7] shadow-sm p-6 text-left transition-all duration-200 ${
                  isAccessible
                    ? 'hover:shadow-lg hover:border-[#5C2200]/30 hover:-translate-y-0.5 cursor-pointer'
                    : 'blur-[2.5px] opacity-50 cursor-not-allowed select-none'
                }`}
              >
                {/* Block letter badge */}
              <div className="flex items-start justify-between mb-4">
                <div className="w-14 h-14 rounded-2xl bg-[#5C2200] flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform duration-200">
                  <span className="text-2xl font-extrabold text-white">{block.letter}</span>
                </div>
                <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${
                  block.gender === 'male'
                    ? 'bg-blue-50 text-blue-700'
                    : 'bg-pink-50 text-pink-700'
                }`}>
                  {block.gender === 'male' ? '♂' : '♀'} {block.gender.charAt(0).toUpperCase() + block.gender.slice(1)}
                </span>
              </div>

              {/* Name & description */}
              <h2 className="text-lg font-bold text-slate-900 mb-1">
                {block.name}
              </h2>
              <p className="text-xs text-[#b89080] leading-relaxed mb-4">
                {block.description}
              </p>

              {/* Stats row */}
              <div className="flex items-center gap-3 text-xs mb-4">
                <div className="flex items-center gap-1.5 text-slate-600">
                  <Bed className="w-3.5 h-3.5" />
                  <span>{blockRooms.length} rooms</span>
                </div>
                <div className="flex items-center gap-1.5 text-green-700">
                  <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                  {availableCount} available
                </div>
                {limitedCount > 0 && (
                  <div className="flex items-center gap-1.5 text-amber-700">
                    <div className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                    {limitedCount} limited
                  </div>
                )}
                {fullCount > 0 && (
                  <div className="flex items-center gap-1.5 text-slate-500">
                    <div className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                    {fullCount} full
                  </div>
                )}
              </div>

              {/* Room type breakdown */}
              <div className="flex flex-wrap gap-1.5 mb-5">
                {(['quad', 'double', 'single'] as const).map((type) => {
                  const count = blockRooms.filter((r) => r.type === type).length;
                  const labels: Record<string, string> = { quad: '4-Bed', double: 'Double', single: 'Single' };
                  return (
                    <span key={type} className="bg-[#fdf7f4] border border-[#e8dcd7] text-[#5C2200] text-[11px] font-medium px-2 py-0.5 rounded-full">
                      {count}× {labels[type]}
                    </span>
                  );
                })}
              </div>

              {/* CTA */}
              <div className="flex items-center gap-1.5 text-sm font-semibold text-[#5C2200]">
                View Rooms
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </button>
            {!isAccessible && (
              <div className="absolute inset-0 z-10 flex items-center justify-center rounded-2xl cursor-not-allowed">
                <div className="bg-white/80 backdrop-blur-md px-4 py-2.5 rounded-xl shadow-sm border border-white/50 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-slate-500" />
                  <span className="text-sm font-bold text-slate-700">Restricted Access</span>
                </div>
              </div>
            )}
            </div>
          );
        })}
      </div>

      {/* ── Progress breadcrumb ── */}
      <div className="flex items-center gap-2 text-xs text-[#b89080]">
        <span className="flex items-center gap-1.5">
          <Building2 className="w-3.5 h-3.5" />
          <span className="font-semibold text-[#5C2200]">Choose Block</span>
        </span>
        <ArrowRight className="w-3 h-3" />
        <span className="flex items-center gap-1.5">
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
