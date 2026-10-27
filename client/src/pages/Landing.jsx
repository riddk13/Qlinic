import { Link } from 'react-router-dom';
import {
  Stethoscope, Ticket, Radio, BellRing, Siren, Clock, BarChart3, ShieldCheck,
  ArrowRight, CheckCircle2, Smartphone, QrCode, Coffee, LayoutDashboard, Zap,
} from 'lucide-react';

const steps = [
  { icon: Ticket, title: 'Take a token', text: 'Pick your clinic and grab a token from your phone in one tap.', color: 'from-violet-500 to-pink-500' },
  { icon: Radio, title: 'Track live', text: 'See who is inside right now and how long your wait will be.', color: 'from-sky-400 to-violet-500' },
  { icon: BellRing, title: 'Walk in on time', text: 'Get alerted when your turn is near. No more crowded waiting rooms.', color: 'from-amber-400 to-pink-500' },
];

const features = [
  { icon: Clock, title: 'Smart wait time', text: "Estimated waiting time based on the doctor's average consultation.", color: 'from-pink-400 to-rose-500' },
  { icon: Siren, title: 'Emergency priority', text: 'Doctors can move urgent patients to the front instantly.', color: 'from-red-400 to-orange-500' },
  { icon: BellRing, title: 'Live notifications', text: 'Real-time updates powered by WebSockets. No refresh needed.', color: 'from-sky-400 to-blue-500' },
  { icon: QrCode, title: 'QR code entry', text: 'Scan the QR outside the clinic and take a token instantly.', color: 'from-violet-400 to-purple-600' },
  { icon: Coffee, title: 'Break mode', text: 'Pause the queue for lunch and patients see when you are back.', color: 'from-amber-300 to-orange-500' },
  { icon: ShieldCheck, title: 'Secure by design', text: 'Role based access for patients and clinic staff.', color: 'from-emerald-400 to-teal-500' },
];

const stats = [
  { value: 'Live', label: 'Real-time queue updates' },
  { value: '1 tap', label: 'To take a token' },
  { value: '0', label: 'Apps to install' },
  { value: 'Free', label: 'For every patient' },
];

const doctorPoints = [
  'Live dashboard with daily stats and progress',
  'Call next, skip or mark urgent in one click',
  'Printable QR code for your clinic door',
  'Full patient history for any date',
];

