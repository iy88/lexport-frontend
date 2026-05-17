import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { Scale, LayoutDashboard, LogOut, FileText, Newspaper, Building2, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { logout } from '@/store/authSlice';
import type { RootState, AppDispatch } from '@/store';

const adminLinks = [
  { to: '/admin/laws', icon: FileText, label: '法规管理' },
  { to: '/admin/news', icon: Newspaper, label: '资讯管理' },
  { to: '/admin/agencies', icon: Building2, label: '机构管理' },
];

export default function UserLayout() {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const user = useSelector((s: RootState) => s.auth.user);
  const showAdmin = user?.role === 'admin' || user?.role === 'editor';

  const handleLogout = () => {
    dispatch(logout());
    navigate('/', { replace: true });
  };

  return (
    <div className="h-screen flex overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 shrink-0 border-r border-border bg-card flex flex-col">
        <Link to="/" className="flex items-center gap-2 px-6 h-16 border-b border-border shrink-0">
          <Scale className="w-6 h-6 text-primary" />
          <span className="text-lg font-bold text-foreground">律航出海</span>
        </Link>
        <nav className="flex-1 p-4 space-y-1">
          <Link
            to="/user"
            className={`flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-md transition-colors ${pathname === '/user' ? 'text-foreground bg-primary/10' : 'text-muted-foreground hover:text-foreground hover:bg-accent'}`}
          >
            <LayoutDashboard className="w-4 h-4" />
            仪表盘
          </Link>
          {user?.role === 'admin' && (
            <>
              <Link
                to="/admin/users"
                className={`flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-md transition-colors ${pathname === '/admin/users' ? 'text-foreground bg-primary/10' : 'text-muted-foreground hover:text-foreground hover:bg-accent'}`}
              >
                <Users className="w-4 h-4" />
                用户管理
              </Link>
            </>
          )}
          {showAdmin && (
            <>
              <div className="pt-4 pb-1 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">内容管理</div>
              {adminLinks.map(({ to, icon: I, label }) => (
                <Link
                  key={to}
                  to={to}
                  className={`flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-md transition-colors ${pathname.startsWith(to) ? 'text-foreground bg-primary/10' : 'text-muted-foreground hover:text-foreground hover:bg-accent'}`}
                >
                  <I className="w-4 h-4" />
                  {label}
                </Link>
              ))}
            </>
          )}
        </nav>
        <div className="p-4 border-t border-border">
          <Button
            variant="ghost"
            className="w-full justify-start text-muted-foreground"
            onClick={handleLogout}
          >
            <LogOut className="w-4 h-4 mr-3" />
            退出登录
          </Button>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 px-6 py-4 overflow-hidden flex flex-col">
        <Outlet />
      </main>
    </div>
  );
}
