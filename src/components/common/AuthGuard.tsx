import {type ReactNode, useEffect} from 'react';
import {useDispatch, useSelector} from 'react-redux';
import {Loader2} from 'lucide-react';
import type {AppDispatch, RootState} from '@/store';
import {fetchProfile} from '@/store/authSlice';

export default function AuthGuard({children}: { children: ReactNode }) {
    const dispatch = useDispatch<AppDispatch>();
    const {token, user, init} = useSelector((s: RootState) => s.auth);

    useEffect(() => {
        if (token && !user && !init) {
            dispatch(fetchProfile());
        }
    }, [token, user, init, dispatch]);

    if (token && !init) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-primary animate-spin"/>
            </div>
        );
    }

    return <>{children}</>;
}
