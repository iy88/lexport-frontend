import {useEffect, useState} from 'react';
import {Link, useNavigate, useParams} from 'react-router-dom';
import {ArrowRight, CheckCircle2, Loader2, Scale, XCircle} from 'lucide-react';
import {useDispatch, useSelector} from 'react-redux';
import {Button} from '@/components/ui/button';
import {Card, CardContent} from '@/components/ui/card';
import api from '@/lib/api';
import {fetchProfile} from '@/store/authSlice';
import type {AppDispatch, RootState} from '@/store';

type Status = 'loading' | 'success' | 'error';

export default function VerifyEmailPage() {
    const {token} = useParams<{ token: string }>();
    const dispatch = useDispatch<AppDispatch>();
    const navigate = useNavigate();
    const loggedIn = useSelector((s: RootState) => !!s.auth.user);
    const [status, setStatus] = useState<Status>('loading');
    const [message, setMessage] = useState('');

    useEffect(() => {
        if (!token) {
            setStatus('error');
            setMessage('缺少验证令牌');
            return;
        }
        api
            .post('/auth/verify-email', {token})
            .then(({data}) => {
                setStatus('success');
                setMessage(data.message);
                // Refresh profile so email_verified updates without re-login
                if (loggedIn) dispatch(fetchProfile());
            })
            .catch((err) => {
                setStatus('error');
                setMessage(
                    err.response?.data?.error?.message || '验证失败，请重试'
                );
            });
    }, [token, dispatch, loggedIn]);

    return (
        <div
            className="min-h-screen flex items-center justify-center px-4 py-12 bg-background">
            <Card className="w-full max-w-md shadow-card">
                <CardContent className="p-8 text-center">
                    <div className="mb-6">
                        {status === 'loading' ? (
                            <Loader2 className="w-12 h-12 text-primary mx-auto animate-spin"/>
                        ) : status === 'success' ? (
                            <CheckCircle2 className="w-12 h-12 text-success mx-auto"/>
                        ) : (
                            <XCircle className="w-12 h-12 text-destructive mx-auto"/>
                        )}
                    </div>

                    <h1 className="text-xl font-bold text-foreground mb-2">
                        {status === 'loading'
                            ? '正在验证邮箱…'
                            : status === 'success'
                                ? '验证成功'
                                : '验证失败'}
                    </h1>

                    <p className="text-sm text-muted-foreground mb-8">
                        {status === 'loading' ? '请稍候，正在处理你的验证请求' : message}
                    </p>

                    <div className="flex flex-col gap-3">
                        {status === 'success' && (
                            <Button className="w-full" onClick={() => navigate(loggedIn ? '/user' : '/login')}>
                                {loggedIn ? '前往个人中心' : '前往登录'}
                                <ArrowRight className="w-4 h-4 ml-2"/>
                            </Button>
                        )}
                        <Link to="/"
                              className="inline-flex items-center justify-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
                            <Scale className="w-4 h-4"/>
                            返回首页
                        </Link>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
