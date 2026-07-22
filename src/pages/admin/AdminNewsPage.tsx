import {useCallback, useEffect, useRef, useState} from 'react';
import {useSelector} from 'react-redux';
import {Button} from '@/components/ui/button';
import {Input} from '@/components/ui/input';
import {Label} from '@/components/ui/label';
import {Badge} from '@/components/ui/badge';
import {Textarea} from '@/components/ui/textarea';
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
import MultiSelect from '@/components/ui/multi-select';
import api from '@/lib/api';
import type {RootState} from '@/store';
import {usePageSize} from '@/hooks/use-page-size';
import {Check, CheckSquare, ChevronLeft, ChevronRight, Clock, EyeOff, Loader2, Pause, Pencil, Plus, Search, Trash2} from 'lucide-react';
import {toast} from 'sonner';

const empty = {
    type: 'cooperation',
    title: '',
    country_id: '',
    source: '',
    date: '',
    summary: '',
    risk_level: '',
    involved_laws: '',
    response: '',
    update_type: '',
    change_desc: '',
    impact: '',
    advice: '',
    content: '',
    tag_ids: [] as number[],
};
type ConfirmAction = {type: 'discard' | 'suspend' | 'delete'; item: any};

function getErrorMessage(error: unknown, fallback: string) {
    return (error as {response?: {data?: {error?: {message?: string}}}})
        .response?.data?.error?.message || fallback;
}

