import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import api from '@/lib/api';
import { usePageSize } from '@/hooks/use-page-size';
import {
  Table, TableHeader, TableBody, TableRow, TableHead, TableCell,
} from '@/components/ui/table';
import { Loader2, ChevronLeft, ChevronRight } from 'lucide-react';

export default function AdminUsersPage() {
  const { size, ready } = usePageSize();
  const [users, setUsers] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    const { data } = await api.get('/admin/users', { params: { page, per_page: size } });
    setUsers(data.data.items);
    setTotal(data.data.meta.total);
    setLoading(false);
  }, [page, size]);

  useEffect(() => { if (ready) fetchUsers(); }, [fetchUsers, ready]);

  const handleRoleChange = async (userId: number, role: string) => {
    await api.put(`/admin/users/${userId}`, { role });
    setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, role } : u)));
  };

  const totalPages = Math.max(1, Math.ceil(total / size));

  return (
    <div className="flex flex-col flex-1 min-h-0">
      <h2 className="text-xl font-bold mb-4 shrink-0">用户管理</h2>
      {loading ? <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin" /></div> : (
        <div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead><TableHead>用户名</TableHead><TableHead>邮箱</TableHead><TableHead>邮箱验证</TableHead><TableHead>角色</TableHead><TableHead>注册时间</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((u) => (
                <TableRow key={u.id}>
                  <TableCell>{u.id}</TableCell>
                  <TableCell className="font-medium">{u.username}</TableCell>
                  <TableCell className="text-muted-foreground">{u.email || '-'}</TableCell>
                  <TableCell>
                    <Badge variant={u.email_verified ? 'default' : 'secondary'} className="text-xs">{u.email_verified ? '已验证' : '未验证'}</Badge>
                  </TableCell>
                  <TableCell>
                    <Select value={u.role} onValueChange={(v) => handleRoleChange(u.id, v)}>
                      <SelectTrigger className="w-24 h-8 text-xs"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="user">用户</SelectItem>
                        <SelectItem value="editor">编辑</SelectItem>
                        <SelectItem value="admin">管理员</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell className="text-muted-foreground text-xs">{u.created_at ? new Date(u.created_at).toLocaleDateString('zh-CN') : '-'}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
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
