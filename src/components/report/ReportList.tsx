import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight, FileText, Loader2, Plus, RefreshCw, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
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
import type { ComplianceReportSummary, ReportStatus } from '@/lib/compliance-reports';
import { REPORT_STATUS_LABELS } from '@/lib/compliance-reports';

const STATUS_COLORS: Record<ReportStatus, string> = {
    submitting: 'bg-gray-500/10 text-gray-600 border-gray-200',
    queued: 'bg-gray-500/10 text-gray-600 border-gray-200',
    in_progress: 'bg-blue-500/10 text-blue-600 border-blue-200',
    completed: 'bg-green-500/10 text-green-600 border-green-200',
    failed: 'bg-red-500/10 text-red-600 border-red-200',
    cancelled: 'bg-yellow-500/10 text-yellow-600 border-yellow-200',
};

interface ReportListProps {
    reports: ComplianceReportSummary[];
    total: number;
    page: number;
    perPage: number;
    loading: boolean;
    error: string | null;
    detailBasePath: string;
    title: string;
    showNewCta?: boolean;
    newCtaPath?: string;
    showRegenerate?: boolean;
    onPageChange: (page: number) => void;
    onRetry: () => void;
    onDelete?: (id: number) => Promise<void>;
}

export default function ReportList({
    reports,
    total,
    page,
    perPage,
    loading,
    error,
    detailBasePath,
    title,
    showNewCta,
    newCtaPath,
    showRegenerate,
    onPageChange,
    onRetry,
    onDelete,
}: ReportListProps) {
    const totalPages = Math.max(1, Math.ceil(total / perPage));
    const [deleteTarget, setDeleteTarget] = useState<ComplianceReportSummary | null>(null);
    const [deleting, setDeleting] = useState(false);

    const handleDelete = async () => {
        if (!deleteTarget || !onDelete) return;
        setDeleting(true);
        try {
            await onDelete(deleteTarget.id);
        } finally {
            setDeleting(false);
            setDeleteTarget(null);
        }
    };

    return (
        <div className="h-full overflow-hidden">
            <div className="max-w-5xl mx-auto h-full min-h-0 py-6 px-4 flex flex-col">
                <div className="flex items-center justify-between mb-6 shrink-0">
                    <h1 className="text-2xl font-bold text-foreground">{title}</h1>
                    {showNewCta && newCtaPath && (
                        <Link to={newCtaPath}>
                            <Button size="sm">
                                <Plus className="w-4 h-4 mr-1" />
                                发起合规初诊
                            </Button>
                        </Link>
                    )}
                </div>

                {error && (
                    <Card className="mb-4 border-destructive/50 shrink-0">
                        <CardContent className="p-4 text-center">
                            <p className="text-sm text-destructive mb-2">{error}</p>
                            <Button variant="outline" size="sm" onClick={onRetry}>
                                重试
                            </Button>
                        </CardContent>
                    </Card>
                )}

                <div
                    data-report-list-viewport
                    className="relative flex-1 min-h-0 overflow-hidden pr-1"
                    aria-busy={loading}
                >
                    {loading && reports.length === 0 ? (
                        <div className="h-full flex items-center justify-center">
                            <Loader2 className="w-8 h-8 text-primary animate-spin" />
                        </div>
                    ) : reports.length === 0 ? (
                        <Card>
                            <CardContent className="p-12 text-center">
                                <FileText className="w-10 h-10 mx-auto mb-3 text-muted-foreground" />
                                <p className="text-muted-foreground mb-4">暂无合规报告</p>
                                {showNewCta && newCtaPath && (
                                    <Link to={newCtaPath}>
                                        <Button>
                                            <Plus className="w-4 h-4 mr-1" />
                                            发起合规初诊
                                        </Button>
                                    </Link>
                                )}
                            </CardContent>
                        </Card>
                    ) : (
                        <div className="space-y-3">
                            {reports.map((r) => (
                                <Card data-report-card key={r.id} className="shadow-card hover:shadow-md transition-shadow">
                                    <CardContent className="p-5">
                                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                                            <div className="flex-1 min-w-0 space-y-1">
                                                <div className="flex items-center gap-2 flex-wrap">
                                                    <span className="font-semibold text-foreground truncate">
                                                        {r.company_name}
                                                    </span>
                                                    <Badge variant="secondary" className="text-xs">
                                                        {r.industry}
                                                    </Badge>
                                                </div>
                                                <div className="flex items-center gap-2 text-xs text-muted-foreground flex-wrap">
                                                    <span>目的国：{r.country}</span>
                                                    <span>·</span>
                                                    <span>业务模式：{r.business_model}</span>
                                                    <span>·</span>
                                                    <span>预算：{r.budget_range}</span>
                                                    {r.doc_count > 0 && (
                                                        <>
                                                            <span>·</span>
                                                            <span>附件 {r.doc_count} 个</span>
                                                        </>
                                                    )}
                                                </div>
                                                <div className="text-xs text-muted-foreground">
                                                    创建于 {new Date(r.created_at).toLocaleString('zh-CN')}
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3 shrink-0">
                                                {r.deleted && (
                                                    <Badge variant="destructive" className="text-xs">
                                                        已删除
                                                    </Badge>
                                                )}
                                                <Badge
                                                    variant="outline"
                                                    className={STATUS_COLORS[r.status]}
                                                >
                                                    {REPORT_STATUS_LABELS[r.status]}
                                                </Badge>
                                                <Link to={`${detailBasePath}/${r.id}`}>
                                                    <Button variant="outline" size="sm">
                                                        查看详情
                                                    </Button>
                                                </Link>
                                                {showRegenerate && !r.deleted && (
                                                    <Link to={`/diagnosis?regenerate=${r.id}`}>
                                                        <Button variant="ghost" size="icon" title="复用信息重新生成"
                                                                className="text-muted-foreground hover:text-primary">
                                                            <RefreshCw className="w-4 h-4"/>
                                                        </Button>
                                                    </Link>
                                                )}
                                                {onDelete && !r.deleted && (
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="text-muted-foreground hover:text-destructive"
                                                        onClick={() => setDeleteTarget(r)}
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </Button>
                                                )}
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    )}

                    {loading && reports.length > 0 && (
                        <div className="absolute top-2 right-3 rounded-full border bg-background/95 p-2 shadow-sm">
                            <Loader2 className="w-4 h-4 text-primary animate-spin" />
                            <span className="sr-only">正在加载报告列表</span>
                        </div>
                    )}
                </div>

                <div className="shrink-0 min-h-[48px] pt-3 bg-background flex items-center justify-between gap-4">
                    {reports.length > 0 && (
                        <>
                            <p className="text-sm text-muted-foreground shrink-0">
                                共 {total} 条记录
                            </p>

                            {totalPages > 1 && (
                                <div className="flex items-center justify-center gap-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        disabled={loading || page <= 1}
                                        onClick={() => onPageChange(page - 1)}
                                    >
                                        <ChevronLeft className="w-4 h-4" />
                                    </Button>
                                    <span className="text-sm text-muted-foreground px-2">
                                        {page} / {totalPages}
                                    </span>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        disabled={loading || page >= totalPages}
                                        onClick={() => onPageChange(page + 1)}
                                    >
                                        <ChevronRight className="w-4 h-4" />
                                    </Button>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>

            <AlertDialog open={!!deleteTarget} onOpenChange={(open) => { if (!open) setDeleteTarget(null); }}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>确认删除</AlertDialogTitle>
                        <AlertDialogDescription>
                            确定要删除「{deleteTarget?.company_name}」的合规报告吗？此操作不可撤销。
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={deleting}>取消</AlertDialogCancel>
                        <AlertDialogAction
                            disabled={deleting}
                            onClick={handleDelete}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                            {deleting ? '删除中...' : '确认删除'}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
