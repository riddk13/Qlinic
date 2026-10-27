import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { io } from 'socket.io-client';
import {
  Megaphone, SkipForward, Siren, Plus, X, Users, CheckCircle2, UserX, CalendarDays,
  Pause, Play, Coffee,
} from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../api/api';
import QrCard from '../components/QrCard';

const input =
  'w-full bg-slate-50 border-2 border-transparent rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:border-violet-400 focus:bg-white';

const emptyForm = {
  name: '', area: '', doctorName: '', openTime: '', closeTime: '', avgConsultTime: 10,
};

export default function Dashboard() {
  const user = JSON.parse(localStorage.getItem('user') || 'null');
  const [params] = useSearchParams();
  const [clinics, setClinics] = useState([]);
  const [clinic, setClinic] = useState(params.get('clinic') || '');
  const [data, setData] = useState(null);
  const [stats, setStats] = useState(null);
  const [pauseMsg, setPauseMsg] = useState('');
  const [resumeTime, setResumeTime] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);

  useEffect(() => {
    api.get('/clinics/mine').then((r) => setClinics(r.data));
  }, []);

  const refresh = async (cid) => {
    const [q, s] = await Promise.all([api.get(`/clinics/${cid}/queue`), api.get(`/clinics/${cid}/stats`)]);
    setData(q.data);
    setStats(s.data);
  };

  useEffect(() => {
    if (!clinic) return;
    refresh(clinic);
    const socket = io('http://localhost:5000');
    socket.emit('join:clinic', clinic);
    socket.on('queue:update', () => refresh(clinic));
    return () => socket.disconnect();
  }, [clinic]);

  const createClinic = async (e) => {
    e.preventDefault();
    try {
      const { data: created } = await api.post('/clinics', form);
      setClinics([created, ...clinics]);
      setClinic(created._id);
      setForm(emptyForm);
      setShowForm(false);
      toast.success('Clinic created');
    } catch (err) {
      toast.error(err.response?.data?.msg || 'Could not create clinic');
    }
  };

  const act = async (fn, okMsg) => {
    try {
      const res = await fn();
      if (res?.data?.msg) toast(res.data.msg);
      else if (okMsg) toast.success(okMsg);
    } catch (err) {
      toast.error(err.response?.data?.msg || 'Action failed');
    }
  };

  const callNext = () => act(() => api.patch(`/tokens/call-next/${clinic}`));
  const skip = (tid) => act(() => api.patch(`/tokens/${tid}/skip`), 'Token skipped');
  const emergency = (tid) => act(() => api.patch(`/tokens/${tid}/emergency`), 'Marked as emergency');

  const pauseQueue = () =>
    act(() => api.patch(`/clinics/${clinic}/pause`, {
      isPaused: true, pauseMessage: pauseMsg, resumeTime,
    }), 'Queue paused');
  const resumeQueue = () =>
    act(() => api.patch(`/clinics/${clinic}/pause`, { isPaused: false }), 'Queue resumed');

  const progress = stats && stats.total ? Math.round((stats.done / stats.total) * 100) : 0;
  const clinicName = clinics.find((c) => c._id === clinic)?.name || 'clinic';

  const cards = stats && [
    { label: 'Total today', value: stats.total, icon: CalendarDays, grad: 'from-violet-500 to-pink-500', glow: 'shadow-violet-200' },
    { label: 'Waiting', value: stats.waiting, icon: Users, grad: 'from-sky-400 to-violet-500', glow: 'shadow-sky-200' },
    { label: 'Completed', value: stats.done, icon: CheckCircle2, grad: 'from-emerald-400 to-sky-400', glow: 'shadow-emerald-200' },
    { label: 'Skipped / cancelled', value: stats.skipped + stats.cancelled, icon: UserX, grad: 'from-amber-300 to-pink-400', glow: 'shadow-amber-200' },
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <p className="text-slate-500 text-sm">Hello, {user?.name}</p>
      <h2 className="text-3xl font-extrabold mb-6">
        Doctor{' '}
        <span className="bg-gradient-to-r from-violet-600 to-pink-500 bg-clip-text text-transparent">Dashboard</span>
      </h2>

      <div className="flex flex-wrap gap-3 items-start mb-8">
        <select value={clinic} onChange={(e) => setClinic(e.target.value)}
          className="bg-white shadow-md rounded-2xl px-5 py-3 text-sm font-semibold focus:outline-none">
          <option value="" disabled>Select a clinic</option>
          {clinics.map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}
        </select>

        <div className="bg-white shadow-md rounded-2xl px-5 py-3 text-sm">
          <button onClick={() => setShowForm(!showForm)}
            className="font-semibold text-violet-600 flex items-center gap-1">
            {showForm ? <X size={16} /> : <Plus size={16} />}
            {showForm ? 'Close' : 'Create new clinic'}
          </button>

          {showForm && (
            <form onSubmit={createClinic} className="grid gap-2 mt-4 w-72">
              {[
                ['name', 'Clinic name'], ['area', 'Area'], ['doctorName', 'Doctor name'],
                ['openTime', 'Opening time (10:00)'], ['closeTime', 'Closing time (18:00)'],
              ].map(([f, label]) => (
                <input key={f} placeholder={label} className={input} value={form[f]}
                  onChange={(e) => setForm({ ...form, [f]: e.target.value })} required={f === 'name'} />
              ))}
              <input type="number" placeholder="Avg. consultation (minutes)" className={input}
                value={form.avgConsultTime}
                onChange={(e) => setForm({ ...form, avgConsultTime: Number(e.target.value) || 10 })} />
              <button type="submit"
                className="bg-gradient-to-r from-violet-600 to-pink-500 text-white font-bold py-2.5 rounded-xl">
                Create clinic
              </button>
            </form>
          )}
        </div>
      </div>

      {!data && (
        <div className="bg-white rounded-3xl p-12 text-center shadow-sm">
          <Users size={42} className="mx-auto text-violet-300" />
          <p className="text-slate-500 mt-3">
            {clinics.length === 0
              ? 'You have no clinics yet. Create your first one above.'
              : 'Select a clinic above to see its live queue.'}
          </p>
        </div>
      )}

      {data && stats && (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {cards.map(({ label, value, icon: Icon, grad, glow }) => (
              <div key={label} className={`bg-gradient-to-br ${grad} text-white rounded-3xl p-5 shadow-lg ${glow} hover:-translate-y-1 transition`}>
                <Icon size={22} className="opacity-80" />
                <p className="text-4xl font-extrabold mt-2">{value}</p>
                <p className="text-sm opacity-90">{label}</p>
              </div>
            ))}
          </div>

          <div className="bg-white rounded-3xl p-5 shadow-md shadow-violet-100 mt-5">
            <div className="flex justify-between text-sm font-semibold mb-2">
              <span>Today's progress</span>
              <span className="text-violet-600">{progress}% completed</span>
            </div>
            <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
              <div className="h-full rounded-full bg-gradient-to-r from-violet-500 via-pink-500 to-amber-400 transition-all duration-700"
                style={{ width: `${progress}%` }} />
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-6 mt-6">
            <div className="space-y-6">
              <div className="rounded-[2rem] p-7 text-center text-white shadow-2xl shadow-pink-200 bg-gradient-to-br from-violet-600 via-pink-500 to-amber-400">
                <p className="text-sm uppercase tracking-widest font-semibold opacity-90">Now inside</p>
                {data.nowServing ? (
                  <p key={data.nowServing} className="text-8xl font-extrabold my-3 animate-pop drop-shadow-lg">
                    {data.nowServing}
                  </p>
                ) : (
                  <p className="text-xl font-bold my-8 opacity-95">Nobody inside</p>
                )}
                <button onClick={callNext} disabled={data.isPaused}
                  className="w-full flex items-center justify-center gap-2 bg-white text-violet-700 font-bold py-3.5 rounded-2xl hover:scale-105 transition shadow-lg disabled:opacity-50 disabled:hover:scale-100">
                  <Megaphone size={18} /> {data.isPaused ? 'Queue is paused' : 'Call next patient'}
                </button>
              </div>

              <div className="bg-white rounded-3xl p-5 shadow-md shadow-violet-100">
                <p className="flex items-center gap-2 font-bold">
                  <Coffee size={18} className="text-amber-500" /> Break control
                </p>
                {data.isPaused ? (
                  <>
                    <p className="text-sm text-amber-700 bg-amber-50 rounded-xl p-3 mt-3">
                      Patients see: "{data.pauseMessage}"{data.resumeTime && ` (back at ${data.resumeTime})`}
                    </p>
                    <button onClick={resumeQueue}
                      className="mt-3 w-full flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold py-2.5 rounded-xl transition">
                      <Play size={16} /> Resume queue
                    </button>
                  </>
                ) : (
                  <div className="grid gap-2 mt-3">
                    <input value={pauseMsg} onChange={(e) => setPauseMsg(e.target.value)}
                      placeholder="Message (e.g. Lunch break)" className={input} />
                    <input type="time" value={resumeTime} onChange={(e) => setResumeTime(e.target.value)}
                      className={input} />
                    <button onClick={pauseQueue}
                      className="flex items-center justify-center gap-2 bg-amber-400 hover:bg-amber-500 text-white font-semibold py-2.5 rounded-xl transition">
                      <Pause size={16} /> Pause queue
                    </button>
                  </div>
                )}
              </div>

              <QrCard clinicId={clinic} clinicName={clinicName} />
            </div>

            <div className="md:col-span-2 space-y-3">
              <h3 className="font-bold">Waiting list</h3>
              {data.queue.length === 0 && (
                <p className="bg-white rounded-2xl p-8 text-center text-slate-500 shadow-sm">
                  The queue is empty. Time for a tea break!
                </p>
              )}
              {data.queue.map((t) => (
                <div key={t._id} className="bg-white rounded-2xl p-3.5 flex items-center gap-3 shadow-md shadow-violet-100">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-sky-400 to-violet-500 text-white font-extrabold text-lg flex items-center justify-center">
                    {t.tokenNumber}
                  </div>
                  <div className="flex-1 text-sm">
                    {t.isEmergency ? (
                      <span className="bg-red-100 text-red-600 text-xs font-semibold px-2.5 py-1 rounded-full">Emergency</span>
                    ) : (
                      <span className="text-slate-500">Est. wait {t.estimatedWaitMin} min</span>
                    )}
                  </div>
                  <button onClick={() => skip(t._id)}
                    className="flex items-center gap-1 text-sm bg-slate-100 hover:bg-slate-200 font-semibold px-3 py-2 rounded-xl transition">
                    <SkipForward size={14} /> Skip
                  </button>
                  <button onClick={() => emergency(t._id)}
                    className="flex items-center gap-1 text-sm bg-red-50 text-red-600 hover:bg-red-100 font-semibold px-3 py-2 rounded-xl transition">
                    <Siren size={14} /> Urgent
                  </button>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}