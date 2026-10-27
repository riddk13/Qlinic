import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, MapPin, Clock, Ticket, Eye, Stethoscope, Users, Radio } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../api/api';
import BackButton from '../components/BackButton';

const colors = [
  'from-blue-400 to-pink-400',
  'from-amber-300 to-pink-400',
  'from-sky-400 to-violet-400',
  'from-emerald-300 to-sky-400',
];

export default function Clinics() {
  const [clinics, setClinics] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const load = async () => {
    try {
      const { data } = await api.get('/clinics', { params: { search } });
      setClinics(data);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => { load(); }, []);

  const takeToken = async (clinicId) => {
    try {
      await api.post('/tokens', { clinicId });
      toast.success('Token booked successfully!');
      navigate(`/queue/${clinicId}`);
    } catch (err) {
      toast.error(err.response?.data?.msg || 'Could not book token');
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <BackButton />

      <div className="mt-6 rounded-[2rem] p-8 text-white bg-gradient-to-br from-violet-600 via-pink-500 to-amber-400 shadow-xl shadow-pink-200 relative overflow-hidden">
        <div className="absolute -top-10 -right-10 w-44 h-44 rounded-full bg-white/20" />
        <h2 className="relative text-3xl font-extrabold">Find your clinic</h2>
        <p className="relative opacity-90 mt-1">Take a token and track the queue live.</p>

        <div className="relative flex gap-2 mt-5 bg-white rounded-2xl p-2 shadow-lg max-w-xl">
          <div className="relative flex-1">
            <Search size={18} className="absolute left-4 top-3 text-slate-400" />
            <input value={search} onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && load()}
              placeholder="Search by clinic name or area"
              className="w-full pl-11 pr-3 py-2.5 text-sm text-slate-800 rounded-xl focus:outline-none" />
          </div>
          <button onClick={load}
            className="bg-gradient-to-r from-violet-600 to-pink-500 text-white px-6 rounded-xl font-semibold hover:opacity-90 transition">
            Search
          </button>
        </div>
      </div>

      {loading && <p className="text-center text-slate-500 py-16">Loading clinics...</p>}
      {!loading && clinics.length === 0 && (
        <p className="bg-white rounded-2xl p-10 text-center text-slate-500 shadow-sm mt-8">No clinics found.</p>
      )}

      <div className="grid sm:grid-cols-2 gap-6 mt-8">
        {clinics.map((c, i) => (
          <div key={c._id}
            className="bg-white rounded-3xl shadow-lg shadow-violet-100 overflow-hidden hover:-translate-y-1.5 hover:shadow-2xl transition duration-300">
            <div className={`relative h-28 bg-gradient-to-br ${colors[i % colors.length]} flex items-center justify-center`}>
              <Stethoscope size={46} className="text-white/90" />
              {c.isPaused ? (
                <span className="absolute top-3 right-3 bg-amber-100 text-amber-700 text-xs font-bold px-3 py-1 rounded-full">
                  On break
                </span>
              ) : (
                <span className="absolute top-3 right-3 flex items-center gap-1.5 bg-white/90 text-emerald-600 text-xs font-bold px-3 py-1 rounded-full">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" /> Live
                </span>
              )}
            </div>
            <div className="p-5">
              <h3 className="text-xl font-bold">{c.name}</h3>
              <p className="text-sm text-slate-500">{c.doctorName}</p>

              <div className="flex flex-wrap gap-2 mt-3 text-xs font-semibold">
                <span className="flex items-center gap-1 bg-sky-50 text-sky-600 px-3 py-1.5 rounded-full">
                  <MapPin size={13} /> {c.area || 'Area not set'}
                </span>
                <span className="flex items-center gap-1 bg-amber-50 text-amber-600 px-3 py-1.5 rounded-full">
                  <Clock size={13} /> {c.openTime || '-'} - {c.closeTime || '-'}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 mt-4">
                <div className="bg-violet-50 rounded-2xl p-3 text-center">
                  <p className="flex items-center justify-center gap-1 text-xs text-violet-500 font-semibold"><Users size={13} /> Waiting</p>
                  <p className="text-2xl font-extrabold text-violet-700">{c.waitingCount ?? 0}</p>
                </div>
                <div className="bg-pink-50 rounded-2xl p-3 text-center">
                  <p className="flex items-center justify-center gap-1 text-xs text-pink-500 font-semibold"><Radio size={13} /> Now serving</p>
                  <p className="text-2xl font-extrabold text-pink-600">{c.nowServing ?? '-'}</p>
                </div>
              </div>

              <div className="flex gap-2 mt-5">
                <button onClick={() => takeToken(c._id)}
                  className="flex-1 flex items-center justify-center gap-1.5 bg-gradient-to-r from-violet-600 to-pink-500 text-white font-semibold py-3 rounded-xl hover:opacity-90 hover:shadow-lg transition">
                  <Ticket size={16} /> Take token
                </button>
                <button onClick={() => navigate(`/queue/${c._id}`)}
                  className="flex-1 flex items-center justify-center gap-1.5 bg-slate-100 hover:bg-slate-200 font-semibold py-3 rounded-xl transition">
                  <Eye size={16} /> View queue
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}