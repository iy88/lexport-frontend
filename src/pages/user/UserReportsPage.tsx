import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';
import ReportList from '@/components/report/ReportList';
import { deleteComplianceReport, listComplianceReports, type ComplianceReportSummary } from '@/lib/compliance-reports';
import {usePageSize} from '@/hooks/use-page-size';

export default function UserReportsPage() {
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
            const data = await listComplianceReports(p, size);
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
            await deleteComplianceReport(id);
            toast.success('报告已删除');
            setReports((prev) => prev.filter((r) => r.id !== id));
            setTotal((prev) => Math.max(0, prev - 1));
            if (reports.length === 1 && page > 1) setPage((current) => current - 1);
        } catch {
            toast.error('删除失败，请稍后重试');
        }
    }, [page, reports.length]);

    return (
        <ReportList
            reports={reports}
            total={total}
            page={page}
            perPage={size}
            loading={loading}
            error={error}
            detailBasePath="/user/reports"
            title="我的合规报告"
            showNewCta
            newCtaPath="/diagnosis"
            showRegenerate
            onPageChange={handlePageChange}
            onRetry={handleRetry}
            onDelete={handleDelete}
        />
    );
}
