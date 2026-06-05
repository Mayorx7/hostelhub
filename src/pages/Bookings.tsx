import { useEffect, useState } from "react";
import {
  Calendar,
  Clock,
  Bed,
  Plus,
  CheckCircle,
  XCircle,
  AlertCircle,
  Loader2,
  RefreshCw,
  X,
} from "lucide-react";
import { supabase } from "../lib/supabase";

interface Booking {
  booking_id: string;
  source?: "booking" | "application";
  application_id?: string;
  profile_id: string;
  guest_name: string;
  matric_number: string;
  phone: string | null;
  room_number: string;
  room_type: string;
  check_in: string | null;
  check_out: string | null;
  booking_status: string;
  total_amount: number | null;
  booking_date: string | null;
}

interface PendingApplication {
  id: string;
  profile_id?: string | null;
  applicant_name?: string | null;
  full_name?: string | null;
  matric_number?: string | null;
  room_type?: string | null;
  status?: string | null;
  application_date?: string | null;
  created_at?: string | null;
}

const statusConfig = {
  confirmed: { badge: "bg-green-100 text-green-700", icon: CheckCircle, label: "Approved" },
  pending:   { badge: "bg-orange-100 text-orange-700", icon: AlertCircle, label: "Pending" },
  cancelled: { badge: "bg-red-100 text-red-700", icon: XCircle, label: "Cancelled" },
  completed: { badge: "bg-blue-100 text-blue-700", icon: CheckCircle, label: "Completed" },
};

function splitRoomLabel(roomLabel?: string | null) {
  const fallback = "Pending allocation";
  const parts = (roomLabel || "")
    .split("—")
    .map((p) => p.trim())
    .filter(Boolean);
  const firstPart = parts[0] || "";
  const hasRoomNumber =
    /^Room\s+/i.test(firstPart) || /^[A-Z]\d+$/i.test(firstPart);
  return {
    roomNumber: hasRoomNumber ? firstPart.replace(/^Room\s+/i, "") : fallback,
    roomType: parts[1] || roomLabel || fallback,
  };
}

function applicationToPendingBooking(app: PendingApplication): Booking {
  const { roomNumber, roomType } = splitRoomLabel(app.room_type);
  return {
    booking_id: `application-${app.id}`,
    source: "application",
    application_id: app.id,
    profile_id: app.profile_id || "",
    guest_name: app.applicant_name || app.full_name || "Student",
    matric_number: app.matric_number || "N/A",
    phone: null,
    room_number: roomNumber,
    room_type: roomType,
    check_in: null,
    check_out: null,
    booking_status: "pending",
    total_amount: null,
    booking_date: app.application_date || app.created_at || null,
  };
}

