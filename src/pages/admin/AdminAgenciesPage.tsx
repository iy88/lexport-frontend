import {useCallback, useEffect, useRef, useState} from 'react';
import {useSelector} from 'react-redux';
import {Button} from '@/components/ui/button';
import {Badge} from '@/components/ui/badge';
import {Input} from '@/components/ui/input';
import {Label} from '@/components/ui/label';
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue,} from '@/components/ui/select';
import {Dialog, DialogContent, DialogHeader, DialogTitle,} from '@/components/ui/dialog';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import api from '@/lib/api';
import type {RootState} from '@/store';
import {usePageSize} from '@/hooks/use-page-size';
import {Check, CheckSquare, ChevronLeft, ChevronRight, Clock, EyeOff, Loader2, Pause, Pencil, Plus, Search, Trash2} from 'lucide-react';
import {toast} from 'sonner';

const empty = {name: '', scene_id: '', region: '', phone: '', email: '', business: '', advantage: '', highlight: ''};
type ConfirmAction = {type: 'discard' | 'suspend' | 'delete'; item: any};

function getErrorMessage(error: unknown, fallback: string) {
    return (error as {response?: {data?: {error?: {message?: string}}}})
        .response?.data?.error?.message || fallback;
}

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
    const [reviewFilter, setReviewFilter] = useState<'pending' | 'none' | 'all'>('all');
    const [categoryFilter, setCategoryFilter] = useState('all');
    const [sceneFilter, setSceneFilter] = useState('all');
    const [regionFilter, setRegionFilter] = useState('');
    const [searchRegion, setSearchRegion] = useState('');
    const [keyword, setKeyword] = useState('');
    const [searchKeyword, setSearchKeyword] = useState('');
    const [categories, setCategories] = useState<any[]>([]);
    const metaLoaded = useRef(false);
    const [dlgOpen, setDlgOpen] = useState(false);
    const [editId, setEditId] = useState<number | null>(null);
    const [form, setForm] = useState(empty);
    const [saving, setSaving] = useState(false);
    const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
    const [openingId, setOpeningId] = useState<number | null>(null);
    const [actingId, setActingId] = useState<number | null>(null);
    const [confirmAction, setConfirmAction] = useState<ConfirmAction | null>(null);

    const fetchList = useCallback(async () => {
        setLoading(true);
        const params: Record<string, string | number> = {page, per_page: size};
        if (statusFilter !== 'all') params.status = statusFilter;
        if (reviewFilter !== 'all') params.review_status = reviewFilter;
        if (categoryFilter !== 'all') params.category_id = categoryFilter;
        if (sceneFilter !== 'all') params.scene_id = sceneFilter;
        if (searchRegion.trim()) params.region = searchRegion.trim();
        if (searchKeyword.trim()) params.keyword = searchKeyword.trim();
        try {
            const {data} = await api.get('/admin/agencies', {params});
            const nextItems = data.data.items || [];
            setItems(nextItems);
            setSelectedIds((previous) => new Set(
                [...previous].filter((id) => nextItems.some(
                    (item: any) => item.id === id && item.review_status === 'pending',
                )),
            ));
            setTotal(data.data.meta?.total || 0);
            if (!metaLoaded.current && data.data.meta?.categories) {
                metaLoaded.current = true;
                setCategories(data.data.meta.categories);
                const allScenes = data.data.meta.categories.flatMap((c: any) => c.scenes || []);
                setScenes(allScenes);
            }
        } catch (error) {
            toast.error(getErrorMessage(error, '机构列表加载失败'));
        } finally {
            setLoading(false);
        }
    }, [page, statusFilter, reviewFilter, categoryFilter, sceneFilter, searchRegion, searchKeyword, size]);

    useEffect(() => {
        if (ready) fetchList();
    }, [fetchList, ready]);

    const openNew = () => {
        setEditId(null);
        setForm(empty);
        setDlgOpen(true);
    };
    const openEdit = async (item: any) => {
        setOpeningId(item.id);
        try {
            const {data} = await api.get(`/admin/agencies/${item.id}`);
            const detail = data.data?.item || item;
            setEditId(item.id);
            setForm({
                name: detail.name || '',
                scene_id: detail.scene_id || '',
                region: detail.region || '',
                phone: detail.phone || '',
                email: detail.email || '',
                business: detail.business || '',
                advantage: detail.advantage || '',
                highlight: detail.highlight || '',
            });
            setDlgOpen(true);
        } catch (error) {
            toast.error(getErrorMessage(error, '机构详情加载失败'));
        } finally {
            setOpeningId(null);
        }
    };

    const handleSave = async () => {
        if (saving) return;
        if (!form.name || !form.scene_id) return;
        setSaving(true);
        try {
            if (editId) {
                await api.put(`/admin/agencies/${editId}`, form);
            } else {
                await api.post('/admin/agencies', form);
            }
            setDlgOpen(false);
            toast.success(editId ? '机构已保存' : '机构已创建');
            await fetchList();
        } catch (error) {
            toast.error(getErrorMessage(error, '机构保存失败'));
        } finally {
            setSaving(false);
        }
    };

    const handleApprove = async (id: number) => {
        setActingId(id);
        try {
            await api.post(`/admin/agencies/${id}/approve`);
            toast.success('机构已审核通过并发布');
            await fetchList();
        } catch (error) {
            toast.error(getErrorMessage(error, '审核失败'));
        } finally {
            setActingId(null);
        }
    };
    const handleSuspend = async (id: number) => {
        setActingId(id);
        try {
            await api.post(`/admin/agencies/${id}/suspend`);
            setConfirmAction(null);
            toast.success('机构已挂起，可通过“审核通过 / 恢复发布”重新发布');
            await fetchList();
        } catch (error) {
            toast.error(getErrorMessage(error, '挂起失败'));
        } finally {
            setActingId(null);
        }
    };
    const handleDiscard = async (id: number) => {
        setActingId(id);
        try {
            await api.delete(`/admin/agencies/${id}/draft`);
            setConfirmAction(null);
            toast.success('待审修改已丢弃，线上版本保持不变');
            await fetchList();
        } catch (error) {
            toast.error(getErrorMessage(error, '丢弃待审修改失败'));
        } finally {
            setActingId(null);
        }
    };

    const toggleSelect = (id: number) => {
        setSelectedIds((prev) => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id); else next.add(id);
            return next;
        });
    };
    const toggleSelectAll = () => {
        const drafts = items.filter((i: any) => i.review_status === 'pending');
        if (drafts.every((i: any) => selectedIds.has(i.id))) {
            setSelectedIds(new Set());
        } else {
            setSelectedIds(new Set(drafts.map((i: any) => i.id)));
        }
    };
    const handleBatchApprove = async () => {
        if (selectedIds.size === 0) return;
        try {
            await api.post('/admin/agencies/approve-batch', {ids: [...selectedIds]});
            setSelectedIds(new Set());
            toast.success('机构批量审核完成');
            await fetchList();
        } catch (error) {
            toast.error(getErrorMessage(error, '批量审核失败'));
        }
    };

    const handleDelete = async (id: number) => {
        setActingId(id);
        try {
            await api.delete(`/admin/agencies/${id}`);
            setConfirmAction(null);
            toast.success('机构已删除');
            await fetchList();
        } catch (error) {
            toast.error(getErrorMessage(error, '删除失败'));
        } finally {
            setActingId(null);
        }
    };

    const totalPages = Math.max(1, Math.ceil(total / size));

    return (
        <div className="flex flex-col flex-1 min-h-0">
            <div className="flex items-center justify-between mb-2 shrink-0">
                <h2 className="text-xl font-bold">机构管理</h2>
                <div className="flex items-center gap-2">
                    {isAdmin && selectedIds.size > 0 && (
                        <Button size="sm" variant="outline" onClick={handleBatchApprove}>
                            <CheckSquare className="w-4 h-4 mr-1"/>批量审核({selectedIds.size})
                        </Button>
                    )}
                    <Button size="sm" onClick={openNew}><Plus className="w-4 h-4 mr-1"/>新建</Button>
                </div>
            </div>
            {/* Filters */}
            <div className="flex items-center gap-2 mb-4 flex-wrap">
                {isAdmin && (
                    <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setPage(1); }}>
                        <SelectTrigger className="w-24 h-8 text-xs"><SelectValue placeholder="状态"/></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">全部状态</SelectItem>
                            <SelectItem value="draft">草稿</SelectItem>
                            <SelectItem value="published">已发布</SelectItem>
                        </SelectContent>
                    </Select>
                )}
                {isAdmin && (
                    <Select value={reviewFilter} onValueChange={(v) => { setReviewFilter(v as any); setPage(1); }}>
                        <SelectTrigger className="w-28 h-8 text-xs"><SelectValue placeholder="审核状态"/></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">全部审核状态</SelectItem>
                            <SelectItem value="pending">待审核</SelectItem>
                            <SelectItem value="none">无待审核</SelectItem>
                        </SelectContent>
                    </Select>
                )}
                <Select value={categoryFilter} onValueChange={(v) => { setCategoryFilter(v); setSceneFilter('all'); setPage(1); }}>
                    <SelectTrigger className="w-28 h-8 text-xs"><SelectValue placeholder="大类"/></SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">全部大类</SelectItem>
                        {categories.map((c: any) => <SelectItem key={c.id} value={c.id}>{c.label_zh}</SelectItem>)}
                    </SelectContent>
                </Select>
                <Select value={sceneFilter} onValueChange={(v) => { setSceneFilter(v); setPage(1); }}>
                    <SelectTrigger className="w-28 h-8 text-xs"><SelectValue placeholder="场景"/></SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">全部场景</SelectItem>
                        {(categoryFilter === 'all'
                            ? scenes
                            : categories.find((c: any) => c.id === categoryFilter)?.scenes || []
                        ).map((s: any) => <SelectItem key={s.id} value={s.id}>{s.label_zh}</SelectItem>)}
                    </SelectContent>
                </Select>
                <Input
                    placeholder="区域..."
                    value={regionFilter}
                    onChange={(e) => setRegionFilter(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') { setSearchRegion(regionFilter.trim()); setPage(1); } }}
                    className="w-24 h-8 text-xs"
                />
                <Input
                    placeholder="搜索名称..."
                    value={keyword}
                    onChange={(e) => setKeyword(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') { setSearchKeyword(keyword.trim()); setPage(1); } }}
                    className="w-36 h-8 text-xs"
                />
                <Button variant="outline" size="sm" className="h-8"
                        onClick={() => { setSearchRegion(regionFilter.trim()); setSearchKeyword(keyword.trim()); setPage(1); }}>
                    <Search className="w-3.5 h-3.5"/>
                </Button>
            </div>
            {loading ? <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin"/></div> : (
                <div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                            <tr className="border-b text-left text-muted-foreground">
                                {isAdmin && <th className="p-3 w-8"><input type="checkbox" className="w-4 h-4 accent-primary cursor-pointer" onChange={toggleSelectAll} checked={items.filter((i: any) => i.review_status === 'pending').length > 0 && items.filter((i: any) => i.review_status === 'pending').every((i: any) => selectedIds.has(i.id))}/></th>}
                                <th className="p-3">名称</th>
                                <th className="p-3">场景</th>
                                <th className="p-3">区域</th>
                                <th className="p-3">状态</th>
                                <th className="p-3">更新时间</th>
                                <th className="p-3">操作</th>
                            </tr>
                            </thead>
                            <tbody>
                            {items.map((item: any) => (
                                <tr key={item.id} className="border-b hover:bg-muted/30">
                                    {isAdmin && <td className="p-3 w-8">{item.review_status === 'pending' ? <input type="checkbox" className="w-4 h-4 accent-primary cursor-pointer" checked={selectedIds.has(item.id)} onChange={() => toggleSelect(item.id)}/> : null}</td>}
                                    <td className="p-3 font-medium">{item.name}</td>
                                    <td className="p-3">{scenes.find((s: any) => s.id === item.scene_id)?.label_zh}</td>
                                    <td className="p-3 text-xs text-muted-foreground">{item.region}</td>
                                    <td className="p-3">
                                        {item.status === 'draft' && item.review_status === 'pending' && (
                                            <Badge variant="secondary" className="text-xs gap-1"><Clock className="w-3 h-3"/>待首次审核</Badge>
                                        )}
                                        {item.status === 'published' && item.review_status === 'pending' && (
                                            <div className="flex items-center gap-1">
                                                <Badge className="bg-success/10 text-success border-success/20 text-xs">已发布</Badge>
                                                <Badge variant="secondary" className="text-xs gap-1"><Clock className="w-3 h-3"/>有待审修改</Badge>
                                            </div>
                                        )}
                                        {item.status === 'published' && item.review_status !== 'pending' && (
                                            <Badge className="bg-success/10 text-success border-success/20 text-xs">已发布</Badge>
                                        )}
                                    </td>
                                    <td className="p-3 text-xs text-muted-foreground">{item.updated_at ? new Date(item.updated_at).toLocaleString('zh-CN') : '-'}</td>
                                    <td className="p-3">
                                        <div className="flex gap-1">
                                            {(!isAdmin || item.review_status !== 'pending') && (
                                                <Button variant="ghost" size="sm" title="编辑机构" disabled={openingId === item.id || actingId === item.id} onClick={() => openEdit(item)}>{openingId === item.id ? <Loader2 className="w-3.5 h-3.5 animate-spin"/> : <Pencil
                                                    className="w-3.5 h-3.5"/>}</Button>
                                            )}
                                            {isAdmin && item.review_status === 'pending' && <Button variant="ghost" size="sm"
                                                                                           title={item.status === 'draft' ? '审核通过 / 恢复发布' : '审核通过'} disabled={actingId === item.id} onClick={() => handleApprove(item.id)}><Check
                                                className="w-3.5 h-3.5 text-success"/></Button>}
                                            {isAdmin && item.status === 'published' && item.has_draft && <Button variant="ghost" size="sm"
                                                                                           title="丢弃待审修改" disabled={actingId === item.id} onClick={() => setConfirmAction({type: 'discard', item})}><EyeOff
                                                className="w-3.5 h-3.5 text-warning"/></Button>}
                                            {isAdmin && item.status === 'published' && <Button variant="ghost" size="sm"
                                                                                               title="挂起发布" disabled={actingId === item.id} onClick={() => setConfirmAction({type: 'suspend', item})}><Pause
                                                className="w-3.5 h-3.5 text-warning"/></Button>}
                                            {(isAdmin || item.status === 'draft') &&
                                                <Button variant="ghost" size="sm"
                                                        title={item.status === 'published' ? '永久删除已发布机构' : '永久删除草稿'}
                                                        disabled={actingId === item.id}
                                                        onClick={() => setConfirmAction({type: 'delete', item})}><Trash2
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
                        <div><Label>名称</Label><Input value={form.name} onChange={(e) => setForm((p) => ({
                            ...p,
                            name: e.target.value
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
                                disabled={saving || !form.name || !form.scene_id}>{saving ? '保存中...' : '保存'}</Button>
                    </div>
                </DialogContent>
            </Dialog>
            <AlertDialog open={confirmAction !== null} onOpenChange={(open) => !open && setConfirmAction(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>
                            {confirmAction?.type === 'discard' && '确认丢弃待审修改？'}
                            {confirmAction?.type === 'suspend' && '确认挂起机构？'}
                            {confirmAction?.type === 'delete' && '确认永久删除？'}
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                            {confirmAction?.type === 'discard' && '此操作只会删除待审核的机构修改，当前线上正式版本仍会保持不变。'}
                            {confirmAction?.type === 'suspend' && (
                                <>挂起“{confirmAction.item.name}”后公开页面将不再展示；之后可通过“审核通过 / 恢复发布”重新发布。现有待审修改会被丢弃。</>
                            )}
                            {confirmAction?.type === 'delete' && (
                                confirmAction.item.status === 'published'
                                    ? <>这会永久删除已发布机构“{confirmAction.item.name}”，公开页面将不再展示该记录。此操作不可撤销。</>
                                    : <>这会永久删除草稿“{confirmAction.item.name}”。由于系统无法区分首次草稿和挂起记录，删除后均无法恢复发布。</>
                            )}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={actingId !== null}>取消</AlertDialogCancel>
                        <AlertDialogAction
                            disabled={confirmAction === null || actingId !== null}
                            onClick={(event) => {
                                event.preventDefault();
                                if (confirmAction?.type === 'discard') void handleDiscard(confirmAction.item.id);
                                if (confirmAction?.type === 'suspend') void handleSuspend(confirmAction.item.id);
                                if (confirmAction?.type === 'delete') void handleDelete(confirmAction.item.id);
                            }}
                        >
                            {actingId !== null ? '处理中...' : '确认'}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
