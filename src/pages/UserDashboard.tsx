import { useSelector } from 'react-redux';
import { Card, CardContent } from '@/components/ui/card';
import type { RootState } from '@/store';

export default function UserDashboard() {
  const user = useSelector((s: RootState) => s.auth.user);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-foreground">
        欢迎回来{user ? `，${user.username}` : ''}
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6">
            <p className="text-sm text-muted-foreground">邮箱状态</p>
            <p className="text-lg font-semibold text-foreground mt-1">
              {user?.email_verified ? '已验证' : '未验证'}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <p className="text-sm text-muted-foreground">角色</p>
            <p className="text-lg font-semibold text-foreground mt-1">
              {user?.role === 'admin' ? '管理员' : '用户'}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <p className="text-sm text-muted-foreground">注册时间</p>
            <p className="text-lg font-semibold text-foreground mt-1">
              {user?.created_at ? new Date(user.created_at).toLocaleDateString('zh-CN') : '-'}
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
