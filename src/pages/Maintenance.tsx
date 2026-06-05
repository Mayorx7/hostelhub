import { useEffect, useState } from "react";
import {
  Wrench,
  AlertTriangle,
  Clock,
  CheckCircle,
  Plus,
  Filter,
  Loader2,
  Trash2,
} from "lucide-react";
import { supabase } from "../lib/supabase";
import { PopupModal } from "../components/ui/PopupModal";

// ─── Types ────────────────────────────────────────────────────────────────────

type Priority = "high" | "medium" | "low";
type Status = "pending" | "in-progress" | "completed";

interface MaintenanceRequest {
  id: string;
  ticket_number: string;
  room: string;
  issue: string;
  description: string;
  reporter_name: string;
  reporter_matric: string | null;
  reported_date: string;
  priority: Priority;
  status: Status;
  assigned_to: string | null;
}

// ─── Config ───────────────────────────────────────────────────────────────────

const priorityConfig: Record<
  Priority,
  { dot: string; badge: string; icon: React.ElementType }
> = {
  high: {
    dot: "#C2410C",
    badge: "bg-red-100 text-red-700 border-red-200",
    icon: AlertTriangle,
  },
  medium: {
    dot: "#B45309",
    badge: "bg-orange-100 text-orange-700 border-orange-200",
    icon: Clock,
  },
  low: {
    dot: "#15803D",
    badge: "bg-green-100 text-green-700 border-green-200",
    icon: Wrench,
  },
};

const statusConfig: Record<Status, { badge: string; text: string }> = {
  pending: { badge: "bg-orange-100 text-orange-700", text: "Pending" },
  "in-progress": { badge: "bg-[#e8dcd7] text-[#5C2200]", text: "In Progress" },
  completed: { badge: "bg-green-100 text-green-700", text: "Completed" },
};

// ─── Sub-components ───────────────────────────────────────────────────────────

