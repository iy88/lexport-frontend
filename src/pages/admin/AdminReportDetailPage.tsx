import { useSelector } from 'react-redux';
import { Navigate } from 'react-router-dom';
import type { RootState } from '@/store';
import ReportDetailContainer from '@/components/report/ReportDetailContainer';

export default function AdminReportDetailPage() {
    const role = useSelector((s: RootState) => s.auth.user?.role);

    // Only admin can access; editor redirects to user reports
    if (role !== 'admin') {
        return <Navigate to="/user/reports" replace />;
    }

    return <ReportDetailContainer backPath="/admin/reports" admin />;
}