export default function AdminNewsPage() {
    const role = useSelector((s: RootState) => s.auth.user?.role);
    const isAdmin = role === 'admin';
    const {size, ready} = usePageSize();
    const [items, setItems] = useState<any[]>([]);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [statusFilter, setStatusFilter] = useState('all');
    const [reviewFilter, setReviewFilter] = useState<'pending' | 'none' | 'all'>('all');
    const [typeFilter, setTypeFilter] = useState('all');
    const [countryFilter, setCountryFilter] = useState('all');
    const [tagFilter, setTagFilter] = useState('all');
    const [dateFrom, setDateFrom] = useState('');
    const [dateTo, setDateTo] = useState('');
    const [keyword, setKeyword] = useState('');
    const [searchKeyword, setSearchKeyword] = useState('');
    const [countries, setCountries] = useState<{ id: string; name_zh: string }[]>([]);
    const [types, setTypes] = useState<{ value: string; label_zh: string }[]>([]);
    const [tags, setTags] = useState<{ id: number; name_zh: string }[]>([]);
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
        if (typeFilter !== 'all') params.type = typeFilter;
        if (countryFilter !== 'all') params.country_id = countryFilter;
        if (tagFilter !== 'all') params.tag_id = tagFilter;
        if (dateFrom) params.date_from = dateFrom;
        if (dateTo) params.date_to = dateTo;
        if (searchKeyword.trim()) params.keyword = searchKeyword.trim();
        try {
            const {data} = await api.get('/admin/news', {params});
            const nextItems = data.data.items || [];
            setItems(nextItems);
            setSelectedIds((previous) => new Set(
                [...previous].filter((id) => nextItems.some(
                    (item: any) => item.id === id && item.review_status === 'pending',
                )),
            ));
            setTotal(data.data.meta?.total || 0);
            if (!metaLoaded.current) {
                metaLoaded.current = true;
                if (data.data.meta?.countries) setCountries(data.data.meta.countries);
                if (data.data.meta?.types) setTypes(data.data.meta.types);
                if (data.data.meta?.tags) setTags(data.data.meta.tags);
            }
        } catch (error) {
            toast.error(getErrorMessage(error, '资讯列表加载失败'));
        } finally {
            setLoading(false);
        }
    }, [page, statusFilter, reviewFilter, typeFilter, countryFilter, tagFilter, dateFrom, dateTo, searchKeyword, size]);

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
            const {data} = await api.get(`/admin/news/${item.id}`);
            const detail = data.data?.item || item;
            setEditId(item.id);
            setForm({
                type: detail.type ?? item.type,
                title: detail.title ?? item.title,
                country_id: detail.country_id ?? item.country_id ?? '',
                source: detail.source ?? item.source ?? '',
                date: detail.date ?? item.date ?? '',
                summary: detail.summary ?? item.summary ?? '',
                risk_level: detail.risk_level ?? item.risk_level ?? '',
                involved_laws: detail.involved_laws ?? item.involved_laws ?? '',
                response: detail.response ?? item.response ?? '',
                update_type: detail.update_type ?? item.update_type ?? '',
                change_desc: detail.change_desc ?? item.change_desc ?? '',
                impact: detail.impact ?? item.impact ?? '',
                advice: detail.advice ?? item.advice ?? '',
                content: detail.content ?? '',
                tag_ids: detail.tags
                    ? detail.tags.map((tag: any) => tag.id)
                    : detail.tag_ids ?? [],
            });
            setDlgOpen(true);
        } catch (error) {
            toast.error(getErrorMessage(error, '资讯详情加载失败'));
        } finally {
            setOpeningId(null);
        }
    };

    const handleSave = async () => {
        if (saving) return;
        if (!form.title) return;
        const body: any = {
            type: form.type,
            title: form.title,
            date: form.date || null,
            country_id: form.country_id || null,
            source: form.source,
            summary: form.summary,
            content: form.content,
            tag_ids: form.tag_ids,
        };
        if (form.type === 'hotspot') {
            Object.assign(body, {
                risk_level: form.risk_level,
                involved_laws: form.involved_laws,
                response: form.response
            });
        }
        if (form.type === 'update') {
            Object.assign(body, {
                update_type: form.update_type,
                change_desc: form.change_desc,
                impact: form.impact,
                advice: form.advice
            });
        }
        setSaving(true);
        try {
            if (editId) {
                await api.put(`/admin/news/${editId}`, body);
            } else {
                await api.post('/admin/news', body);
            }
            setDlgOpen(false);
            toast.success(editId ? '资讯已保存' : '资讯已创建');
            await fetchList();
        } catch (error) {
            toast.error(getErrorMessage(error, '资讯保存失败'));
        } finally {
            setSaving(false);
        }
    };

    const handleApprove = async (id: number) => {
        setActingId(id);
        try {
            await api.post(`/admin/news/${id}/approve`);
            toast.success('资讯已审核通过并发布');
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
            await api.post(`/admin/news/${id}/suspend`);
            setConfirmAction(null);
            toast.success('资讯已挂起，可通过“审核通过 / 恢复发布”重新发布');
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
            await api.delete(`/admin/news/${id}/draft`);
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
            await api.post('/admin/news/approve-batch', {ids: [...selectedIds]});
            setSelectedIds(new Set());
            toast.success('资讯批量审核完成');
            await fetchList();
        } catch (error) {
            toast.error(getErrorMessage(error, '批量审核失败'));
        }
    };

    const handleDelete = async (id: number) => {
        setActingId(id);
        try {
            await api.delete(`/admin/news/${id}`);
            setConfirmAction(null);
            toast.success('资讯已删除');
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
                <h2 className="text-xl font-bold">资讯管理</h2>
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
                <Select value={typeFilter} onValueChange={(v) => { setTypeFilter(v); setPage(1); }}>
                    <SelectTrigger className="w-24 h-8 text-xs"><SelectValue placeholder="类型"/></SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">全部类型</SelectItem>
                        {types.map((t) => <SelectItem key={t.value} value={t.value}>{t.label_zh}</SelectItem>)}
                    </SelectContent>
                </Select>
                <Select value={countryFilter} onValueChange={(v) => { setCountryFilter(v); setPage(1); }}>
                    <SelectTrigger className="w-24 h-8 text-xs"><SelectValue placeholder="国家"/></SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">全部国家</SelectItem>
                        {countries.map((c) => <SelectItem key={c.id} value={c.id}>{c.name_zh}</SelectItem>)}
                    </SelectContent>
                </Select>
                <Select value={tagFilter} onValueChange={(v) => { setTagFilter(v); setPage(1); }}>
                    <SelectTrigger className="w-24 h-8 text-xs"><SelectValue placeholder="标签"/></SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">全部标签</SelectItem>
                        {tags.map((t) => <SelectItem key={t.id} value={String(t.id)}>{t.name_zh}</SelectItem>)}
                    </SelectContent>
                </Select>
                <Input type="date" value={dateFrom} onChange={(e) => { setDateFrom(e.target.value); setPage(1); }}
                       className="w-36 h-8 text-xs"/>
                <span className="text-xs text-muted-foreground">至</span>
                <Input type="date" value={dateTo} onChange={(e) => { setDateTo(e.target.value); setPage(1); }}
                       className="w-36 h-8 text-xs"/>
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
                                {isAdmin && <th className="p-3 w-8"><input type="checkbox" className="w-4 h-4 accent-primary cursor-pointer" onChange={toggleSelectAll} checked={items.filter((i: any) => i.review_status === 'pending').length > 0 && items.filter((i: any) => i.review_status === 'pending').every((i: any) => selectedIds.has(i.id))}/></th>}
                                <th className="p-3">标题</th>
                                <th className="p-3">类型</th>
                                <th className="p-3">国家</th>
                                <th className="p-3">状态</th>
                                <th className="p-3">更新时间</th>
                                <th className="p-3">操作</th>
                            </tr>
                            </thead>
                            <tbody>
                            {items.map((item: any) => (
                                <tr key={item.id} className="border-b hover:bg-muted/30">
                                    {isAdmin && <td className="p-3 w-8">{item.review_status === 'pending' ? <input type="checkbox" className="w-4 h-4 accent-primary cursor-pointer" checked={selectedIds.has(item.id)} onChange={() => toggleSelect(item.id)}/> : null}</td>}
                                    <td className="p-3 font-medium">{item.title}</td>
                                    <td className="p-3"><Badge variant="outline"
                                                               className="text-xs">{types.find((t) => t.value === item.type)?.label_zh}</Badge>
                                    </td>
                                    <td className="p-3">{countries.find((c) => c.id === item.country_id)?.name_zh}</td>
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
                                                <Button variant="ghost" size="sm" title="编辑资讯" disabled={openingId === item.id || actingId === item.id} onClick={() => openEdit(item)}>{openingId === item.id ? <Loader2 className="w-3.5 h-3.5 animate-spin"/> : <Pencil
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
                                                        title={item.status === 'published' ? '永久删除已发布资讯' : '永久删除草稿'}
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
                    <DialogHeader><DialogTitle>{editId ? '编辑' : '新建'}资讯</DialogTitle></DialogHeader>
                    <div className="space-y-4 py-2">
                        <div><Label>类型</Label>
                            <Select value={form.type} onValueChange={(v) => setForm((p) => ({...p, type: v}))}>
                                <SelectTrigger><SelectValue/></SelectTrigger>
                                <SelectContent>{types.map((t) => <SelectItem key={t.value}
                                                                             value={t.value}>{t.label_zh}</SelectItem>)}</SelectContent>
                            </Select>
                        </div>
                        <div><Label>标题</Label><Input value={form.title} onChange={(e) => setForm((p) => ({
                            ...p,
                            title: e.target.value
                        }))}/></div>
                        <div><Label>国家</Label>
                            <Select value={form.country_id}
                                    onValueChange={(v) => setForm((p) => ({...p, country_id: v}))}>
                                <SelectTrigger><SelectValue placeholder="选择国家"/></SelectTrigger>
                                <SelectContent>{countries.map((c) => <SelectItem key={c.id}
                                                                                 value={c.id}>{c.name_zh}</SelectItem>)}</SelectContent>
                            </Select>
                        </div>
                        <div><Label>来源</Label><Input value={form.source} onChange={(e) => setForm((p) => ({
                            ...p,
                            source: e.target.value
                        }))}/></div>
                        <div><Label>日期</Label><Input type="date" value={form.date} onChange={(e) => setForm((p) => ({
                            ...p,
                            date: e.target.value
                        }))}/></div>
                        <div><Label>摘要</Label><Input value={form.summary} onChange={(e) => setForm((p) => ({
                            ...p,
                            summary: e.target.value
                        }))}/></div>
                        <div><Label>正文</Label><Textarea value={form.content} onChange={(e) => setForm((p) => ({
                            ...p,
                            content: e.target.value
                        }))} rows={5} placeholder="正文内容（支持 Markdown）"/></div>
                        <div><Label>标签</Label>
                            <MultiSelect
                                options={tags.map((t) => ({value: String(t.id), label: t.name_zh}))}
                                value={form.tag_ids.map(String)}
                                onChange={(v) => setForm((p) => ({...p, tag_ids: v.map(Number)}))}
                            />
                        </div>
                        {form.type === 'hotspot' && <>
                            <div><Label>风险等级</Label><Select value={form.risk_level}
                                                                onValueChange={(v) => setForm((p) => ({
                                                                    ...p,
                                                                    risk_level: v
                                                                }))}><SelectTrigger><SelectValue
                                placeholder="选择"/></SelectTrigger><SelectContent><SelectItem
                                value="high">高</SelectItem><SelectItem value="medium">中</SelectItem><SelectItem
                                value="low">低</SelectItem></SelectContent></Select></div>
                            <div><Label>涉事法规</Label><Input value={form.involved_laws}
                                                               onChange={(e) => setForm((p) => ({
                                                                   ...p,
                                                                   involved_laws: e.target.value
                                                               }))}/></div>
                            <div><Label>应对建议</Label><Input value={form.response} onChange={(e) => setForm((p) => ({
                                ...p,
                                response: e.target.value
                            }))}/></div>
                        </>}
                        {form.type === 'update' && <>
                            <div><Label>更新类型</Label><Select value={form.update_type}
                                                                onValueChange={(v) => setForm((p) => ({
                                                                    ...p,
                                                                    update_type: v
                                                                }))}><SelectTrigger><SelectValue
                                placeholder="选择"/></SelectTrigger><SelectContent><SelectItem
                                value="修订">修订</SelectItem><SelectItem value="新增">新增</SelectItem><SelectItem
                                value="废止">废止</SelectItem></SelectContent></Select></div>
                            <div><Label>变更描述</Label><Input value={form.change_desc}
                                                               onChange={(e) => setForm((p) => ({
                                                                   ...p,
                                                                   change_desc: e.target.value
                                                               }))}/></div>
                            <div><Label>影响</Label><Input value={form.impact} onChange={(e) => setForm((p) => ({
                                ...p,
                                impact: e.target.value
                            }))}/></div>
                            <div><Label>建议</Label><Input value={form.advice} onChange={(e) => setForm((p) => ({
                                ...p,
                                advice: e.target.value
                            }))}/></div>
                        </>}
                        <Button className="w-full" onClick={handleSave} disabled={saving || !form.title}>{saving ? '保存中...' : '保存'}</Button>
                    </div>
                </DialogContent>
            </Dialog>
            <AlertDialog open={confirmAction !== null} onOpenChange={(open) => !open && setConfirmAction(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>
                            {confirmAction?.type === 'discard' && '确认丢弃待审修改？'}
                            {confirmAction?.type === 'suspend' && '确认挂起资讯？'}
                            {confirmAction?.type === 'delete' && '确认永久删除？'}
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                            {confirmAction?.type === 'discard' && '此操作只会删除待审核的资讯修改，当前线上正式版本仍会保持不变。'}
                            {confirmAction?.type === 'suspend' && (
                                <>挂起“{confirmAction.item.title}”后公开页面将不再展示；之后可通过“审核通过 / 恢复发布”重新发布。现有待审修改会被丢弃。</>
                            )}
                            {confirmAction?.type === 'delete' && (
                                confirmAction.item.status === 'published'
                                    ? <>这会永久删除已发布资讯“{confirmAction.item.title}”及其正文和标签关系，公开页面将不再展示该记录。此操作不可撤销。</>
                                    : <>这会永久删除草稿“{confirmAction.item.title}”。由于系统无法区分首次草稿和挂起记录，删除后均无法恢复发布。</>
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
