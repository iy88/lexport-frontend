import React, {useEffect, useState} from 'react';
import {Link, useNavigate, useSearchParams} from 'react-router-dom';
import {useDispatch, useSelector} from 'react-redux';
import {Button} from '@/components/ui/button';
import {Input} from '@/components/ui/input';
import {Label} from '@/components/ui/label';
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from '@/components/ui/card';
import {Tabs, TabsContent, TabsList, TabsTrigger} from '@/components/ui/tabs';
import {ArrowLeft, Eye, EyeOff, Loader2, Scale} from 'lucide-react';
import {toast} from 'sonner';
import type {AppDispatch, RootState} from '@/store';
import {clearError, clearRegisterResult, login, register} from '@/store/authSlice';

const LoginPage: React.FC = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const dispatch = useDispatch<AppDispatch>();
    const {user, token, loading, error, registerEmailSent} = useSelector((s: RootState) => s.auth);

    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [loginForm, setLoginForm] = useState({login_id: '', password: ''});
    const [registerForm, setRegisterForm] = useState({
        username: '',
        password: '',
        confirmPassword: '',
        email: '',
    });

    useEffect(() => {
        if (user && token && registerEmailSent === null) {
            // Login: navigate immediately
            const redirect = searchParams.get('redirect');
            navigate(redirect || '/', { replace: true });
        }
        if (user && token && registerEmailSent !== null) {
            if (registerEmailSent) {
                toast.success('注册成功，请查收验证邮件');
            } else {
                toast.warning('账号已创建，但验证邮件发送失败，请在账户页重试');
            }
            dispatch(clearRegisterResult());
            navigate('/user', {replace: true});
        }
    }, [user, token, navigate, searchParams, registerEmailSent, dispatch]);

    // Show registration verification status
    useEffect(() => {
        if (error) {
            toast.error(error);
            dispatch(clearError());
        }
    }, [error, dispatch]);

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        if (!loginForm.login_id || !loginForm.password) {
            toast.error('请填写登录账号和密码');
            return;
        }
        dispatch(login(loginForm));
    };

    const handleRegister = (e: React.FormEvent) => {
        e.preventDefault();
        if (!registerForm.username || !registerForm.password || !registerForm.email) {
            toast.error('请填写所有必填项');
            return;
        }
        if (!/^[a-zA-Z0-9_]{3,50}$/.test(registerForm.username)) {
            toast.error('用户名需为3-50位字母、数字或下划线');
            return;
        }
        if (registerForm.password.length < 8) {
            toast.error('密码长度不少于8位');
            return;
        }
        if (!/[a-zA-Z]/.test(registerForm.password) || !/\d/.test(registerForm.password)) {
            toast.error('密码需包含字母和数字');
            return;
        }
        if (registerForm.password !== registerForm.confirmPassword) {
            toast.error('两次输入的密码不一致');
            return;
        }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(registerForm.email)) {
            toast.error('请输入正确的邮箱格式');
            return;
        }
        dispatch(register({
            username: registerForm.username,
            password: registerForm.password,
            email: registerForm.email,
        }));
    };

    return (
        <div
            className="min-h-screen flex items-center justify-center px-4 py-12 bg-background">
            <div className="w-full max-w-md">
                <div className="mb-8 text-center">
                    <Link to="/"
                          className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-6">
                        <ArrowLeft className="w-4 h-4"/>
                        <span className="text-sm">返回首页</span>
                    </Link>
                    <div className="flex items-center justify-center gap-2 mb-4">
                        <Scale className="w-8 h-8 text-primary"/>
                        <span className="text-2xl font-bold text-foreground">律航出海</span>
                    </div>
                    <p className="text-sm text-muted-foreground">法律AI智能体 · 非洲制造业合规平台</p>
                </div>

                <Card className="shadow-card">
                    <Tabs defaultValue="login" className="w-full">
                        <TabsList className="grid w-full grid-cols-2">
                            <TabsTrigger value="login">登录</TabsTrigger>
                            <TabsTrigger value="register">注册</TabsTrigger>
                        </TabsList>

                        <TabsContent value="login">
                            <form onSubmit={handleLogin}>
                                <CardHeader className="pb-4">
                                    <CardTitle className="text-xl">欢迎回来</CardTitle>
                                    <CardDescription>登录后体验完整的合规初诊与机构推荐服务</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="login-id">用户名 / 邮箱</Label>
                                        <Input
                                            id="login-id"
                                            placeholder="请输入用户名或邮箱"
                                            value={loginForm.login_id}
                                            onChange={(e) => setLoginForm((p) => ({...p, login_id: e.target.value}))}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <div className="flex items-center justify-between">
                                            <Label htmlFor="login-password">密码</Label>
                                            <button type="button" className="text-xs text-primary hover:underline">
                                                忘记密码？
                                            </button>
                                        </div>
                                        <div className="relative">
                                            <Input
                                                id="login-password"
                                                type={showPassword ? 'text' : 'password'}
                                                placeholder="请输入密码"
                                                value={loginForm.password}
                                                onChange={(e) => setLoginForm((p) => ({
                                                    ...p,
                                                    password: e.target.value
                                                }))}
                                            />
                                            <button
                                                type="button"
                                                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                                                onClick={() => setShowPassword(!showPassword)}
                                            >
                                                {showPassword ? <EyeOff className="w-4 h-4"/> :
                                                    <Eye className="w-4 h-4"/>}
                                            </button>
                                        </div>
                                    </div>
                                    <Button type="submit" className="w-full h-11" disabled={loading}>
                                        {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin"/> : null}
                                        登录
                                    </Button>
                                </CardContent>
                            </form>
                        </TabsContent>

                        <TabsContent value="register">
                            <form onSubmit={handleRegister}>
                                <CardHeader className="pb-4">
                                    <CardTitle className="text-xl">创建账号</CardTitle>
                                    <CardDescription>注册后即可使用合规初诊与机构匹配服务</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="register-username">用户名 *</Label>
                                        <Input
                                            id="register-username"
                                            placeholder="3-50位字母、数字或下划线"
                                            value={registerForm.username}
                                            onChange={(e) => setRegisterForm((p) => ({...p, username: e.target.value}))}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="register-email">邮箱 *</Label>
                                        <Input
                                            id="register-email"
                                            type="email"
                                            placeholder="请输入邮箱"
                                            value={registerForm.email}
                                            onChange={(e) => setRegisterForm((p) => ({...p, email: e.target.value}))}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="register-password">密码 *</Label>
                                        <div className="relative">
                                            <Input
                                                id="register-password"
                                                type={showPassword ? 'text' : 'password'}
                                                placeholder="密码不少于8位"
                                                value={registerForm.password}
                                                onChange={(e) => setRegisterForm((p) => ({
                                                    ...p,
                                                    password: e.target.value
                                                }))}
                                            />
                                            <button
                                                type="button"
                                                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                                                onClick={() => setShowPassword(!showPassword)}
                                            >
                                                {showPassword ? <EyeOff className="w-4 h-4"/> :
                                                    <Eye className="w-4 h-4"/>}
                                            </button>
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="register-confirm">确认密码 *</Label>
                                        <div className="relative">
                                            <Input
                                                id="register-confirm"
                                                type={showConfirmPassword ? 'text' : 'password'}
                                                placeholder="请再次输入密码"
                                                value={registerForm.confirmPassword}
                                                onChange={(e) => setRegisterForm((p) => ({
                                                    ...p,
                                                    confirmPassword: e.target.value
                                                }))}
                                            />
                                            <button
                                                type="button"
                                                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                            >
                                                {showConfirmPassword ? <EyeOff className="w-4 h-4"/> :
                                                    <Eye className="w-4 h-4"/>}
                                            </button>
                                        </div>
                                    </div>
                                    <Button type="submit" className="w-full h-11" disabled={loading}>
                                        {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin"/> : null}
                                        注册
                                    </Button>
                                </CardContent>
                            </form>
                        </TabsContent>
                    </Tabs>
                </Card>
            </div>
        </div>
    );
};

export default LoginPage;
