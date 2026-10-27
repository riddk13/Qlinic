import { Navigate, useLocation } from 'react-router-dom';

export default function Protected({ children, role }) {
  const { pathname } = useLocation();
  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user') || 'null');

  if (!token || !user) return <Navigate to={`/login?next=${encodeURIComponent(pathname)}`} />;
  if (role && user.role !== role) return <Navigate to="/" />;
  return children;
}