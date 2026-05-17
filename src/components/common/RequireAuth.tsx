import { Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import type { RootState } from '@/store';

export default function RequireAuth({ children }: { children: React.ReactNode }) {
  const { user, init } = useSelector((s: RootState) => s.auth);
  if (!init || user) return <>{children}</>;
  return <Navigate to="/login" replace />;
}
