import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Phone, Ticket, CheckCircle2, XCircle, LogOut } from 'lucide-react';
import api from '../api/api';

export default function Profile() {
  const user = JSON.parse(localStorage.getItem('user') || 'null');
  const navigate = useNavigate();
  const [tokens, setTokens] = useState([]);

  useEffect(() => {
    api.get('/tokens/my').then((r) => setTokens(r.data));
  }, []);

  const count = (s) => tokens.filter((t) => t.status === s).length;
  const stats = [
    { label: 'Total tokens', value: tokens.length, icon: Ticket, grad: 'from-violet-500 to-pink-500' },
    { label: 'Completed visits', value: count('done'), icon: CheckCircle2, grad: 'from-emerald-400 to-sky-400' },
    { label: 'Cancelled', value: count('cancelled'), icon: XCircle, grad: 'from-amber-300 to-pink-400' },
  ];

  const logout = () => {
    localStorage.clear();
    navigate('/');
  };

  return (
    <div className="max-w-xl mx-auto px-4 py-8">
      <div className="bg-white rounded-[2rem] p-8 text-center shadow-xl shadow-violet-100">
        <span className="w-24 h-24 rounded-full bg-gradient-to-br from-violet-500 via-pink-500 to-amber-400 text-white text-4xl font-extrabold flex items-center justify-center mx-auto shadow-lg">
          {user?.name?.[0]?.toUpperCase()}
        </span>
        <h2 className="text-2xl font-extrabold mt-4">{user?.name}</h2>
        <span className="inline-block mt-1 text-xs px-3 py-1 rounded-full bg-gradient-to-r from-amber-200 to-pink-200 text-pink-700 font-semibold capitalize">
          {user?.role}
        </span>
        {user?.phone && (
          <p className="flex items-center justify-center gap-1.5 text-slate-500 text-sm mt-3">
            <Phone size={14} /> {user.phone}
          </p>
        )}
      </div>

      <div className="grid grid-cols-3 gap-3 mt-5">
        {stats.map(({ label, value, icon: Icon, grad }) => (
          <div key={label} className={`bg-gradient-to-br ${grad} text-white rounded-3xl p-4 text-center shadow-lg`}>
            <Icon size={20} className="mx-auto opacity-80" />
            <p className="text-3xl font-extrabold mt-1">{value}</p>
            <p className="text-xs opacity-90">{label}</p>
          </div>
        ))}
      </div>

      <button onClick={logout}
        className="mt-6 w-full flex items-center justify-center gap-2 bg-white hover:bg-pink-50 hover:text-pink-600 font-semibold py-3 rounded-2xl shadow-md transition">
        <LogOut size={18} /> Logout
      </button>
    </div>
  );
}