import ComplianceReport from '@/components/report/ComplianceReport';
import reportData from '../../data/report-demo.json';

export default function ReportPage() {
    return <ComplianceReport data={reportData}/>;
}
