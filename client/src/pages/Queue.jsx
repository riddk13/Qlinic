import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { io } from 'socket.io-client';
import { Users, PartyPopper, Siren, Ticket, Clock, Coffee } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../api/api';
import BackButton from '../components/BackButton';

export default function Queue() {
  const { id } = useParams();
  const user = JSON.parse(localStorage.getItem('user') || 'null');
  const isPatient = user?.role === 'patient';

  const [data, setData] = useState(null);
  const [mine, setMine] = useState(null);

  const loadAll = async () => {
    const res = await api.get(`/clinics/${id}/queue`);
    setData(res.data);
    if (isPatient) {
      const { data: tokens } = await api.get('/tokens/my');
      setMine(
        tokens.find((t) => t.clinicId?._id === id && ['waiting', 'in-progress'].includes(t.status)) || null
      );
    }
  };

  useEffect(() => {
    loadAll();
    const socket = io('http://localhost:5000');
    socket.emit('join:clinic', id);
    socket.on('queue:update', loadAll);
    socket.on('token:called', (d) => toast(`Token ${d.tokenNumber} is being called`, { icon: '📣' }));
    return () => socket.disconnect();
  }, [id]);

  const takeToken = async () => {
    try {
      await api.post('/tokens', { clinicId: id });
      toast.success('Token booked successfully!');
      loadAll();
    } catch (err) {
      toast.error(err.response?.data?.msg || 'Could not book token');
    }
  };

  const myEntry = mine && data ? data.queue.find((q) => q._id === mine._id) : null;
  const myTurn = mine?.status === 'in-progress';
  const ahead = myEntry?.patientsAhead;

  useEffect(() => {
    if (myTurn) toast.success("It's your turn! Please go in.", { id: 'turn', duration: 8000 });
    else if (ahead !== undefined && ahead <= 2)
      toast(ahead === 0 ? 'You are next! Get ready.' : `Only ${ahead} ahead of you. Please be nearby.`, {
        id: 'near', icon: '🔔', duration: 6000,
      });
  }, [ahead, myTurn]);

  if (!data) return <p className="text-center py-20 text-slate-500">Loading...</p>;

  return (
    <div className="max-w-xl mx-auto px-4 py-8">
      <BackButton />
      <h2 className="text-center text-2xl font-extrabold mt-4">{data.clinic}</h2>

      {data.isPaused && (
        <div className="mt-5 flex items-center gap-4 bg-amber-100 text-amber-800 rounded-3xl p-5 shadow-md animate-pop">
          <span className="w-12 h-12 rounded-2xl bg-amber-300/60 flex items-center justify-center">
            <Coffee size={24} />
          </span>
          <div>
            <p className="font-extrabold">Doctor is on break</p>
            <p className="text-sm">
              {data.pauseMessage}
              {data.resumeTime && ` • Back at ${data.resumeTime}`}
            </p>
          </div>
        </div>
      )}

      {/* Now serving */}
      <div className="relative mt-5 rounded-[2rem] p-10 text-center text-white shadow-2xl shadow-pink-200 bg-gradient-to-br from-violet-600 via-pink-500 to-amber-400 overflow-hidden">
        <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-white/20" />
        <div className="absolute -bottom-12 -left-8 w-36 h-36 rounded-full bg-white/10" />
        <p className="relative text-sm uppercase tracking-widest font-semibold opacity-90">Now serving</p>
        {data.nowServing ? (
          <p key={data.nowServing} className="relative text-8xl font-extrabold mt-2 animate-pop drop-shadow-lg">
            {data.nowServing}
          </p>
        ) : (
          <p className="relative text-2xl font-bold mt-6 opacity-95">Doctor has not started yet</p>
        )}
      </div>

      {/* Take token (useful after scanning the QR) */}
      {isPatient && !mine && (
        <button onClick={takeToken}
          className="mt-5 w-full flex items-center justify-center gap-2 bg-gradient-to-r from-violet-600 to-pink-500 text-white font-bold py-4 rounded-2xl shadow-lg shadow-pink-200 hover:-translate-y-0.5 transition">
          <Ticket size={18} /> Take a token
        </button>
      )}

      {/* My position */}
      {isPatient && mine && (
        <div className={`mt-5 rounded-3xl p-5 flex items-center gap-4 shadow-lg animate-pop ${
          myTurn ? 'bg-emerald-500 text-white shadow-emerald-200' : 'bg-white shadow-violet-100'
        }`}>
          <div className={`w-16 h-16 rounded-2xl font-extrabold text-2xl flex items-center justify-center ${
            myTurn ? 'bg-white/25' : 'bg-gradient-to-br from-violet-500 to-pink-500 text-white'
          }`}>
            {mine.tokenNumber}
          </div>
          <div className="flex-1">
            {myTurn ? (
              <>
                <p className="flex items-center gap-2 font-extrabold text-lg"><PartyPopper size={20} /> It is your turn!</p>
                <p className="text-sm opacity-90">Please go in to see the doctor.</p>
              </>
            ) : (
              <>
                <p className="font-bold flex items-center gap-2"><Ticket size={16} className="text-violet-500" /> Your token</p>
                <p className="text-sm text-slate-500">
                  {myEntry ? `${myEntry.patientsAhead} people ahead of you` : 'Updating...'}
                </p>
                {myEntry && (
                  <p className="text-sm font-semibold text-pink-600 flex items-center gap-1 mt-0.5">
                    <Clock size={14} /> About {myEntry.estimatedWaitMin} min wait
                  </p>
                )}
              </>
            )}
          </div>
        </div>
      )}

      {/* Waiting list */}
      <div className="flex items-center justify-between mt-8 mb-3">
        <h3 className="font-bold flex items-center gap-2">
          <Users size={18} className="text-violet-500" /> Waiting
        </h3>
        <span className="bg-white shadow-sm text-sm font-bold px-3.5 py-1 rounded-full text-violet-600">
          {data.waitingCount}
        </span>
      </div>

      {data.queue.length === 0 && (
        <p className="bg-white rounded-2xl p-6 text-center text-slate-500 shadow-sm">
          The queue is empty. Come right in!
        </p>
      )}

      <div className="space-y-3">
        {data.queue.map((t) => {
          const isMe = mine && t._id === mine._id;
          return (
            <div key={t._id}
              className={`rounded-2xl p-4 flex items-center gap-4 shadow-md transition ${
                isMe ? 'bg-violet-50 border-2 border-violet-400 shadow-violet-200' : 'bg-white shadow-violet-100'
              }`}>
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-sky-400 to-violet-500 text-white font-extrabold text-xl flex items-center justify-center">
                {t.tokenNumber}
              </div>
              <div className="flex-1">
                <p className="font-semibold text-sm flex items-center gap-2">
                  {t.patientsAhead} ahead
                  {isMe && <span className="text-xs bg-violet-600 text-white px-2 py-0.5 rounded-full">You</span>}
                  {t.isEmergency && (
                    <span className="flex items-center gap-1 text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded-full">
                      <Siren size={12} /> Emergency
                    </span>
                  )}
                </p>
                <p className="text-xs text-slate-500 mt-0.5">Estimated wait: {t.estimatedWaitMin} min</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}