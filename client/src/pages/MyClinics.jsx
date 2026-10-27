import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Pencil, Trash2, LayoutDashboard, MapPin, Clock, Stethoscope, X } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../api/api';

const input =
  'w-full bg-slate-50 border-2 border-transparent rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:border-violet-400 focus:bg-white';

export default function MyClinics() {
  const [clinics, setClinics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({});

  const load = async () => {
    try {
      const { data } = await api.get('/clinics/mine');
      setClinics(data);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => { load(); }, []);

  const startEdit = (c) => {
    setEditing(c._id);
    setForm({
      name: c.name || '', area: c.area || '', doctorName: c.doctorName || '',
      openTime: c.openTime || '', closeTime: c.closeTime || '', avgConsultTime: c.avgConsultTime || 10,
    });
  };

  const save = async (e) => {
    e.preventDefault();
    try {
      await api.put(`/clinics/${editing}`, form);
      toast.success('Clinic updated');
      setEditing(null);
      load();
    } catch (err) {
      toast.error(err.response?.data?.msg || 'Could not update');
    }
  };

  const remove = async (c) => {
    if (!window.confirm(`Delete "${c.name}" and all its tokens? This cannot be undone.`)) return;
    try {
      await api.delete(`/clinics/${c._id}`);
      toast.success('Clinic deleted');
      load();
    } catch (err) {
      toast.error(err.response?.data?.msg || 'Could not delete');
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h2 className="text-3xl font-extrabold mb-1">
        My <span className="bg-gradient-to-r from-violet-600 to-pink-500 bg-clip-text text-transparent">Clinics</span>
      </h2>
      <p className="text-slate-500 mb-6">Edit details, open the live dashboard or remove a clinic.</p>

      {loading && <p className="text-slate-500">Loading...</p>}
      {!loading && clinics.length === 0 && (
        <div className="bg-white rounded-3xl p-10 text-center shadow-sm">
          <Stethoscope size={40} className="mx-auto text-violet-300" />
          <p className="text-slate-500 mt-3">You have no clinics yet.</p>
          <Link to="/dashboard"
            className="inline-block mt-4 bg-gradient-to-r from-violet-600 to-pink-500 text-white font-semibold px-6 py-2.5 rounded-full">
            Create one from Dashboard
          </Link>
        </div>
      )}

      <div className="space-y-4">
        {clinics.map((c) => (
          <div key={c._id} className="bg-white rounded-3xl p-5 shadow-md shadow-violet-100">
            {editing === c._id ? (
              <form onSubmit={save} className="grid sm:grid-cols-2 gap-3">
                {[
                  ['name', 'Clinic name'], ['area', 'Area'], ['doctorName', 'Doctor name'],
                  ['openTime', 'Opening time'], ['closeTime', 'Closing time'],
                ].map(([f, label]) => (
                  <input key={f} placeholder={label} className={input} value={form[f]}
                    onChange={(e) => setForm({ ...form, [f]: e.target.value })} />
                ))}
                <input type="number" placeholder="Avg. consultation (min)" className={input}
                  value={form.avgConsultTime}
                  onChange={(e) => setForm({ ...form, avgConsultTime: Number(e.target.value) || 10 })} />
                <div className="sm:col-span-2 flex gap-2">
                  <button type="submit"
                    className="flex-1 bg-gradient-to-r from-violet-600 to-pink-500 text-white font-bold py-2.5 rounded-xl">
                    Save changes
                  </button>
                  <button type="button" onClick={() => setEditing(null)}
                    className="flex items-center gap-1 bg-slate-100 hover:bg-slate-200 font-semibold px-5 rounded-xl">
                    <X size={16} /> Cancel
                  </button>
                </div>
              </form>
            ) : (
              <div className="flex flex-wrap items-center gap-4">
                <span className="w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-500 to-pink-500 text-white flex items-center justify-center shadow-md">
                  <Stethoscope size={26} />
                </span>
                <div className="flex-1 min-w-[200px]">
                  <p className="text-lg font-bold">{c.name}</p>
                  <p className="text-sm text-slate-500">{c.doctorName}</p>
                  <div className="flex flex-wrap gap-2 mt-2 text-xs font-semibold">
                    <span className="flex items-center gap-1 bg-sky-50 text-sky-600 px-3 py-1 rounded-full">
                      <MapPin size={12} /> {c.area || 'Area not set'}
                    </span>
                    <span className="flex items-center gap-1 bg-amber-50 text-amber-600 px-3 py-1 rounded-full">
                      <Clock size={12} /> {c.openTime || '-'} - {c.closeTime || '-'}
                    </span>
                    <span className="bg-violet-50 text-violet-600 px-3 py-1 rounded-full">
                      {c.avgConsultTime} min / patient
                    </span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Link to={`/dashboard?clinic=${c._id}`}
                    className="flex items-center gap-1 text-sm bg-gradient-to-r from-violet-600 to-pink-500 text-white font-semibold px-4 py-2 rounded-xl">
                    <LayoutDashboard size={14} /> Open
                  </Link>
                  <button onClick={() => startEdit(c)}
                    className="flex items-center gap-1 text-sm bg-slate-100 hover:bg-slate-200 font-semibold px-4 py-2 rounded-xl transition">
                    <Pencil size={14} /> Edit
                  </button>
                  <button onClick={() => remove(c)}
                    className="flex items-center gap-1 text-sm bg-red-50 text-red-600 hover:bg-red-100 font-semibold px-4 py-2 rounded-xl transition">
                    <Trash2 size={14} /> Delete
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}