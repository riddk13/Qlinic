import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  Home, LogOut, Building2, Ticket, LayoutDashboard, History, User, Hospital,
} from 'lucide-react';

export default function Navbar() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const user = JSON.parse(localStorage.getItem('user') || 'null');
  if (!user) return null;

  const logout = () => {
    localStorage.clear();
    navigate('/');
  };

  const isActive = (to) => (to === '/' ? pathname === '/' : pathname.startsWith(to));

  const link = (to) =>
    `flex items-center gap-1.5 whitespace-nowrap text-sm font-semibold px-3.5 py-2 rounded-full transition ${
      isActive(to)
        ? 'bg-gradient-to-r from-violet-500 to-pink-500 text-white shadow-md'
        : 'text-slate-600 hover:bg-violet-50 hover:text-violet-600'
    }`;

  const items =
    user.role === 'patient'
      ? [
          ['/', Home, 'Home'],
          ['/clinics', Building2, 'Clinics'],
          ['/my-tokens', Ticket, 'My Tokens'],
          ['/profile', User, 'Profile'],
        ]
      : [
          ['/', Home, 'Home'],
          ['/dashboard', LayoutDashboard, 'Dashboard'],
          ['/my-clinics', Hospital, 'My Clinics'],
          ['/history', History, 'History'],
        ];

  return (
    <nav className="sticky top-0 z-20 backdrop-blur-xl bg-white/70 border-b border-white shadow-sm">
      <div className="max-w-5xl mx-auto px-4 h-16 flex items-center gap-3">
        <div className="flex items-center gap-1 overflow-x-auto">
          {items.map(([to, Icon, label]) => (
            <Link key={to} to={to} className={link(to)}>
              <Icon size={16} /> {label}
            </Link>
          ))}
        </div>

        <div className="ml-auto flex items-center gap-3 shrink-0">
          <div className="hidden md:flex items-center gap-2">
            <span className="w-9 h-9 rounded-full bg-gradient-to-br from-amber-300 to-pink-400 text-white font-bold flex items-center justify-center">
              {user.name?.[0]?.toUpperCase()}
            </span>
            <div className="leading-tight">
              <p className="text-sm font-semibold">{user.name}</p>
              <p className="text-xs text-slate-500 capitalize">{user.role}</p>
            </div>
          </div>
          <button onClick={logout}
            className="flex items-center gap-1.5 text-sm font-semibold bg-white hover:bg-pink-50 hover:text-pink-600 border border-slate-200 px-3.5 py-2 rounded-full transition">
            <LogOut size={16} /> <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </div>
    </nav>
  );
}