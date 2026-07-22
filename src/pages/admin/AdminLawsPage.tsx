import { useCallback, useEffect, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
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
import {
    Check,
    CheckSquare,
    ChevronLeft,
    ChevronRight,
    Clock,
    Download,
    EyeOff,
    FileText,
    Loader2,
    Pause,
    Pencil,
    Plus,
    Search,
    Trash2,
    Upload,
    X,
} from 'lucide-react';
import type { RootState } from '@/store';
import { usePageSize } from '@/hooks/use-page-size';
import {
    type AdminLaw,
    type LawCountry,
    type LawScene,
    type LawStatus,
    type ReviewStatus,
    type BatchApproveResult,
    listAdminLaws,
    getAdminLaw,
    createAdminLaw,
    updateAdminLaw,
    approveAdminLaw,
    approveAdminLaws,
    suspendAdminLaw,
    discardAdminLawDraft,
    deleteAdminLaw,
    extractLawError,
} from '@/lib/laws';

// --- Helpers ---

const emptyForm = {
    title_cn: '',
    title_en: '',
    law_number: '',
    country_id: '',
    scene_id: '',
    effective_date: '',
    summary: '',
};

interface ConfirmAction {
    type: 'delete' | 'suspend' | 'discard';
    law: AdminLaw;
}

// --- Component ---

export default function AdminLawsPage() {
    const role = useSelector((s: RootState) => s.auth.user?.role);
    const isAdmin = role === 'admin';
    const { size, ready } = usePageSize();

    // List state
    const [items, setItems] = useState<AdminLaw[]>([]);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(true);
    const [listError, setListError] = useState<string | null>(null);
    const [page, setPage] = useState(1);
    const [statusFilter, setStatusFilter] = useState<LawStatus | 'all'>('all');
    const [reviewFilter, setReviewFilter] = useState<ReviewStatus | 'all'>('all');
    const [countryFilter, setCountryFilter] = useState('all');
    const [sceneFilter, setSceneFilter] = useState('all');
    const [keyword, setKeyword] = useState('');
    const [searchKeyword, setSearchKeyword] = useState('');
    const [countries, setCountries] = useState<LawCountry[]>([]);
    const [scenes, setScenes] = useState<LawScene[]>([]);
    const metaLoaded = useRef(false);

    // Selection (only pending items)
    const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());

    // Batch
    const [batchApproving, setBatchApproving] = useState(false);
    const [batchFailures, setBatchFailures] = useState<BatchApproveResult['failed'] | null>(null);

    // Dialog
    const [dlgOpen, setDlgOpen] = useState(false);
    const [editId, setEditId] = useState<number | null>(null);
    const [form, setForm] = useState(emptyForm);
    const [saving, setSaving] = useState(false);
    const [loadingEdit, setLoadingEdit] = useState(false);
    const [editLaw, setEditLaw] = useState<AdminLaw | null>(null);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Confirm dialogs
    const [confirmAction, setConfirmAction] = useState<ConfirmAction | null>(null);
    const [actingId, setActingId] = useState<number | null>(null);

    // --- Fetch ---

    const fetchList = useCallback(async () => {
        setLoading(true);
        setListError(null);
        try {
            const result = await listAdminLaws({
                page,
                per_page: size,
                status: statusFilter !== 'all' ? statusFilter : undefined,
                review_status: reviewFilter !== 'all' ? reviewFilter : undefined,
                country_id: countryFilter !== 'all' ? countryFilter : undefined,
                scene_id: sceneFilter !== 'all' ? sceneFilter : undefined,
                keyword: searchKeyword.trim() || undefined,
            });
            setItems(result.items);
            setTotal(result.meta.total);
            if (!metaLoaded.current) {
                metaLoaded.current = true;
                setCountries(result.meta.countries);
                setScenes(result.meta.scenes);
            }
        } catch {
            setListError('加载法规列表失败');
        } finally {
            setLoading(false);
        }
    }, [page, size, statusFilter, reviewFilter, countryFilter, sceneFilter, searchKeyword]);

    useEffect(() => {
        if (ready) fetchList();
    }, [fetchList, ready]);

    // Clean up selections when filter/page changes
    useEffect(() => {
        setSelectedIds(new Set());
        setBatchFailures(null);
    }, [page, statusFilter, reviewFilter, countryFilter, sceneFilter, searchKeyword]);

    // Fix page if over total
    useEffect(() => {
        if (!loading && total > 0) {
            const maxPage = Math.ceil(total / size);
            if (page > maxPage) setPage(maxPage);
        }
    }, [total, page, size, loading]);

    // --- Dialog ---

    const openNew = () => {
        setEditId(null);
        setEditLaw(null);
        setForm(emptyForm);
        setSelectedFile(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
        setDlgOpen(true);
    };

    const openEdit = async (item: AdminLaw) => {
        setEditId(item.id);
        setEditLaw(null);
        setLoadingEdit(true);
        setDlgOpen(true);
        try {
            const detail = await getAdminLaw(item.id);
            setEditLaw(detail);
            setForm({
                title_cn: detail.title_cn || '',
                title_en: detail.title_en || '',
                law_number: detail.law_number || '',
                country_id: detail.country_id,
                scene_id: detail.scene_id,
                effective_date: detail.effective_date || '',
                summary: detail.summary || '',
            });
        } catch {
            toast.error('加载法规详情失败');
            setDlgOpen(false);
        } finally {
            setLoadingEdit(false);
            setSelectedFile(null);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    const handleSave = async () => {
        if (saving) return;

        const titleCn = form.title_cn.trim();
        if (!titleCn || !form.country_id || !form.scene_id) return;

        // Validate file extension
        if (selectedFile && !selectedFile.name.includes('.')) {
            toast.error('文件名缺少后缀，请重命名文件后重新选择');
            return;
        }

        const fd = new FormData();
        fd.append('title_cn', titleCn);
        fd.append('country_id', form.country_id);
        fd.append('scene_id', form.scene_id);
        if (form.title_en.trim()) fd.append('title_en', form.title_en.trim());
        if (form.law_number.trim()) fd.append('law_number', form.law_number.trim());
        if (form.effective_date) fd.append('effective_date', form.effective_date);
        if (form.summary.trim()) fd.append('summary', form.summary.trim());
        if (selectedFile) fd.append('file', selectedFile);

        setSaving(true);
        try {
            if (editId) {
                await updateAdminLaw(editId, fd);
            } else {
                await createAdminLaw(fd);
            }
            toast.success(editId ? '法规已更新' : '法规已创建');
            setDlgOpen(false);
            await fetchList();
        } catch (err: unknown) {
            const msg = extractLawError(err);
            toast.error(msg);
        } finally {
            setSaving(false);
        }
    };

    // --- Actions ---

    const handleApprove = async (id: number) => {
        setActingId(id);
        try {
            await approveAdminLaw(id);
            toast.success('已审核通过并发布');
            await fetchList();
        } catch (err: unknown) {
            toast.error(extractLawError(err));
        } finally {
            setActingId(null);
        }
    };

    const handleSuspend = async () => {
        if (!confirmAction || confirmAction.type !== 'suspend') return;
        setActingId(confirmAction.law.id);
        try {
            await suspendAdminLaw(confirmAction.law.id);
            toast.success('法规已挂起，可通过“审核通过 / 恢复发布”重新发布');
            setConfirmAction(null);
            await fetchList();
        } catch (err: unknown) {
            toast.error(extractLawError(err));
        } finally {
            setActingId(null);
        }
    };

    const handleDiscard = async () => {
        if (!confirmAction || confirmAction.type !== 'discard') return;
        setActingId(confirmAction.law.id);
        try {
            await discardAdminLawDraft(confirmAction.law.id);
            toast.success('待审修改已丢弃');
            setConfirmAction(null);
            await fetchList();
        } catch (err: unknown) {
            toast.error(extractLawError(err));
        } finally {
            setActingId(null);
        }
    };

    const handleDelete = async () => {
        if (!confirmAction || confirmAction.type !== 'delete') return;
        setActingId(confirmAction.law.id);
        try {
            await deleteAdminLaw(confirmAction.law.id);
            toast.success('法规已删除');
            setConfirmAction(null);
            await fetchList();
        } catch (err: unknown) {
            toast.error(extractLawError(err));
        } finally {
            setActingId(null);
        }
    };

    // --- Selection ---

    const pendingItems = items.filter((i) => i.review_status === 'pending');

    const toggleSelect = (id: number) => {
        setSelectedIds((prev) => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return next;
        });
    };

    const toggleSelectAll = () => {
        if (batchApproving || pendingItems.length === 0) return;
        if (pendingItems.every((i) => selectedIds.has(i.id))) {
            setSelectedIds(new Set());
        } else {
            setSelectedIds(new Set(pendingItems.map((i) => i.id)));
        }
    };

    const handleBatchApprove = async () => {
        if (selectedIds.size === 0 || batchApproving) return;
        setBatchApproving(true);
        try {
            const result = await approveAdminLaws([...selectedIds]);
            // Remove approved from selection; keep failed
            setSelectedIds((prev) => {
                const next = new Set(prev);
                for (const id of result.approved) next.delete(id);
                return next;
            });
            setBatchFailures(result.failed.length > 0 ? result.failed : null);
            if (result.approved.length > 0) {
                toast.success(`${result.approved.length} 条审核通过`);
            }
            await fetchList();
        } catch (err: unknown) {
            toast.error(extractLawError(err));
        } finally {
            setBatchApproving(false);
        }
    };

    // --- Render helpers ---

    const totalPages = Math.max(1, Math.ceil(total / size));

    const canEdit = (law: AdminLaw): boolean => {
        if (isAdmin) {
            // Admin can edit unless there's a pending draft from an editor
            return !(law.status === 'published' && law.has_draft);
        }
        // Editor can always edit (creates/updates draft)
        return true;
    };

    const fileLabel = (law: AdminLaw) => {
        const canDownload = law.status === 'published' && Boolean(law.object_name);
        const parts: React.ReactNode[] = [];

        // Official file
        if (law.object_name) {
            parts.push(
                <div key="official" className="flex items-center gap-1">
                    <Upload className="w-3 h-3 text-muted-foreground shrink-0" />
                    {canDownload ? (
                        <a
                            href={`/api/laws/${law.id}/download`}
                            className="text-primary hover:underline truncate inline-flex items-center gap-1"
                            title={law.object_name}
                        >
                            <span className="truncate max-w-[120px]">
                                {law.object_name}
                            </span>
                            <Download className="w-3 h-3 shrink-0" />
                        </a>
                    ) : (
                        <span className="truncate max-w-[120px]" title={law.object_name}>
                            {law.object_name}
                        </span>
                    )}
                </div>,
            );
        }

        // Pending file
        if (law.has_pending_file) {
            parts.push(
                <div
                    key="pending-file"
                    className="flex items-center gap-1 text-warning"
                >
                    <FileText className="w-3 h-3 shrink-0" />
                    <span>待审新文件</span>
                    {law.pending_object_name ? (
                        <span
                            className="truncate max-w-[100px] text-muted-foreground"
                            title={law.pending_object_name}
                        >
                            ：{law.pending_object_name}
                        </span>
                    ) : (
                        <span className="text-muted-foreground">
                            ：审核后确定文件名
                        </span>
                    )}
                </div>,
            );
        } else if (
            law.pending_object_name &&
            !law.has_pending_file
        ) {
            parts.push(
                <div key="pending-rename" className="text-xs text-muted-foreground">
                    审核后将重命名为：{law.pending_object_name}
                </div>,
            );
        }

        if (parts.length === 0) return <span className="text-muted-foreground">-</span>;
        return <div className="space-y-1 text-xs">{parts}</div>;
    };

    const statusBadge = (law: AdminLaw) => {
        if (law.status === 'draft' && law.review_status === 'pending') {
            return (
                <Badge variant="secondary" className="text-xs gap-1">
                    <Clock className="w-3 h-3" />
                    待首次审核
                </Badge>
            );
        }
        if (law.status === 'published' && law.review_status === 'pending') {
            return (
                <div className="flex items-center gap-1">
                    <Badge className="bg-success/10 text-success border-success/20 text-xs">
                        已发布
                    </Badge>
                    <Badge variant="secondary" className="text-xs gap-1">
                        <Clock className="w-3 h-3" />
                        待审核修改
                    </Badge>
                </div>
            );
        }
        // published + none
        return (
            <Badge className="bg-success/10 text-success border-success/20 text-xs">
                已发布
            </Badge>
        );
    };

    const isRowActing = (id: number) => actingId === id;

    // --- Render ---

    return (
        <div className="flex flex-col flex-1 min-h-0">
            {/* Header */}
            <div className="flex items-center justify-between mb-2 shrink-0">
                <h2 className="text-xl font-bold">法规管理</h2>
                <div className="flex items-center gap-2">
                    {isAdmin && selectedIds.size > 0 && (
                        <Button
                            size="sm"
                            variant="outline"
                            disabled={batchApproving}
                            onClick={handleBatchApprove}
                        >
                            {batchApproving ? (
                                <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                            ) : (
                                <CheckSquare className="w-4 h-4 mr-1" />
                            )}
                            批量审核({selectedIds.size})
                        </Button>
                    )}
                    <Button size="sm" onClick={openNew} disabled={batchApproving}>
                        <Plus className="w-4 h-4 mr-1" />
                        新建
                    </Button>
                </div>
            </div>

            {/* Filters */}
            <div className="flex items-center gap-2 mb-4 flex-wrap">
                {isAdmin && (
                    <Select
                        value={statusFilter}
                        disabled={batchApproving}
                        onValueChange={(v) => {
                            setStatusFilter(v as LawStatus | 'all');
                            setPage(1);
                        }}
                    >
                        <SelectTrigger className="w-24 h-8 text-xs">
                            <SelectValue placeholder="状态" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">全部状态</SelectItem>
                            <SelectItem value="draft">草稿</SelectItem>
                            <SelectItem value="published">已发布</SelectItem>
                        </SelectContent>
                    </Select>
                )}
                {isAdmin && (
                    <Select
                        value={reviewFilter}
                        disabled={batchApproving}
                        onValueChange={(v) => {
                            setReviewFilter(v as ReviewStatus | 'all');
                            setPage(1);
                        }}
                    >
                        <SelectTrigger className="w-28 h-8 text-xs">
                            <SelectValue placeholder="审核状态" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">全部审核状态</SelectItem>
                            <SelectItem value="pending">待审核</SelectItem>
                            <SelectItem value="none">无待审核</SelectItem>
                        </SelectContent>
                    </Select>
                )}
                <Select
                    value={countryFilter}
                    disabled={batchApproving}
                    onValueChange={(v) => {
                        setCountryFilter(v);
                        setPage(1);
                    }}
                >
                    <SelectTrigger className="w-24 h-8 text-xs">
                        <SelectValue placeholder="国家" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">全部国家</SelectItem>
                        {countries.map((c) => (
                            <SelectItem key={c.id} value={c.id}>
                                {c.name_zh}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                <Select
                    value={sceneFilter}
                    disabled={batchApproving}
                    onValueChange={(v) => {
                        setSceneFilter(v);
                        setPage(1);
                    }}
                >
                    <SelectTrigger className="w-24 h-8 text-xs">
                        <SelectValue placeholder="场景" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">全部场景</SelectItem>
                        {scenes.map((s) => (
                            <SelectItem key={s.id} value={s.id}>
                                {s.label_zh}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                <Input
                    placeholder="搜索标题..."
                    value={keyword}
                    disabled={batchApproving}
                    onChange={(e) => setKeyword(e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                            setSearchKeyword(keyword.trim());
                            setPage(1);
                        }
                    }}
                    className="w-40 h-8 text-xs"
                />
                <Button
                    variant="outline"
                    size="sm"
                    className="h-8"
                    disabled={batchApproving}
                    onClick={() => {
                        setSearchKeyword(keyword.trim());
                        setPage(1);
                    }}
                >
                    <Search className="w-3.5 h-3.5" />
                </Button>
            </div>

            {/* Batch failures */}
            {batchFailures && batchFailures.length > 0 && (
                <div className="mb-4 p-3 border border-destructive/30 bg-destructive/5 rounded-md">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-semibold text-destructive">
                            部分审核失败（{batchFailures.length} 条）
                        </span>
                        <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 text-xs"
                            onClick={() => setBatchFailures(null)}
                        >
                            <X className="w-3 h-3" />
                        </Button>
                    </div>
                    <ul className="space-y-1 text-xs text-muted-foreground">
                        {batchFailures.map((f) => (
                            <li key={f.id}>
                                <span className="font-medium text-foreground">
                                    ID {f.id}
                                </span>
                                ：[{f.code}] {f.message}
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            {/* List error */}
            {listError && (
                <div className="mb-4 p-3 border border-destructive/30 bg-destructive/5 rounded-md flex items-center justify-between">
                    <span className="text-sm text-destructive">{listError}</span>
                    <Button variant="outline" size="sm" onClick={fetchList}>
                        重试
                    </Button>
                </div>
            )}

            {/* Table */}
            {loading ? (
                <div className="flex justify-center py-20">
                    <Loader2 className="w-8 h-8 animate-spin" />
                </div>
            ) : (
                <div className="flex-1 min-h-0 overflow-auto">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b text-left text-muted-foreground">
                                    {isAdmin && (
                                        <th className="p-3 w-8">
                                            <input
                                                type="checkbox"
                                                className="w-4 h-4 accent-primary cursor-pointer"
                                                disabled={batchApproving}
                                                onChange={toggleSelectAll}
                                                checked={
                                                    pendingItems.length > 0 &&
                                                    pendingItems.every((i) =>
                                                        selectedIds.has(i.id),
                                                    )
                                                }
                                            />
                                        </th>
                                    )}
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
                                {items.map((item) => (
                                    <tr
                                        key={item.id}
                                        className="border-b hover:bg-muted/30"
                                    >
                                        {isAdmin && (
                                            <td className="p-3 w-8">
                                                {item.review_status === 'pending' ? (
                                                    <input
                                                        type="checkbox"
                                                        className="w-4 h-4 accent-primary cursor-pointer"
                                                        checked={selectedIds.has(item.id)}
                                                        disabled={batchApproving}
                                                        onChange={() =>
                                                            toggleSelect(item.id)
                                                        }
                                                    />
                                                ) : null}
                                            </td>
                                        )}
                                        <td className="p-3 font-medium">
                                            {item.title_cn}
                                        </td>
                                        <td className="p-3">
                                            {countries.find(
                                                (c) => c.id === item.country_id,
                                            )?.name_zh ?? item.country_id}
                                        </td>
                                        <td className="p-3">
                                            <Badge variant="outline" className="text-xs">
                                                {scenes.find(
                                                    (s) => s.id === item.scene_id,
                                                )?.label_zh ?? item.scene_id}
                                            </Badge>
                                        </td>
                                        <td className="p-3 max-w-[260px]">
                                            {fileLabel(item)}
                                        </td>
                                        <td className="p-3">{statusBadge(item)}</td>
                                        <td className="p-3 text-xs text-muted-foreground">
                                            {item.updated_at
                                                ? new Date(
                                                      item.updated_at,
                                                  ).toLocaleString('zh-CN')
                                                : '-'}
                                        </td>
                                        <td className="p-3">
                                            <div className="flex gap-1">
                                                {canEdit(item) && (
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        title="编辑法规"
                                                        disabled={batchApproving}
                                                        onClick={() => openEdit(item)}
                                                    >
                                                        <Pencil className="w-3.5 h-3.5" />
                                                    </Button>
                                                )}
                                                {isAdmin &&
                                                    item.review_status ===
                                                        'pending' && (
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            title={item.status === 'draft' ? '审核通过 / 恢复发布' : '审核通过'}
                                                            disabled={
                                                                batchApproving ||
                                                                isRowActing(item.id)
                                                            }
                                                            onClick={() =>
                                                                handleApprove(
                                                                    item.id,
                                                                )
                                                            }
                                                        >
                                                            {isRowActing(item.id) ? (
                                                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                                            ) : (
                                                                <Check className="w-3.5 h-3.5 text-success" />
                                                            )}
                                                        </Button>
                                                    )}
                                                {isAdmin &&
                                                    item.status === 'published' &&
                                                    item.has_draft && (
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            title="丢弃待审修改"
                                                            disabled={
                                                                batchApproving ||
                                                                isRowActing(item.id)
                                                            }
                                                            onClick={() =>
                                                                setConfirmAction({
                                                                    type: 'discard',
                                                                    law: item,
                                                                })
                                                            }
                                                        >
                                                            <EyeOff className="w-3.5 h-3.5 text-warning" />
                                                        </Button>
                                                    )}
                                                {isAdmin &&
                                                    item.status === 'published' && (
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            title="挂起发布"
                                                            disabled={
                                                                batchApproving ||
                                                                isRowActing(item.id)
                                                            }
                                                            onClick={() =>
                                                                setConfirmAction({
                                                                    type: 'suspend',
                                                                    law: item,
                                                                })
                                                            }
                                                        >
                                                            <Pause className="w-3.5 h-3.5 text-warning" />
                                                        </Button>
                                                    )}
                                                {(isAdmin || item.status === 'draft') && (
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        title={item.status === 'published' ? '永久删除已发布法规' : '永久删除草稿'}
                                                        disabled={
                                                            batchApproving ||
                                                            isRowActing(item.id)
                                                        }
                                                        onClick={() =>
                                                            setConfirmAction({
                                                                type: 'delete',
                                                                law: item,
                                                            })
                                                        }
                                                    >
                                                        <Trash2 className="w-3.5 h-3.5 text-destructive" />
                                                    </Button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex justify-center gap-2 pt-4 shrink-0">
                    <Button
                        variant="outline"
                        size="sm"
                        disabled={batchApproving || page <= 1}
                        onClick={() => setPage((p) => p - 1)}
                    >
                        <ChevronLeft className="w-4 h-4" />
                    </Button>
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                        (p) => (
                            <Button
                                key={p}
                                variant={p === page ? 'default' : 'outline'}
                                size="sm"
                                className="w-9 h-9"
                                disabled={batchApproving}
                                onClick={() => setPage(p)}
                            >
                                {p}
                            </Button>
                        ),
                    )}
                    <Button
                        variant="outline"
                        size="sm"
                        disabled={batchApproving || page >= totalPages}
                        onClick={() => setPage((p) => p + 1)}
                    >
                        <ChevronRight className="w-4 h-4" />
                    </Button>
                </div>
            )}

            {/* Edit dialog */}
            <Dialog
                open={dlgOpen}
                onOpenChange={(open) => {
                    if (!saving) setDlgOpen(open);
                }}
            >
                <DialogContent className="max-w-lg max-h-[90dvh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>
                            {editId ? '编辑' : '新建'}法规
                        </DialogTitle>
                    </DialogHeader>

                    {loadingEdit ? (
                        <div className="flex justify-center py-12">
                            <Loader2 className="w-8 h-8 animate-spin" />
                        </div>
                    ) : (
                        <div className="space-y-4 py-2">
                            {/* Read-only file info when editing */}
                            {editLaw && (
                                <div className="text-xs text-muted-foreground bg-muted/30 rounded p-2 space-y-1">
                                    {editLaw.object_name && (
                                        <p>
                                            正式文件：{editLaw.object_name}
                                        </p>
                                    )}
                                    {editLaw.has_pending_file &&
                                        editLaw.pending_object_name && (
                                            <p className="text-warning">
                                                待审新文件：
                                                {editLaw.pending_object_name}
                                            </p>
                                        )}
                                    {editLaw.pending_object_name &&
                                        !editLaw.has_pending_file && (
                                            <p>
                                                审核后重命名为：
                                                {editLaw.pending_object_name}
                                            </p>
                                        )}
                                </div>
                            )}

                            <div>
                                <Label>中文标题 *</Label>
                                <Input
                                    value={form.title_cn}
                                    onChange={(e) =>
                                        setForm((p) => ({
                                            ...p,
                                            title_cn: e.target.value,
                                        }))
                                    }
                                    disabled={saving}
                                />
                            </div>
                            <div>
                                <Label>英文标题</Label>
                                <Input
                                    value={form.title_en}
                                    onChange={(e) =>
                                        setForm((p) => ({
                                            ...p,
                                            title_en: e.target.value,
                                        }))
                                    }
                                    disabled={saving}
                                />
                            </div>
                            <div>
                                <Label>法号/法令编号</Label>
                                <Input
                                    value={form.law_number}
                                    onChange={(e) =>
                                        setForm((p) => ({
                                            ...p,
                                            law_number: e.target.value,
                                        }))
                                    }
                                    disabled={saving}
                                />
                            </div>
                            <div>
                                <Label>国家 *</Label>
                                <Select
                                    value={form.country_id}
                                    onValueChange={(v) =>
                                        setForm((p) => ({
                                            ...p,
                                            country_id: v,
                                        }))
                                    }
                                    disabled={saving}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="选择国家" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {countries.map((c) => (
                                            <SelectItem key={c.id} value={c.id}>
                                                {c.name_zh}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div>
                                <Label>场景 *</Label>
                                <Select
                                    value={form.scene_id}
                                    onValueChange={(v) =>
                                        setForm((p) => ({
                                            ...p,
                                            scene_id: v,
                                        }))
                                    }
                                    disabled={saving}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="选择场景" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {scenes.map((s) => (
                                            <SelectItem key={s.id} value={s.id}>
                                                {s.label_zh}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div>
                                <Label>生效日期</Label>
                                <Input
                                    type="date"
                                    value={form.effective_date}
                                    onChange={(e) =>
                                        setForm((p) => ({
                                            ...p,
                                            effective_date: e.target.value,
                                        }))
                                    }
                                    disabled={saving}
                                />
                            </div>
                            <div>
                                <Label>摘要</Label>
                                <Input
                                    value={form.summary}
                                    onChange={(e) =>
                                        setForm((p) => ({
                                            ...p,
                                            summary: e.target.value,
                                        }))
                                    }
                                    disabled={saving}
                                />
                            </div>
                            <div>
                                <Label>法规文件</Label>
                                <Input
                                    type="file"
                                    ref={fileInputRef}
                                    disabled={saving}
                                    onChange={(e) =>
                                        setSelectedFile(
                                            e.target.files?.[0] ?? null,
                                        )
                                    }
                                />
                            </div>

                            {/* Warn if admin trying to edit published with draft */}
                            {isAdmin &&
                                editLaw &&
                                editLaw.status === 'published' &&
                                editLaw.has_draft && (
                                    <p className="text-xs text-destructive">
                                        该记录有待审修改，请先审核或丢弃草稿后再编辑
                                    </p>
                                )}

                            <Button
                                className="w-full"
                                onClick={handleSave}
                                disabled={
                                    saving ||
                                    !form.title_cn ||
                                    !form.country_id ||
                                    !form.scene_id ||
                                    Boolean(
                                        isAdmin &&
                                            editLaw &&
                                            editLaw.status === 'published' &&
                                            editLaw.has_draft,
                                    )
                                }
                            >
                                {saving
                                    ? '保存中...'
                                    : editId
                                      ? '保存修改'
                                      : '创建法规'}
                            </Button>
                        </div>
                    )}
                </DialogContent>
            </Dialog>

            {/* Confirmation dialogs for destructive actions */}
            <AlertDialog
                open={!!confirmAction}
                onOpenChange={(open) => {
                    if (!open && !actingId) setConfirmAction(null);
                }}
            >
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>
                            {confirmAction?.type === 'delete' && '确认删除'}
                            {confirmAction?.type === 'suspend' && '确认挂起'}
                            {confirmAction?.type === 'discard' && '确认丢弃修改'}
                        </AlertDialogTitle>
                        <AlertDialogDescription className="space-y-2">
                            {confirmAction?.type === 'delete' && (
                                <>
                                    {confirmAction.law.status === 'published' ? (
                                        <p>
                                            删除已发布法规「{confirmAction.law.title_cn}
                                            」将同时删除 OSS 正式文件，公开页面将无法访问。
                                        </p>
                                    ) : (
                                        <p>
                                            确定要删除草稿「{confirmAction.law.title_cn}
                                            」吗？
                                        </p>
                                    )}
                                </>
                            )}
                            {confirmAction?.type === 'suspend' && (
                                <>
                                    <p>
                                        挂起「{confirmAction?.law.title_cn}
                                        」后公开详情和下载将不可用。
                                    </p>
                                    <p>
                                        挂起后可点击“审核通过 / 恢复发布”重新发布；若之后删除该草稿，则会永久删除且无法恢复。
                                    </p>
                                    {confirmAction.law.has_draft && (
                                        <p className="font-semibold text-destructive">
                                            该记录存在待审修改，挂起会同时丢弃待审修改！
                                        </p>
                                    )}
                                </>
                            )}
                            {confirmAction?.type === 'discard' && (
                                <p>
                                    丢弃「{confirmAction.law.title_cn}
                                    」的待审修改，线上正式版本保持不变。
                                </p>
                            )}
                            {confirmAction?.type !== 'suspend' && <p>此操作不可撤销。</p>}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={!!actingId}>
                            取消
                        </AlertDialogCancel>
                        <AlertDialogAction
                            disabled={!!actingId}
                            onClick={(event) => {
                                event.preventDefault();
                                if (confirmAction?.type === 'delete')
                                    void handleDelete();
                                else if (confirmAction?.type === 'suspend')
                                    void handleSuspend();
                                else if (confirmAction?.type === 'discard')
                                    void handleDiscard();
                            }}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                            {actingId ? (
                                <>
                                    <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                                    处理中...
                                </>
                            ) : (
                                '确认'
                            )}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
