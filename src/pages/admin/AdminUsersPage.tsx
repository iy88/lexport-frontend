import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import api from '@/lib/api';
import { usePageSize } from '@/hooks/use-page-size';
import { Loader2, ChevronLeft, ChevronRight } from 'lucide-react';

export default function AdminUsersPage() {
  const perPage = usePageSize();
  const [users, setUsers] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    const { data } = await api.get('/admin/users', { params: { page, per_page: perPage } });
    setUsers(data.data.items);
    setTotal(data.data.meta.total);
    setLoading(false);
  }, [page, perPage]);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  const handleRoleChange = async (userId: number, role: string) => {
    await api.put(`/admin/users/${userId}`, { role });
    setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, role } : u)));
  };

  const totalPages = Math.max(1, Math.ceil(total / perPage));

  return (
    <div className="flex flex-col flex-1 min-h-0">
      <h2 className="text-xl font-bold mb-4 shrink-0">用户管理</h2>
      {loading ? <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin" /></div> : (
        <div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="border-b text-left text-muted-foreground">
                <th className="p-3">ID</th><th className="p-3">用户名</th><th className="p-3">邮箱</th><th className="p-3">邮箱验证</th><th className="p-3">角色</th><th className="p-3">注册时间</th>
              </tr></thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id} className="border-b hover:bg-muted/30">
                    <td className="p-3">{u.id}</td>
                    <td className="p-3 font-medium">{u.username}</td>
                    <td className="p-3 text-muted-foreground">{u.email || '-'}</td>
                    <td className="p-3">
                      <Badge variant={u.email_verified ? 'default' : 'secondary'} className="text-xs">{u.email_verified ? '已验证' : '未验证'}</Badge>
                    </td>
                    <td className="p-3">
                      <Select value={u.role} onValueChange={(v) => handleRoleChange(u.id, v)}>
                        <SelectTrigger className="w-24 h-8 text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="user">用户</SelectItem>
                          <SelectItem value="editor">编辑</SelectItem>
                          <SelectItem value="admin">管理员</SelectItem>
                        </SelectContent>
                      </Select>
                    </td>
                    <td className="p-3 text-muted-foreground text-xs">{u.created_at ? new Date(u.created_at).toLocaleDateString('zh-CN') : '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2 pt-4 shrink-0">
          <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}><ChevronLeft className="w-4 h-4" /></Button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <Button key={p} variant={p === page ? 'default' : 'outline'} size="sm" className="w-9 h-9" onClick={() => setPage(p)}>{p}</Button>
          ))}
          <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}><ChevronRight className="w-4 h-4" /></Button>
        </div>
      )}
    </div>
  );
}
