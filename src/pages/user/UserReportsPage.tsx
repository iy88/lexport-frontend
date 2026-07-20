import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';
import ReportList from '@/components/report/ReportList';
import { deleteComplianceReport, listComplianceReports, type ComplianceReportSummary } from '@/lib/compliance-reports';

const PER_PAGE = 20;

export default function UserReportsPage() {
    const [reports, setReports] = useState<ComplianceReportSummary[]>([]);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(1);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetch = useCallback(async (p: number) => {
        setLoading(true);
        setError(null);
        try {
            const data = await listComplianceReports(p, PER_PAGE);
            setReports(data.reports);
            setTotal(data.meta.total);
            setPage(data.meta.page);
        } catch {
            setError('加载报告列表失败，请稍后重试');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetch(page);
    }, [page, fetch]);

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
        } catch {
            toast.error('删除失败，请稍后重试');
        }
    }, []);

    return (
        <ReportList
            reports={reports}
            total={total}
            page={page}
            perPage={PER_PAGE}
            loading={loading}
            error={error}
            detailBasePath="/user/reports"
            title="我的合规报告"
            showNewCta
            newCtaPath="/diagnosis"
            onPageChange={handlePageChange}
            onRetry={handleRetry}
            onDelete={handleDelete}
        />
    );
}