export default function Landing() {
  const user = JSON.parse(localStorage.getItem('user') || 'null');
  const home = user ? (user.role === 'patient' ? '/clinics' : '/dashboard') : '/login';

  return (
    <div className="relative overflow-hidden">
      {/* Header (only for visitors, logged in users already have the navbar) */}
      {!user && (
        <header className="relative z-10 max-w-6xl mx-auto px-4 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-pink-500 flex items-center justify-center text-white shadow-lg">
              <Stethoscope size={22} />
            </span>
            <span className="text-2xl font-extrabold bg-gradient-to-r from-violet-600 to-pink-500 bg-clip-text text-transparent">
              Qlinic
            </span>
          </div>
          <Link to="/login"
            className="bg-gradient-to-r from-violet-600 to-pink-500 text-white shadow-lg shadow-pink-200 font-semibold px-6 py-2.5 rounded-full hover:-translate-y-0.5 transition">
            Login / Sign up
          </Link>
        </header>
      )}

      {/* ================= HERO ================= */}
      <section className="relative">
        <div className="lp-hero-bg absolute inset-0 bg-gradient-to-br from-violet-200/70 via-pink-100/60 to-amber-100/70" />
        <div className="absolute -top-32 -left-32 w-[30rem] h-[30rem] rounded-full bg-pink-400/40 blur-3xl animate-blob" />
        <div className="absolute top-20 right-0 w-[30rem] h-[30rem] rounded-full bg-violet-400/40 blur-3xl animate-blob" />
        <div className="absolute bottom-0 left-1/3 w-[24rem] h-[24rem] rounded-full bg-amber-300/40 blur-3xl animate-blob" />

        <div className="relative max-w-6xl mx-auto px-4 pt-14 pb-28 grid lg:grid-cols-2 gap-14 items-center">
          <div className="animate-fade-up">
            <span className="inline-flex items-center gap-2 bg-white rounded-full px-4 py-2 shadow-md text-sm font-semibold text-violet-600">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" /> Live queue for local clinics
            </span>
            <h1 className="lp-title text-5xl md:text-7xl font-extrabold leading-[1.05] mt-6">
              Skip the line.
              <br />
              <span className="bg-gradient-to-r from-violet-600 via-pink-500 to-amber-500 bg-clip-text text-transparent">
                Not the doctor.
              </span>
            </h1>
            <p className="lp-text text-slate-600 text-lg mt-6 max-w-lg">
              Take a clinic token from home, watch the queue move in real time and walk in right when it is your turn.
            </p>
            <div className="flex flex-wrap gap-3 mt-8">
              <Link to={home}
                className="inline-flex items-center gap-2 bg-gradient-to-r from-violet-600 to-pink-500 text-white font-bold px-7 py-4 rounded-full shadow-xl shadow-pink-300 hover:-translate-y-0.5 transition">
                {user ? 'Open app' : 'Get started'} <ArrowRight size={18} />
              </Link>
              <a href="#how"
                className="inline-flex items-center gap-2 bg-white/90 font-semibold px-7 py-4 rounded-full shadow-md hover:shadow-lg transition">
                How it works
              </a>
            </div>
            <div className="lp-text flex flex-wrap gap-5 mt-8 text-sm text-slate-600 font-medium">
              {['Free for patients', 'No app install', 'Real-time updates'].map((t) => (
                <span key={t} className="flex items-center gap-1.5">
                  <CheckCircle2 size={16} className="text-emerald-500" /> {t}
                </span>
              ))}
            </div>
          </div>

          <div className="relative flex justify-center animate-fade-up" style={{ animationDelay: '0.2s' }}>
            <div className="w-80 bg-white rounded-[2rem] shadow-2xl shadow-violet-300 p-5 animate-float">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Sharma Clinic</p>
              <div className="mt-3 rounded-3xl p-6 text-center text-white bg-gradient-to-br from-violet-600 via-pink-500 to-amber-400">
                <p className="text-xs uppercase tracking-widest opacity-90">Now serving</p>
                <p className="text-7xl font-extrabold">12</p>
              </div>
              <div className="mt-4 flex items-center gap-3 bg-emerald-50 rounded-2xl p-3">
                <span className="w-12 h-12 rounded-xl bg-emerald-500 text-white font-extrabold text-lg flex items-center justify-center">15</span>
                <div>
                  <p className="text-sm font-bold text-emerald-700">Your token</p>
                  <p className="text-xs text-emerald-600">2 people ahead • about 20 min</p>
                </div>
              </div>
            </div>
            <div className="absolute -top-4 right-4 bg-white rounded-2xl shadow-lg px-4 py-2 flex items-center gap-2 text-sm font-semibold animate-float" style={{ animationDelay: '1s' }}>
              <BellRing size={16} className="text-pink-500" /> You are next!
            </div>
            <div className="absolute -bottom-4 left-2 bg-white rounded-2xl shadow-lg px-4 py-2 flex items-center gap-2 text-sm font-semibold animate-float" style={{ animationDelay: '2s' }}>
              <Zap size={16} className="text-amber-500" /> Live updates
            </div>
          </div>
        </div>
      </section>

      {/* ================= STATS BAND ================= */}
      <section className="relative -mt-12 z-10 px-4">
        <div className="max-w-5xl mx-auto rounded-[2rem] bg-gradient-to-r from-violet-700 via-fuchsia-600 to-pink-500 text-white shadow-2xl shadow-violet-300 p-8 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          {stats.map((s) => (
            <div key={s.label}>
              <p className="text-4xl font-extrabold">{s.value}</p>
              <p className="text-sm opacity-90 mt-1">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ================= HOW IT WORKS ================= */}
      <section id="how" className="lp-light relative mt-20 py-20 bg-gradient-to-b from-violet-100/70 via-pink-100/60 to-amber-100/60">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="lp-title text-center text-4xl font-extrabold">How it works</h2>
          <p className="lp-text text-center text-slate-600 mt-2">Three simple steps. That is it.</p>
          <div className="grid md:grid-cols-3 gap-6 mt-12">
            {steps.map(({ icon: Icon, title, text, color }, i) => (
              <div key={title} className="lp-card relative bg-white rounded-3xl p-7 shadow-xl shadow-violet-200/70 hover:-translate-y-2 transition">
                <span className="absolute top-5 right-6 text-6xl font-extrabold text-violet-100">{i + 1}</span>
                <span className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${color} text-white flex items-center justify-center shadow-lg`}>
                  <Icon size={26} />
                </span>
                <h3 className="text-xl font-bold mt-5">{title}</h3>
                <p className="lp-muted text-slate-500 mt-2 text-sm leading-relaxed">{text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ================= FEATURES (dark) ================= */}
      <section className="relative py-20 bg-gradient-to-br from-slate-900 via-indigo-950 to-purple-950 text-white overflow-hidden">
        <div className="absolute -top-20 -left-20 w-96 h-96 rounded-full bg-violet-600/30 blur-3xl" />
        <div className="absolute -bottom-20 -right-20 w-96 h-96 rounded-full bg-pink-600/30 blur-3xl" />
        <div className="relative max-w-6xl mx-auto px-4">
          <h2 className="text-center text-4xl font-extrabold">
            Built for{' '}
            <span className="bg-gradient-to-r from-pink-400 to-amber-300 bg-clip-text text-transparent">
              patients and doctors
            </span>
          </h2>
          <p className="text-center text-slate-300 mt-2">Everything a small clinic needs, nothing it does not.</p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 mt-12">
            {features.map(({ icon: Icon, title, text, color }) => (
              <div key={title}
                className="bg-white/10 backdrop-blur border border-white/15 rounded-3xl p-6 hover:bg-white/15 hover:-translate-y-1 transition">
                <span className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${color} text-white flex items-center justify-center shadow-lg`}>
                  <Icon size={22} />
                </span>
                <h3 className="font-bold text-lg mt-4">{title}</h3>
                <p className="text-slate-300 text-sm mt-1.5 leading-relaxed">{text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ================= FOR DOCTORS ================= */}
      <section className="lp-light-alt relative py-20 bg-gradient-to-br from-amber-100 via-pink-100 to-violet-100">
        <div className="max-w-6xl mx-auto px-4 grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <span className="inline-flex items-center gap-2 bg-white rounded-full px-4 py-2 shadow-sm text-sm font-semibold text-pink-600">
              <LayoutDashboard size={16} /> For doctors and clinics
            </span>
            <h2 className="lp-title text-4xl font-extrabold mt-5 leading-tight">
              Run a calmer clinic,{' '}
              <span className="bg-gradient-to-r from-violet-600 to-pink-500 bg-clip-text text-transparent">
                every single day
              </span>
            </h2>
            <p className="lp-text text-slate-600 mt-4">
              No more shouting names in a crowded room. Manage the whole queue from one simple dashboard.
            </p>
            <ul className="mt-6 space-y-3">
              {doctorPoints.map((p) => (
                <li key={p} className="lp-text flex items-start gap-3 font-medium">
                  <span className="mt-0.5 w-6 h-6 rounded-full bg-gradient-to-br from-violet-500 to-pink-500 text-white flex items-center justify-center shrink-0">
                    <CheckCircle2 size={14} />
                  </span>
                  {p}
                </li>
              ))}
            </ul>
            <Link to={home}
              className="inline-flex items-center gap-2 mt-8 bg-gradient-to-r from-violet-600 to-pink-500 text-white font-bold px-7 py-4 rounded-full shadow-xl shadow-pink-300 hover:-translate-y-0.5 transition">
              Register your clinic <ArrowRight size={18} />
            </Link>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {[
              { icon: BarChart3, label: 'Daily insights', grad: 'from-violet-500 to-pink-500' },
              { icon: Smartphone, label: 'Works on any phone', grad: 'from-sky-400 to-violet-500' },
              { icon: QrCode, label: 'QR code for your door', grad: 'from-emerald-400 to-sky-400' },
              { icon: Siren, label: 'Urgent patients first', grad: 'from-amber-300 to-pink-400' },
            ].map(({ icon: Icon, label, grad }) => (
              <div key={label}
                className={`bg-gradient-to-br ${grad} text-white rounded-3xl p-6 shadow-xl hover:-translate-y-1 transition`}>
                <Icon size={28} className="opacity-90" />
                <p className="font-bold mt-4">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ================= CTA ================= */}
      <section className="relative max-w-5xl mx-auto px-4 py-20">
        <div className="rounded-[2.5rem] p-12 text-center text-white bg-gradient-to-br from-violet-600 via-pink-500 to-amber-400 shadow-2xl shadow-pink-300 overflow-hidden relative">
          <div className="absolute -top-16 -right-16 w-56 h-56 rounded-full bg-white/20" />
          <div className="absolute -bottom-20 -left-10 w-52 h-52 rounded-full bg-white/10" />
          <h2 className="relative text-4xl font-extrabold">Ready to ditch the waiting room?</h2>
          <p className="relative mt-3 opacity-90">Join as a patient or register your clinic in under a minute.</p>
          <Link to={home}
            className="relative inline-flex items-center gap-2 mt-8 bg-white text-violet-700 font-bold px-8 py-4 rounded-full hover:scale-105 transition shadow-xl">
            {user ? 'Open app' : 'Create free account'} <ArrowRight size={18} />
          </Link>
        </div>
      </section>

      {/* ================= FOOTER ================= */}
      <footer className="bg-slate-900 text-slate-300 py-10 text-center text-sm">
        <div className="flex items-center justify-center gap-2 mb-2">
          <span className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-pink-500 flex items-center justify-center text-white">
            <Stethoscope size={16} />
          </span>
          <span className="font-extrabold text-white text-lg">Qlinic</span>
        </div>
        <p>Line nahi, Qlinic. Built with React, Node.js, Express, MongoDB and Socket.io.</p>
      </footer>
    </div>
  );
}