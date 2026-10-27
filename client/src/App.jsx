import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Clinics from './pages/Clinics';
import Queue from './pages/Queue';
import Dashboard from './pages/Dashboard';
import MyTokens from './pages/MyTokens';
import MyClinics from './pages/MyClinics';
import History from './pages/History';
import Profile from './pages/Profile';
import Protected from './components/Protected';
import Navbar from './components/Navbar';
import ThemeToggle from './components/ThemeToggle';

if (localStorage.getItem('theme') === 'dark') {
  document.documentElement.classList.add('dark');
}

export default function App() {
  return (
    <BrowserRouter>
      <Toaster position="top-center" toastOptions={{ style: { borderRadius: '16px', fontWeight: 600 } }} />
      <Navbar />
      <ThemeToggle />
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/clinics" element={<Protected role="patient"><Clinics /></Protected>} />
        <Route path="/my-tokens" element={<Protected role="patient"><MyTokens /></Protected>} />
        <Route path="/profile" element={<Protected role="patient"><Profile /></Protected>} />
        <Route path="/queue/:id" element={<Protected><Queue /></Protected>} />
        <Route path="/dashboard" element={<Protected role="staff"><Dashboard /></Protected>} />
        <Route path="/my-clinics" element={<Protected role="staff"><MyClinics /></Protected>} />
        <Route path="/history" element={<Protected role="staff"><History /></Protected>} />
      </Routes>
    </BrowserRouter>
  );
}