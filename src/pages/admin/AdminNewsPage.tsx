import {useCallback, useEffect, useRef, useState} from 'react';
import {useSelector} from 'react-redux';
import {Button} from '@/components/ui/button';
import {Input} from '@/components/ui/input';
import {Label} from '@/components/ui/label';
import {Badge} from '@/components/ui/badge';
import {Textarea} from '@/components/ui/textarea';
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue,} from '@/components/ui/select';
import {Dialog, DialogContent, DialogHeader, DialogTitle,} from '@/components/ui/dialog';
import MultiSelect from '@/components/ui/multi-select';
import api from '@/lib/api';
import type {RootState} from '@/store';
import {usePageSize} from '@/hooks/use-page-size';
import {Check, ChevronLeft, ChevronRight, Clock, Loader2, Pause, Pencil, Plus, Search, Trash2} from 'lucide-react';

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

export default function AdminNewsPage() {
    const role = useSelector((s: RootState) => s.auth.user?.role);
    const isAdmin = role === 'admin';
    const {size, ready} = usePageSize();
    const [items, setItems] = useState<any[]>([]);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [statusFilter, setStatusFilter] = useState('all');
    const [typeFilter, setTypeFilter] = useState('all');
    const [countryFilter, setCountryFilter] = useState('all');
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

    const fetchList = useCallback(async () => {
        setLoading(true);
        const params: Record<string, string | number> = {page, per_page: size};
        if (statusFilter !== 'all') params.status = statusFilter;
        if (typeFilter !== 'all') params.type = typeFilter;
        if (countryFilter !== 'all') params.country_id = countryFilter;
        if (dateFrom) params.date_from = dateFrom;
        if (dateTo) params.date_to = dateTo;
        if (searchKeyword.trim()) params.keyword = searchKeyword.trim();
        const {data} = await api.get('/admin/news', {params});
        setItems(data.data.items || []);
        setTotal(data.data.meta?.total || 0);
        if (!metaLoaded.current) {
            metaLoaded.current = true;
            if (data.data.meta?.countries) setCountries(data.data.meta.countries);
            if (data.data.meta?.types) setTypes(data.data.meta.types);
            if (data.data.meta?.tags) setTags(data.data.meta.tags);
        }
        setLoading(false);
    }, [page, statusFilter, typeFilter, countryFilter, dateFrom, dateTo, searchKeyword, size]);

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
            type: item.type,
            title: item.title,
            country_id: item.country_id || '',
            source: item.source || '',
            date: item.date || '',
            summary: item.summary || '',
            risk_level: item.risk_level || '',
            involved_laws: item.involved_laws || '',
            response: item.response || '',
            update_type: item.update_type || '',
            change_desc: item.change_desc || '',
            impact: item.impact || '',
            advice: item.advice || '',
            content: item.content || '',
            tag_ids: item.tags ? item.tags.map((t: any) => t.id) : [],
        });
        setDlgOpen(true);
    };

    const handleSave = async () => {
        if (saving) return;
        if (!form.title) return;
        const body: any = {type: form.type, title: form.title, date: form.date || undefined};
        if (form.country_id) body.country_id = form.country_id;
        if (form.source) body.source = form.source;
        if (form.summary) body.summary = form.summary;
        if (form.content) body.content = form.content;
        if (form.tag_ids.length > 0) body.tag_ids = form.tag_ids;
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
            fetchList();
        } finally {
            setSaving(false);
        }
    };

    const handleApprove = async (id: number) => {
        await api.post(`/admin/news/${id}/approve`);
        fetchList();
    };
    const handleSuspend = async (id: number) => {
        await api.post(`/admin/news/${id}/suspend`);
        fetchList();
    };
    const handleDelete = async (id: number) => {
        if (!confirm('确定删除？')) return;
        await api.delete(`/admin/news/${id}`);
        fetchList();
    };

    const totalPages = Math.max(1, Math.ceil(total / size));

    return (
        <div className="flex flex-col flex-1 min-h-0">
            <div className="flex items-center justify-between mb-2 shrink-0">
                <h2 className="text-xl font-bold">资讯管理</h2>
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
                                    <td className="p-3 font-medium">{item.title}</td>
                                    <td className="p-3"><Badge variant="outline"
                                                               className="text-xs">{types.find((t) => t.value === item.type)?.label_zh}</Badge>
                                    </td>
                                    <td className="p-3">{countries.find((c) => c.id === item.country_id)?.name_zh}</td>
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
        </div>
    );
}
