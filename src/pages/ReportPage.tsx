import ComplianceReport from '@/components/report/ComplianceReport';
import reportData from '../../docs/report.json';

export default function ReportPage() {
    return <ComplianceReport data={reportData}/>;
}
