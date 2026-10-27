import { useState } from 'react';
import { Moon, Sun } from 'lucide-react';

export default function ThemeToggle() {
  const [dark, setDark] = useState(document.documentElement.classList.contains('dark'));

  const toggle = () => {
    const next = !dark;
    document.documentElement.classList.toggle('dark', next);
    localStorage.setItem('theme', next ? 'dark' : 'light');
    setDark(next);
  };

  return (
    <button onClick={toggle} aria-label="Toggle dark mode"
      className="fixed bottom-5 right-5 z-50 w-12 h-12 rounded-full bg-gradient-to-br from-violet-600 to-pink-500 text-white shadow-xl flex items-center justify-center hover:scale-110 transition">
      {dark ? <Sun size={20} /> : <Moon size={20} />}
    </button>
  );
}