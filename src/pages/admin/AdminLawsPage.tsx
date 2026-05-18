import { useState, useEffect, useCallback, useRef } from 'react';
import { useSelector } from 'react-redux';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import api from '@/lib/api';
import type { RootState } from '@/store';
import { usePageSize } from '@/hooks/use-page-size';
import { Plus, Pencil, Trash2, Check, Loader2, ChevronLeft, ChevronRight, Clock } from 'lucide-react';

const empty = { title: '', country_id: '', scene_id: '', level: '', penalty: '', effective_date: '', summary: '' };

export default function AdminLawsPage() {
  const role = useSelector((s: RootState) => s.auth.user?.role);
  const isAdmin = role === 'admin';
  const { size, ready } = usePageSize();
  const [items, setItems] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('all');
  const [countries, setCountries] = useState<{ id: string; name_zh: string }[]>([]);
  const [scenes, setScenes] = useState<{ id: string; label_zh: string }[]>([]);
  const metaLoaded = useRef(false);
  const [dlgOpen, setDlgOpen] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [form, setForm] = useState(empty);

  const fetchList = useCallback(async () => {
    setLoading(true);
    const params: Record<string, string | number> = { page, per_page: size };
    if (statusFilter !== 'all') params.status = statusFilter;
    const { data } = await api.get('/admin/laws', { params });
    setItems(data.data.items || []);
    setTotal(data.data.meta?.total || 0);
    if (!metaLoaded.current) {
      metaLoaded.current = true;
      if (data.data.meta?.countries) setCountries(data.data.meta.countries);
      if (data.data.meta?.scenes) setScenes(data.data.meta.scenes);
    }
    setLoading(false);
  }, [page, statusFilter, size]);

  useEffect(() => { if (ready) fetchList(); }, [fetchList, ready]);

  const openNew = () => { setEditId(null); setForm(empty); setDlgOpen(true); };
  const openEdit = (item: any) => { setEditId(item.id); setForm({ title: item.title, country_id: item.country_id, scene_id: item.scene_id, level: item.level || '', penalty: item.penalty || '', effective_date: item.effective_date || '', summary: item.summary || '' }); setDlgOpen(true); };

  const handleSave = async () => {
    if (!form.title || !form.country_id || !form.scene_id) return;
    if (editId) {
      await api.put(`/admin/laws/${editId}`, form);
    } else {
      await api.post('/admin/laws', form);
    }
    setDlgOpen(false);
    fetchList();
  };

  const handleDelete = async (id: number) => {
    if (!confirm('确定删除？')) return;
    await api.delete(`/admin/laws/${id}`);
    fetchList();
  };

  const handleApprove = async (id: number) => {
    await api.post(`/admin/laws/${id}/approve`);
    fetchList();
  };

  const totalPages = Math.max(1, Math.ceil(total / size));

  return (
    <div className="flex flex-col flex-1 min-h-0">
      <div className="flex items-center justify-between mb-4 shrink-0">
        <h2 className="text-xl font-bold">法规管理</h2>
        <div className="flex items-center gap-2">
          {isAdmin && (
            <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setPage(1); }}>
              <SelectTrigger className="w-28 h-8 text-xs"><SelectValue placeholder="全部" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全部</SelectItem>
                <SelectItem value="draft">待审核</SelectItem>
                <SelectItem value="published">已发布</SelectItem>
              </SelectContent>
            </Select>
          )}
          <Button size="sm" onClick={openNew}><Plus className="w-4 h-4 mr-1" />新建</Button>
        </div>
      </div>

      {loading ? <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin" /></div> : (
        <div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="border-b text-left text-muted-foreground">
                <th className="p-3">标题</th><th className="p-3">国家</th><th className="p-3">场景</th><th className="p-3">层级</th><th className="p-3">状态</th><th className="p-3">操作</th>
              </tr></thead>
              <tbody>
                {items.map((item: any) => (
                  <tr key={item.id} className="border-b hover:bg-muted/30">
                    <td className="p-3 font-medium">{item.title}</td>
                    <td className="p-3">{countries.find((c) => c.id === item.country_id)?.name_zh}</td>
                    <td className="p-3"><Badge variant="outline" className="text-xs">{scenes.find((s) => s.id === item.scene_id)?.label_zh}</Badge></td>
                    <td className="p-3">{item.level}</td>
                    <td className="p-3">
                      {item.status === 'draft'
                        ? <Badge variant="secondary" className="text-xs gap-1"><Clock className="w-3 h-3" />草稿</Badge>
                        : <Badge className="bg-success/10 text-success border-success/20 text-xs">已发布</Badge>}
                    </td>
                    <td className="p-3">
                      <div className="flex gap-1">
                        <Button variant="ghost" size="sm" onClick={() => openEdit(item)}><Pencil className="w-3.5 h-3.5" /></Button>
                        {isAdmin && item.status === 'draft' && <Button variant="ghost" size="sm" onClick={() => handleApprove(item.id)}><Check className="w-3.5 h-3.5 text-success" /></Button>}
                        {isAdmin && <Button variant="ghost" size="sm" onClick={() => handleDelete(item.id)}><Trash2 className="w-3.5 h-3.5 text-destructive" /></Button>}
                      </div>
                    </td>
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

      <Dialog open={dlgOpen} onOpenChange={setDlgOpen}>
        <DialogContent className="max-w-lg max-h-[90dvh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editId ? '编辑' : '新建'}法规</DialogTitle></DialogHeader>
          <div className="space-y-4 py-2">
            <div><Label>标题</Label><Input value={form.title} onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))} /></div>
            <div><Label>国家</Label>
              <Select value={form.country_id} onValueChange={(v) => setForm((p) => ({ ...p, country_id: v }))}>
                <SelectTrigger><SelectValue placeholder="选择国家" /></SelectTrigger>
                <SelectContent>{countries.map((c) => <SelectItem key={c.id} value={c.id}>{c.name_zh}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div><Label>场景</Label>
              <Select value={form.scene_id} onValueChange={(v) => setForm((p) => ({ ...p, scene_id: v }))}>
                <SelectTrigger><SelectValue placeholder="选择场景" /></SelectTrigger>
                <SelectContent>{scenes.map((s) => <SelectItem key={s.id} value={s.id}>{s.label_zh}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div><Label>效力层级</Label><Input value={form.level} onChange={(e) => setForm((p) => ({ ...p, level: e.target.value }))} /></div>
            <div><Label>处罚条款</Label><Input value={form.penalty} onChange={(e) => setForm((p) => ({ ...p, penalty: e.target.value }))} /></div>
            <div><Label>生效日期</Label><Input type="date" value={form.effective_date} onChange={(e) => setForm((p) => ({ ...p, effective_date: e.target.value }))} /></div>
            <div><Label>摘要</Label><Input value={form.summary} onChange={(e) => setForm((p) => ({ ...p, summary: e.target.value }))} /></div>
            <Button className="w-full" onClick={handleSave} disabled={!form.title || !form.country_id || !form.scene_id}>保存</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