const FilterBtn = ({
  children,
  active,
  onClick,
}: {
  children: React.ReactNode;
  active?: boolean;
  onClick: () => void;
}) => (
  <button
    onClick={onClick}
    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
      active
        ? "bg-[#5C2200] text-white shadow-sm"
        : "bg-white text-[#5C2200] border border-[#e8dcd7] hover:bg-[#fdf7f4]"
    }`}
  >
    {children}
  </button>
);

// ─── Review Modal ─────────────────────────────────────────────────────────────

interface ReviewModalProps {
  booking: Booking | null;
  onClose: () => void;
  onAction: (
    applicationId: string,
    action: "approved" | "rejected"
  ) => Promise<void>;
  onComplete: (bookingId: string) => Promise<void>;
  onDeleteBooking: (bookingId: string) => Promise<void>;
  processing: boolean;
}

function ReviewModal({ booking, onClose, onAction, onComplete, onDeleteBooking, processing }: ReviewModalProps) {
  if (!booking) return null;
  const isApp = booking.source === "application";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative bg-white rounded-2xl shadow-2xl border border-[#e8dcd7] w-full max-w-md animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#e8dcd7]">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-[#b89080]">
              {isApp ? "Application Review" : "Booking Details"}
            </p>
            <h2 className="text-base font-bold text-slate-900 mt-0.5">
              {booking.guest_name}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-[#fdf7f4] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: "Matric No.", value: booking.matric_number },
              {
                label: "Requested Room",
                value: booking.room_number,
              },
              { label: "Room Type", value: booking.room_type },
              {
                label: "Applied On",
                value: booking.booking_date
                  ? new Date(booking.booking_date).toLocaleDateString("en-GB", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })
                  : "—",
              },
            ].map((item) => (
              <div
                key={item.label}
                className="rounded-lg bg-[#fdf7f4] border border-[#e8dcd7] px-3.5 py-2.5"
              >
                <p className="text-[10px] font-semibold uppercase tracking-wider text-[#b89080]">
                  {item.label}
                </p>
                <p className="text-sm font-semibold text-slate-900 mt-0.5 truncate">
                  {item.value}
                </p>
              </div>
            ))}
          </div>

          {isApp && (
            <div className="rounded-lg bg-orange-50 border border-orange-100 px-4 py-3 flex gap-2.5 items-start">
              <AlertCircle className="w-4 h-4 text-orange-500 mt-0.5 shrink-0" />
              <p className="text-xs text-orange-700 leading-relaxed">
                Approving will confirm this booking. A confirmed booking record
                will be created and the student's status will update
                immediately.
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-[#e8dcd7] flex items-center gap-3">
          {isApp ? (
            <>
              <button
                onClick={() =>
                  onAction(booking.application_id!, "rejected")
                }
                disabled={processing}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border border-red-200 text-red-600 text-sm font-semibold hover:bg-red-50 transition-colors disabled:opacity-50"
              >
                {processing ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <XCircle className="w-4 h-4" />
                )}
                Reject
              </button>
              <button
                onClick={() =>
                  onAction(booking.application_id!, "approved")
                }
                disabled={processing}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-[#5C2200] text-white text-sm font-semibold hover:bg-[#7A3010] transition-colors disabled:opacity-50"
              >
                {processing ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <CheckCircle className="w-4 h-4" />
                )}
                Approve
              </button>
            </>
          ) : (
            <>
              {booking.booking_status === "confirmed" && (
                <button
                  onClick={() => onComplete(booking.booking_id)}
                  disabled={processing}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-green-600 text-white text-sm font-semibold hover:bg-green-700 transition-colors disabled:opacity-50"
                >
                  {processing ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <CheckCircle className="w-4 h-4" />
                  )}
                  Confirm Move-In
                </button>
              )}
              <button
                onClick={() => onDeleteBooking(booking.booking_id)}
                disabled={processing}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border border-red-200 text-red-600 text-sm font-semibold hover:bg-red-50 transition-colors disabled:opacity-50"
              >
                {processing ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <XCircle className="w-4 h-4" />
                )}
                Delete
              </button>
              <button
                onClick={onClose}
                className="flex-1 px-4 py-2.5 rounded-lg bg-[#5C2200] text-white text-sm font-semibold hover:bg-[#7A3010] transition-colors"
              >
                Close
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Toast ───────────────────────────────────────────────────────────────────

function Toast({
  message,
  type,
}: {
  message: string;
  type: "success" | "error";
}) {
  return (
    <div className="fixed bottom-6 right-6 z-[60] animate-in slide-in-from-bottom-4 fade-in duration-300">
      <div
        className={`flex items-center gap-3 px-4 py-3 rounded-xl shadow-xl border text-sm font-medium ${
          type === "success"
            ? "bg-green-50 border-green-200 text-green-800"
            : "bg-red-50 border-red-200 text-red-800"
        }`}
      >
        {type === "success" ? (
          <CheckCircle className="w-4 h-4 shrink-0" />
        ) : (
          <AlertCircle className="w-4 h-4 shrink-0" />
        )}
        {message}
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function Bookings() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [newBookingPulse, setNewBookingPulse] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [processing, setProcessing] = useState(false);
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);

  function showToast(message: string, type: "success" | "error") {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  }

  async function fetchBookings(isPolling = false) {
    try {
      if (!isPolling) setLoading(true);
      const [bookingsRes, applicationsRes] = await Promise.all([
        supabase
          .from("bookings_view")
          .select("*")
          .order("booking_date", { ascending: false }),
        supabase
          .from("dashboard_applications_view")
          .select("*")
          .eq("status", "pending")
          .order("application_date", { ascending: false }),
      ]);

      if (bookingsRes.error) throw bookingsRes.error;
      if (applicationsRes.error) throw applicationsRes.error;

      const pendingApplications = (
        (applicationsRes.data || []) as PendingApplication[]
      ).map(applicationToPendingBooking);

      const existingBookings = (
        (bookingsRes.data || []) as Booking[]
      ).map((b) => ({ ...b, source: "booking" as const }));

      setBookings(
        [...pendingApplications, ...existingBookings].sort((a, b) => {
          const aTime = a.booking_date
            ? new Date(a.booking_date).getTime()
            : 0;
          const bTime = b.booking_date
            ? new Date(b.booking_date).getTime()
            : 0;
          return bTime - aTime;
        })
      );
    } catch (error) {
      console.error("Error fetching bookings:", error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchBookings();

    const refreshBookings = () => {
      setNewBookingPulse(true);
      fetchBookings(true).then(() => {
        setTimeout(() => setNewBookingPulse(false), 3000);
      });
    };

    const channel = supabase
      .channel("bookings-realtime")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "bookings" },
        refreshBookings
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "applications" },
        refreshBookings
      )
      .subscribe();

    const intervalId = setInterval(() => fetchBookings(true), 10000);

    return () => {
      supabase.removeChannel(channel);
      clearInterval(intervalId);
    };
  }, []);

  // ── Approve / Reject handler ───────────────────────────────────────────────

  async function handleApplicationAction(
    applicationId: string,
    action: "approved" | "rejected"
  ) {
    setProcessing(true);
    try {
      if (action === "rejected") {
        // Delete the application so the student can easily reapply
        const { error: deleteError } = await supabase
          .from("applications")
          .delete()
          .eq("id", applicationId);

        if (deleteError) throw deleteError;
      } else {
        // 1. Update application status to approved and return the row
        const { data: appData, error: appError } = await supabase
          .from("applications")
          .update({ status: action })
          .eq("id", applicationId)
          .select("user_id, room_type")
          .maybeSingle();

        if (appError) throw appError;

        if (!appData) {
          throw new Error(`Application record not found after update (ID: ${applicationId}). RLS might be blocking it or the ID is wrong.`);
        }
        if (!appData.user_id) throw new Error("Application is missing user_id — cannot create booking.");

        // Extract room number from the label stored in room_type (e.g. "A1 — 4-Bed Shared...")
        const firstPart = (appData.room_type || "").split(/[\u2014\u2013-]/)[0].trim();
        const roomNumber = firstPart.replace(/^Room\s+/i, "").trim();

        if (!roomNumber) {
          throw new Error(`Could not parse room number from room_type: "${appData.room_type}". Check the room_type format in the applications table.`);
        }

        const { data: roomData, error: roomError } = await supabase
          .from("rooms")
          .select("id, price")
          .eq("room_number", roomNumber)
          .maybeSingle();

        if (roomError) throw roomError;
        if (!roomData) {
          throw new Error(`Room "${roomNumber}" was not found in the rooms table. Ensure the room_number matches exactly.`);
        }

        // Check if a confirmed booking already exists for this user+room (avoid duplicates)
        const { data: existingBooking } = await supabase
          .from("bookings")
          .select("id")
          .eq("resident_id", appData.user_id)
          .eq("status", "confirmed")
          .maybeSingle();

        if (!existingBooking) {
          const { error: bookingError } = await supabase
            .from("bookings")
            .insert({
              resident_id: appData.user_id,
              room_id: roomData.id,
              status: "confirmed",
              total_amount: roomData.price,
            });

          if (bookingError) {
            console.error("Booking insert error:", bookingError);
            // Provide a more descriptive error for common RLS failures
            if (bookingError.code === "42501" || bookingError.message?.includes("policy")) {
              throw new Error("Permission denied: run bookings_flow_patch.sql in Supabase to grant admin insert rights.");
            }
            throw bookingError;
          }
        }
      }

      setSelectedBooking(null);
      showToast(
        action === "approved"
          ? "Application approved — booking confirmed."
          : "Application rejected and deleted.",
        "success"
      );
      await fetchBookings(true);
    } catch (err: any) {
      console.error("Action error:", err);
      showToast(err.message || "Failed to process action. Please try again.", "error");
    } finally {
      setProcessing(false);
    }
  }

  async function handleCompleteBooking(bookingId: string) {
    setProcessing(true);
    try {
      const { error } = await supabase
        .from("bookings")
        .update({ status: "completed" })
        .eq("id", bookingId);

      if (error) throw error;

      setSelectedBooking(null);
      showToast("Move-in confirmed successfully.", "success");
      await fetchBookings(true);
    } catch (err: any) {
      console.error("Complete error:", err);
      showToast(err.message || "Failed to confirm move-in.", "error");
    } finally {
      setProcessing(false);
    }
  }

  async function handleDeleteBooking(bookingId: string) {
    if (!window.confirm("Are you sure you want to permanently delete this booking?")) return;
    
    setProcessing(true);
    try {
      const { error } = await supabase
        .from("bookings")
        .delete()
        .eq("id", bookingId);

      if (error) throw error;

      setSelectedBooking(null);
      showToast("Booking deleted successfully.", "success");
      await fetchBookings(true);
    } catch (err: any) {
      console.error("Delete error:", err);
      showToast(err.message || "Failed to delete booking.", "error");
    } finally {
      setProcessing(false);
    }
  }

  const filteredBookings = bookings.filter(
    (b) => filter === "all" || b.booking_status === filter
  );

  const thisMonth = bookings.filter((b) => {
    if (!b.booking_date) return false;
    const d = new Date(b.booking_date);
    const now = new Date();
    return (
      d.getMonth() === now.getMonth() &&
      d.getFullYear() === now.getFullYear()
    );
  }).length;

  const stats = [
    {
      label: "Total Bookings",
      value: loading ? "—" : bookings.length.toString(),
      sub: "All time",
      icon: Calendar,
      iconBg: "bg-[#5C2200]",
    },
    {
      label: "Pending",
      value: loading
        ? "—"
        : bookings
            .filter((b) => b.booking_status === "pending")
            .length.toString(),
      sub: "Awaiting review",
      icon: Clock,
      iconBg: "bg-[#7A3010]",
    },
    {
      label: "This Month",
      value: loading ? "—" : thisMonth.toString(),
      sub: "New bookings",
      icon: CheckCircle,
      iconBg: "bg-green-600",
    },
  ];

  return (
    <div className="p-6 space-y-6">
      {/* ── Banner ── */}
      <div className="relative overflow-hidden rounded-2xl bg-[#5C2200]">
        <img
          src="https://images.pexels.com/photos/1438832/pexels-photo-1438832.jpeg?auto=compress&cs=tinysrgb&w=1200"
          alt="Bookings"
          className="absolute inset-0 w-full h-full object-cover opacity-15"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#5C2200]/90 via-[#5C2200]/70 to-[#5C2200]/50" />
        <div className="relative px-8 py-7 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-orange-200 mb-1">
              Reservations
            </p>
            <h1 className="text-2xl font-extrabold text-white">
              Booking Management
            </h1>
            <p className="mt-1 text-orange-100 text-sm">
              Approve pending applications and manage confirmed reservations.
            </p>
          </div>
          <div className="hidden sm:flex items-center gap-2 bg-white/10 border border-white/20 rounded-lg px-3 py-2">
            <span
              className={`w-2 h-2 rounded-full bg-green-400 ${
                newBookingPulse ? "animate-ping" : ""
              }`}
            />
            <span className="text-xs font-semibold text-white">Live</span>
          </div>
        </div>
        <div className="absolute -right-6 -top-6 h-28 w-28 rounded-full bg-white/10 blur-xl" />
      </div>

      {/* ── Stat cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {stats.map((s) => {
          const Icon = s.icon;
          return (
            <div
              key={s.label}
              className="bg-white rounded-xl border border-[#e8dcd7] shadow-sm p-5"
            >
              <div className="flex items-center justify-between mb-3">
                <div
                  className={`${s.iconBg} w-10 h-10 rounded-lg flex items-center justify-center`}
                >
                  <Icon className="w-5 h-5 text-white" />
                </div>
              </div>
              <p className="text-2xl font-bold text-slate-900">
                {loading ? (
                  <span className="inline-block w-8 h-7 bg-[#e8dcd7] rounded-md animate-pulse" />
                ) : (
                  s.value
                )}
              </p>
              <p className="text-sm text-[#b89080] mt-0.5">{s.label}</p>
              <p className="text-xs text-[#5C2200] mt-1">{s.sub}</p>
            </div>
          );
        })}
      </div>

      {/* ── Toolbar ── */}
      <div className="flex flex-col sm:flex-row gap-3 justify-between items-start sm:items-center">
        <div className="flex flex-wrap gap-2">
          <FilterBtn active={filter === "all"} onClick={() => setFilter("all")}>
            All Bookings
          </FilterBtn>
          <FilterBtn
            active={filter === "confirmed"}
            onClick={() => setFilter("confirmed")}
          >
            Approved
          </FilterBtn>
          <FilterBtn
            active={filter === "pending"}
            onClick={() => setFilter("pending")}
          >
            Pending
          </FilterBtn>
          <FilterBtn
            active={filter === "cancelled"}
            onClick={() => setFilter("cancelled")}
          >
            Cancelled
          </FilterBtn>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => fetchBookings()}
            disabled={loading}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium bg-white text-[#5C2200] border border-[#e8dcd7] rounded-lg hover:bg-[#fdf7f4] transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </button>
          <button className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium bg-[#5C2200] text-white rounded-lg hover:bg-[#7A3010] transition-colors shadow-sm">
            <Plus className="w-4 h-4" />
            New Booking
          </button>
        </div>
      </div>

      {/* ── New booking live notification ── */}
      {newBookingPulse && (
        <div className="flex items-center gap-3 bg-green-50 border border-green-200 text-green-800 rounded-xl px-4 py-3 text-sm font-medium">
          <span className="w-2 h-2 rounded-full bg-green-500 animate-ping shrink-0" />
          New booking request received — list updated automatically.
        </div>
      )}

      {/* ── Table ── */}
      <div className="bg-white rounded-xl border border-[#e8dcd7] shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-[#fdf7f4] border-b border-[#e8dcd7]">
              <tr>
                {[
                  "Guest",
                  "Room",
                  "Check-in",
                  "Check-out",
                  "Booked On",
                  "Amount",
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
                  <td colSpan={8} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center gap-2">
                      <Loader2 className="w-8 h-8 text-[#5C2200] animate-spin" />
                      <p className="text-sm text-[#b89080]">
                        Loading bookings…
                      </p>
                    </div>
                  </td>
                </tr>
              ) : filteredBookings.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center">
                    <Calendar className="w-10 h-10 text-[#e8dcd7] mx-auto mb-3" />
                    <p className="text-sm text-[#b89080]">No bookings found.</p>
                    <p className="text-xs text-slate-400 mt-1">
                      Pending applications and approved bookings appear here.
                    </p>
                  </td>
                </tr>
              ) : (
                filteredBookings.map((b) => {
                  const statusKey = b.booking_status as keyof typeof statusConfig;
                  const cfg = statusConfig[statusKey] || statusConfig.pending;
                  const StatusIcon = cfg.icon;
                  return (
                    <tr
                      key={b.booking_id}
                      className="hover:bg-[#fdf7f4] transition-colors"
                    >
                      {/* Guest */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-[#5C2200] flex items-center justify-center text-white text-xs font-bold shrink-0">
                            {b.guest_name
                              ?.split(" ")
                              .map((n) => n[0])
                              .join("") || "U"}
                          </div>
                          <div>
                            <div className="text-sm font-medium text-slate-900">
                              {b.guest_name}
                            </div>
                            <div className="text-xs text-[#b89080]">
                              {b.matric_number}
                            </div>
                          </div>
                        </div>
                      </td>
                      {/* Room */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <Bed className="w-3.5 h-3.5 text-[#b89080]" />
                          <div>
                            <div className="text-sm font-medium text-slate-900">
                              {b.room_number}
                            </div>
                            <div className="text-xs text-[#b89080]">
                              {b.room_type}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-700">
                        {b.check_in
                          ? new Date(b.check_in).toLocaleDateString()
                          : "—"}
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-700">
                        {b.check_out
                          ? new Date(b.check_out).toLocaleDateString()
                          : "—"}
                      </td>
                      <td className="px-6 py-4 text-sm text-[#b89080]">
                        {b.booking_date
                          ? new Date(b.booking_date).toLocaleDateString()
                          : "—"}
                      </td>
                      <td className="px-6 py-4 text-sm font-semibold text-slate-900">
                        {b.total_amount
                          ? `₦${b.total_amount.toLocaleString()}`
                          : b.source === "application"
                          ? "Pending review"
                          : "₦0"}
                      </td>
                      {/* Status */}
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 text-xs font-semibold rounded-full ${cfg.badge}`}
                        >
                          <StatusIcon className="w-3 h-3" />
                          {cfg.label ||
                            b.booking_status.charAt(0).toUpperCase() +
                              b.booking_status.slice(1)}
                        </span>
                      </td>
                      {/* Actions */}
                      <td className="px-6 py-4">
                        {b.source === "application" ? (
                          <button
                            onClick={() => setSelectedBooking(b)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-[#5C2200] text-white hover:bg-[#7A3010] transition-colors"
                          >
                            Review
                          </button>
                        ) : (
                          <button
                            onClick={() => setSelectedBooking(b)}
                            className="text-sm font-medium text-[#5C2200] hover:underline"
                          >
                            Manage
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Review Modal ── */}
      {selectedBooking && (
        <ReviewModal
          booking={selectedBooking}
          onClose={() => setSelectedBooking(null)}
          onAction={handleApplicationAction}
          onComplete={handleCompleteBooking}
          onDeleteBooking={handleDeleteBooking}
          processing={processing}
        />
      )}

      {/* ── Toast ── */}
      {toast && <Toast message={toast.message} type={toast.type} />}
    </div>
  );
}
