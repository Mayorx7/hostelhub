import { Link } from 'react-router-dom';
import logo from '../assets/logo.jpg';

export default function Footer() {
  return (
    <footer className="border-t border-[#e8dcd7] bg-[#5C2200]">
      <div className="mx-auto max-w-7xl px-6 py-10">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-3">
              <img
                src={logo}
                alt="CUSTECH Hostel Portal Logo"
                className="h-10 w-10 rounded-full object-cover"
              />
              <div>
                <span className="block text-sm font-semibold text-white leading-tight">
                  CUSTECH Hostel Portal
                </span>
                <span className="block text-[11px] text-orange-200 leading-tight">
                  Confluence University of Science &amp; Technology
                </span>
              </div>
            </div>
            <p className="mt-4 max-w-xs text-sm text-orange-200 leading-relaxed">
              The official student hostel management system for CUSTECH, Osara, Kogi State.
            </p>
            <p className="mt-3 text-xs text-orange-300">
              hostel@custech.edu.ng · Student Hostels Office
            </p>
          </div>

          {/* Quick links */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-orange-300 mb-4">
              Quick links
            </p>
            <ul className="space-y-2.5 text-sm text-orange-200">
              <li><Link to="/" className="hover:text-white transition-colors">Overview</Link></li>
              <li><Link to="/how-to-apply" className="hover:text-white transition-colors">How to apply</Link></li>
              <li><Link to="/fees" className="hover:text-white transition-colors">Hostel fees</Link></li>
              <li><Link to="/login" className="hover:text-white transition-colors">Sign in</Link></li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-orange-300 mb-4">
              Support
            </p>
            <ul className="space-y-2.5 text-sm text-orange-200">
              <li><a href="mailto:hostel@custech.edu.ng" className="hover:text-white transition-colors">Email us</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Help centre</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Portal guide</a></li>
            </ul>
          </div>
        </div>

        <div className="mt-8 border-t border-white/10 pt-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <p className="text-xs text-orange-300">
            © {new Date().getFullYear()} CUSTECH Hostel Portal. All rights reserved.
          </p>
          <p className="text-xs text-orange-400">
            Built for CUSTECH students, Osara, Kogi State.
          </p>
        </div>
      </div>
    </footer>
  );
}