const FilterBtn = ({
  children,
  active,
  onClick,
}: {
  children: React.ReactNode;
  active?: boolean;
  onClick?: () => void;
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

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function Maintenance() {
  const [requests, setRequests] = useState<MaintenanceRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeFilter, setActiveFilter] = useState<"all" | Status>("all");
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

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

  // ── Fetch all maintenance requests (admin view — no user_id filter) ──
  const fetchRequests = async () => {
    setLoading(true);
    setError("");

    try {
      const { data, error: fetchError } = await supabase
        .from("maintenance_view")
        .select("*")
        .order("reported_date", { ascending: false });

      if (fetchError) throw fetchError;

      const formattedData = (data || []).map((item: any) => ({
        ...item,
        id: item.request_id, // Map request_id from view to id for the component
      }));

      setRequests(formattedData as MaintenanceRequest[]);
    } catch (err: any) {
      setError(err.message || "Failed to load maintenance requests.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleStatusUpdate = async (id: string, newStatus: Status) => {
    setUpdatingId(id);
    try {
      const { error: updateError } = await supabase
        .from("maintenance_requests")
        .update({ status: newStatus })
        .eq("id", id);

      if (updateError) throw updateError;

      // Update local state
      setRequests((prev) =>
        prev.map((r) => (r.id === id ? { ...r, status: newStatus } : r)),
      );
    } catch (err: any) {
      console.error("Error updating status:", err);
      showError("Failed to update status. Please try again.");
    } finally {
      setUpdatingId(null);
    }
  };

  const confirmDelete = (id: string) => {
    setModalConfig({
      isOpen: true,
      title: "Delete Request",
      description: "Are you sure you want to delete this maintenance request? This action cannot be undone.",
      type: "danger",
      confirmText: "Delete",
      onConfirm: async () => {
        closePopup();
        setDeletingId(id);
        try {
          const { error: deleteError } = await supabase
            .from("maintenance_requests")
            .delete()
            .eq("id", id);

          if (deleteError) throw deleteError;

          setRequests((prev) => prev.filter((r) => r.id !== id));
        } catch (err: any) {
          console.error("Error deleting request:", err);
          showError("Failed to delete request. Please try again.");
        } finally {
          setDeletingId(null);
        }
      },
    });
  };

  const handleDeleteRequest = confirmDelete;

  // ── Derived counts (always from full list, not filtered view) ──
  const pendingCount = requests.filter((r) => r.status === "pending").length;
  const inProgressCount = requests.filter(
    (r) => r.status === "in-progress",
  ).length;
  const completedCount = requests.filter(
    (r) => r.status === "completed",
  ).length;

  // ── Client-side status filter ──
  const visible =
    activeFilter === "all"
      ? requests
      : requests.filter((r) => r.status === activeFilter);

  return (
    <div className="p-6 space-y-6">
      {/* ── Banner ── */}
      <div className="relative overflow-hidden rounded-2xl bg-[#5C2200]">
        <img
          src="https://images.pexels.com/photos/5691608/pexels-photo-5691608.jpeg?auto=compress&cs=tinysrgb&w=1200"
          alt="Maintenance"
          className="absolute inset-0 w-full h-full object-cover opacity-15"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#5C2200]/90 via-[#5C2200]/70 to-[#5C2200]/50" />
        <div className="relative px-8 py-7">
          <p className="text-xs font-semibold uppercase tracking-widest text-orange-200 mb-1">
            Facilities
          </p>
          <h1 className="text-2xl font-extrabold text-white">
            Maintenance Management
          </h1>
          <p className="mt-1 text-orange-100 text-sm">
            Track, assign and resolve all facility requests.
          </p>
        </div>
        <div className="absolute -right-6 -top-6 h-28 w-28 rounded-full bg-white/10 blur-xl" />
      </div>

      {/* ── Stat blocks ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          {
            label: "Pending Requests",
            value: pendingCount,
            sub: "Awaiting assignment",
            icon: Clock,
            iconBg: "bg-[#7A3010]",
          },
          {
            label: "In Progress",
            value: inProgressCount,
            sub: "Being resolved",
            icon: Wrench,
            iconBg: "bg-[#5C2200]",
          },
          {
            label: "Completed",
            value: completedCount,
            sub: "This week",
            icon: CheckCircle,
            iconBg: "bg-[#7A3010]",
          },
        ].map((s) => {
          const Icon = s.icon;
          return (
            <div
              key={s.label}
              className="bg-white rounded-xl border border-[#e8dcd7] shadow-sm p-5"
            >
              <div
                className={`${s.iconBg} w-10 h-10 rounded-lg flex items-center justify-center mb-3`}
              >
                <Icon className="w-5 h-5 text-white" />
              </div>
              <p className="text-2xl font-bold text-slate-900">
                {loading ? "—" : s.value}
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
          {(["all", "pending", "in-progress", "completed"] as const).map(
            (f) => (
              <FilterBtn
                key={f}
                active={activeFilter === f}
                onClick={() => setActiveFilter(f)}
              >
                {f === "all"
                  ? "All Requests"
                  : (statusConfig[f as Status]?.text ?? f)}
              </FilterBtn>
            ),
          )}
        </div>
        <div className="flex gap-2">
          <button className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium bg-white text-[#5C2200] border border-[#e8dcd7] rounded-lg hover:bg-[#fdf7f4] transition-colors">
            <Filter className="w-4 h-4" />
            Filter
          </button>
          <button className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium bg-[#5C2200] text-white rounded-lg hover:bg-[#7A3010] transition-colors shadow-sm">
            <Plus className="w-4 h-4" />
            New Request
          </button>
        </div>
      </div>

      {/* ── Loading state ── */}
      {loading && (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-7 h-7 text-[#5C2200] animate-spin" />
        </div>
      )}

      {/* ── Error state ── */}
      {!loading && error && (
        <div className="rounded-lg bg-rose-50 border border-rose-100 px-4 py-3 text-sm text-rose-700">
          {error}
        </div>
      )}

      {/* ── Empty state ── */}
      {!loading && !error && visible.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <Wrench className="w-10 h-10 text-[#e8dcd7] mb-3" />
          <p className="text-slate-500 text-sm">
            No maintenance requests found.
          </p>
        </div>
      )}

      {/* ── Request cards grid ── */}
      {!loading && !error && visible.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {visible.map((r) => {
            const pCfg = priorityConfig[r.priority];
            const sCfg = statusConfig[r.status];
            const PriorityIcon = pCfg.icon;

            return (
              <div
                key={r.id}
                className="bg-white rounded-xl border border-[#e8dcd7] shadow-sm p-5 hover:shadow-md transition-shadow"
              >
                {/* Card header */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-start gap-3">
                    <div
                      className={`w-9 h-9 rounded-lg flex items-center justify-center border shrink-0 ${pCfg.badge}`}
                    >
                      <PriorityIcon className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-slate-900">
                        {r.issue}
                      </h3>
                      <p className="text-xs font-mono text-[#b89080] mt-0.5">
                        {r.ticket_number}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span
                      className={`px-2.5 py-0.5 text-xs font-semibold rounded-full ${sCfg.badge}`}
                    >
                      {sCfg.text}
                    </span>
                    <button
                      onClick={() => handleDeleteRequest(r.id)}
                      disabled={deletingId === r.id}
                      className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                      title="Delete request"
                    >
                      {deletingId === r.id ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Trash2 className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Description */}
                <p className="text-sm text-slate-500 mb-4 leading-relaxed">
                  {r.description}
                </p>

                {/* Room + priority row */}
                <div className="grid grid-cols-2 gap-3 pb-4 mb-4 border-b border-[#e8dcd7]">
                  <div>
                    <p className="text-xs text-[#b89080] mb-1">Room</p>
                    <span className="px-2.5 py-0.5 bg-[#fdf7f4] text-[#5C2200] border border-[#e8dcd7] rounded text-xs font-semibold">
                      {r.room}
                    </span>
                  </div>
                  <div>
                    <p className="text-xs text-[#b89080] mb-1">Priority</p>
                    <span
                      className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-0.5 rounded border ${pCfg.badge}`}
                    >
                      <span
                        className="w-1.5 h-1.5 rounded-full"
                        style={{ background: pCfg.dot }}
                      />
                      {r.priority}
                    </span>
                  </div>
                </div>

                {/* Meta */}
                <div className="space-y-1.5 text-sm mb-4">
                  <div className="flex justify-between">
                    <span className="text-[#b89080]">Reported by:</span>
                    <span className="font-medium text-slate-900 text-right">
                      {r.reporter_name}
                      {r.reporter_matric && (
                        <span className="block text-[10px] text-[#b89080] font-normal uppercase">
                          {r.reporter_matric}
                        </span>
                      )}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#b89080]">Reported:</span>
                    <span className="font-medium text-slate-900">
                      {r.reported_date
                        ? new Date(r.reported_date).toLocaleString()
                        : "—"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#b89080]">Assigned to:</span>
                    <span
                      className={`font-medium ${!r.assigned_to ? "text-orange-600" : "text-slate-900"}`}
                    >
                      {r.assigned_to ?? "Unassigned"}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col gap-2 pt-4 border-t border-[#e8dcd7]">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-[#b89080] uppercase tracking-wider">
                      Update Status:
                    </span>
                    <div className="flex gap-1.5 flex-1">
                      {(
                        ["pending", "in-progress", "completed"] as Status[]
                      ).map((s) => (
                        <button
                          key={s}
                          onClick={() => handleStatusUpdate(r.id, s)}
                          disabled={updatingId === r.id || r.status === s}
                          className={`flex-1 py-1.5 rounded text-[10px] font-bold uppercase tracking-tight transition-all ${
                            r.status === s
                              ? "bg-[#5C2200] text-white"
                              : "bg-[#fdf7f4] text-[#5C2200] border border-[#e8dcd7] hover:bg-[#e8dcd7]"
                          } disabled:opacity-50 disabled:cursor-not-allowed`}
                        >
                          {updatingId === r.id && r.status !== s ? (
                            <Loader2 className="w-3 h-3 animate-spin mx-auto" />
                          ) : (
                            s.replace("-", " ")
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

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
