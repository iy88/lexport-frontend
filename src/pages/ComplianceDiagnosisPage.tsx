import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { AlertTriangle, ClipboardCheck, Loader2, RefreshCw, Stethoscope } from 'lucide-react';
import { toast } from 'sonner';
import PageMeta from '@/components/common/PageMeta';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import AttachmentSelector, { type AttachmentFile } from '@/components/report/AttachmentSelector';
import { createComplianceReport, getComplianceReport } from '@/lib/compliance-reports';
import type { RootState } from '@/store';

const initialFormData = {
    companyName: '',
    industry: '',
    country: '',
    size: '',
    businessModel: '',
    budget: '',
    requirements: '',
};

export default function ComplianceDiagnosisPage() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const user = useSelector((s: RootState) => s.auth.user);
    const [formData, setFormData] = useState(initialFormData);
    const [attachments, setAttachments] = useState<AttachmentFile[]>([]);
    const [submitting, setSubmitting] = useState(false);
    const [regenerating, setRegenerating] = useState(false);

    // Idempotency tracking
    const submissionRef = useRef<{ signature: string; key: string } | null>(null);

    const buildSignature = () => JSON.stringify({
        companyName: formData.companyName.trim(),
        industry: formData.industry.trim(),
        country: formData.country.trim(),
        size: formData.size.trim(),
        businessModel: formData.businessModel.trim(),
        budget: formData.budget.trim(),
        requirements: formData.requirements.trim(),
        attachments: attachments.map(({file}) => ({
            name: file.name,
            size: file.size,
            type: file.type,
            lastModified: file.lastModified,
        })),
    });

    const emailVerified = !!user?.email_verified;

    // Pre-fill form from existing report (regeneration)
    const regenerateId = searchParams.get('regenerate');
    useEffect(() => {
        if (!regenerateId) return;
        setRegenerating(true);
        getComplianceReport(Number(regenerateId))
            .then((detail) => {
                setFormData({
                    companyName: detail.company_name || '',
                    industry: detail.industry || '',
                    country: detail.country || '',
                    size: detail.company_size || '',
                    businessModel: detail.business_model || '',
                    budget: detail.budget_range || '',
                    requirements: detail.query || '',
                });
            })
            .catch(() => {
                toast.error('加载原报告信息失败');
            })
            .finally(() => setRegenerating(false));
    }, [regenerateId]);

    const handleDiagnose = async () => {
        // Trim all fields
        const companyName = formData.companyName.trim();
        const industry = formData.industry.trim();
        const country = formData.country.trim();
        const size = formData.size.trim();
        const businessModel = formData.businessModel.trim();
        const budget = formData.budget.trim();
        const requirements = formData.requirements.trim();

        // Validation
        if (!companyName) { toast.error('请输入企业名称'); return; }
        if (!industry) { toast.error('请输入所属行业'); return; }
        if (!country) { toast.error('请输入目的国'); return; }
        if (country.length > 30) { toast.error('目的国不超过 30 个字符'); return; }
        if (!size) { toast.error('请输入企业规模'); return; }
        if (size.length > 20) { toast.error('企业规模不超过 20 个字符'); return; }
        if (!businessModel) { toast.error('请输入业务模式/场景'); return; }
        if (businessModel.length > 20) { toast.error('业务模式/场景不超过 20 个字符'); return; }
        if (!budget) { toast.error('请输入预算区间'); return; }
        if (budget.length > 20) { toast.error('预算区间不超过 20 个字符'); return; }
        if (!requirements) { toast.error('请输入需求描述'); return; }

        // Check attachment errors
        const hasAttachmentError = attachments.some((a) => a.error);
        if (hasAttachmentError) { toast.error('请移除无效的附件后重试'); return; }

        // Email verification gate
        if (!emailVerified) {
            toast.error('请先验证邮箱后再创建合规报告');
            return;
        }

        setSubmitting(true);
        try {
            // Determine idempotency key
            const sig = buildSignature();
            const current = submissionRef.current;
            let key: string;
            if (current && current.signature === sig) {
                // Retry with same key
                key = current.key;
            } else {
                // New or changed submission
                key = crypto.randomUUID();
                submissionRef.current = { signature: sig, key };
            }

            const fd = new FormData();
            fd.append('query', requirements);
            fd.append('company_name', companyName);
            fd.append('industry', industry);
            fd.append('target_country', country);
            fd.append('company_size', size);
            fd.append('business_model', businessModel);
            fd.append('budget_range', budget);
            for (const a of attachments) {
                fd.append('documents', a.file);
            }

            const result = await createComplianceReport(fd, key);
            submissionRef.current = null; // Clear on success
            toast.success('报告任务已提交，正在生成');
            navigate(`/user/reports/${result.id}`, { replace: true });
        } catch (err: unknown) {
            if (err && typeof err === 'object' && 'response' in err) {
                const axiosErr = err as {
                    response?: {
                        status?: number;
                        data?: { error?: { code?: string; message?: string }; message?: string };
                    };
                };
                const status = axiosErr.response?.status;
                const code = axiosErr.response?.data?.error?.code;
                const msg =
                    axiosErr.response?.data?.error?.message ||
                    axiosErr.response?.data?.message ||
                    '提交失败';

                if (code === 'EMAIL_VERIFICATION_REQUIRED') {
                    toast.error(
                        <span>
                            请先验证邮箱后再创建合规报告。
                            <Link to="/user" className="underline ml-1">前往账户页</Link>
                        </span>
                    );
                } else if (code === 'IDEMPOTENCY_CONFLICT') {
                    submissionRef.current = null;
                    toast.error('提交内容已变化，请重新提交');
                } else if (code === 'RATE_LIMITED' || status === 429) {
                    toast.error('提交过于频繁，请稍后重试');
                } else if (status === 400) {
                    toast.error(`提交失败：${msg}`);
                } else if (status === 413) {
                    toast.error('上传文件总大小超过限制');
                } else if (status === 502) {
                    toast.error('服务暂时不可用，请稍后重试');
                } else {
                    toast.error(msg || '提交失败，请稍后重试');
                }
            } else {
                // Network error: keep identity for retry
                toast.error('网络错误，请检查连接后重试');
            }
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="bg-primary/[0.03] px-4 py-10 md:py-16">
            <PageMeta title="合规初诊工具｜律航出海" description="填写企业出海信息，快速获取目的国相关法规与合规风险提示。" />
            <div className="mx-auto max-w-2xl">
                <div className="mb-8 text-center">
                    <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                        <Stethoscope className="h-6 w-6 text-primary" />
                    </div>
                    <h1 className="text-3xl font-bold text-foreground md:text-4xl">
                        {regenerateId ? '重新生成合规报告' : '合规初诊工具'}
                    </h1>
                    <p className="mt-3 text-muted-foreground">
                        {regenerateId
                            ? '已复用原报告的企业信息，请修改后重新提交（附件需重新选择）。'
                            : '填写企业基本信息，快速匹配目的国法规要点与风险提示。'}
                    </p>
                </div>

                <Card className="shadow-card">
                    <CardContent className="p-6 md:p-8">
                        {!emailVerified && (
                            <div className="flex items-start gap-2 p-3 mb-4 bg-warning/10 border border-warning/20 rounded-md">
                                <AlertTriangle className="w-4 h-4 text-warning shrink-0 mt-0.5" />
                                <div className="text-sm">
                                    <p className="font-medium text-foreground">邮箱未验证</p>
                                    <p className="text-muted-foreground text-xs mt-0.5">
                                        创建合规报告需要验证邮箱。
                                        <Link to="/user" className="text-primary hover:underline ml-1">
                                            前往账户页验证
                                        </Link>
                                    </p>
                                </div>
                            </div>
                        )}
                        <div className="space-y-5">
                            <div>
                                <Label className="mb-2 block text-sm font-medium" htmlFor="company-name">
                                    企业名称 <span className="text-destructive">*</span>
                                </Label>
                                <Input
                                    id="company-name"
                                    value={formData.companyName}
                                    onChange={(e) => setFormData((p) => ({ ...p, companyName: e.target.value }))}
                                    placeholder="请输入企业名称"
                                    disabled={submitting}
                                />
                            </div>
                            <div>
                                <Label className="mb-2 block text-sm font-medium" htmlFor="industry">
                                    所属行业 <span className="text-destructive">*</span>
                                </Label>
                                <Input
                                    id="industry"
                                    value={formData.industry}
                                    onChange={(e) => setFormData((p) => ({ ...p, industry: e.target.value }))}
                                    placeholder="如：数字基础设施、纺织制造、光伏"
                                    disabled={submitting}
                                />
                            </div>
                            <div>
                                <Label className="mb-2 block text-sm font-medium" htmlFor="country">
                                    目的国 <span className="text-destructive">*</span>
                                </Label>
                                <Input
                                    id="country"
                                    value={formData.country}
                                    onChange={(e) => setFormData((p) => ({ ...p, country: e.target.value }))}
                                    placeholder="如：尼日利亚"
                                    disabled={submitting}
                                    maxLength={30}
                                />
                                <p className="text-[10px] text-muted-foreground mt-1">
                                    输入单个国家，不超过 30 个字符
                                </p>
                            </div>
                            <div>
                                <Label className="mb-2 block text-sm font-medium" htmlFor="company-size">
                                    企业规模 <span className="text-destructive">*</span>
                                </Label>
                                <Input
                                    id="company-size"
                                    value={formData.size}
                                    onChange={(e) => setFormData((p) => ({ ...p, size: e.target.value }))}
                                    placeholder="如：500-1000人，微型/小型/中型/大型企业"
                                    disabled={submitting}
                                    maxLength={20}
                                />
                            </div>
                            <div>
                                <Label className="mb-2 block text-sm font-medium" htmlFor="business-model">
                                    业务模式/场景 <span className="text-destructive">*</span>
                                </Label>
                                <Input
                                    id="business-model"
                                    value={formData.businessModel}
                                    onChange={(e) => setFormData((p) => ({ ...p, businessModel: e.target.value }))}
                                    placeholder="如：独资、合资、海关进出口"
                                    disabled={submitting}
                                    maxLength={20}
                                />
                            </div>
                            <div>
                                <Label className="mb-2 block text-sm font-medium" htmlFor="budget">
                                    预算区间 <span className="text-destructive">*</span>
                                </Label>
                                <Input
                                    id="budget"
                                    value={formData.budget}
                                    onChange={(e) => setFormData((p) => ({ ...p, budget: e.target.value }))}
                                    placeholder="如：50-200万元人民币"
                                    disabled={submitting}
                                    maxLength={20}
                                />
                            </div>
                            <div>
                                <Label className="mb-2 block text-sm font-medium" htmlFor="requirements">
                                    需求描述 <span className="text-destructive">*</span>
                                </Label>
                                <Textarea
                                    id="requirements"
                                    value={formData.requirements}
                                    onChange={(e) => setFormData((p) => ({ ...p, requirements: e.target.value }))}
                                    placeholder="请简要描述企业当前的出海计划、重点关注事项或需要解决的合规问题"
                                    className="min-h-28 resize-y"
                                    disabled={submitting}
                                />
                            </div>
                            <div>
                                <Label className="mb-2 block text-sm font-medium">
                                    附件（可选，最多 5 个，每个 ≤ 20MB）
                                </Label>
                                <AttachmentSelector
                                    files={attachments}
                                    onChange={setAttachments}
                                    disabled={submitting}
                                />
                            </div>
                            <Button
                                className="h-11 w-full"
                                onClick={handleDiagnose}
                                disabled={submitting || regenerating}
                            >
                                {regenerating ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        正在加载原报告信息...
                                    </>
                                ) : submitting ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        正在提交...
                                    </>
                                ) : (
                                    <>
                                        {regenerateId ? (
                                            <RefreshCw className="mr-2 h-4 w-4" />
                                        ) : (
                                            <Stethoscope className="mr-2 h-4 w-4" />
                                        )}
                                        {regenerateId ? '重新生成合规报告' : '生成合规初诊报告'}
                                    </>
                                )}
                            </Button>
                            <Button asChild variant="outline" className="h-11 w-full">
                                <Link to="/user/reports">
                                    <ClipboardCheck className="mr-2 h-4 w-4" />
                                    查看我的合规报告
                                </Link>
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
