import { useEffect, useRef, useState } from "react";
import {
  TrendingUp,
  TrendingDown,
  Download,
  Users,
  Bed,
  CreditCard,
  Wrench,
  ChevronRight,
  ArrowUpRight,
  ArrowDownRight,
  FileText,
  PieChart,
  BarChart3,
  Loader2,
} from "lucide-react";
import {
  Chart,
  BarController,
  BarElement,
  LineController,
  LineElement,
  PointElement,
  DoughnutController,
  ArcElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Filler,
} from "chart.js";
import { supabase } from "../lib/supabase";

Chart.register(
  BarController, BarElement,
  LineController, LineElement, PointElement,
  DoughnutController, ArcElement,
  CategoryScale, LinearScale,
  Tooltip, Filler
);

// ─── Types ────────────────────────────────────────────────────────────────────

interface ActivityItem {
  type: string;
  text: string;
  sub: string;
  time: string;
  color: string;
  bg: string;
  Icon: any;
}

interface ReportStats {
  occupancy: string;
  revenue: string;
  residents: string;
  maintenance: string;
}

// ─── KPI Card Component ───────────────────────────────────────────────────────

function KpiCard({ card }: { card: any }) {
  const { label, value, change, positive, Icon, accent, iconBg, iconColor, badgeBg, badgeColor } = card;
  const [lifted, setLifted] = useState(false);
  return (
    <div
      onMouseEnter={() => setLifted(true)}
      onMouseLeave={() => setLifted(false)}
      style={{
        background: "#fff",
        borderRadius: 16,
        border: "1px solid #e8dcd7",
        padding: 20,
        position: "relative",
        overflow: "hidden",
        transition: "transform 0.2s, box-shadow 0.2s",
        transform: lifted ? "translateY(-3px)" : "translateY(0)",
        boxShadow: lifted ? "0 8px 28px rgba(92,34,0,0.10)" : "none",
        cursor: "default",
      }}
    >
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, background: accent, borderRadius: "16px 16px 0 0" }} />
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14 }}>
        <div style={{ background: iconBg, borderRadius: 10, padding: 8 }}>
          <Icon style={{ width: 18, height: 18, color: iconColor }} />
        </div>
        <span style={{
          display: "flex", alignItems: "center", gap: 3,
          fontSize: 11, fontWeight: 700,
          background: badgeBg, color: badgeColor,
          padding: "3px 8px", borderRadius: 20,
        }}>
          {positive
            ? <ArrowUpRight style={{ width: 10, height: 10 }} />
            : <ArrowDownRight style={{ width: 10, height: 10 }} />}
          {change}
        </span>
      </div>
      <p style={{ fontSize: 30, fontWeight: 800, color: "#1a0a00", letterSpacing: "-0.04em", margin: 0, fontFamily: "'DM Mono', monospace" }}>
        {value}
      </p>
      <p style={{ fontSize: 12, color: "#b89080", marginTop: 4, fontWeight: 500, marginBottom: 0 }}>{label}</p>
    </div>
  );
}

// ─── Revenue Bar Chart Component ──────────────────────────────────────────────

function RevenueChart({ data }: { data: { month: string; amount: number }[] }) {
  const ref = useRef<HTMLCanvasElement>(null);
  const chartRef = useRef<Chart | null>(null);

  useEffect(() => {
    if (!ref.current) return;
    chartRef.current?.destroy();

    const labels = data.length > 0 ? data.map(d => d.month) : ["Jan", "Feb", "Mar", "Apr", "May", "Jun"];
    const values = data.length > 0 ? data.map(d => d.amount) : [0, 0, 0, 0, 0, 0];

    chartRef.current = new Chart(ref.current, {
      type: "bar",
      data: {
        labels: labels,
        datasets: [{
          label: "Revenue (₦M)",
          data: values,
          backgroundColor: (ctx: any) => ctx.dataIndex === values.length - 1 ? "#5C2200" : "rgba(92,34,0,0.18)",
          hoverBackgroundColor: "#5C2200",
          borderRadius: 7,
          borderSkipped: false,
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        animation: { duration: 1200, easing: "easeOutQuart" },
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: "#1a0a00",
            titleColor: "#fff",
            bodyColor: "rgba(255,255,255,0.75)",
            padding: 10,
            cornerRadius: 8,
            callbacks: { label: (ctx: any) => ` ₦${ctx.parsed.y.toFixed(1)}M` },
          },
        },
        scales: {
          x: { grid: { display: false }, ticks: { color: "#b89080", font: { size: 11 } }, border: { display: false } },
          y: {
            grid: { color: "rgba(0,0,0,0.05)" },
            ticks: { color: "#b89080", font: { size: 11 }, callback: (v: any) => `₦${v}M` },
            border: { display: false },
            beginAtZero: true,
          },
        },
      },
    });
    return () => chartRef.current?.destroy();
  }, [data]);

  const totalRevenue = data.reduce((sum, d) => sum + d.amount, 0).toFixed(1);

  return (
    <div style={{ background: "#fff", borderRadius: 16, border: "1px solid #e8dcd7", overflow: "hidden" }}>
      <div style={{ padding: "16px 20px", borderBottom: "1px solid #f0e6e0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <p style={{ fontSize: 14, fontWeight: 700, color: "#1a0a00", margin: 0 }}>Revenue overview</p>
          <p style={{ fontSize: 11, color: "#b89080", margin: "2px 0 0" }}>Last 6 months · hover bars for details</p>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 6, background: "#fdf7f4", padding: "4px 10px", borderRadius: 8, border: "1px solid #e8dcd7" }}>
          <div style={{ width: 8, height: 8, borderRadius: 2, background: "#5C2200" }} />
          <span style={{ fontSize: 11, fontWeight: 600, color: "#5C2200" }}>₦{totalRevenue}M total</span>
        </div>
      </div>
      <div style={{ padding: "16px 20px 14px", height: 220 }}>
        <canvas ref={ref} />
      </div>
    </div>
  );
}

