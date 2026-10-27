import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Radio, XCircle, Ticket } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../api/api';
import BackButton from '../components/BackButton';

const badge = {
  waiting: 'bg-amber-100 text-amber-700',
  'in-progress': 'bg-sky-100 text-sky-700',
  done: 'bg-emerald-100 text-emerald-700',
  skipped: 'bg-slate-200 text-slate-600',
  cancelled: 'bg-pink-100 text-pink-600',
};

export default function MyTokens() {
  const [tokens, setTokens] = useState([]);
  const [tab, setTab] = useState('active');

  const load = async () => {
    const { data } = await api.get('/tokens/my');
    setTokens(data);
  };
  useEffect(() => { load(); }, []);

  const cancel = async (id) => {
    try {
      await api.patch(`/tokens/${id}/cancel`);
      toast.success('Token cancelled');
      load();
    } catch (err) {
      toast.error(err.response?.data?.msg || 'Could not cancel');
    }
  };

  const isActive = (t) => ['waiting', 'in-progress'].includes(t.status);
  const list = tokens.filter((t) => (tab === 'active' ? isActive(t) : !isActive(t)));

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <BackButton />
      <h2 className="text-3xl font-extrabold mt-5 mb-5">My Tokens</h2>

      <div className="inline-flex bg-white rounded-full p-1 shadow-md mb-6">
        {[['active', 'Active'], ['history', 'History']].map(([key, label]) => (
          <button key={key} onClick={() => setTab(key)}
            className={`px-6 py-2 rounded-full text-sm font-semibold transition ${
              tab === key ? 'bg-gradient-to-r from-violet-600 to-pink-500 text-white shadow' : 'text-slate-500'
            }`}>
            {label}
          </button>
        ))}
      </div>

      {list.length === 0 && (
        <div className="bg-white rounded-3xl p-10 text-center shadow-sm">
          <Ticket size={40} className="mx-auto text-violet-300" />
          <p className="text-slate-500 mt-3">
            {tab === 'active' ? 'You have no active tokens.' : 'No past tokens yet.'}
          </p>
          {tab === 'active' && (
            <Link to="/clinics" className="inline-block mt-4 bg-gradient-to-r from-violet-600 to-pink-500 text-white font-semibold px-6 py-2.5 rounded-full">
              Find a clinic
            </Link>
          )}
        </div>
      )}

      <div className="space-y-4">
        {list.map((t) => (
          <div key={t._id} className="bg-white rounded-3xl p-4 flex items-center gap-4 shadow-md shadow-violet-100 hover:shadow-xl transition">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-500 to-pink-500 text-white font-extrabold text-2xl flex items-center justify-center shadow-md">
              {t.tokenNumber}
            </div>
            <div className="flex-1">
              <p className="font-bold">{t.clinicId?.name}</p>
              <p className="text-xs text-slate-500">{t.date}</p>
              <span className={`inline-block mt-1.5 text-xs font-semibold px-3 py-1 rounded-full capitalize ${badge[t.status]}`}>
                {t.status}
              </span>
            </div>
            <div className="flex flex-col gap-2">
              {isActive(t) && (
                <Link to={`/queue/${t.clinicId?._id}`}
                  className="flex items-center gap-1 text-sm bg-gradient-to-r from-violet-600 to-pink-500 text-white font-semibold px-3.5 py-1.5 rounded-xl">
                  <Radio size={14} /> Live
                </Link>
              )}
              {t.status === 'waiting' && (
                <button onClick={() => cancel(t._id)}
                  className="flex items-center gap-1 text-sm bg-slate-100 hover:bg-pink-50 hover:text-pink-600 font-semibold px-3.5 py-1.5 rounded-xl transition">
                  <XCircle size={14} /> Cancel
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}