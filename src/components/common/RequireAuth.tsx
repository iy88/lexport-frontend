import {Navigate, useLocation} from 'react-router-dom';
import {useSelector} from 'react-redux';
import type {RootState} from '@/store';

export default function RequireAuth({children}: { children: React.ReactNode }) {
    const {user, init} = useSelector((s: RootState) => s.auth);
    const location = useLocation();

    if (!init) return null;
    if (user) return <>{children}</>;

    const search = location.pathname !== '/login'
        ? `?redirect=${encodeURIComponent(location.pathname)}`
        : '';
    return <Navigate to={`/login${search}`} replace/>;
}
