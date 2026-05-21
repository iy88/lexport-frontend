import {useCallback, useEffect, useRef, useState} from 'react';
import {useSelector} from 'react-redux';
import {Button} from '@/components/ui/button';
import {Badge} from '@/components/ui/badge';
import {Input} from '@/components/ui/input';
import {Label} from '@/components/ui/label';
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue,} from '@/components/ui/select';
import {Dialog, DialogContent, DialogHeader, DialogTitle,} from '@/components/ui/dialog';
import api from '@/lib/api';
import type {RootState} from '@/store';
import {usePageSize} from '@/hooks/use-page-size';
import {Check, ChevronLeft, ChevronRight, Clock, Loader2, Pencil, Plus, Trash2} from 'lucide-react';

const empty = {name_zh: '', scene_id: '', region: '', phone: '', email: '', business: '', advantage: '', highlight: ''};

export default function AdminAgenciesPage() {
    const role = useSelector((s: RootState) => s.auth.user?.role);
    const isAdmin = role === 'admin';
    const {size, ready} = usePageSize();
    const [items, setItems] = useState<any[]>([]);
    const [scenes, setScenes] = useState<any[]>([]);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [statusFilter, setStatusFilter] = useState('all');
    const metaLoaded = useRef(false);
    const [dlgOpen, setDlgOpen] = useState(false);
    const [editId, setEditId] = useState<number | null>(null);
    const [form, setForm] = useState(empty);

    const fetchList = useCallback(async () => {
        setLoading(true);
        const params: Record<string, string | number> = {page, per_page: size};
        if (statusFilter !== 'all') params.status = statusFilter;
        const {data} = await api.get('/admin/agencies', {params});
        setItems(data.data.items || []);
        setTotal(data.data.meta?.total || 0);
        if (!metaLoaded.current && data.data.meta?.categories) {
            metaLoaded.current = true;
            const allScenes = data.data.meta.categories.flatMap((c: any) => c.scenes || []);
            setScenes(allScenes);
        }
        setLoading(false);
    }, [page, statusFilter, size]);

    useEffect(() => {
        if (ready) fetchList();
    }, [fetchList, ready]);

    const openNew = () => {
        setEditId(null);
        setForm(empty);
        setDlgOpen(true);
    };
    const openEdit = (item: any) => {
        setEditId(item.id);
        setForm({
            name_zh: item.name_zh,
            scene_id: item.scene_id,
            region: item.region || '',
            phone: item.phone || '',
            email: item.email || '',
            business: item.business || '',
            advantage: item.advantage || '',
            highlight: item.highlight || ''
        });
        setDlgOpen(true);
    };

    const handleSave = async () => {
        if (!form.name_zh || !form.scene_id) return;
        if (editId) {
            await api.put(`/admin/agencies/${editId}`, form);
        } else {
            await api.post('/admin/agencies', form);
        }
        setDlgOpen(false);
        fetchList();
    };

    const handleApprove = async (id: number) => {
        await api.post(`/admin/agencies/${id}/approve`);
        fetchList();
    };
    const handleDelete = async (id: number) => {
        if (!confirm('确定删除？')) return;
        await api.delete(`/admin/agencies/${id}`);
        fetchList();
    };

    const totalPages = Math.max(1, Math.ceil(total / size));

    return (
        <div className="flex flex-col flex-1 min-h-0">
            <div className="flex items-center justify-between mb-4 shrink-0">
                <h2 className="text-xl font-bold">机构管理</h2>
                <div className="flex items-center gap-2">
                    {isAdmin && (
                        <Select value={statusFilter} onValueChange={(v) => {
                            setStatusFilter(v);
                            setPage(1);
                        }}>
                            <SelectTrigger className="w-28 h-8 text-xs"><SelectValue
                                placeholder="全部"/></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">全部</SelectItem>
                                <SelectItem value="draft">待审核</SelectItem>
                                <SelectItem value="published">已发布</SelectItem>
                            </SelectContent>
                        </Select>
                    )}
                    <Button size="sm" onClick={openNew}><Plus className="w-4 h-4 mr-1"/>新建</Button>
                </div>
            </div>
            {loading ? <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin"/></div> : (
                <div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                            <tr className="border-b text-left text-muted-foreground">
                                <th className="p-3">名称</th>
                                <th className="p-3">场景</th>
                                <th className="p-3">区域</th>
                                <th className="p-3">状态</th>
                                <th className="p-3">操作</th>
                            </tr>
                            </thead>
                            <tbody>
                            {items.map((item: any) => (
                                <tr key={item.id} className="border-b hover:bg-muted/30">
                                    <td className="p-3 font-medium">{item.name_zh}</td>
                                    <td className="p-3">{scenes.find((s: any) => s.id === item.scene_id)?.label_zh}</td>
                                    <td className="p-3 text-xs text-muted-foreground">{item.region}</td>
                                    <td className="p-3">
                                        {item.status === 'draft'
                                            ? <Badge variant="secondary" className="text-xs gap-1"><Clock
                                                className="w-3 h-3"/>草稿</Badge>
                                            : <Badge
                                                className="bg-success/10 text-success border-success/20 text-xs">已发布</Badge>}
                                    </td>
                                    <td className="p-3">
                                        <div className="flex gap-1">
                                            <Button variant="ghost" size="sm" onClick={() => openEdit(item)}><Pencil
                                                className="w-3.5 h-3.5"/></Button>
                                            {isAdmin && item.status === 'draft' && <Button variant="ghost" size="sm"
                                                                                           onClick={() => handleApprove(item.id)}><Check
                                                className="w-3.5 h-3.5 text-success"/></Button>}
                                            {isAdmin &&
                                                <Button variant="ghost" size="sm" onClick={() => handleDelete(item.id)}><Trash2
                                                    className="w-3.5 h-3.5 text-destructive"/></Button>}
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
                    <Button variant="outline" size="sm" disabled={page <= 1}
                            onClick={() => setPage((p) => p - 1)}><ChevronLeft className="w-4 h-4"/></Button>
                    {Array.from({length: totalPages}, (_, i) => i + 1).map((p) => <Button key={p}
                                                                                          variant={p === page ? 'default' : 'outline'}
                                                                                          size="sm" className="w-9 h-9"
                                                                                          onClick={() => setPage(p)}>{p}</Button>)}
                    <Button variant="outline" size="sm" disabled={page >= totalPages}
                            onClick={() => setPage((p) => p + 1)}><ChevronRight className="w-4 h-4"/></Button>
                </div>
            )}
            <Dialog open={dlgOpen} onOpenChange={setDlgOpen}>
                <DialogContent className="max-w-lg max-h-[90dvh] overflow-y-auto">
                    <DialogHeader><DialogTitle>{editId ? '编辑' : '新建'}机构</DialogTitle></DialogHeader>
                    <div className="space-y-4 py-2">
                        <div><Label>名称</Label><Input value={form.name_zh} onChange={(e) => setForm((p) => ({
                            ...p,
                            name_zh: e.target.value
                        }))}/></div>
                        <div><Label>场景</Label>
                            <Select value={form.scene_id} onValueChange={(v) => setForm((p) => ({...p, scene_id: v}))}>
                                <SelectTrigger><SelectValue placeholder="选择场景"/></SelectTrigger>
                                <SelectContent>{scenes.map((s: any) => <SelectItem key={s.id}
                                                                                   value={s.id}>{s.label_zh}</SelectItem>)}</SelectContent>
                            </Select>
                        </div>
                        <div><Label>区域</Label><Input value={form.region} onChange={(e) => setForm((p) => ({
                            ...p,
                            region: e.target.value
                        }))}/></div>
                        <div><Label>电话</Label><Input value={form.phone} onChange={(e) => setForm((p) => ({
                            ...p,
                            phone: e.target.value
                        }))}/></div>
                        <div><Label>邮箱</Label><Input value={form.email} onChange={(e) => setForm((p) => ({
                            ...p,
                            email: e.target.value
                        }))}/></div>
                        <div><Label>业务</Label><Input value={form.business} onChange={(e) => setForm((p) => ({
                            ...p,
                            business: e.target.value
                        }))}/></div>
                        <div><Label>优势</Label><Input value={form.advantage} onChange={(e) => setForm((p) => ({
                            ...p,
                            advantage: e.target.value
                        }))}/></div>
                        <div><Label>亮点标签</Label><Input value={form.highlight} onChange={(e) => setForm((p) => ({
                            ...p,
                            highlight: e.target.value
                        }))}/></div>
                        <Button className="w-full" onClick={handleSave}
                                disabled={!form.name_zh || !form.scene_id}>保存</Button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
