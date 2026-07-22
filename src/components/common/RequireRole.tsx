import { useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { toast } from 'sonner';
import type { RootState } from '@/store';
import type { User } from '@/store/authSlice';

interface RequireRoleProps {
    children: React.ReactNode;
    roles: User['role'][];
}

export default function RequireRole({ children, roles }: RequireRoleProps) {
    const { user, init } = useSelector((s: RootState) => s.auth);
    const unauthorized = init && !!user && !roles.includes(user.role);

    useEffect(() => {
        if (unauthorized) toast.error('权限不足');
    }, [unauthorized]);

    if (!init) return null;
    if (!user) return null; // RequireAuth should handle this

    if (unauthorized) {
        return <Navigate to="/user" replace />;
    }

    return <>{children}</>;
}
