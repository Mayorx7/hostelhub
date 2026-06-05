import { useEffect, useState } from "react";
import {
  Users,
  Bed,
  Calendar,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  AlertTriangle,
  Loader2,
  XCircle,
} from "lucide-react";
import { PopupModal } from "../components/ui/PopupModal";
import { supabase } from "../lib/supabase";
// We now fetch rooms and blocks from Supabase instead of using static data.
interface Block {
  id: string;
  name: string;
  gender: "male" | "female";
  letter: string;
}

interface DBRoom {
  room_id: string;
  room_number: string;
  block_id: string;
  room_status: "available" | "occupied" | "maintenance" | "limited" | "full";
  capacity: number;
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function Dashboard() {
  const [residentCount, setResidentCount] = useState<number | string>("—");
  const [pendingApps, setPendingApps] = useState<number | string>("—");
  const [recentApplications, setRecentApplications] = useState<any[]>([]);
  const [maintenanceAlerts, setMaintenanceAlerts] = useState<any[]>([]);
  const [dbRooms, setDbRooms] = useState<DBRoom[]>([]);
  const [dbBlocks, setDbBlocks] = useState<Block[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);

  // Modal State
  const [modalConfig, setModalConfig] = useState<{
    isOpen: boolean;
    title: string;
    description: string;
    type: "danger" | "warning" | "info" | "success";
    confirmText?: string;
    onConfirm?: () => void;
  }>({
    isOpen: false,
    title: "",
    description: "",
    type: "info",
  });

  const closePopup = () => setModalConfig((prev) => ({ ...prev, isOpen: false }));
  
  const showError = (message: string) => {
    setModalConfig({
      isOpen: true,
      title: "Error",
      description: message,
      type: "danger",
    });
  };

  useEffect(() => {
    fetchDashboardData();

    // Listen for realtime updates on applications and maintenance requests
    // (This requires the tables to be in the 'supabase_realtime' publication)
    const channel = supabase
      .channel("dashboard-realtime")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "applications" },
        () => fetchDashboardData()
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "maintenance_requests" },
        () => fetchDashboardData()
      )
      .subscribe();

    // Fallback polling every 10 seconds in case realtime isn't enabled on the DB
    const intervalId = setInterval(() => {
      fetchDashboardData(true);
    }, 10000);

