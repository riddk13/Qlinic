import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Phone, Lock, User, Stethoscope, Eye, EyeOff } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../api/api';
import BackButton from '../components/BackButton';

const input =
  'w-full bg-slate-50 border-2 border-transparent rounded-2xl pl-11 pr-4 py-3 text-sm focus:outline-none focus:border-violet-400 focus:bg-white transition';

export default function Login() {
  const [isRegister, setIsRegister] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [form, setForm] = useState({ name: '', phone: '', password: '', role: 'patient' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [params] = useSearchParams();

  const change = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { data } = await api.post(isRegister ? '/auth/register' : '/auth/login', form);
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      toast.success(`Welcome, ${data.user.name}!`);
      navigate(data.user.role === 'patient' ? (params.get('next') || '/clinics') : '/dashboard');
    } catch (err) {
      setError(err.response?.data?.msg || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative overflow-hidden min-h-screen flex items-center justify-center px-4 py-10">
      <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full bg-pink-300/40 blur-3xl animate-blob" />
      <div className="absolute top-1/3 -right-24 w-96 h-96 rounded-full bg-violet-300/40 blur-3xl animate-blob" />
      <div className="absolute -bottom-24 left-1/3 w-96 h-96 rounded-full bg-amber-200/50 blur-3xl animate-blob" />

      <div className="absolute top-6 left-6 z-10">
        <BackButton to="/" label="Home" />
      </div>

      <div className="relative w-full max-w-md bg-white/90 backdrop-blur rounded-3xl shadow-2xl shadow-violet-200/60 p-8 animate-fade-up">
        <div className="flex items-center gap-2 mb-6">
          <span className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-pink-500 flex items-center justify-center text-white shadow-md">
            <Stethoscope size={22} />
          </span>
          <span className="text-2xl font-extrabold bg-gradient-to-r from-violet-600 to-pink-500 bg-clip-text text-transparent">
            Qlinic
          </span>
        </div>

        <h2 className="text-3xl font-extrabold">{isRegister ? 'Create account' : 'Welcome back'}</h2>
        <p className="text-slate-500 text-sm mt-1 mb-6">
          {isRegister ? 'It only takes a few details' : 'Login with your phone number'}
        </p>

        <form onSubmit={submit} className="space-y-3">
          {isRegister && (
            <>
              <div className="relative">
                <User size={18} className="absolute left-4 top-3.5 text-slate-400" />
                <input name="name" placeholder="Full name" onChange={change} required className={input} />
              </div>
              <div className="grid grid-cols-2 gap-2">
                {[['patient', 'I am a Patient'], ['staff', 'I am a Doctor']].map(([val, label]) => (
                  <button type="button" key={val} onClick={() => setForm({ ...form, role: val })}
                    className={`py-3 rounded-2xl text-sm font-semibold border-2 transition ${
                      form.role === val
                        ? 'border-violet-500 bg-violet-50 text-violet-700'
                        : 'border-slate-100 bg-slate-50 text-slate-500 hover:border-violet-200'
                    }`}>
                    {label}
                  </button>
                ))}
              </div>
            </>
          )}
          <div className="relative">
            <Phone size={18} className="absolute left-4 top-3.5 text-slate-400" />
            <input name="phone" placeholder="Phone number" onChange={change} required className={input} />
          </div>
          <div className="relative">
            <Lock size={18} className="absolute left-4 top-3.5 text-slate-400" />
            <input name="password" type={showPass ? 'text' : 'password'} placeholder="Password"
              onChange={change} required className={input} />
            <button type="button" onClick={() => setShowPass(!showPass)}
              className="absolute right-4 top-3.5 text-slate-400 hover:text-violet-500">
              {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          {error && <p className="text-sm text-pink-600 bg-pink-50 rounded-xl px-4 py-2.5">{error}</p>}

          <button type="submit" disabled={loading}
            className="w-full bg-gradient-to-r from-violet-600 to-pink-500 hover:from-violet-700 hover:to-pink-600 disabled:opacity-60 text-white font-bold py-3.5 rounded-2xl shadow-lg shadow-pink-200 transition hover:-translate-y-0.5">
            {loading ? 'Please wait...' : isRegister ? 'Create account' : 'Login'}
          </button>
        </form>

        <button onClick={() => { setIsRegister(!isRegister); setError(''); }}
          className="mt-5 text-sm font-semibold text-violet-600 hover:underline w-full text-center">
          {isRegister ? 'Already have an account? Login' : "Don't have an account? Sign up"}
        </button>
      </div>
    </div>
  );
}