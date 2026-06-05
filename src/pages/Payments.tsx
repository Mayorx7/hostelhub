import { useEffect, useState } from "react";
import {
  CreditCard,
  Calendar,
  CheckCircle,
  Clock,
  XCircle,
  Download,
  Filter,
  Loader2,
} from "lucide-react";
import { supabase } from "../lib/supabase";

interface Payment {
  payment_id: string;
  invoice_number: string;
  resident_name: string;
  room_number: string;
  description: string;
  amount: number;
  paid_date: string | null;
  payment_status: "paid" | "pending" | "failed" | "completed";
  created_at: string;
}

const statusConfig = {
  paid: { badge: "bg-green-100 text-green-700", icon: CheckCircle },
  completed: { badge: "bg-green-100 text-green-700", icon: CheckCircle },
  pending: { badge: "bg-orange-100 text-orange-700", icon: Clock },
  failed: { badge: "bg-red-100 text-red-700", icon: XCircle },
  overdue: { badge: "bg-red-100 text-red-700", icon: XCircle },
};

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
    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${active ? "bg-[#5C2200] text-white shadow-sm" : "bg-white text-[#5C2200] border border-[#e8dcd7] hover:bg-[#fdf7f4]"}`}
  >
    {children}
  </button>
);

export default function Payments() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    fetchPayments();
  }, []);

  async function fetchPayments() {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("payments_view")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setPayments(data || []);
    } catch (error) {
      console.error("Error fetching payments:", error);
    } finally {
      setLoading(false);
    }
  }

  const filteredPayments = payments.filter((p) => {
    if (filter === "all") return true;
    if (filter === "paid")
      return p.payment_status === "completed" || p.payment_status === "paid";
    return p.payment_status === filter;
  });

  const totalRevenue = payments
    .filter(
      (p) => p.payment_status === "completed" || p.payment_status === "paid",
    )
    .reduce((s, p) => s + p.amount, 0);
  const pendingAmount = payments
    .filter((p) => p.payment_status === "pending")
    .reduce((s, p) => s + p.amount, 0);
  const failedAmount = payments
    .filter((p) => p.payment_status === "failed")
    .reduce((s, p) => s + p.amount, 0);

  return (
    <div className="p-6 space-y-6">
      {/* ── Banner ── */}
      <div className="relative overflow-hidden rounded-2xl bg-[#5C2200]">
        <img
          src="https://images.pexels.com/photos/259209/pexels-photo-259209.jpeg?auto=compress&cs=tinysrgb&w=1200"
          alt="Payments"
          className="absolute inset-0 w-full h-full object-cover opacity-15"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#5C2200]/90 via-[#5C2200]/70 to-[#5C2200]/50" />
        <div className="relative px-8 py-7">
          <p className="text-xs font-semibold uppercase tracking-widest text-orange-200 mb-1">
            Finance
          </p>
          <h1 className="text-2xl font-extrabold text-white">
            Payment Management
          </h1>
          <p className="mt-1 text-orange-100 text-sm">
            Track and manage all accommodation fee transactions.
          </p>
        </div>
        <div className="absolute -right-6 -top-6 h-28 w-28 rounded-full bg-white/10 blur-xl" />
      </div>

      {/* ── Stat blocks ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            label: "Total Revenue",
            value: `₦${totalRevenue.toLocaleString()}`,
            sub: "Collected all time",
            icon: CheckCircle,
            iconBg: "bg-[#5C2200]",
          },
          {
            label: "Pending",
            value: `₦${pendingAmount.toLocaleString()}`,
            sub: "Awaiting collection",
            icon: Clock,
            iconBg: "bg-[#7A3010]",
          },
          {
            label: "Failed/Overdue",
            value: `₦${failedAmount.toLocaleString()}`,
            sub: "Requires attention",
            icon: XCircle,
            iconBg: "bg-[#5C2200]",
          },
          {
            label: "Total Invoices",
            value: `${payments.length}`,
            sub: "Live records",
            icon: CreditCard,
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
          <FilterBtn active={filter === "all"} onClick={() => setFilter("all")}>
            All Payments
          </FilterBtn>
          <FilterBtn
            active={filter === "paid"}
            onClick={() => setFilter("paid")}
          >
            Paid
          </FilterBtn>
          <FilterBtn
            active={filter === "pending"}
            onClick={() => setFilter("pending")}
          >
            Pending
          </FilterBtn>
          <FilterBtn
            active={filter === "failed"}
            onClick={() => setFilter("failed")}
          >
            Failed
          </FilterBtn>
        </div>
        <div className="flex gap-2">
          <button className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium bg-white text-[#5C2200] border border-[#e8dcd7] rounded-lg hover:bg-[#fdf7f4] transition-colors">
            <Filter className="w-4 h-4" />
            Filter
          </button>
          <button className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium bg-[#5C2200] text-white rounded-lg hover:bg-[#7A3010] transition-colors shadow-sm">
            <Download className="w-4 h-4" />
            Export
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
                  "Invoice",
                  "Resident",
                  "Room",
                  "Description",
                  "Amount",
                  "Due Date",
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
                        Loading payments...
                      </p>
                    </div>
                  </td>
                </tr>
              ) : filteredPayments.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center">
                    <p className="text-sm text-[#b89080]">No payments found.</p>
                  </td>
                </tr>
              ) : (
                filteredPayments.map((p) => {
                  const statusKey =
                    p.payment_status as keyof typeof statusConfig;
                  const cfg = statusConfig[statusKey] || statusConfig.pending;
                  const StatusIcon = cfg.icon;
                  return (
                    <tr
                      key={p.payment_id}
                      className="hover:bg-[#fdf7f4] transition-colors"
                    >
                      {/* Invoice */}
                      <td className="px-6 py-4">
                        <span className="font-mono text-xs font-medium text-slate-700 bg-[#fdf7f4] border border-[#e8dcd7] px-2 py-0.5 rounded">
                          {p.invoice_number || "N/A"}
                        </span>
                      </td>
                      {/* Resident */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-[#5C2200] flex items-center justify-center text-white text-xs font-bold shrink-0">
                            {p.resident_name
                              ?.split(" ")
                              .map((n) => n[0])
                              .join("") || "U"}
                          </div>
                          <span className="text-sm font-medium text-slate-900">
                            {p.resident_name}
                          </span>
                        </div>
                      </td>
                      {/* Room */}
                      <td className="px-6 py-4">
                        <span className="px-2.5 py-0.5 bg-[#fdf7f4] text-[#5C2200] border border-[#e8dcd7] rounded text-xs font-semibold">
                          {p.room_number || "N/A"}
                        </span>
                      </td>
                      {/* Description */}
                      <td className="px-6 py-4">
                        <div className="text-sm text-slate-600">
                          {p.description}
                        </div>
                      </td>
                      {/* Amount */}
                      <td className="px-6 py-4 text-base font-bold text-slate-900">
                        ₦{p.amount.toLocaleString()}
                      </td>
                      {/* Due date */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1.5 text-sm text-slate-600">
                          <Calendar className="w-3.5 h-3.5 text-[#b89080]" />
                          {p.created_at
                            ? new Date(p.created_at).toLocaleDateString()
                            : "N/A"}
                        </div>
                        {p.paid_date && (
                          <div className="text-xs text-[#5C2200] mt-0.5">
                            Paid: {new Date(p.paid_date).toLocaleDateString()}
                          </div>
                        )}
                      </td>
                      {/* Status */}
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 text-xs font-semibold rounded-full ${cfg.badge}`}
                        >
                          <StatusIcon className="w-3 h-3" />
                          {p.payment_status}
                        </span>
                      </td>
                      {/* Actions */}
                      <td className="px-6 py-4">
                        <button className="text-sm font-medium text-[#5C2200] hover:underline">
                          View
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