// ─── Occupancy Donut Component ────────────────────────────────────────────────

function OccupancyDonut({ occupancyRate }: { occupancyRate: string }) {
  const ref = useRef<HTMLCanvasElement>(null);
  const chartRef = useRef<Chart | null>(null);

  const rateNum = parseFloat(occupancyRate) || 0;

  useEffect(() => {
    if (!ref.current) return;
    chartRef.current?.destroy();
    chartRef.current = new Chart(ref.current, {
      type: "doughnut",
      data: {
        labels: ["Occupied", "Available"],
        datasets: [{
          data: [rateNum, 100 - rateNum],
          backgroundColor: ["#5C2200", "#e8dcd7"],
          borderWidth: 3,
          borderColor: "#fff",
          hoverOffset: 6,
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        animation: { duration: 1400 } as any,
        cutout: "68%",
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: "#1a0a00",
            titleColor: "#fff",
            bodyColor: "rgba(255,255,255,0.75)",
            padding: 10,
            cornerRadius: 8,
            callbacks: { label: (ctx: any) => ` ${ctx.parsed}%` },
          },
        },
      },
    });
    return () => chartRef.current?.destroy();
  }, [rateNum]);

  return (
    <div style={{ background: "#fff", borderRadius: 16, border: "1px solid #e8dcd7", overflow: "hidden" }}>
      <div style={{ padding: "16px 20px", borderBottom: "1px solid #f0e6e0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <p style={{ fontSize: 14, fontWeight: 700, color: "#1a0a00", margin: 0 }}>Occupancy analysis</p>
          <p style={{ fontSize: 11, color: "#b89080", margin: "2px 0 0" }}>Live system capacity</p>
        </div>
        <PieChart style={{ width: 16, height: 16, color: "#b89080" }} />
      </div>
      <div style={{ padding: "14px 20px" }}>
        <div style={{ height: 160 }}>
          <canvas ref={ref} />
        </div>
        <div style={{ marginTop: 24, padding: "10px 14px", background: "#fdf7f4", borderRadius: 10, border: "1px solid #e8dcd7", display: "flex", justifyContent: "space-between" }}>
          <span style={{ fontSize: 12, fontWeight: 700, color: "#5C2200" }}>Overall occupancy</span>
          <span style={{ fontSize: 12, fontWeight: 800, color: "#1a0a00", fontFamily: "'DM Mono', monospace" }}>
            {occupancyRate}
          </span>
        </div>
      </div>
    </div>
  );
}

// ─── Trend Line Component ─────────────────────────────────────────────────────

function TrendLineChart() {
  const ref = useRef<HTMLCanvasElement>(null);
  const chartRef = useRef<Chart | null>(null);

  useEffect(() => {
    if (!ref.current) return;
    chartRef.current?.destroy();
    chartRef.current = new Chart(ref.current, {
      type: "line",
      data: {
        labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
        datasets: [
          {
            label: "Bookings",
            data: [38, 44, 40, 52, 50, 61],
            borderColor: "#5C2200",
            backgroundColor: "rgba(92,34,0,0.08)",
            borderWidth: 2,
            pointBackgroundColor: "#5C2200",
            pointRadius: 4,
            pointHoverRadius: 6,
            fill: true,
            tension: 0.4,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        animation: { duration: 1400, easing: "easeOutQuart" },
        interaction: { mode: "index", intersect: false },
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: "#1a0a00",
            titleColor: "#fff",
            bodyColor: "rgba(255,255,255,0.75)",
            padding: 10,
            cornerRadius: 8,
          },
        },
        scales: {
          x: { grid: { display: false }, ticks: { color: "#b89080", font: { size: 11 } }, border: { display: false } },
          y: { grid: { color: "rgba(0,0,0,0.05)" }, ticks: { color: "#b89080", font: { size: 11 } }, border: { display: false }, beginAtZero: true },
        },
      },
    });
    return () => chartRef.current?.destroy();
  }, []);

  return (
    <div style={{ background: "#fff", borderRadius: 16, border: "1px solid #e8dcd7", overflow: "hidden" }}>
      <div style={{ padding: "16px 20px", borderBottom: "1px solid #f0e6e0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <p style={{ fontSize: 14, fontWeight: 700, color: "#1a0a00", margin: 0 }}>Bookings trend</p>
          <p style={{ fontSize: 11, color: "#b89080", margin: "2px 0 0" }}>Monthly volume</p>
        </div>
        <BarChart3 style={{ width: 16, height: 16, color: "#b89080" }} />
      </div>
      <div style={{ padding: "16px 20px 8px", height: 220 }}>
        <canvas ref={ref} />
      </div>
    </div>
  );
}

// ─── Main Page Component ──────────────────────────────────────────────────────

export default function Reports() {
  const [activeTab, setActiveTab] = useState<"overview" | "financial" | "occupancy">("overview");
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<ReportStats>({
    occupancy: "—",
    revenue: "—",
    residents: "—",
    maintenance: "—",
  });
  const [activity, setActivity] = useState<ActivityItem[]>([]);
  const [revenueData, setRevenueData] = useState<{ month: string; amount: number }[]>([]);

  useEffect(() => {
    fetchReportData();
  }, []);

  async function fetchReportData() {
    try {
      setLoading(true);

      const [
        { data: occData },
        { data: revTotal },
        { data: resCount },
        { data: maintCount },
        { data: feedData },
        { data: monthlyRev }
      ] = await Promise.all([
        supabase.from('report_occupancy').select('*').single(),
        supabase.from('student_payments').select('amount').eq('status', 'completed'),
        supabase.from('residents_view').select('*', { count: 'exact', head: true }),
        supabase.from('maintenance_requests').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
        supabase.from('report_activity_feed').select('*'),
        supabase.from('report_revenue_monthly').select('*')
      ]);

      const totalRev = revTotal?.reduce((sum, r) => sum + Number(r.amount), 0) || 0;

      setStats({
        occupancy: occData ? `${occData.occupancy_rate}%` : "0%",
        revenue: `₦${(totalRev / 1000000).toFixed(1)}M`,
        residents: resCount?.toString() || "0",
        maintenance: maintCount?.toString() || "0",
      });

      const iconMap: Record<string, any> = {
        payment: CreditCard,
        booking: Bed,
        maintenance: Wrench
      };

      setActivity((feedData || []).map(item => ({
        ...item,
        Icon: iconMap[item.type] || FileText,
        time: new Date(item.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      })));

      setRevenueData((monthlyRev || []).map(item => ({
        month: item.month,
        amount: Number(item.total_revenue) / 1000000
      })));

    } catch (error) {
      console.error("Error fetching report data:", error);
    } finally {
      setLoading(false);
    }
  }

  const kpiCards = [
    {
      label: "Occupancy rate",
      value: stats.occupancy,
      change: "+2.4%",
      positive: true,
      Icon: Bed,
      accent: "#16a34a",
      iconBg: "#f0fdf4",
      iconColor: "#16a34a",
      badgeBg: "#f0fdf4",
      badgeColor: "#15803d",
    },
    {
      label: "Total revenue",
      value: stats.revenue,
      change: "+12.5%",
      positive: true,
      Icon: CreditCard,
      accent: "#2563eb",
      iconBg: "#eff6ff",
      iconColor: "#2563eb",
      badgeBg: "#eff6ff",
      badgeColor: "#1d4ed8",
    },
    {
      label: "Active residents",
      value: stats.residents,
      change: "Live",
      positive: true,
      Icon: Users,
      accent: "#7c3aed",
      iconBg: "#f5f3ff",
      iconColor: "#7c3aed",
      badgeBg: "#f5f3ff",
      badgeColor: "#7c3aed",
    },
    {
      label: "Pending maintenance",
      value: stats.maintenance,
      change: "Tasks",
      positive: false,
      Icon: Wrench,
      accent: "#d97706",
      iconBg: "#fffbeb",
      iconColor: "#d97706",
      badgeBg: "#fffbeb",
      badgeColor: "#b45309",
    },
  ];

  const performanceMetrics = [
    { name: "Average booking time",  current: "2.4 days",  prev: "3.1 days",  delta: "↓ 22.6%", positive: true },
    { name: "Maintenance response",  current: "4.2 hrs",   prev: "5.8 hrs",   delta: "↓ 27.6%", positive: true },
    { name: "Student satisfaction",  current: "4.8 / 5.0", prev: "4.5 / 5.0", delta: "↑ 6.7%",  positive: true },
    { name: "On-time payments",      current: "94.2%",     prev: "91.8%",     delta: "↑ 2.4%",  positive: true },
  ];

  if (loading) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100vh", background: "#fdf7f4" }}>
        <div style={{ textAlign: "center" }}>
          <Loader2 style={{ width: 40, height: 40, color: "#5C2200", animation: "spin 1s linear infinite", margin: "0 auto 12px" }} />
          <p style={{ fontSize: 14, fontWeight: 600, color: "#b89080" }}>Generating reports...</p>
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        padding: 24,
        background: "linear-gradient(135deg,#fdf7f4 0%,#fef9f7 100%)",
        fontFamily: "'DM Sans', sans-serif",
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&family=DM+Mono:wght@400;500&display=swap');
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        .rpt-tab { transition: all 0.15s ease; }
        .rpt-export:hover { background: #7A3010 !important; }
        .rpt-activity:hover { background: #fdf7f4; padding-left: 26px !important; transition: all 0.15s; }
        .rpt-metricrow:hover { background: #fdf7f4; }
        .rpt-viewlog:hover { background: #f5ede8 !important; }
        @keyframes livepulse { 0%,100%{opacity:1;} 50%{opacity:0.25;} }
      `}</style>

      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 20, flexWrap: "wrap", gap: 12 }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
            <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#5C2200" }} />
            <span style={{ fontSize: 10, fontWeight: 700, color: "#b89080", letterSpacing: "0.1em", textTransform: "uppercase" }}>
              CUSTECH Portal
            </span>
          </div>
          <h1 style={{ fontSize: 26, fontWeight: 800, color: "#1a0a00", letterSpacing: "-0.03em", margin: 0, lineHeight: 1.1 }}>
            Reports & analytics
          </h1>
          <p style={{ fontSize: 13, color: "#b89080", marginTop: 4, marginBottom: 0 }}>
            Current semester · Updated just now
          </p>
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
          <div style={{ display: "flex", gap: 4, background: "#fff", border: "1px solid #e8dcd7", borderRadius: 10, padding: 4 }}>
            {(["overview", "financial", "occupancy"] as const).map(tab => (
              <button
                key={tab}
                className="rpt-tab"
                onClick={() => setActiveTab(tab)}
                style={{
                  padding: "6px 14px", borderRadius: 7, fontSize: 12, fontWeight: 600,
                  border: "none", cursor: "pointer", textTransform: "capitalize",
                  background: activeTab === tab ? "#5C2200" : "transparent",
                  color: activeTab === tab ? "#fff" : "#b89080",
                  transition: "all 0.15s",
                }}
              >
                {tab}
              </button>
            ))}
          </div>
          <button
            className="rpt-export"
            style={{
              display: "flex", alignItems: "center", gap: 6,
              padding: "9px 16px", fontSize: 13, fontWeight: 600,
              background: "#5C2200", color: "#fff", border: "none",
              borderRadius: 10, cursor: "pointer", transition: "background 0.15s",
            }}
          >
            <Download style={{ width: 14, height: 14 }} />
            Export
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))", gap: 14, marginBottom: 18 }}>
        {kpiCards.map(card => <KpiCard key={card.label} card={card} />)}
      </div>

      {/* Charts row */}
      <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: 14, marginBottom: 18 }}>
        <RevenueChart data={revenueData} />
        <OccupancyDonut occupancyRate={stats.occupancy} />
      </div>

      {/* Bottom row */}
      <div style={{ display: "grid", gridTemplateColumns: "1.3fr 1fr", gap: 14, marginBottom: 18 }}>
        <TrendLineChart />

        {/* Activity feed */}
        <div style={{ background: "#fff", borderRadius: 16, border: "1px solid #e8dcd7", overflow: "hidden", display: "flex", flexDirection: "column" }}>
          <div style={{ padding: "16px 20px", borderBottom: "1px solid #f0e6e0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <p style={{ fontSize: 14, fontWeight: 700, color: "#1a0a00", margin: 0 }}>Recent activity</p>
              <p style={{ fontSize: 11, color: "#b89080", margin: "2px 0 0" }}>Live feed</p>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
              <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#16a34a", display: "inline-block", animation: "livepulse 2s infinite" }} />
              <span style={{ fontSize: 11, fontWeight: 600, color: "#16a34a" }}>Live</span>
            </div>
          </div>
          <div style={{ flex: 1 }}>
            {activity.length === 0 ? (
              <div style={{ padding: 40, textAlign: "center", color: "#b89080", fontSize: 12 }}>
                No recent activity to show.
              </div>
            ) : (
              activity.map((item, i) => (
                <div
                  key={i}
                  className="rpt-activity"
                  style={{
                    display: "flex", alignItems: "flex-start", gap: 10,
                    padding: "13px 20px",
                    borderBottom: i < activity.length - 1 ? "1px solid #f5ede8" : "none",
                    transition: "all 0.15s",
                  }}
                >
                  <div style={{ width: 34, height: 34, borderRadius: 10, background: item.bg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <item.Icon style={{ width: 14, height: 14, color: item.color }} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: 12, fontWeight: 600, color: "#1a0a00", margin: 0, lineHeight: 1.4 }}>{item.text}</p>
                    <p style={{ fontSize: 11, color: "#b89080", margin: "2px 0 0" }}>{item.sub} · {item.time}</p>
                  </div>
                </div>
              ))
            )}
          </div>
          <div style={{ padding: "14px 20px", borderTop: "1px solid #f0e6e0" }}>
            <button
              className="rpt-viewlog"
              style={{
                width: "100%", padding: 9, background: "#fdf7f4",
                border: "1px solid #e8dcd7", borderRadius: 9, fontSize: 12,
                fontWeight: 700, color: "#5C2200", cursor: "pointer",
                display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                transition: "background 0.15s",
              }}
            >
              <FileText style={{ width: 13, height: 13 }} />
              View full activity log
            </button>
          </div>
        </div>
      </div>

      {/* Performance Metrics Table */}
      <div style={{ background: "#fff", borderRadius: 16, border: "1px solid #e8dcd7", overflow: "hidden" }}>
        <div style={{ padding: "16px 20px", borderBottom: "1px solid #f0e6e0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <p style={{ fontSize: 14, fontWeight: 700, color: "#1a0a00", margin: 0 }}>Performance metrics</p>
            <p style={{ fontSize: 11, color: "#b89080", margin: "2px 0 0" }}>Period-over-period comparison</p>
          </div>
          <button style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 11, fontWeight: 700, color: "#5C2200", background: "none", border: "none", cursor: "pointer" }}>
            Full report <ChevronRight style={{ width: 12, height: 12 }} />
          </button>
        </div>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "#fdf7f4" }}>
                {["Metric", "Current period", "Previous period", "Change"].map(h => (
                  <th key={h} style={{ padding: "10px 20px", textAlign: "left", fontSize: 10, fontWeight: 700, color: "#b89080", textTransform: "uppercase", letterSpacing: "0.08em" }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {performanceMetrics.map((m) => (
                <tr key={m.name} className="rpt-metricrow" style={{ borderTop: "1px solid #f0e6e0" }}>
                  <td style={{ padding: "14px 20px", fontSize: 13, fontWeight: 600, color: "#1a0a00" }}>{m.name}</td>
                  <td style={{ padding: "14px 20px", fontSize: 13, fontWeight: 700, color: "#1a0a00", fontFamily: "'DM Mono', monospace" }}>{m.current}</td>
                  <td style={{ padding: "14px 20px", fontSize: 12, color: "#b89080", fontFamily: "'DM Mono', monospace" }}>{m.prev}</td>
                  <td style={{ padding: "14px 20px" }}>
                    <span style={{
                      display: "inline-flex", alignItems: "center", gap: 4,
                      fontSize: 11, fontWeight: 700,
                      background: m.positive ? "#f0fdf4" : "#fef2f2",
                      color: m.positive ? "#15803d" : "#dc2626",
                      padding: "3px 10px", borderRadius: 20,
                      fontFamily: "'DM Mono', monospace",
                    }}>
                      {m.positive
                        ? <TrendingUp style={{ width: 10, height: 10 }} />
                        : <TrendingDown style={{ width: 10, height: 10 }} />}
                      {m.delta}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
