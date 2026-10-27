import { useEffect, useState } from 'react';
import { CalendarDays, Phone, Users } from 'lucide-react';
import api from '../api/api';

const badge = {
  waiting: 'bg-amber-100 text-amber-700',
  'in-progress': 'bg-sky-100 text-sky-700',
  done: 'bg-emerald-100 text-emerald-700',
  skipped: 'bg-slate-200 text-slate-600',
  cancelled: 'bg-pink-100 text-pink-600',
};

const today = () => new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' });

export default function History() {
  const [clinics, setClinics] = useState([]);
  const [clinic, setClinic] = useState('');
  const [date, setDate] = useState(today());
  const [rows, setRows] = useState([]);

  useEffect(() => {
    api.get('/clinics/mine').then((r) => {
      setClinics(r.data);
      if (r.data[0]) setClinic(r.data[0]._id);
    });
  }, []);

  useEffect(() => {
    if (!clinic) return;
    api.get(`/clinics/${clinic}/history`, { params: { date } }).then((r) => setRows(r.data));
  }, [clinic, date]);

  const served = rows.filter((r) => r.status === 'done').length;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h2 className="text-3xl font-extrabold mb-1">
        Patient{' '}
        <span className="bg-gradient-to-r from-violet-600 to-pink-500 bg-clip-text text-transparent">History</span>
      </h2>
      <p className="text-slate-500 mb-6">See who visited on any day.</p>

      <div className="flex flex-wrap gap-3 mb-6">
        <select value={clinic} onChange={(e) => setClinic(e.target.value)}
          className="bg-white shadow-md rounded-2xl px-5 py-3 text-sm font-semibold focus:outline-none">
          {clinics.length === 0 && <option value="">No clinics</option>}
          {clinics.map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}
        </select>
        <div className="flex items-center gap-2 bg-white shadow-md rounded-2xl px-4 py-2">
          <CalendarDays size={18} className="text-violet-500" />
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)}
            className="text-sm font-semibold focus:outline-none bg-transparent" />
        </div>
        <div className="flex items-center gap-2 bg-gradient-to-r from-violet-600 to-pink-500 text-white rounded-2xl px-5 py-3 text-sm font-semibold shadow-md">
          <Users size={16} /> {rows.length} total, {served} served
        </div>
      </div>

      {rows.length === 0 ? (
        <div className="bg-white rounded-3xl p-10 text-center text-slate-500 shadow-sm">
          No patients on this date.
        </div>
      ) : (
        <div className="space-y-3">
          {rows.map((t) => (
            <div key={t._id} className="bg-white rounded-2xl p-4 flex items-center gap-4 shadow-md shadow-violet-100">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-sky-400 to-violet-500 text-white font-extrabold text-lg flex items-center justify-center">
                {t.tokenNumber}
              </div>
              <div className="flex-1">
                <p className="font-bold">{t.patientId?.name || 'Unknown patient'}</p>
                <p className="text-xs text-slate-500 flex items-center gap-1">
                  <Phone size={12} /> {t.patientId?.phone || '-'}
                </p>
              </div>
              {t.isEmergency && (
                <span className="text-xs bg-red-100 text-red-600 font-semibold px-2.5 py-1 rounded-full">Emergency</span>
              )}
              <span className={`text-xs font-semibold px-3 py-1 rounded-full capitalize ${badge[t.status]}`}>
                {t.status}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}