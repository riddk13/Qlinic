import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

export default function BackButton({ to, label = 'Back' }) {
  const navigate = useNavigate();
  return (
    <button
      onClick={() => (to ? navigate(to) : navigate(-1))}
      className="inline-flex items-center gap-2 bg-white hover:bg-violet-50 text-slate-600 hover:text-violet-600 text-sm font-semibold px-4 py-2 rounded-full shadow-sm border border-slate-100 transition hover:-translate-x-0.5"
    >
      <ArrowLeft size={16} /> {label}
    </button>
  );
}