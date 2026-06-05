import { useEffect, useState } from "react";
import {
  Mail,
  Phone,
  MapPin,
  Calendar,
  Plus,
  Search,
  Filter,
  Loader2,
} from "lucide-react";
import { supabase } from "../lib/supabase";

interface Resident {
  profile_id: string;
  full_name: string;
  matric_number: string;
  phone: string;
  avatar_url: string;
  room_number: string;
  block: string;
  floor: number;
  room_type: string;
  booking_id: string;
  check_in: string;
  check_out: string;
  booking_status: string;
  total_amount: number;
  resident_since: string;
}

export default function Guests() {
  const [residents, setResidents] = useState<Resident[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchResidents();
  }, []);

  async function fetchResidents() {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("residents_view")
        .select("*")
        .order("full_name", { ascending: true });

      if (error) throw error;
      setResidents(data || []);
    } catch (error) {
      console.error("Error fetching residents:", error);
    } finally {
      setLoading(false);
    }
  }

  const filteredResidents = residents.filter(
    (r) =>
      r.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.room_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.matric_number?.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <div className="p-6 space-y-6">
      {/* ── Banner ── */}
      <div className="relative overflow-hidden rounded-2xl bg-[#5C2200]">
        <img
          src="https://images.pexels.com/photos/1181406/pexels-photo-1181406.jpeg?auto=compress&cs=tinysrgb&w=1200"
          alt="Residents"
          className="absolute inset-0 w-full h-full object-cover opacity-15"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#5C2200]/90 via-[#5C2200]/70 to-[#5C2200]/50" />
        <div className="relative px-8 py-7">
          <p className="text-xs font-semibold uppercase tracking-widest text-orange-200 mb-1">
            Directory
          </p>
          <h1 className="text-2xl font-extrabold text-white">
            Resident Management
          </h1>
          <p className="mt-1 text-orange-100 text-sm">
            Manage and track all hostel residents.
          </p>
        </div>
        <div className="absolute -right-6 -top-6 h-28 w-28 rounded-full bg-white/10 blur-xl" />
      </div>

      {/* ── Toolbar ── */}
      <div className="flex flex-col sm:flex-row gap-3 justify-between items-start sm:items-center">
        <div className="flex items-center gap-2 bg-white border border-[#e8dcd7] rounded-lg px-3 py-2 w-full sm:w-80 focus-within:ring-1 focus-within:ring-[#5C2200]/30 transition-shadow">
          <Search className="w-4 h-4 text-[#b89080] shrink-0" />
          <input
            type="text"
            placeholder="Search by name, matric number, or room…"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="bg-transparent outline-none text-sm w-full text-slate-700 placeholder:text-[#b89080]"
          />
        </div>
        <div className="flex gap-2">
          <button className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium bg-white text-[#5C2200] border border-[#e8dcd7] rounded-lg hover:bg-[#fdf7f4] transition-colors">
            <Filter className="w-4 h-4" />
            Filter
          </button>
          <button className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium bg-[#5C2200] text-white rounded-lg hover:bg-[#7A3010] transition-colors shadow-sm">
            <Plus className="w-4 h-4" />
            Add Resident
          </button>
        </div>
      </div>

      {/* ── Table ── */}
      <div className="bg-white rounded-xl border border-[#e8dcd7] shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-[#fdf7f4] border-b border-[#e8dcd7]">
              <tr>
                {[
                  "Resident",
                  "Contact",
                  "Room",
                  "Check-in",
                  "Check-out",
                  "Status",
                  "Actions",
                ].map((h) => (
                  <th
                    key={h}
                    className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-[#b89080]"
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
                      <p className="text-sm text-[#b89080]">
                        Loading residents...
                      </p>
                    </div>
                  </td>
                </tr>
              ) : filteredResidents.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center">
                    <p className="text-sm text-[#b89080]">
                      No residents found.
                    </p>
                  </td>
                </tr>
              ) : (
                filteredResidents.map((r) => (
                  <tr
                    key={r.booking_id}
                    className="hover:bg-[#fdf7f4] transition-colors"
                  >
                    {/* Resident */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-[#5C2200] flex items-center justify-center text-white text-xs font-bold shrink-0">
                          {r.full_name
                            ?.split(" ")
                            .map((n) => n[0])
                            .join("") || "U"}
                        </div>
                        <div>
                          <div className="text-sm font-medium text-slate-900">
                            {r.full_name}
                          </div>
                          <div className="flex items-center gap-1 text-xs text-[#b89080] mt-0.5">
                            <span className="font-semibold">
                              {r.matric_number}
                            </span>
                          </div>
                        </div>
                      </div>
                    </td>
                    {/* Contact */}
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-xs text-slate-600">
                          <Phone className="w-3.5 h-3.5 text-[#b89080]" />
                          {r.phone || "No phone"}
                        </div>
                      </div>
                    </td>
                    {/* Room */}
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="px-2.5 py-0.5 bg-[#fdf7f4] text-[#5C2200] border border-[#e8dcd7] rounded text-xs font-semibold w-fit">
                          {r.room_number}
                        </span>
                        <span className="text-[10px] text-[#b89080] mt-1">
                          Block {r.block} · Floor {r.floor}
                        </span>
                      </div>
                    </td>
                    {/* Check-in */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5 text-sm text-slate-600">
                        <Calendar className="w-3.5 h-3.5 text-[#b89080]" />
                        {r.check_in || "N/A"}
                      </div>
                    </td>
                    {/* Check-out */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5 text-sm text-slate-600">
                        <Calendar className="w-3.5 h-3.5 text-[#b89080]" />
                        {r.check_out || "N/A"}
                      </div>
                    </td>
                    {/* Status */}
                    <td className="px-6 py-4">
                      <span
                        className={`px-2.5 py-0.5 text-xs font-semibold rounded-full ${
                          r.booking_status === "confirmed"
                            ? "bg-green-100 text-green-700"
                            : "bg-orange-100 text-orange-700"
                        }`}
                      >
                        {r.booking_status.charAt(0).toUpperCase() +
                          r.booking_status.slice(1)}
                      </span>
                    </td>
                    {/* Actions */}
                    <td className="px-6 py-4">
                      <button className="text-sm font-medium text-[#5C2200] hover:underline">
                        Manage
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
