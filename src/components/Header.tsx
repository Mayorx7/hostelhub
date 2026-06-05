import { Menu, Bell, Home } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import NotificationsPopover from './NotificationsPopover';

interface HeaderProps {
  onMenuClick: () => void;
}

export default function Header({ onMenuClick }: HeaderProps) {
  const { user } = useAuth();
  const displayName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Admin';
  const initials = displayName
    .split(' ')
    .map((n: string) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <header className="h-16 bg-white border-b border-[#e8dcd7] flex items-center justify-between px-6 shadow-sm shrink-0">
      <div className="flex items-center gap-4">
        <button
          onClick={onMenuClick}
          className="lg:hidden text-[#b89080] hover:text-[#5C2200] transition-colors"
        >
          <Menu className="w-5 h-5" />
        </button>

        <p className="hidden md:block text-sm text-slate-500">
          Welcome back, <span className="font-semibold text-[#5C2200]">{displayName}</span>
        </p>
      </div>

      <div className="flex items-center gap-3">
        <Link
          to="/"
          className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-[#5C2200] bg-[#fdf7f4] border border-[#e8dcd7] rounded-lg hover:bg-[#e8dcd7] transition-colors"
        >
          <Home className="w-3.5 h-3.5" />
          Home
        </Link>

        {/* Notifications */}
        <NotificationsPopover />

        {/* Avatar */}
        <div className="w-8 h-8 rounded-full bg-[#5C2200] flex items-center justify-center text-white text-xs font-bold">
          {initials}
        </div>
      </div>
    </header>
  );
}
