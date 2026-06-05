import {
  Home,
  Users,
  Bed,
  Calendar,
  CreditCard,
  Wrench,
  BarChart3,
  X,
  LogOut,
  Megaphone,
} from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import logo from '../assets/logo.jpg';
import { useAuth } from '../context/AuthContext';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const menuItems = [
  { id: 'dashboard',   label: 'Dashboard',   icon: Home,      path: '/admin-dashboard' },
  { id: 'rooms',       label: 'Rooms',        icon: Bed,       path: '/admin-dashboard/rooms' },
  { id: 'guests',      label: 'Residents',    icon: Users,     path: '/admin-dashboard/guests' },
  { id: 'bookings',    label: 'Bookings',     icon: Calendar,  path: '/admin-dashboard/bookings' },
  { id: 'payments',    label: 'Payments',     icon: CreditCard, path: '/admin-dashboard/payments' },
  { id: 'maintenance', label: 'Maintenance',  icon: Wrench,    path: '/admin-dashboard/maintenance' },
  { id: 'reports',     label: 'Reports',      icon: BarChart3, path: '/admin-dashboard/reports' },
  { id: 'announcements', label: 'Announcements', icon: Megaphone, path: '/admin-dashboard/announcements' },
];

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, signOut } = useAuth();

  const displayName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Admin';
  const initials = displayName
    .split(' ')
    .map((n: string) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  const handleNav = (path: string) => {
    navigate(path);
    onClose();
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  return (
    <>
      {/* Mobile overlay */}
      <div
        className={`fixed inset-0 bg-black/40 z-20 lg:hidden transition-opacity ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
      />

      <aside
        className={`fixed lg:static inset-y-0 left-0 z-30 w-64 bg-[#5C2200] flex flex-col transform transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Logo header */}
        <div className="flex items-center justify-between h-16 px-5 border-b border-white/10">
          <div className="flex items-center gap-2.5">
            <img
              src={logo}
              alt="CUSTECH Hostel Portal Logo"
              className="h-10 w-10 object-cover rounded-full shrink-0"
            />
            <div>
              <span className="block text-sm font-semibold text-white leading-tight">
                HostelHub
              </span>
              <span className="block text-[10px] text-orange-200 leading-tight">
                CUSTECH Portal
              </span>
            </div>
          </div>
          <button onClick={onClose} className="lg:hidden text-orange-200 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-5 px-3">
          <p className="px-3 mb-3 text-[10px] font-semibold uppercase tracking-widest text-orange-300">
            Navigation
          </p>
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              item.path === '/admin-dashboard'
                ? location.pathname === '/admin-dashboard'
                : location.pathname.startsWith(item.path);

            return (
              <button
                key={item.id}
                onClick={() => handleNav(item.path)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 mb-0.5 rounded-lg transition-all text-left ${
                  isActive
                    ? 'bg-white text-[#5C2200] shadow-sm font-semibold'
                    : 'text-orange-100 hover:bg-white/10 hover:text-white'
                }`}
              >
                <Icon className="w-[18px] h-[18px] shrink-0" />
                <span className="text-sm font-medium">{item.label}</span>
                {isActive && (
                  <span className="ml-auto w-1.5 h-1.5 rounded-full bg-[#5C2200]" />
                )}
              </button>
            );
          })}
        </nav>

        {/* User footer */}
        <div className="p-3 border-t border-white/10">
          <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg mb-1">
            <div className="w-8 h-8 rounded-full bg-orange-200 flex items-center justify-center text-[#5C2200] font-bold text-xs shrink-0">
              {initials}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">{displayName}</p>
              <p className="text-xs text-orange-200 truncate">Administrator</p>
            </div>
          </div>
          <button
            onClick={handleSignOut}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-orange-200 hover:bg-white/10 hover:text-white transition-colors text-sm"
          >
            <LogOut className="w-4 h-4 shrink-0" />
            Sign out
          </button>
        </div>
      </aside>
    </>
  );
}
