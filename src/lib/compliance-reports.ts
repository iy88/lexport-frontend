import { z } from 'zod';
import api from '@/lib/api';

// --- Zod schema for report JSON validation (matches ComplianceReportData) ---

const reportFieldSchema = z.object({
    icon: z.string(),
    label: z.string(),
    value: z.string(),
});

const reportSectionSchema = z.object({
    title: z.string(),
    fields: z.array(reportFieldSchema),
});

const reportMetaSchema = z.object({
    title: z.string(),
    description: z.string(),
});

const headerSchema = z.object({
    title: z.string(),
    subtitle: z.string(),
});

const basicInfoSchema = z.object({
    title: z.string(),
    reportMeta: reportSectionSchema,
    companyBackground: reportSectionSchema,
});

const riskLevelSchema = z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']);

const overallRiskSchema = z.object({
    badge: z.string(),
    level: z.string(),
    levelKey: riskLevelSchema,
});

const topRisksSchema = z.object({
    title: z.string(),
    items: z.array(z.string()),
});

const complianceGapSchema = z.object({
    title: z.string(),
    summary: z.string(),
    priorityTitle: z.string(),
    actions: z.array(z.string()),
});

const aiDiagnosisSchema = z.object({
    title: z.string(),
    overallRisk: overallRiskSchema,
    topRisks: topRisksSchema,
    complianceGap: complianceGapSchema,
});

const riskItemSchema = z.object({
    level: riskLevelSchema,
    impact: z.string(),
    icon: z.string(),
    action: z.string(),
    title: z.string(),
    desc: z.string(),
});

const riskAnalysisSchema = z.object({
    title: z.string(),
    items: z.array(riskItemSchema),
});

const agencyItemSchema = z.object({
    business: z.string(),
    advantage: z.string(),
    name: z.string(),
});

const agencyMatchingSchema = z.object({
    title: z.string(),
    columns: z.array(z.string()),
    items: z.array(agencyItemSchema),
});

const checklistItemSchema = z.object({
    date: z.string(),
    owner: z.string(),
    warn: z.string(),
    task: z.string(),
    material: z.string(),
});

const executionChecklistSchema = z.object({
    title: z.string(),
    items: z.array(checklistItemSchema),
});

const dataSourcesSchema = z.object({
    title: z.string(),
    text: z.string(),
});

const lawReferencesSchema = z.object({
    title: z.string(),
    items: z.array(z.string()),
});

const disclaimerSchema = z.object({
    title: z.string(),
    items: z.array(z.string()),
});

const appendixSchema = z.object({
    title: z.string(),
    copyright: z.string(),
    dataSources: dataSourcesSchema,
    lawReferences: lawReferencesSchema,
    disclaimer: disclaimerSchema,
});

export const complianceReportDataSchema = z.object({
    meta: reportMetaSchema,
    header: headerSchema,
    basicInfo: basicInfoSchema,
    aiDiagnosis: aiDiagnosisSchema,
    riskAnalysis: riskAnalysisSchema,
    agencyMatching: agencyMatchingSchema,
    executionChecklist: executionChecklistSchema,
    appendix: appendixSchema,
});

export type ComplianceReportData = z.infer<typeof complianceReportDataSchema>;

// --- API types ---

export type ReportStatus = 'queued' | 'in_progress' | 'completed' | 'failed' | 'cancelled';

export const REPORT_STATUS_LABELS: Record<ReportStatus, string> = {
    queued: '排队中',
    in_progress: '生成中',
    completed: '已完成',
    failed: '生成失败',
    cancelled: '已取消',
};

export interface ComplianceReportSummary {
    id: number;
    company_name: string;
    industry: string;
    country: string;
    company_size: string;
    budget_range: string;
    business_model: string;
    doc_count: number;
    status: ReportStatus;
    deleted?: boolean;
    created_at: string;
}

export interface ComplianceReportDetail extends ComplianceReportSummary {
    result_text: string | null;
    query?: string;
}

export interface ComplianceReportListMeta {
    page: number;
    per_page: number;
    total: number;
}

export interface ComplianceReportListResponse {
    reports: ComplianceReportSummary[];
    meta: ComplianceReportListMeta;
}

export interface CreateReportResponse {
    id: number;
    task_id: string;
    status: ReportStatus;
    company_name: string;
    industry: string;
    country: string;
    company_size: string;
    budget_range: string;
    business_model: string;
    doc_count: number;
    created_at: string;
}

// --- API methods ---

/** Create a compliance report (multipart/form-data). Returns the created report info. */
export async function createComplianceReport(formData: FormData): Promise<CreateReportResponse> {
    const { data } = await api.post('/compliance-reports', formData);
    return data.data;
}

/** List compliance reports with pagination. */
export async function listComplianceReports(
    page: number = 1,
    perPage: number = 20,
): Promise<ComplianceReportListResponse> {
    const { data } = await api.get('/compliance-reports', { params: { page, per_page: perPage } });
    return data.data;
}

/** Get a single compliance report by ID. */
export async function getComplianceReport(id: number): Promise<ComplianceReportDetail> {
    const { data } = await api.get(`/compliance-reports/${id}`);
    return data.data;
}

/** Soft-delete a compliance report by ID. */
export async function deleteComplianceReport(id: number): Promise<ComplianceReportSummary> {
    const { data } = await api.delete(`/compliance-reports/${id}`);
    return data.data;
}

// --- Admin API methods (require admin role, handled server-side) ---

/** Admin: list all compliance reports (including deleted). */
export async function listAdminComplianceReports(
    page: number = 1,
    perPage: number = 20,
): Promise<ComplianceReportListResponse> {
    const { data } = await api.get('/admin/compliance-reports', { params: { page, per_page: perPage } });
    return data.data;
}

/** Admin: get any compliance report detail by ID. */
export async function getAdminComplianceReport(id: number): Promise<ComplianceReportDetail> {
    const { data } = await api.get(`/admin/compliance-reports/${id}`);
    return data.data;
}

/** Admin: soft-delete any compliance report by ID. */
export async function deleteAdminComplianceReport(id: number): Promise<ComplianceReportSummary> {
    const { data } = await api.delete(`/admin/compliance-reports/${id}`);
    return data.data;
}

/** Parse and validate the result_text JSON from a completed report. */
export function parseReportResult(resultText: string | null): ComplianceReportData | null {
    if (!resultText || !resultText.trim()) return null;

    let parsed: unknown;
    try {
        parsed = JSON.parse(resultText.trim());
    } catch {
        return null;
    }

    const result = complianceReportDataSchema.safeParse(parsed);
    if (!result.success) return null;

    return result.data;
}
