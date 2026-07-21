import { useCallback, useEffect, useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { AlertTriangle, ArrowLeft, CheckCircle2, Clock, Loader2, RefreshCw, Trash2, XCircle } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
import type {
    ComplianceReportDetail,
    ComplianceReportData,
    ReportStatus,
} from '@/lib/compliance-reports';
import {
    REPORT_STATUS_LABELS,
    deleteAdminComplianceReport,
    deleteComplianceReport,
    getAdminComplianceReport,
    getComplianceReport,
    parseReportResult,
} from '@/lib/compliance-reports';
import ComplianceReport from '@/components/report/ComplianceReport';

const POLL_INTERVAL = 3000;
const POLLABLE_STATUSES: ReportStatus[] = ['queued', 'in_progress'];

function formatElapsed(seconds: number): string {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;
    const parts = [minutes, remainingSeconds].map((part) => String(part).padStart(2, '0'));

    if (hours > 0) {
        parts.unshift(String(hours).padStart(2, '0'));
    }

    return parts.join(':');
}

const STATUS_COLORS: Record<ReportStatus, string> = {
    queued: 'bg-gray-500/10 text-gray-600 border-gray-200',
    in_progress: 'bg-blue-500/10 text-blue-600 border-blue-200',
    completed: 'bg-green-500/10 text-green-600 border-green-200',
    failed: 'bg-red-500/10 text-red-600 border-red-200',
    cancelled: 'bg-yellow-500/10 text-yellow-600 border-yellow-200',
};

interface ReportDetailContainerProps {
    backPath: string;
    admin?: boolean;
}

export default function ReportDetailContainer({ backPath, admin }: ReportDetailContainerProps) {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [detail, setDetail] = useState<ComplianceReportDetail | null>(null);
    const [reportData, setReportData] = useState<ComplianceReportData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [parseError, setParseError] = useState(false);
    const [elapsedSeconds, setElapsedSeconds] = useState(0);
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

    const handleDelete = async () => {
        if (!id) return;
        setDeleting(true);
        try {
            await deleteFn(Number(id));
            toast.success('报告已删除');
            navigate(backPath, { replace: true });
        } catch {
            toast.error('删除失败，请稍后重试');
            setDeleting(false);
            setShowDeleteDialog(false);
        }
    };

    const getFn = admin ? getAdminComplianceReport : getComplianceReport;
    const deleteFn = admin ? deleteAdminComplianceReport : deleteComplianceReport;

    const fetchDetail = useCallback(async () => {
        if (!id) return;
        try {
            const d = await getFn(Number(id));
            setDetail(d);
            setError(null);

            if (d.status === 'completed') {
                const parsed = parseReportResult(d.result_text);
                if (parsed) {
                    setReportData(parsed);
                    setParseError(false);
                } else {
                    setReportData(null);
                    setParseError(true);
                }
            } else {
                setReportData(null);
                setParseError(false);
            }
        } catch (err: unknown) {
            if (err && typeof err === 'object' && 'response' in err) {
                const axiosErr = err as { response?: { status?: number } };
                if (axiosErr.response?.status === 404) {
                    setError('报告不存在或无权限访问');
                } else {
                    setError('加载报告失败，请稍后重试');
                }
            } else {
                setError('网络错误，请检查连接后重试');
            }
        } finally {
            setLoading(false);
        }
    }, [id]);

    // Initial load
    useEffect(() => {
        setLoading(true);
        setError(null);
        setParseError(false);
        setReportData(null);
        setDetail(null);
        fetchDetail();
    }, [fetchDetail]);

    // Polling
    useEffect(() => {
        if (detail && POLLABLE_STATUSES.includes(detail.status)) {
            pollRef.current = setInterval(fetchDetail, POLL_INTERVAL);
        }
        return () => {
            if (pollRef.current) {
                clearInterval(pollRef.current);
                pollRef.current = null;
            }
        };
    }, [detail, fetchDetail]);

    // Elapsed time while the report is queued or being generated
    useEffect(() => {
        if (!detail || !POLLABLE_STATUSES.includes(detail.status)) {
            setElapsedSeconds(0);
            return;
        }

        const parsedCreatedAt = Date.parse(detail.created_at);
        const startedAt = Number.isNaN(parsedCreatedAt) ? Date.now() : parsedCreatedAt;
        const updateElapsed = () => {
            setElapsedSeconds(Math.max(0, Math.floor((Date.now() - startedAt) / 1000)));
        };

        updateElapsed();
        const timer = setInterval(updateElapsed, 1000);
        return () => clearInterval(timer);
    }, [detail]);

    if (loading) {
        return (
            <div className="flex items-center justify-center py-20">
                <Loader2 className="w-8 h-8 text-primary animate-spin" />
            </div>
        );
    }

    if (error || !detail) {
        return (
            <div className="h-full overflow-y-auto">
                <div className="max-w-2xl mx-auto py-12 px-4 text-center">
                    <XCircle className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                    <p className="text-muted-foreground mb-4">{error || '报告不存在'}</p>
                    <Link to={backPath}>
                        <Button variant="outline">
                            <ArrowLeft className="w-4 h-4 mr-1" />
                            返回列表
                        </Button>
                    </Link>
                </div>
            </div>
        );
    }

    // Completed with valid data → render report
    if (detail.status === 'completed' && reportData) {
        return (
            <div className="-mx-6 -my-4 h-[calc(100%+2rem)] overflow-y-auto">
                <div className="sticky top-0 z-10 h-16 bg-background border-b border-border px-6 flex items-center gap-3">
                    <Link to={backPath}>
                        <Button variant="ghost">
                            <ArrowLeft className="w-4 h-4 mr-1" />
                            返回列表
                        </Button>
                    </Link>
                    <Badge variant="outline" className={STATUS_COLORS.completed}>
                        <CheckCircle2 className="w-3 h-3 mr-1" />
                        已完成
                    </Badge>
                    {detail.deleted && (
                        <Badge variant="destructive" className="text-xs">已删除</Badge>
                    )}
                    <div className="flex-1" />
                    <Button
                        variant="ghost"
                        size="icon"
                        className="text-muted-foreground hover:text-destructive"
                        onClick={() => setShowDeleteDialog(true)}
                    >
                        <Trash2 className="w-4 h-4" />
                    </Button>
                </div>
                <ComplianceReport data={reportData} />
                <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>确认删除</AlertDialogTitle>
                            <AlertDialogDescription>
                                确定要删除「{detail.company_name}」的合规报告吗？此操作不可撤销。
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

    // Completed but invalid result_text
    if (detail.status === 'completed' && parseError) {
        return (
            <div className="h-full overflow-y-auto">
                <div className="max-w-2xl mx-auto py-12 px-4">
                    <div className="flex items-center justify-between mb-6">
                        <Link to={backPath}>
                            <Button variant="ghost" size="sm">
                                <ArrowLeft className="w-4 h-4 mr-1" />
                                返回列表
                            </Button>
                        </Link>
                    </div>
                    <ReportMetaCard detail={detail} />
                    <Card className="border-destructive/50 mt-4">
                        <CardContent className="p-6 text-center">
                            <AlertTriangle className="w-10 h-10 mx-auto mb-3 text-destructive" />
                            <p className="text-sm text-destructive font-medium mb-1">报告格式异常</p>
                            <p className="text-xs text-muted-foreground">
                                请联系管理员或稍后刷新
                            </p>
                            <Button variant="outline" size="sm" className="mt-4" onClick={fetchDetail}>
                                <RefreshCw className="w-3.5 h-3.5 mr-1" />
                                刷新
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </div>
        );
    }

    // Polling statuses or terminal non-completed
    const isPolling = POLLABLE_STATUSES.includes(detail.status);

    return (
        <div className="h-full overflow-y-auto">
            <div className="max-w-2xl mx-auto py-8 px-4">
                <div className="flex items-center justify-between mb-6">
                    <Link to={backPath}>
                        <Button variant="ghost" size="sm">
                            <ArrowLeft className="w-4 h-4 mr-1" />
                            返回列表
                        </Button>
                    </Link>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="text-muted-foreground hover:text-destructive"
                        onClick={() => setShowDeleteDialog(true)}
                    >
                        <Trash2 className="w-4 h-4" />
                    </Button>
                </div>

                {detail.deleted && (
                    <div className="mb-4">
                        <Badge variant="destructive">已删除</Badge>
                    </div>
                )}
                <ReportMetaCard detail={detail} />

                {/* Status display */}
                <Card className="mt-4">
                    <CardContent className="p-8 text-center">
                        {isPolling && (
                            <>
                                <Loader2 className="w-10 h-10 mx-auto mb-3 text-primary animate-spin" />
                                <p className="font-semibold text-foreground mb-1">
                                    {REPORT_STATUS_LABELS[detail.status]}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                    报告正在生成中，请稍候...
                                </p>
                                <p className="mt-2 text-xs tabular-nums text-muted-foreground">
                                    已用时 {formatElapsed(elapsedSeconds)}
                                </p>
                            </>
                        )}
                        {detail.status === 'failed' && (
                            <>
                                <XCircle className="w-10 h-10 mx-auto mb-3 text-destructive" />
                                <p className="font-semibold text-foreground mb-1">报告生成失败</p>
                                <p className="text-xs text-muted-foreground mb-4">
                                    请稍后重试或联系管理员
                                </p>
                                <Button variant="outline" size="sm" onClick={fetchDetail}>
                                    <RefreshCw className="w-3.5 h-3.5 mr-1" />
                                    刷新
                                </Button>
                            </>
                        )}
                        {detail.status === 'cancelled' && (
                            <>
                                <Clock className="w-10 h-10 mx-auto mb-3 text-muted-foreground" />
                                <p className="font-semibold text-foreground mb-1">报告生成已取消</p>
                                <p className="text-xs text-muted-foreground">该任务已被取消</p>
                            </>
                        )}
                    </CardContent>
                </Card>

                <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>确认删除</AlertDialogTitle>
                            <AlertDialogDescription>
                                确定要删除「{detail.company_name}」的合规报告吗？此操作不可撤销。
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
        </div>
    );
}

/** Shared metadata card for non-completed/parse-error views */
function ReportMetaCard({ detail }: { detail: ComplianceReportDetail }) {
    return (
        <Card>
            <CardHeader className="pb-3">
                <CardTitle className="text-lg">{detail.company_name}</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-y-2 text-sm">
                <div>
                    <span className="text-muted-foreground">行业：</span>
                    <span>{detail.industry}</span>
                </div>
                <div>
                    <span className="text-muted-foreground">目的国：</span>
                    <span>{detail.country}</span>
                </div>
                <div>
                    <span className="text-muted-foreground">企业规模：</span>
                    <span>{detail.company_size}</span>
                </div>
                <div>
                    <span className="text-muted-foreground">业务模式：</span>
                    <span>{detail.business_model}</span>
                </div>
                <div>
                    <span className="text-muted-foreground">预算：</span>
                    <span>{detail.budget_range}</span>
                </div>
                <div>
                    <span className="text-muted-foreground">附件：</span>
                    <span>{detail.doc_count} 个</span>
                </div>
                <div className="col-span-2">
                    <span className="text-muted-foreground">创建时间：</span>
                    <span>{new Date(detail.created_at).toLocaleString('zh-CN')}</span>
                </div>
                <div className="col-span-2">
                    <span className="text-muted-foreground">状态：</span>
                    <Badge variant="outline" className={STATUS_COLORS[detail.status]}>
                        {REPORT_STATUS_LABELS[detail.status]}
                    </Badge>
                </div>
                {detail.query && (
                    <div className="col-span-2">
                        <span className="text-muted-foreground block mb-1">用户需求：</span>
                        <div className="text-sm bg-muted/50 rounded-md p-3 leading-relaxed whitespace-pre-wrap text-muted-foreground">
                            {detail.query}
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
