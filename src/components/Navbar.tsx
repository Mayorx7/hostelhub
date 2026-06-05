import { NavLink, Link, useNavigate } from 'react-router-dom';
import { LogIn, ClipboardList, LogOut } from 'lucide-react';
import logo from '../assets/logo.jpg';
import Container from './ui/Container';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  const linkClass =
    'rounded-md px-3 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-orange-50 hover:text-[#5C2200]';
  const activeClass = 'bg-orange-50 text-[#5C2200]';

  return (
    <nav className="w-full bg-white border-b border-[#e8dcd7] sticky top-0 z-50">
      <Container>
        <div className="h-16 flex items-center justify-between gap-8">
          {/* Brand */}
          <NavLink to="/" className="flex items-center gap-3 text-left flex-shrink-0">
            <img
              src={logo}
              alt="CUSTECH Hostel Portal Logo"
              className="h-9 w-9 rounded-full object-cover"
            />
            <div>
              <span className="block text-sm font-semibold text-[#5C2200] leading-tight">
                CUSTECH Hostel Portal
              </span>
              <span className="block text-[11px] text-slate-400 leading-tight">
                Confluence University of Science &amp; Technology
              </span>
            </div>
          </NavLink>

          {/* Desktop nav links */}
          <div className="hidden md:flex items-center gap-1">
            <NavLink
              to="/"
              end
              className={({ isActive }) => `${linkClass} ${isActive ? activeClass : ''}`}
            >
              Overview
            </NavLink>
            <NavLink
              to="/how-to-apply"
              className={({ isActive }) => `${linkClass} ${isActive ? activeClass : ''}`}
            >
              How To Apply
            </NavLink>
            <NavLink
              to="/fees"
              className={({ isActive }) => `${linkClass} ${isActive ? activeClass : ''}`}
            >
              Hostel Fees
            </NavLink>
            <NavLink
              to="/rooms"
              className={({ isActive }) => `${linkClass} ${isActive ? activeClass : ''}`}
            >
              Explore Rooms
            </NavLink>
          </div>

          {/* CTA */}
          {user ? (
            <div className="flex items-center gap-3 flex-shrink-0">
              <Link
                to="/apply"
                className="hidden sm:inline-flex items-center gap-2 rounded-lg bg-[#5C2200] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#7A3010] transition-colors"
              >
                <ClipboardList className="h-4 w-4" />
                Apply Now
              </Link>
              <button
                onClick={handleSignOut}
                className="inline-flex items-center gap-2 rounded-lg border border-[#e8dcd7] bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
                title="Sign out"
              >
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:inline">Sign out</span>
              </button>
            </div>
          ) : (
            <Link
              to="/login"
              className="flex-shrink-0 inline-flex items-center gap-2 rounded-lg bg-[#5C2200] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#7A3010] transition-colors"
            >
              <LogIn className="h-4 w-4" />
              Sign In
            </Link>
          )}
        </div>
      </Container>
    </nav>
  );
}
