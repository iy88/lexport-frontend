import {ArrowRight, FileText, Stethoscope} from 'lucide-react';
import {Link} from 'react-router-dom';
import {Button} from '@/components/ui/button';
import {Card, CardContent, CardHeader, CardTitle} from '@/components/ui/card';

const features = [
    {
        title: '多维度风险分析',
        desc: '覆盖准入合规、税务、外汇、数据安全、劳工、环保六大维度，逐项拆解风险等级与应对建议。',
    },
    {
        title: 'AI 智能机构匹配',
        desc: '根据目的国与行业自动匹配律所、会计师事务所、人力资源机构，附推荐理由与联系方式。',
    },
    {
        title: '落地执行清单',
        desc: '按时间节点输出任务清单，明确责任人、所需材料与预警提醒，直接可交付执行。',
    },
];

const ReportSection = () => (
    <section id="report-section" className="scroll-mt-20 py-16 md:py-24">
        <div className="mx-auto max-w-7xl px-4 md:px-6">
            <div className="mb-12 text-center md:mb-16">
                <h2 className="mb-4 text-balance text-2xl font-bold text-foreground md:text-4xl">
                    合规报告与初诊工具
                </h2>
                <p className="mx-auto max-w-2xl text-pretty text-muted-foreground">
                    基于 AI 大模型深度分析及全球实时法务数据库，自动生成非洲市场准入与经营合规评估报告。
                </p>
            </div>

            <div className="mb-12 grid grid-cols-1 gap-6 md:grid-cols-3">
                {features.map((feature) => (
                    <Card key={feature.title} className="border-none shadow-card">
                        <CardContent className="p-6 text-center">
                            <div className="mx-auto mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                                <FileText className="h-5 w-5 text-primary"/>
                            </div>
                            <h3 className="mb-2 font-semibold text-foreground">{feature.title}</h3>
                            <p className="text-pretty text-sm text-muted-foreground">{feature.desc}</p>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <div className="mx-auto grid max-w-4xl grid-cols-1 gap-6 md:grid-cols-2">
                <Card className="flex flex-col shadow-card">
                    <CardHeader className="pb-2">
                        <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                            <FileText className="h-5 w-5 text-primary"/>
                        </div>
                        <CardTitle className="text-lg">查看报告示例</CardTitle>
                    </CardHeader>
                    <CardContent className="flex-1">
                        <p className="mb-4 text-pretty text-sm text-muted-foreground">
                            查看一份完整的非洲制造业出海合规报告示例，了解报告结构、分析维度和机构匹配结果。
                        </p>
                        <a href="/report" target="_blank" rel="noopener noreferrer">
                            <Button className="w-full">查看合规报告示例<ArrowRight className="ml-2 h-4 w-4"/></Button>
                        </a>
                    </CardContent>
                </Card>

                <Card className="flex flex-col shadow-card">
                    <CardHeader className="pb-2">
                        <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                            <Stethoscope className="h-5 w-5 text-primary"/>
                        </div>
                        <CardTitle className="text-lg">合规初诊工具</CardTitle>
                    </CardHeader>
                    <CardContent className="flex-1">
                        <p className="mb-4 text-pretty text-sm text-muted-foreground">
                            输入目的国、企业规模、业务场景、预算区间，系统自动匹配法规要点，生成定制化合规初诊报告。
                        </p>
                        <Button asChild className="w-full">
                            <Link to="/diagnosis"><Stethoscope className="mr-2 h-4 w-4"/>立即体验合规初诊</Link>
                        </Button>
                    </CardContent>
                </Card>
            </div>
        </div>
    </section>
);

export default ReportSection;
