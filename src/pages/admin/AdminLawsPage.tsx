import {useCallback, useEffect, useRef, useState} from 'react';
import {useSelector} from 'react-redux';
import {Button} from '@/components/ui/button';
import {Input} from '@/components/ui/input';
import {Label} from '@/components/ui/label';
import {Badge} from '@/components/ui/badge';
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue,} from '@/components/ui/select';
import {Dialog, DialogContent, DialogHeader, DialogTitle,} from '@/components/ui/dialog';
import api from '@/lib/api';
import apiFile from '@/lib/api-file';
import type {RootState} from '@/store';
import {usePageSize} from '@/hooks/use-page-size';
import {Check, CheckSquare, ChevronLeft, ChevronRight, Clock, Download, Loader2, Pause, Pencil, Plus, Search, Trash2, Upload} from 'lucide-react';

const empty = {
    title_cn: '',
    title_en: '',
    law_number: '',
    country_id: '',
    scene_id: '',
    effective_date: '',
    summary: '',
};

export default function AdminLawsPage() {
    const role = useSelector((s: RootState) => s.auth.user?.role);
    const isAdmin = role === 'admin';
    const {size, ready} = usePageSize();
    const [items, setItems] = useState<any[]>([]);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [statusFilter, setStatusFilter] = useState('all');
    const [countryFilter, setCountryFilter] = useState('all');
    const [sceneFilter, setSceneFilter] = useState('all');
    const [keyword, setKeyword] = useState('');
    const [searchKeyword, setSearchKeyword] = useState('');
    const [countries, setCountries] = useState<{ id: string; name_zh: string }[]>([]);
    const [scenes, setScenes] = useState<{ id: string; label_zh: string }[]>([]);
    const metaLoaded = useRef(false);
    const [dlgOpen, setDlgOpen] = useState(false);
    const [editId, setEditId] = useState<number | null>(null);
    const [form, setForm] = useState(empty);
    const [saving, setSaving] = useState(false);
    const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
    const fileRef = useRef<HTMLInputElement>(null);

    const fetchList = useCallback(async () => {
        setLoading(true);
        const params: Record<string, string | number> = {page, per_page: size};
        if (statusFilter !== 'all') params.status = statusFilter;
        if (countryFilter !== 'all') params.country_id = countryFilter;
        if (sceneFilter !== 'all') params.scene_id = sceneFilter;
        if (searchKeyword.trim()) params.keyword = searchKeyword.trim();
        const {data} = await api.get('/admin/laws', {params});
        setItems(data.data.items || []);
        setTotal(data.data.meta?.total || 0);
        if (!metaLoaded.current) {
            metaLoaded.current = true;
            if (data.data.meta?.countries) setCountries(data.data.meta.countries);
            if (data.data.meta?.scenes) setScenes(data.data.meta.scenes);
        }
        setLoading(false);
    }, [page, statusFilter, countryFilter, sceneFilter, searchKeyword, size]);

    useEffect(() => {
        if (ready) fetchList();
    }, [fetchList, ready]);

    const openNew = () => {
        setEditId(null);
        setForm(empty);
        if (fileRef.current) fileRef.current.value = '';
        setDlgOpen(true);
    };
    const openEdit = (item: any) => {
        setEditId(item.id);
        setForm({
            title_cn: item.title_cn || '',
            title_en: item.title_en || '',
            law_number: item.law_number || '',
            country_id: item.country_id,
            scene_id: item.scene_id,
            effective_date: item.effective_date || '',
            summary: item.summary || '',
        });
        if (fileRef.current) fileRef.current.value = '';
        setDlgOpen(true);
    };

    const handleSave = async () => {
        if (saving) return;
        if (!form.title_cn || !form.country_id || !form.scene_id) return;
        const fd = new FormData();
        fd.append('title_cn', form.title_cn);
        fd.append('country_id', form.country_id);
        fd.append('scene_id', form.scene_id);
        if (form.title_en) fd.append('title_en', form.title_en);
        if (form.law_number) fd.append('law_number', form.law_number);
        if (form.effective_date) fd.append('effective_date', form.effective_date);
        if (form.summary) fd.append('summary', form.summary);
        if (fileRef.current?.files?.[0]) fd.append('file', fileRef.current.files[0]);

        setSaving(true);
        try {
            if (editId) {
                await apiFile.put(`/admin/laws/${editId}`, fd);
            } else {
                await apiFile.post('/admin/laws', fd);
            }
            setDlgOpen(false);
            fetchList();
        } finally {
            setSaving(false);
        }
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
    const handleSuspend = async (id: number) => {
        await api.post(`/admin/laws/${id}/suspend`);
        fetchList();
    };

    const toggleSelect = (id: number) => {
        setSelectedIds((prev) => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id); else next.add(id);
            return next;
        });
    };
    const toggleSelectAll = () => {
        const drafts = items.filter((i: any) => i.status === 'draft');
        if (drafts.every((i: any) => selectedIds.has(i.id))) {
            setSelectedIds(new Set());
        } else {
            setSelectedIds(new Set(drafts.map((i: any) => i.id)));
        }
    };
    const handleBatchApprove = async () => {
        if (selectedIds.size === 0) return;
        await api.post('/admin/laws/approve-batch', {ids: [...selectedIds]});
        setSelectedIds(new Set());
        fetchList();
    };

    const totalPages = Math.max(1, Math.ceil(total / size));

    return (
        <div className="flex flex-col flex-1 min-h-0">
            <div className="flex items-center justify-between mb-2 shrink-0">
                <h2 className="text-xl font-bold">法规管理</h2>
                {isAdmin && selectedIds.size > 0 && (
                    <Button size="sm" variant="outline" onClick={handleBatchApprove}>
                        <CheckSquare className="w-4 h-4 mr-1"/>批量审核({selectedIds.size})
                    </Button>
                )}
                <Button size="sm" onClick={openNew}><Plus className="w-4 h-4 mr-1"/>新建</Button>
            </div>
            {/* Filters */}
            <div className="flex items-center gap-2 mb-4 flex-wrap">
                {isAdmin && (
                    <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setPage(1); }}>
                        <SelectTrigger className="w-24 h-8 text-xs"><SelectValue placeholder="状态"/></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">全部状态</SelectItem>
                            <SelectItem value="draft">待审核</SelectItem>
                            <SelectItem value="published">已发布</SelectItem>
                        </SelectContent>
                    </Select>
                )}
                <Select value={countryFilter} onValueChange={(v) => { setCountryFilter(v); setPage(1); }}>
                    <SelectTrigger className="w-24 h-8 text-xs"><SelectValue placeholder="国家"/></SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">全部国家</SelectItem>
                        {countries.map((c) => <SelectItem key={c.id} value={c.id}>{c.name_zh}</SelectItem>)}
                    </SelectContent>
                </Select>
                <Select value={sceneFilter} onValueChange={(v) => { setSceneFilter(v); setPage(1); }}>
                    <SelectTrigger className="w-24 h-8 text-xs"><SelectValue placeholder="场景"/></SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">全部场景</SelectItem>
                        {scenes.map((s) => <SelectItem key={s.id} value={s.id}>{s.label_zh}</SelectItem>)}
                    </SelectContent>
                </Select>
                <Input
                    placeholder="搜索标题..."
                    value={keyword}
                    onChange={(e) => setKeyword(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') { setSearchKeyword(keyword.trim()); setPage(1); } }}
                    className="w-40 h-8 text-xs"
                />
                <Button variant="outline" size="sm" className="h-8" onClick={() => { setSearchKeyword(keyword.trim()); setPage(1); }}>
                    <Search className="w-3.5 h-3.5"/>
                </Button>
            </div>

            {loading ? <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin"/></div> : (
                <div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                            <tr className="border-b text-left text-muted-foreground">
                                {isAdmin && <th className="p-3 w-8"><input type="checkbox" className="w-4 h-4 accent-primary cursor-pointer" onChange={toggleSelectAll} checked={items.filter((i: any) => i.status === 'draft').length > 0 && items.filter((i: any) => i.status === 'draft').every((i: any) => selectedIds.has(i.id))}/></th>}
                                <th className="p-3">标题</th>
                                <th className="p-3">国家</th>
                                <th className="p-3">场景</th>
                                <th className="p-3">文件</th>
                                <th className="p-3">状态</th>
                                <th className="p-3">更新时间</th>
                                <th className="p-3">操作</th>
                            </tr>
                            </thead>
                            <tbody>
                            {items.map((item: any) => (
                                <tr key={item.id} className="border-b hover:bg-muted/30">
                                    {isAdmin && <td className="p-3 w-8">{item.status === 'draft' ? <input type="checkbox" className="w-4 h-4 accent-primary cursor-pointer" checked={selectedIds.has(item.id)} onChange={() => toggleSelect(item.id)}/> : null}</td>}
                                    <td className="p-3 font-medium">{item.title_cn}</td>
                                    <td className="p-3">{countries.find((c) => c.id === item.country_id)?.name_zh}</td>
                                    <td className="p-3"><Badge variant="outline"
                                                               className="text-xs">{scenes.find((s) => s.id === item.scene_id)?.label_zh}</Badge>
                                    </td>
                                    <td className="p-3 text-xs max-w-[200px]">{item.has_file ? <a href={`/api/laws/${item.id}/download`} className="flex items-center gap-1 hover:text-primary transition-colors" title={item.filename}><Upload className="w-3 h-3 text-muted-foreground shrink-0"/><span className="overflow-hidden whitespace-nowrap">{item.filename.length > 24 ? `${item.filename.slice(0, 12)}...${item.filename.slice(-10)}` : item.filename}</span><Download className="w-3 h-3 shrink-0 ml-1"/></a> : '-'}</td>
                                    <td className="p-3">
                                        {item.status === 'draft'
                                            ? <Badge variant="secondary" className="text-xs gap-1"><Clock
                                                className="w-3 h-3"/>草稿</Badge>
                                            : <Badge
                                                className="bg-success/10 text-success border-success/20 text-xs">已发布</Badge>}
                                    </td>
                                    <td className="p-3 text-xs text-muted-foreground">{item.updated_at ? new Date(item.updated_at).toLocaleString('zh-CN') : '-'}</td>
                                    <td className="p-3">
                                        <div className="flex gap-1">
                                            <Button variant="ghost" size="sm" onClick={() => openEdit(item)}><Pencil
                                                className="w-3.5 h-3.5"/></Button>
                                            {isAdmin && item.status === 'draft' && <Button variant="ghost" size="sm"
                                                                                           onClick={() => handleApprove(item.id)}><Check
                                                className="w-3.5 h-3.5 text-success"/></Button>}
                                            {isAdmin && item.status === 'published' && <Button variant="ghost" size="sm"
                                                                                               onClick={() => handleSuspend(item.id)}><Pause
                                                className="w-3.5 h-3.5 text-warning"/></Button>}
                                            {(isAdmin || item.status === 'draft') &&
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
                    {Array.from({length: totalPages}, (_, i) => i + 1).map((p) => (
                        <Button key={p} variant={p === page ? 'default' : 'outline'} size="sm" className="w-9 h-9"
                                onClick={() => setPage(p)}>{p}</Button>
                    ))}
                    <Button variant="outline" size="sm" disabled={page >= totalPages}
                            onClick={() => setPage((p) => p + 1)}><ChevronRight className="w-4 h-4"/></Button>
                </div>
            )}

            <Dialog open={dlgOpen} onOpenChange={setDlgOpen}>
                <DialogContent className="max-w-lg max-h-[90dvh] overflow-y-auto">
                    <DialogHeader><DialogTitle>{editId ? '编辑' : '新建'}法规</DialogTitle></DialogHeader>
                    <div className="space-y-4 py-2">
                        <div><Label>中文标题 *</Label><Input value={form.title_cn} onChange={(e) => setForm((p) => ({
                            ...p,
                            title_cn: e.target.value
                        }))}/></div>
                        <div><Label>英文标题</Label><Input value={form.title_en} onChange={(e) => setForm((p) => ({
                            ...p,
                            title_en: e.target.value
                        }))}/></div>
                        <div><Label>法号/法令编号</Label><Input value={form.law_number} onChange={(e) => setForm((p) => ({
                            ...p,
                            law_number: e.target.value
                        }))}/></div>
                        <div><Label>国家 *</Label>
                            <Select value={form.country_id}
                                    onValueChange={(v) => setForm((p) => ({...p, country_id: v}))}>
                                <SelectTrigger><SelectValue placeholder="选择国家"/></SelectTrigger>
                                <SelectContent>{countries.map((c) => <SelectItem key={c.id}
                                                                                 value={c.id}>{c.name_zh}</SelectItem>)}</SelectContent>
                            </Select>
                        </div>
                        <div><Label>场景 *</Label>
                            <Select value={form.scene_id} onValueChange={(v) => setForm((p) => ({...p, scene_id: v}))}>
                                <SelectTrigger><SelectValue placeholder="选择场景"/></SelectTrigger>
                                <SelectContent>{scenes.map((s) => <SelectItem key={s.id}
                                                                              value={s.id}>{s.label_zh}</SelectItem>)}</SelectContent>
                            </Select>
                        </div>
                        <div><Label>生效日期</Label><Input type="date" value={form.effective_date}
                                                           onChange={(e) => setForm((p) => ({
                                                               ...p,
                                                               effective_date: e.target.value
                                                           }))}/></div>
                        <div><Label>摘要</Label><Input value={form.summary} onChange={(e) => setForm((p) => ({
                            ...p,
                            summary: e.target.value
                        }))}/></div>
                        <div><Label>法规文件</Label><Input type="file" ref={fileRef as any}/></div>
                        <Button className="w-full" onClick={handleSave}
                                disabled={saving || !form.title_cn || !form.country_id || !form.scene_id}>{saving ? '保存中...' : '保存'}</Button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
