import { useEffect, useState } from "react";
import {
  Megaphone,
  Plus,
  Trash2,
  Info,
  AlertTriangle,
  CheckCircle,
  Loader2,
} from "lucide-react";
import { supabase } from "../lib/supabase";
import { useAuth } from "../context/AuthContext";
import { PopupModal } from "../components/ui/PopupModal";

interface Announcement {
  id: string;
  title: string;
  message: string;
  type: "info" | "warning" | "success";
  target: "all" | "students" | "staff";
  created_at: string;
  creator_name?: string;
}

export default function AdminAnnouncements() {
  const { user } = useAuth();
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Form state
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [type, setType] = useState<"info" | "warning" | "success">("info");
  const [target, setTarget] = useState<"all" | "students" | "staff">("all");

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
    fetchAnnouncements();
  }, []);

  async function fetchAnnouncements() {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("announcements_view")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        // Fallback if the view isn't created yet, query the table directly
        if (error.code === '42P01') {
           const fallback = await supabase
            .from("announcements")
            .select("*")
            .order("created_at", { ascending: false });
           if (fallback.error) throw fallback.error;
           setAnnouncements(fallback.data || []);
        } else {
           throw error;
        }
      } else {
        setAnnouncements(data || []);
      }
    } catch (error) {
      console.error("Error fetching announcements:", error);
    } finally {
      setLoading(false);
    }
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!title || !message) return;

    try {
      setSubmitting(true);
      const { error } = await supabase.from("announcements").insert({
        title,
        message,
        type,
        target,
        created_by: user?.id,
      });

      if (error) throw error;

      // Reset form
      setTitle("");
      setMessage("");
      setType("info");
      setTarget("all");
      setIsCreating(false);
      
      // Refresh list
      fetchAnnouncements();
    } catch (error) {
      console.error("Error creating announcement:", error);
      showError("Failed to create announcement.");
    } finally {
      setSubmitting(false);
    }
  }

  const confirmDelete = (id: string) => {
    setModalConfig({
      isOpen: true,
      title: "Delete Announcement",
      description: "Are you sure you want to delete this announcement? This action cannot be undone.",
      type: "danger",
      confirmText: "Delete",
      onConfirm: async () => {
        closePopup();
        try {
          const { error } = await supabase.from("announcements").delete().eq("id", id);
          if (error) throw error;
          setAnnouncements((prev) => prev.filter((a) => a.id !== id));
        } catch (error) {
          console.error("Error deleting announcement:", error);
          showError("Failed to delete announcement.");
        }
      },
    });
  };

  const handleDelete = confirmDelete;

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "warning": return <AlertTriangle className="w-4 h-4 text-amber-500" />;
      case "success": return <CheckCircle className="w-4 h-4 text-green-500" />;
      default: return <Info className="w-4 h-4 text-blue-500" />;
    }
  };

  const getTypeClasses = (type: string) => {
    switch (type) {
      case "warning": return "bg-amber-50 border-amber-200";
      case "success": return "bg-green-50 border-green-200";
      default: return "bg-blue-50 border-blue-200";
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* ── Banner ── */}
      <div className="relative overflow-hidden rounded-2xl bg-[#5C2200]">
        <div className="absolute inset-0 bg-gradient-to-r from-[#5C2200]/90 via-[#5C2200]/70 to-[#7A3010]/60" />
        <div className="relative px-8 py-7 flex justify-between items-center">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-orange-200 mb-1">
              Communication
            </p>
            <h1 className="text-2xl font-extrabold text-white">
              Announcements
            </h1>
            <p className="mt-1 text-orange-100 text-sm">
              Broadcast important information to students and staff.
            </p>
          </div>
          <button
            onClick={() => setIsCreating(!isCreating)}
            className="hidden sm:flex items-center gap-2 px-4 py-2 bg-white text-[#5C2200] rounded-lg font-semibold hover:bg-orange-50 transition-colors"
          >
            {isCreating ? <Megaphone className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
            {isCreating ? "View All" : "New Announcement"}
          </button>
        </div>
        <div className="absolute -right-6 -top-6 h-28 w-28 rounded-full bg-white/10 blur-xl" />
      </div>

      {/* ── Create Form ── */}
      {isCreating && (
        <form onSubmit={handleCreate} className="bg-white rounded-xl border border-[#e8dcd7] shadow-sm p-6 space-y-4">
          <h2 className="text-lg font-bold text-[#5C2200] border-b pb-2 mb-4">Create New Announcement</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-sm font-semibold text-slate-700">Title</label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3 py-2 border border-[#e8dcd7] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5C2200]/30"
                placeholder="e.g., Water Maintenance Tomorrow"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-sm font-semibold text-slate-700">Type</label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value as any)}
                  className="w-full px-3 py-2 border border-[#e8dcd7] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5C2200]/30 bg-white"
                >
                  <option value="info">Info (Blue)</option>
                  <option value="warning">Warning (Amber)</option>
                  <option value="success">Success (Green)</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-sm font-semibold text-slate-700">Target Audience</label>
                <select
                  value={target}
                  onChange={(e) => setTarget(e.target.value as any)}
                  className="w-full px-3 py-2 border border-[#e8dcd7] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5C2200]/30 bg-white"
                >
                  <option value="all">Everyone</option>
                  <option value="students">Students Only</option>
                  <option value="staff">Staff Only</option>
                </select>
              </div>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-sm font-semibold text-slate-700">Message</label>
            <textarea
              required
              rows={4}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full px-3 py-2 border border-[#e8dcd7] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5C2200]/30 resize-none"
              placeholder="Provide the details of the announcement here..."
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setIsCreating(false)}
              className="px-4 py-2 border border-[#e8dcd7] rounded-lg text-slate-600 font-semibold hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 bg-[#5C2200] text-white rounded-lg font-semibold hover:bg-[#7A3010] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Megaphone className="w-4 h-4" />}
              Publish
            </button>
          </div>
        </form>
      )}

      {/* ── Announcements List ── */}
      <div className="space-y-4">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-12">
            <Loader2 className="w-8 h-8 text-[#5C2200] animate-spin" />
            <p className="text-sm text-[#b89080] mt-2">Loading announcements...</p>
          </div>
        ) : announcements.length === 0 ? (
          <div className="bg-white rounded-xl border border-[#e8dcd7] shadow-sm p-12 text-center">
            <Megaphone className="w-12 h-12 text-[#e8dcd7] mx-auto mb-3" />
            <h3 className="text-lg font-semibold text-slate-800">No Announcements</h3>
            <p className="text-slate-500 mt-1">You haven't published any announcements yet.</p>
            {!isCreating && (
              <button
                onClick={() => setIsCreating(true)}
                className="mt-4 px-4 py-2 bg-[#fdf7f4] text-[#5C2200] border border-[#e8dcd7] rounded-lg font-semibold hover:bg-[#e8dcd7] transition-colors"
              >
                Create the first one
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {announcements.map((item) => (
              <div
                key={item.id}
                className={`border rounded-xl p-5 shadow-sm relative ${getTypeClasses(item.type)}`}
              >
                <button
                  onClick={() => handleDelete(item.id)}
                  className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-red-500 hover:bg-white rounded-md transition-colors bg-white/50"
                  title="Delete announcement"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
                <div className="flex items-start gap-3">
                  <div className="mt-1 bg-white p-1.5 rounded-full shadow-sm">
                    {getTypeIcon(item.type)}
                  </div>
                  <div className="pr-8 w-full">
                    <h3 className="font-bold text-slate-900 text-lg mb-1">{item.title}</h3>
                    <p className="text-slate-700 whitespace-pre-wrap text-sm leading-relaxed mb-3">
                      {item.message}
                    </p>
                    <div className="flex items-center gap-4 text-xs font-semibold text-slate-500">
                      <span>Target: <span className="uppercase text-slate-700">{item.target}</span></span>
                      <span>•</span>
                      <span>{new Date(item.created_at).toLocaleString()}</span>
                      {item.creator_name && (
                        <>
                          <span>•</span>
                          <span>By {item.creator_name}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
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
