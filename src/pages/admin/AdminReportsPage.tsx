import { useCallback, useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Navigate } from 'react-router-dom';
import { toast } from 'sonner';
import ReportList from '@/components/report/ReportList';
import { deleteAdminComplianceReport, listAdminComplianceReports, type ComplianceReportSummary } from '@/lib/compliance-reports';
import type { RootState } from '@/store';

const PER_PAGE = 20;

export default function AdminReportsPage() {
    const role = useSelector((s: RootState) => s.auth.user?.role);
    const [reports, setReports] = useState<ComplianceReportSummary[]>([]);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(1);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetch = useCallback(async (p: number) => {
        setLoading(true);
        setError(null);
        try {
            const data = await listAdminComplianceReports(p, PER_PAGE);
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
        if (role === 'admin') {
            fetch(page);
        }
    }, [page, fetch, role]);

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

    if (role !== 'admin') {
        return <Navigate to="/user/reports" replace />;
    }

    return (
        <ReportList
            reports={reports}
            total={total}
            page={page}
            perPage={PER_PAGE}
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
