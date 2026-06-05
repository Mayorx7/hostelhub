import { useEffect, useState, useRef } from "react";
import { Bell, Info, AlertTriangle, CheckCircle } from "lucide-react";
import { supabase } from "../lib/supabase";
import { useAuth } from "../context/AuthContext";

interface Announcement {
  id: string;
  title: string;
  message: string;
  type: "info" | "warning" | "success";
  created_at: string;
}

export default function NotificationsPopover() {
  const { user } = useAuth();
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [hasUnread, setHasUnread] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchAnnouncements();

    // Close when clicking outside
    function handleClickOutside(event: MouseEvent) {
      if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  async function fetchAnnouncements() {
    try {
      // Determine the user's role from metadata
      const role = user?.user_metadata?.role || 'student';
      
      const { data, error } = await supabase
        .from("announcements")
        .select("*")
        .in("target", ["all", role === "admin" ? "staff" : "students", role === "admin" ? "students" : "staff"])
        .order("created_at", { ascending: false })
        .limit(10);

      if (error) {
         if (error.code !== '42P01') console.error(error); // ignore table not found if schema not run yet
         return;
      }

      setAnnouncements(data || []);

      if (data && data.length > 0) {
        const latestTime = new Date(data[0].created_at).getTime();
        const lastRead = localStorage.getItem("lastReadAnnouncement");
        if (!lastRead || parseInt(lastRead) < latestTime) {
          setHasUnread(true);
        }
      }
    } catch (error) {
      console.error("Error fetching notifications:", error);
    }
  }

  const handleToggle = () => {
    setIsOpen(!isOpen);
    if (!isOpen && announcements.length > 0) {
      const latestTime = new Date(announcements[0].created_at).getTime();
      localStorage.setItem("lastReadAnnouncement", latestTime.toString());
      setHasUnread(false);
    }
  };

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
    <div className="relative" ref={popoverRef}>
      <button
        onClick={handleToggle}
        className="relative p-2 text-[#b89080] hover:text-[#5C2200] hover:bg-[#fdf7f4] rounded-lg transition-colors"
      >
        <Bell className={`w-5 h-5 ${hasUnread ? "text-[#5C2200]" : ""}`} />
        {hasUnread && (
          <>
            <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-red-500 rounded-full ring-2 ring-white z-10" />
            <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-red-500 rounded-full animate-ping opacity-75" />
          </>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-xl shadow-xl border border-[#e8dcd7] z-50 overflow-hidden flex flex-col max-h-[80vh]">
          <div className="bg-[#fdf7f4] border-b border-[#e8dcd7] px-4 py-3 flex items-center justify-between">
            <h3 className="font-bold text-[#5C2200]">Notifications</h3>
            {announcements.length > 0 && (
              <span className="text-[10px] font-semibold bg-[#5C2200] text-white px-2 py-0.5 rounded-full">
                {announcements.length} New
              </span>
            )}
          </div>
          
          <div className="overflow-y-auto flex-1 p-2 space-y-2">
            {announcements.length === 0 ? (
              <div className="text-center py-8 text-[#b89080]">
                <Bell className="w-8 h-8 mx-auto mb-2 opacity-20" />
                <p className="text-sm">No new announcements</p>
              </div>
            ) : (
              announcements.map((item) => (
                <div key={item.id} className={`p-3 rounded-lg border ${getTypeClasses(item.type)}`}>
                  <div className="flex gap-3">
                    <div className="mt-0.5 shrink-0 bg-white p-1 rounded-full shadow-sm">
                      {getTypeIcon(item.type)}
                    </div>
                    <div>
                      <h4 className="font-semibold text-sm text-slate-900 leading-tight mb-1">
                        {item.title}
                      </h4>
                      <p className="text-xs text-slate-700 whitespace-pre-wrap leading-relaxed">
                        {item.message}
                      </p>
                      <p className="text-[10px] text-slate-500 mt-2 font-medium">
                        {new Date(item.created_at).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
