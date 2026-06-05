import { useEffect, useState } from "react";
import {
  Bed,
  Search,
  SlidersHorizontal,
  Building2,
  CheckCircle,
  AlertTriangle,
  XCircle,
  Users,
  BarChart3,
  Loader2,
} from "lucide-react";
import { ROOM_TYPE_CONFIG, type RoomType } from "../data/hostel";
import { supabase } from "../lib/supabase";

interface Block {
  id: string;
  name: string;
  gender: "male" | "female";
  description: string;
  total_rooms: number;
}

interface DBRoom {
  room_id: string;
  room_number: string;
  block_id: string;
  block_name: string;
  block_gender: "male" | "female";
  floor: number;
  room_type: string;
  price: number;
  room_status: "available" | "occupied" | "maintenance" | "limited" | "full";
  capacity: number;
  description: string;
  occupied_count: number;
}

// ─── Status badge ──────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: string }) {
  if (status === "available")
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-green-50 text-green-700 text-[11px] font-semibold">
        <CheckCircle className="w-3 h-3" /> Available
      </span>
    );
  if (status === "limited")
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 text-[11px] font-semibold">
        <AlertTriangle className="w-3 h-3" /> Limited
      </span>
    );
  if (status === "full" || status === "occupied")
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 text-[11px] font-semibold">
        <XCircle className="w-3 h-3" /> Full
      </span>
    );
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-red-50 text-red-700 text-[11px] font-semibold">
      <SlidersHorizontal className="w-3 h-3" /> {status}
    </span>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function AdminRooms() {
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [rooms, setRooms] = useState<DBRoom[]>([]);
  const [loading, setLoading] = useState(true);

  const [activeBlock, setActiveBlock] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string | "all">("all");
  const [statusFilter, setStatusFilter] = useState<string | "all">("all");
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    try {
      setLoading(true);
      const [blocksRes, roomsRes] = await Promise.all([
        supabase.from("blocks").select("*").order("id"),
        supabase.from("rooms_view").select("*").order("room_number"),
      ]);

      if (blocksRes.error) throw blocksRes.error;
      if (roomsRes.error) throw roomsRes.error;

      setBlocks(blocksRes.data || []);
      setRooms(roomsRes.data || []);
    } catch (error) {
      console.error("Error fetching room data:", error);
    } finally {
      setLoading(false);
    }
  }

  const filtered = rooms.filter((r) => {
    const matchBlock  = activeBlock  === 'all' || r.block_id === activeBlock;
    
    // Type matching (handles '4-Bed Shared' vs 'quad' labels)
    const matchType   = typeFilter   === 'all' || 
      (typeFilter === 'quad' && r.room_type === '4-Bed Shared') ||
      (typeFilter === 'double' && r.room_type === 'Double') ||
      (typeFilter === 'single' && r.room_type === 'Single');

    // Status matching (handles 'occupied' mapping to 'full')
    const matchStatus = statusFilter === 'all' || 
      (statusFilter === 'full' && (r.room_status === 'full' || r.room_status === 'occupied')) ||
      r.room_status === statusFilter;

    const matchSearch = search === '' ||
      r.room_number.toLowerCase().includes(search.toLowerCase()) ||
      r.block_name.toLowerCase().includes(search.toLowerCase());
      
    return matchBlock && matchType && matchStatus && matchSearch;
  });

  const totalAvailable = rooms.filter(
    (r) => r.room_status === "available",
  ).length;
  const totalLimited = rooms.filter((r) => r.room_status === "limited").length;
  const totalFull = rooms.filter(
    (r) => r.room_status === "full" || r.room_status === "occupied",
  ).length;

  return (
    <div className="p-6 space-y-6">
      {/* ── Banner ── */}
      <div className="relative overflow-hidden rounded-2xl bg-[#5C2200]">
        <div className="absolute inset-0 bg-gradient-to-r from-[#5C2200]/90 via-[#5C2200]/70 to-[#7A3010]/60" />
        <div className="relative px-8 py-7">
          <p className="text-xs font-semibold uppercase tracking-widest text-orange-200 mb-1">
            Management
          </p>
          <h1 className="text-2xl font-extrabold text-white">
            Room Management
          </h1>
          <p className="mt-1 text-orange-100 text-sm">
            All {rooms.length} rooms across {blocks.length} blocks — male &amp;
            female halls.
          </p>
        </div>
        <div className="absolute -right-6 -top-6 h-28 w-28 rounded-full bg-white/10 blur-xl" />
      </div>

      {/* ── Summary stats ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          {
            label: "Total Rooms",
            value: rooms.length,
            icon: Bed,
            color: "text-[#5C2200]",
            bg: "bg-[#fdf7f4]",
          },
          {
            label: "Available",
            value: totalAvailable,
            icon: CheckCircle,
            color: "text-green-700",
            bg: "bg-green-50",
          },
          {
            label: "Limited",
            value: totalLimited,
            icon: AlertTriangle,
            color: "text-amber-700",
            bg: "bg-amber-50",
          },
          {
            label: "Full",
            value: totalFull,
            icon: XCircle,
            color: "text-slate-600",
            bg: "bg-slate-50",
          },
        ].map((s) => {
          const Icon = s.icon;
          return (
            <div
              key={s.label}
              className="bg-white rounded-xl border border-[#e8dcd7] shadow-sm px-5 py-4 flex items-center gap-3"
            >
              <div
                className={`${s.bg} w-10 h-10 rounded-lg flex items-center justify-center shrink-0`}
              >
                <Icon className={`w-5 h-5 ${s.color}`} />
              </div>
              <div>
                <p className={`text-xl font-extrabold ${s.color}`}>
                  {loading ? "—" : s.value}
                </p>
                <p className="text-xs text-[#b89080]">{s.label}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Block overview cards ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {loading
          ? [1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="h-24 bg-white border border-[#e8dcd7] rounded-xl animate-pulse"
              />
            ))
          : blocks.map((b) => {
              const bRooms = rooms.filter((r) => r.block_id === b.id);
              const bAvailable = bRooms.filter(
                (r) => r.room_status === "available",
              ).length;
              const isActive = activeBlock === b.id;
              return (
                <button
                  key={b.id}
                  id={`block-filter-${b.id}`}
                  onClick={() => setActiveBlock(isActive ? "all" : b.id)}
                  className={`rounded-xl border p-4 text-left transition-all ${
                    isActive
                      ? "bg-[#5C2200] border-[#5C2200] shadow-sm"
                      : "bg-white border-[#e8dcd7] hover:border-[#5C2200]/40"
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span
                      className={`text-xl font-extrabold ${isActive ? "text-white" : "text-[#5C2200]"}`}
                    >
                      {b.id}
                    </span>
                    <span
                      className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${
                        b.gender === "male"
                          ? isActive
                            ? "bg-blue-200 text-blue-900"
                            : "bg-blue-50 text-blue-700"
                          : isActive
                            ? "bg-pink-200 text-pink-900"
                            : "bg-pink-50 text-pink-700"
                      }`}
                    >
                      {b.gender === "male" ? "♂" : "♀"}
                    </span>
                  </div>
                  <p
                    className={`text-xs font-semibold ${isActive ? "text-white" : "text-slate-900"}`}
                  >
                    {b.name}
                  </p>
                  <p
                    className={`text-[11px] mt-0.5 ${isActive ? "text-orange-200" : "text-[#b89080]"}`}
                  >
                    {bAvailable}/{bRooms.length} available
                  </p>
                </button>
              );
            })}
      </div>

      {/* ── Toolbar ── */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        {/* Search */}
        <div className="flex items-center gap-2 bg-white border border-[#e8dcd7] rounded-lg px-3 py-2.5 w-full sm:w-72 focus-within:ring-1 focus-within:ring-[#5C2200]/30">
          <Search className="w-4 h-4 text-[#b89080] shrink-0" />
          <input
            type="text"
            placeholder="Search room ID or hall…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-transparent outline-none text-sm w-full text-slate-700 placeholder:text-[#b89080]"
          />
        </div>

        <div className="flex flex-wrap gap-2">
          {/* Type filter */}
          {(["all", "quad", "double", "single"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTypeFilter(t)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                typeFilter === t
                  ? "bg-[#5C2200] text-white border-[#5C2200]"
                  : "bg-white text-slate-600 border-[#e8dcd7] hover:border-[#5C2200]/40"
              }`}
            >
              {t === "all" ? "All Types" : ROOM_TYPE_CONFIG[t].label}
            </button>
          ))}
          <div className="w-px bg-[#e8dcd7]" />
          {/* Status filter */}
          {(["all", "available", "limited", "full"] as const).map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                statusFilter === s
                  ? "bg-[#5C2200] text-white border-[#5C2200]"
                  : "bg-white text-slate-600 border-[#e8dcd7] hover:border-[#5C2200]/40"
              }`}
            >
              {s === "all"
                ? "All Status"
                : s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}
          {(activeBlock !== "all" ||
            typeFilter !== "all" ||
            statusFilter !== "all" ||
            search) && (
            <button
              onClick={() => {
                setActiveBlock("all");
                setTypeFilter("all");
                setStatusFilter("all");
                setSearch("");
              }}
              className="px-3 py-1.5 rounded-lg text-xs font-medium text-[#5C2200] hover:underline"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* ── Results count ── */}
      <p className="text-sm text-[#b89080]">
        Showing{" "}
        <span className="font-semibold text-slate-900">{filtered.length}</span>{" "}
        of {rooms.length} rooms
      </p>

      {/* ── Table ── */}
      <div className="bg-white rounded-xl border border-[#e8dcd7] shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-[#fdf7f4] border-b border-[#e8dcd7]">
              <tr>
                {[
                  "Room",
                  "Block",
                  "Type",
                  "Beds",
                  "Price",
                  "Gender",
                  "Status",
                ].map((h) => (
                  <th
                    key={h}
                    className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-[#b89080]"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#e8dcd7]">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center gap-2">
                      <Loader2 className="w-8 h-8 text-[#5C2200] animate-spin" />
                      <p className="text-sm text-[#b89080]">Loading rooms...</p>
                    </div>
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center">
                    <p className="text-sm text-[#b89080]">
                      No rooms match your filters.
                    </p>
                  </td>
                </tr>
              ) : (
                filtered.map((room) => (
                  <tr
                    key={room.room_id}
                    className="hover:bg-[#fdf7f4] transition-colors"
                  >
                    <td className="px-5 py-3.5">
                      <span className="font-bold text-slate-900 text-sm">
                        Room {room.room_number}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-[#5C2200] flex items-center justify-center shrink-0">
                          <span className="text-white text-xs font-bold">
                            {room.block_id}
                          </span>
                        </div>
                        <span className="text-sm text-slate-700">
                          {room.block_name}
                        </span>
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="text-sm text-slate-700">
                        {room.room_type}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-1">
                        <Bed className="w-3.5 h-3.5 text-[#b89080]" />
                        <span className="text-sm text-slate-700">
                          {room.capacity}
                        </span>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-sm font-semibold text-slate-900">
                      ₦{room.price.toLocaleString()}
                    </td>
                    <td className="px-5 py-3.5">
                      <span
                        className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                          room.block_gender === "male"
                            ? "bg-blue-50 text-blue-700"
                            : "bg-pink-50 text-pink-700"
                        }`}
                      >
                        {room.block_gender === "male" ? "♂ Male" : "♀ Female"}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <StatusBadge status={room.room_status} />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Block capacity summary ── */}
      <div className="bg-white rounded-xl border border-[#e8dcd7] shadow-sm p-6">
        <h2 className="text-sm font-semibold text-slate-900 mb-4 flex items-center gap-2">
          <BarChart3 className="w-4 h-4 text-[#5C2200]" />
          Block Capacity Overview
        </h2>
        <div className="space-y-3">
          {loading ? (
            <div className="h-20 bg-[#fdf7f4] animate-pulse rounded-lg" />
          ) : (
            blocks.map((b) => {
              const bRooms = rooms.filter((r) => r.block_id === b.id);
              const bAvailable = bRooms.filter(
                (r) => r.room_status === "available",
              ).length;
              const bFull = bRooms.filter(
                (r) => r.room_status === "full" || r.room_status === "occupied",
              ).length;
              const pct =
                bRooms.length > 0
                  ? Math.round((bFull / bRooms.length) * 100)
                  : 0;
              return (
                <div key={b.id}>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="font-bold text-slate-800">
                      {b.name} ({b.id})
                    </span>
                    <span className="text-[#b89080]">
                      {pct}% occupied · {bAvailable} available
                    </span>
                  </div>
                  <div className="h-2 bg-[#fdf7f4] border border-[#e8dcd7] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#5C2200] rounded-full transition-all"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })
          )}
        </div>
        <div className="mt-4 flex items-center gap-2 text-xs text-[#b89080]">
          <Users className="w-3.5 h-3.5" />
          Total bed capacity: {rooms.reduce(
            (sum, r) => sum + r.capacity,
            0,
          )}{" "}
          beds across {rooms.length} rooms
        </div>
      </div>
    </div>
  );
}