    return () => {
      supabase.removeChannel(channel);
      clearInterval(intervalId);
    };
  }, []);

  async function fetchDashboardData(isPolling = false) {
    try {
      if (!isPolling) setLoading(true);

      const [
        { count: resCount },
        { count: appCount },
        { data: apps },
        { data: alerts },
        { data: dbRoomsData },
        { data: dbBlocksData },
      ] = await Promise.all([
        supabase
          .from("residents_view")
          .select("*", { count: "exact", head: true }),
        supabase
          .from("applications")
          .select("*", { count: "exact", head: true })
          .eq("status", "pending"),
        supabase
          .from("dashboard_applications_view")
          .select("*")
          .order("application_date", { ascending: false })
          .limit(5),
        supabase
          .from("maintenance_requests")
          .select("*")
          .eq("status", "pending")
          .order("reported_date", { ascending: false })
          .limit(3),
        supabase.from("rooms_view").select("*"),
        supabase.from("blocks").select("*").order("id"),
      ]);

      setResidentCount(resCount || 0);
      setPendingApps(appCount || 0);
      setRecentApplications(apps || []);
      setMaintenanceAlerts(alerts || []);
      // @ts-ignore (we only use a subset of fields for the dashboard logic)
      setDbRooms(dbRoomsData || []);
      setDbBlocks(dbBlocksData || []);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  }

  const handleApplicationAction = async (
    id: string,
    status: "approved" | "rejected",
  ) => {
    try {
      setProcessingId(id);
      
      if (status === "rejected") {
        // Delete the application so the student can easily reapply
        const { error: deleteError } = await supabase
          .from("applications")
          .delete()
          .eq("id", id);

        if (deleteError) throw deleteError;
      } else {
        // Update application to approved and fetch data atomically
        const { data: appData, error: appError } = await supabase
          .from("applications")
          .update({ status })
          .eq("id", id)
          .select("user_id, room_type")
          .maybeSingle();

        if (appError) throw appError;

        if (!appData) {
          throw new Error(`Application record not found after update (ID: ${id}). Please ensure the database RLS policies are up to date.`);
        }

        const firstPart = (appData.room_type || "").split(/[\u2014\u2013-]/)[0].trim();
        const roomNumber = firstPart.replace(/^Room\s+/i, "").trim();

        if (!roomNumber) {
          throw new Error("Could not parse room number from: " + appData.room_type);
        }

        const { data: roomData } = await supabase
          .from("rooms")
          .select("id, price")
          .eq("room_number", roomNumber)
          .single();

        if (!roomData) {
          throw new Error("Room not found in database: " + roomNumber);
        }

        // Check for existing booking to prevent 409 Conflict
        const { data: existingBooking } = await supabase
          .from("bookings")
          .select("id")
          .eq("resident_id", appData.user_id)
          .eq("status", "confirmed")
          .maybeSingle();

        if (!existingBooking) {
          const { error: bookingError } = await supabase.from("bookings").insert({
            resident_id: appData.user_id,
            room_id: roomData.id,
            status: "confirmed",
            total_amount: roomData.price,
          });
          if (bookingError) {
            console.error("Failed to create booking:", bookingError);
            throw bookingError;
          }
        }
      }

      // Update local state (remove it from recent since it's processed/deleted)
      setRecentApplications((prev) =>
        prev.map((a) => (a.id === id ? { ...a, status } : a)),
      );

      // Decrement pending count
      setPendingApps((prev) =>
        typeof prev === "number" ? Math.max(0, prev - 1) : prev,
      );
      
      setModalConfig({
        isOpen: true,
        title: "Success",
        description: status === "approved" ? "Application approved and booking confirmed." : "Application rejected and deleted.",
        type: "success",
      });
      
    } catch (error: any) {
      console.error("Error updating application status:", error);
      showError(error.message || "Failed to update application status");
    } finally {
      setProcessingId(null);
      fetchDashboardData(true); // Refresh data completely
    }
  };

  // ─── Calculate Dynamic Stats ───────────────────────────────────────────────
  const totalRooms = dbRooms.length;
  const availableRooms = dbRooms.filter((r) => r.room_status === "available").length;
  const fullRooms = dbRooms.filter((r) => r.room_status === "full" || r.room_status === "occupied").length;
  const occupancyPct = totalRooms > 0 ? Math.round((fullRooms / totalRooms) * 100) : 0;
  const totalBeds = dbRooms.reduce((sum, r) => sum + r.capacity, 0);

  const stats = [
    {
      label: "Total Rooms",
      value: `${totalRooms}`,
      sub: `${dbBlocks.length} blocks`,
      icon: Bed,
      color: "bg-[#5C2200]",
      change: `${availableRooms} available`,
    },
    {
      label: "Occupancy Rate",
      value: `${occupancyPct}%`,
      sub: `${fullRooms} full rooms`,
      icon: TrendingUp,
      color: "bg-green-600",
      change: `${totalBeds} total beds`,
    },
    {
      label: "Pending Applications",
      value: `${pendingApps}`,
      sub: "Live from Supabase",
      icon: Calendar,
      color: "bg-orange-500",
      change: "Real-time data",
    },
    {
      label: "Total Residents",
      value: `${residentCount}`,
      sub: "Live from Supabase",
      icon: Users,
      color: "bg-[#7A3010]",
      change: "Real-time data",
    },
  ];

  const statusStyles: Record<string, string> = {
    approved: "bg-green-100 text-green-700",
    pending: "bg-orange-100 text-orange-700",
    rejected: "bg-red-100 text-red-700",
  };

  return (
    <div className="p-6 space-y-6">
      {/* ── Banner ── */}
      <div className="relative h-44 rounded-2xl overflow-hidden">
        <img
          src="https://images.pexels.com/photos/271624/pexels-photo-271624.jpeg?auto=compress&cs=tinysrgb&w=1200"
          alt="Hostel building"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#5C2200]/90 via-[#5C2200]/70 to-transparent flex items-center">
          <div className="px-8">
            <p className="text-xs font-semibold uppercase tracking-widest text-orange-200 mb-1">
              Admin Panel
            </p>
            <h1 className="text-3xl font-extrabold text-white">
              Dashboard Overview
            </h1>
            <p className="text-orange-100 text-sm mt-1">
              {totalRooms} rooms across {dbBlocks.length} halls · {availableRooms}{" "}
              currently available
            </p>
          </div>
        </div>
      </div>

      {/* ── Stat cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s) => {
          const Icon = s.icon;
          return (
            <div
              key={s.label}
              className="bg-white rounded-xl border border-[#e8dcd7] shadow-sm p-5"
            >
              <div className="flex items-center justify-between mb-3">
                <div
                  className={`${s.color} w-10 h-10 rounded-lg flex items-center justify-center`}
                >
                  <Icon className="w-5 h-5 text-white" />
                </div>
              </div>
              <p className="text-2xl font-extrabold text-slate-900">
                {s.value}
              </p>
              <p className="text-sm text-[#b89080] mt-0.5">{s.label}</p>
              <p className="text-xs text-[#5C2200] font-medium mt-1">
                {s.change}
              </p>
            </div>
          );
        })}
      </div>

      {/* ── Block capacity strip ── */}
      <div className="bg-white rounded-xl border border-[#e8dcd7] shadow-sm p-5">
        <h2 className="text-sm font-semibold text-slate-900 mb-4">
          Block Occupancy
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {dbBlocks.map((b) => {
            const bRooms = dbRooms.filter((r) => r.block_id === b.id);
            const bFull = bRooms.filter((r) => r.room_status === "full" || r.room_status === "occupied").length;
            const bAvail = bRooms.filter(
              (r) => r.room_status === "available",
            ).length;
            const bLimited = bRooms.filter(
              (r) => r.room_status === "limited",
            ).length;
            return (
              <div
                key={b.id}
                className="rounded-xl border border-[#e8dcd7] p-4"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xl font-extrabold text-[#5C2200]">
                    {b.id}
                  </span>
                  <span
                    className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${
                      b.gender === "male"
                        ? "bg-blue-50 text-blue-700"
                        : "bg-pink-50 text-pink-700"
                    }`}
                  >
                    {b.gender === "male" ? "♂" : "♀"}
                  </span>
                </div>
                <p className="text-xs font-semibold text-slate-800 mb-0.5">
                  {b.name}
                </p>
                <div className="space-y-0.5 text-[11px] text-[#b89080]">
                  <div className="flex justify-between">
                    <span className="text-green-700">Available</span>
                    <span>{bAvail}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-amber-700">Limited</span>
                    <span>{bLimited}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Full</span>
                    <span>{bFull}</span>
                  </div>
                </div>
                <div className="mt-2 h-1.5 bg-[#e8dcd7] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#5C2200] rounded-full transition-all"
                    style={{
                      width: `${bRooms.length > 0 ? Math.round((bFull / bRooms.length) * 100) : 0}%`,
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Recent applications + maintenance ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Applications table */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-[#e8dcd7] shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-[#e8dcd7]">
            <h2 className="text-sm font-semibold text-slate-900">
              Recent Applications
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-[#fdf7f4]">
                <tr>
                  {["Applicant", "Room", "Date", "Status", "Actions"].map(
                    (h) => (
                      <th
                        key={h}
                        className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-[#b89080]"
                      >
                        {h}
                      </th>
                    ),
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#e8dcd7]">
                {loading ? (
                  // Loading skeleton rows
                  [...Array(3)].map((_, i) => (
                    <tr key={i}>
                      {[...Array(5)].map((_, j) => (
                        <td key={j} className="px-5 py-4">
                          <div className="h-4 bg-[#e8dcd7] rounded-full animate-pulse" style={{ width: `${60 + (j % 3) * 20}%` }} />
                        </td>
                      ))}
                    </tr>
                  ))
                ) : recentApplications.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-5 py-10 text-center">
                      <Calendar className="w-8 h-8 text-[#e8dcd7] mx-auto mb-2" />
                      <p className="text-sm text-[#b89080]">No applications yet.</p>
                      <p className="text-xs text-slate-400 mt-0.5">Student applications will appear here once submitted.</p>
                    </td>
                  </tr>
                ) : recentApplications.map((a) => (
                  <tr
                    key={a.id}
                    className="hover:bg-[#fdf7f4] transition-colors"
                  >
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-[#5C2200] flex items-center justify-center text-white text-xs font-bold shrink-0">
                          {a.applicant_name
                            ?.split(" ")
                            .map((n: string) => n[0])
                            .join("") || "U"}
                        </div>
                        <span className="text-sm font-medium text-slate-900">
                          {a.applicant_name}
                        </span>
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="text-sm text-slate-700 font-medium">
                        {a.room_type}
                      </div>
                      <div className="text-xs text-[#b89080]">
                        {a.matric_number}
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-sm text-slate-600">
                      {a.application_date
                        ? new Date(a.application_date).toLocaleDateString()
                        : "—"}
                    </td>
                    <td className="px-5 py-3.5">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${statusStyles[a.status] || "bg-slate-100 text-slate-700"}`}
                      >
                        {a.status === "approved" && (
                          <CheckCircle className="w-3 h-3" />
                        )}
                        {a.status === "pending" && (
                          <AlertTriangle className="w-3 h-3" />
                        )}
                        {a.status === "rejected" && (
                          <AlertCircle className="w-3 h-3" />
                        )}
                        {a.status?.charAt(0).toUpperCase() + a.status?.slice(1)}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      {a.status === "pending" ? (
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() =>
                              handleApplicationAction(a.id, "approved")
                            }
                            disabled={!!processingId}
                            className="p-1 text-green-600 hover:bg-green-50 rounded transition-colors disabled:opacity-50"
                            title="Approve"
                          >
                            <CheckCircle className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() =>
                              handleApplicationAction(a.id, "rejected")
                            }
                            disabled={!!processingId}
                            className="p-1 text-red-600 hover:bg-red-50 rounded transition-colors disabled:opacity-50"
                            title="Reject"
                          >
                            <XCircle className="w-5 h-5" />
                          </button>
                        </div>
                      ) : (
                        <span className="text-xs text-[#b89080] italic">
                          Processed
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Maintenance alerts */}
        <div className="bg-white rounded-xl border border-[#e8dcd7] shadow-sm">
          <div className="px-6 py-4 border-b border-[#e8dcd7]">
            <h2 className="text-sm font-semibold text-slate-900">
              Maintenance Alerts
            </h2>
          </div>
          <div className="p-4 space-y-3">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-8 text-[#b89080]">
                <Loader2 className="w-6 h-6 animate-spin mb-2" />
                <p className="text-xs">Loading alerts...</p>
              </div>
            ) : maintenanceAlerts.length === 0 ? (
              <p className="text-xs text-center py-8 text-[#b89080]">
                No pending alerts.
              </p>
            ) : (
              maintenanceAlerts.map((a) => (
                <div
                  key={a.id}
                  className={`flex gap-3 p-3.5 rounded-lg border-l-4 bg-[#fdf7f4] ${
                    a.priority === "high"
                      ? "border-red-500"
                      : "border-amber-400"
                  }`}
                >
                  <AlertCircle
                    className={`w-4 h-4 mt-0.5 shrink-0 ${a.priority === "high" ? "text-red-500" : "text-amber-500"}`}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-0.5">
                      <span className="text-xs font-bold text-slate-900">
                        Room {a.room}
                      </span>
                      <span
                        className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${
                          a.priority === "high"
                            ? "bg-red-100 text-red-700"
                            : "bg-amber-100 text-amber-700"
                        }`}
                      >
                        {a.priority}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed truncate">
                      {a.issue}
                    </p>
                    <p className="text-[11px] text-[#b89080] mt-0.5">
                      {a.reported_date
                        ? new Date(a.reported_date).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })
                        : "—"}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Popup Modal */}
      <PopupModal
        isOpen={modalConfig.isOpen}
        onClose={closePopup}
        title={modalConfig.title}
        description={modalConfig.description}
        type={modalConfig.type}
        confirmText={modalConfig.confirmText}
        onConfirm={modalConfig.onConfirm}
      />
    </div>
  );
}
