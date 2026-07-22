import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { BadgeCheck, Calendar, ClipboardCheck, Loader2, Mail, Send, Shield, Stethoscope } from 'lucide-react';
import { toast } from 'sonner';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import api from '@/lib/api';
import { fetchProfile, updateUser } from '@/store/authSlice';
import type { AppDispatch, RootState } from '@/store';

const ROLE_LABELS: Record<string, string> = {
    admin: '管理员',
    editor: '编辑',
    user: '用户',
};

export default function UserDashboard() {
    const dispatch = useDispatch<AppDispatch>();
    const user = useSelector((s: RootState) => s.auth.user);

    // Email change dialog
    const [emailOpen, setEmailOpen] = useState(false);
    const [newEmail, setNewEmail] = useState('');
    const [password, setPassword] = useState('');
    const [saving, setSaving] = useState(false);

    // Resend verification
    const [resending, setResending] = useState(false);

    const handleEmailChange = async () => {
        if (!newEmail.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newEmail)) {
            toast.error('请输入正确的邮箱格式');
            return;
        }
        if (!password) {
            toast.error('请输入当前密码');
            return;
        }
        setSaving(true);
        try {
            const { data } = await api.put('/user/email', {
                email: newEmail.trim(),
                password,
            });
            if (data.data?.user) {
                dispatch(updateUser(data.data.user));
            }
            setEmailOpen(false);
            if (data.data?.verification_email_sent) {
                toast.success('邮箱已更新，请查收验证邮件');
            } else {
                toast.warning('邮箱已更新，但验证邮件发送失败，请稍后重试');
            }
        } catch (err: unknown) {
            const msg =
                (err as any)?.response?.data?.error?.message || '修改失败，请稍后重试';
            toast.error(msg);
        } finally {
            setPassword('');
            setSaving(false);
        }
    };

    const handleResend = async () => {
        setResending(true);
        try {
            const { data } = await api.post('/user/email/resend-verification');
            if (data.data?.user) {
                dispatch(updateUser(data.data.user));
            }
            toast.success(data.message || '验证邮件已重新发送');
        } catch (err: unknown) {
            const axiosErr = err as {
                response?: { status?: number; data?: { error?: { message?: string } } };
            };
            if (axiosErr.response?.status === 429) {
                toast.error('操作过于频繁，请稍后重试');
            } else if (axiosErr.response?.status === 409) {
                dispatch(fetchProfile());
                toast.info(axiosErr.response?.data?.error?.message || '邮箱已验证');
            } else if (axiosErr.response?.status === 502) {
                toast.error('邮件服务暂时不可用，请稍后重试');
            } else {
                toast.error(
                    axiosErr.response?.data?.error?.message ||
                        '发送失败，请稍后重试',
                );
            }
        } finally {
            setResending(false);
        }
    };

    return (
        <div className="h-full overflow-y-auto">
            <div className="max-w-3xl mx-auto space-y-6">
                {/* Header */}
                <div>
                    <h1 className="text-2xl font-bold text-foreground">
                        个人中心
                    </h1>
                    <p className="text-sm text-muted-foreground mt-1">
                        {user?.username} · {ROLE_LABELS[user?.role || 'user'] ?? '用户'}
                    </p>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-4">
                    <Card className="shadow-card">
                        <CardContent className="p-5 flex items-center gap-4">
                            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                                <Shield className="w-5 h-5 text-primary" />
                            </div>
                            <div className="min-w-0">
                                <p className="text-xs text-muted-foreground">账户角色</p>
                                <p className="text-base font-semibold text-foreground">
                                    {ROLE_LABELS[user?.role || 'user'] ?? '用户'}
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="shadow-card">
                        <CardContent className="p-5 flex items-center gap-4">
                            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                                <Calendar className="w-5 h-5 text-primary" />
                            </div>
                            <div className="min-w-0">
                                <p className="text-xs text-muted-foreground">注册时间</p>
                                <p className="text-base font-semibold text-foreground">
                                    {user?.created_at
                                        ? new Date(user.created_at).toLocaleDateString('zh-CN')
                                        : '-'}
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Quick actions */}
                <div>
                    <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                        快捷操作
                    </h2>
                    <div className="grid grid-cols-2 gap-4">
                        <Link to="/diagnosis" className="group">
                            <Card className="shadow-card hover:shadow-md transition-shadow h-full border-primary/10 group-hover:border-primary/30">
                                <CardContent className="p-5 flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 group-hover:bg-primary/20 transition-colors">
                                        <Stethoscope className="w-5 h-5 text-primary" />
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-sm font-semibold text-foreground">
                                            合规初诊
                                        </p>
                                        <p className="text-xs text-muted-foreground mt-0.5">
                                            创建新的合规报告
                                        </p>
                                    </div>
                                </CardContent>
                            </Card>
                        </Link>
                        <Link to="/user/reports" className="group">
                            <Card className="shadow-card hover:shadow-md transition-shadow h-full border-primary/10 group-hover:border-primary/30">
                                <CardContent className="p-5 flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 group-hover:bg-primary/20 transition-colors">
                                        <ClipboardCheck className="w-5 h-5 text-primary" />
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-sm font-semibold text-foreground">
                                            我的报告
                                        </p>
                                        <p className="text-xs text-muted-foreground mt-0.5">
                                            查看历史合规报告
                                        </p>
                                    </div>
                                </CardContent>
                            </Card>
                        </Link>
                    </div>
                </div>

                {/* Email section */}
                <Card className="shadow-card">
                    <CardContent className="p-6">
                        <div className="flex items-center gap-2 mb-4">
                            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                                <Mail className="w-4 h-4 text-primary" />
                            </div>
                            <h2 className="text-base font-semibold">账户邮箱</h2>
                        </div>

                        <div className="flex items-center gap-3 mb-4 ml-12">
                            <span className="text-sm text-foreground font-medium">
                                {user?.email || '未绑定'}
                            </span>
                            {user?.email_verified ? (
                                <span className="inline-flex items-center gap-1 text-xs text-success bg-success/10 rounded-full px-2 py-0.5">
                                    <BadgeCheck className="w-3 h-3" />
                                    已验证
                                </span>
                            ) : user?.email ? (
                                <span className="inline-flex items-center gap-1 text-xs text-warning bg-warning/10 rounded-full px-2 py-0.5">
                                    未验证
                                </span>
                            ) : null}
                        </div>

                        <div className="flex items-center gap-2 flex-wrap ml-12">
                            {user?.email && !user.email_verified && (
                                <Button
                                    variant="outline"
                                    size="sm"
                                    disabled={resending}
                                    onClick={handleResend}
                                >
                                    {resending ? (
                                        <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                                    ) : (
                                        <Send className="w-4 h-4 mr-1" />
                                    )}
                                    重新发送验证邮件
                                </Button>
                            )}
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                    setNewEmail(user?.email || '');
                                    setPassword('');
                                    setEmailOpen(true);
                                }}
                            >
                                {user?.email ? '更换邮箱' : '绑定邮箱'}
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                <Dialog open={emailOpen} onOpenChange={setEmailOpen}>
                    <DialogContent className="max-w-sm">
                        <DialogHeader>
                            <DialogTitle>
                                {user?.email ? '更换邮箱' : '绑定邮箱'}
                            </DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4 py-2">
                            <div>
                                <Label>新邮箱</Label>
                                <Input
                                    type="email"
                                    value={newEmail}
                                    onChange={(e) => setNewEmail(e.target.value)}
                                    placeholder="请输入新邮箱地址"
                                    disabled={saving}
                                />
                            </div>
                            <div>
                                <Label>当前密码</Label>
                                <Input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="请输入当前密码"
                                    disabled={saving}
                                />
                            </div>
                            <Button
                                className="w-full"
                                onClick={handleEmailChange}
                                disabled={saving || !newEmail.trim() || !password}
                            >
                                {saving
                                    ? '保存中...'
                                    : user?.email
                                      ? '更换邮箱'
                                      : '绑定邮箱'}
                            </Button>
                        </div>
                    </DialogContent>
                </Dialog>
            </div>
        </div>
    );
}
