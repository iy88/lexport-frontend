import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';
import ReportList from '@/components/report/ReportList';
import { deleteAdminComplianceReport, listAdminComplianceReports, type ComplianceReportSummary } from '@/lib/compliance-reports';
import {usePageSize} from '@/hooks/use-page-size';

export default function AdminReportsPage() {
    const {size, ready} = usePageSize({
        containerSelector: '[data-report-list-viewport]',
        rowSelector: '[data-report-card]',
        rowHeight: 116,
        rowGap: 12,
        safetyMargin: 24,
        headerHeight: 0,
        paginationHeight: 0,
        min: 1,
        max: 12,
    });
    const [reports, setReports] = useState<ComplianceReportSummary[]>([]);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(1);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetch = useCallback(async (p: number) => {
        setLoading(true);
        setError(null);
        try {
            const data = await listAdminComplianceReports(p, size);
            const lastPage = Math.max(1, Math.ceil(data.meta.total / size));
            if (p > lastPage) {
                setPage(lastPage);
                return;
            }
            setReports(data.reports);
            setTotal(data.meta.total);
            setPage(data.meta.page);
        } catch {
            setError('加载报告列表失败，请稍后重试');
        } finally {
            setLoading(false);
        }
    }, [size]);

    useEffect(() => {
        if (ready) fetch(page);
    }, [page, fetch, ready]);

    const handleRetry = useCallback(() => {
        fetch(page);
    }, [fetch, page]);

    const handlePageChange = (p: number) => {
        if (p !== page) setPage(p);
        else fetch(p);
    };

    const handleDelete = useCallback(async (id: number) => {
        try {
            await deleteAdminComplianceReport(id);
            toast.success('报告已删除');
            setReports((prev) =>
                prev.map((r) => (r.id === id ? { ...r, deleted: true } : r)),
            );
        } catch {
            toast.error('删除失败，请稍后重试');
        }
    }, []);

    return (
        <ReportList
            reports={reports}
            total={total}
            page={page}
            perPage={size}
            loading={loading}
            error={error}
            detailBasePath="/admin/reports"
            title="全部合规报告"
            showNewCta={false}
            onPageChange={handlePageChange}
            onRetry={handleRetry}
            onDelete={handleDelete}
        />
    );
}
