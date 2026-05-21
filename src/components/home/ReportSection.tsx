import React, {useState} from 'react';
import {AlertTriangle, ArrowRight, CheckCircle, FileText, Stethoscope} from 'lucide-react';
import {Button} from '@/components/ui/button';
import {Card, CardContent, CardHeader, CardTitle} from '@/components/ui/card';
import {Dialog, DialogContent, DialogHeader, DialogTitle} from '@/components/ui/dialog';
import {Label} from '@/components/ui/label';
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue,} from '@/components/ui/select';

const scenes = [
    {id: 'customs', label: '海关进出口'},
    {id: 'labor', label: '劳工雇佣'},
    {id: 'data', label: '数据安全'},
    {id: 'env', label: '环保合规'},
    {id: 'tax', label: '税务'},
    {id: 'cert', label: '产品认证'},
    {id: 'ip', label: '知识产权'},
];

const countryList = ['南非', '刚果（金）', '尼日利亚', '安哥拉', '埃及', '加纳'];
const companySizes = ['微型企业（<10人）', '小型企业（10-50人）', '中型企业（50-200人）', '大型企业（>200人）'];
const budgetRanges = ['< 10万元', '10-50万元', '50-200万元', '> 200万元'];

const demoLaws = [
    {
        id: 1,
        title: '南非海关管理法（修订版）',
        country: '南非',
        scene: 'customs',
        penalty: '货物扣押 + 罚款20-50%货值',
        summary: '制造业进口原材料需提前30天备案，未备案货物将被扣押并处以货值20-50%的罚款。'
    },
    {
        id: 2,
        title: '南非劳工法典（2023年修订）',
        country: '南非',
        scene: 'labor',
        penalty: '每项违规最高罚款100万南非兰特',
        summary: '外籍员工与本地员工比例需符合要求，加班工资为正常工资的1.5倍。'
    },
    {
        id: 3,
        title: '刚果（金）矿业法及制造业配套法规',
        country: '刚果（金）',
        scene: 'env',
        penalty: '项目暂停 + 环境修复费用',
        summary: '制造业项目须通过环境影响评估（EIA），未取得环评批复不得开工。'
    },
    {
        id: 4,
        title: '刚果（金）增值税法实施细则',
        country: '刚果（金）',
        scene: 'tax',
        penalty: '滞纳金每日0.5%，最高不超过本金',
        summary: '标准增值税率16%，出口适用零税率，制造业进口设备可退税。'
    },
    {
        id: 5,
        title: '尼日利亚海关管理法（修订版）',
        country: '尼日利亚',
        scene: 'customs',
        penalty: '货物扣押 + 罚款20-50%货值',
        summary: '制造业进口原材料需提前30天备案，未备案货物将被扣押。'
    },
    {
        id: 6,
        title: '尼日利亚数据保护法（NDPR）',
        country: '尼日利亚',
        scene: 'data',
        penalty: '最高罚款年营业额2%或1000万奈拉',
        summary: '处理个人数据的企业须注册数据保护官，数据跨境传输须通过合规评估。'
    },
    {
        id: 7,
        title: '安哥拉制造业投资法',
        country: '安哥拉',
        scene: 'customs',
        penalty: '投资许可撤销 + 资产冻结',
        summary: '制造业外资投资须取得私人投资局（ANIP）许可，进口设备享受关税减免。'
    },
    {
        id: 8,
        title: '安哥拉劳动法（2022年修订）',
        country: '安哥拉',
        scene: 'labor',
        penalty: '每项违规最高罚款500万宽扎',
        summary: '本地员工比例须达70%以上，外籍员工须申请工作许可。'
    },
    {
        id: 9,
        title: '埃及增值税法实施细则',
        country: '埃及',
        scene: 'tax',
        penalty: '滞纳金每日0.5%，最高不超过本金',
        summary: '标准增值税率14%，苏伊士运河经济区制造业享税收优惠。'
    },
    {
        id: 10,
        title: '埃及环境保护法',
        country: '埃及',
        scene: 'env',
        penalty: '项目暂停 + 环境修复费用',
        summary: '制造业项目须通过环境影响评估（EIA），工业废水须达到排放标准。'
    },
    {
        id: 11,
        title: '加纳海关关税法',
        country: '加纳',
        scene: 'customs',
        penalty: '货物扣押 + 罚款25-50%货值',
        summary: '制造业进口原材料须在海关提前申报，自由贸易区企业享受关税豁免。'
    },
    {
        id: 12,
        title: '加纳劳动法（2023年修订）',
        country: '加纳',
        scene: 'labor',
        penalty: '每项违规最高罚款10万塞地',
        summary: '制造业须遵守每日8小时工作制，加班须支付1.5倍工资。'
    },
];

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

const ReportSection: React.FC = () => {
    const [diagnoseOpen, setDiagnoseOpen] = useState(false);
    const [diagnoseResult, setDiagnoseResult] = useState<typeof demoLaws>([]);
    const [formData, setFormData] = useState({
        country: '',
        size: '',
        scenes: [] as string[],
        budget: '',
    });

    const handleSceneToggle = (sceneId: string) => {
        setFormData((prev) => ({
            ...prev,
            scenes: prev.scenes.includes(sceneId)
                ? prev.scenes.filter((s) => s !== sceneId)
                : [...prev.scenes, sceneId],
        }));
    };

    const handleDiagnose = () => {
        let results = demoLaws;
        if (formData.country) results = results.filter((l) => l.country === formData.country);
        if (formData.scenes.length > 0) results = results.filter((l) => formData.scenes.includes(l.scene));
        setDiagnoseResult(results);
    };

    return (
        <section id="report-section" className="py-16 md:py-24 scroll-mt-20">
            <div className="max-w-7xl mx-auto px-4 md:px-6">
                <div className="text-center mb-12 md:mb-16">
                    <h2 className="text-2xl md:text-4xl font-bold text-foreground mb-4 text-balance">
                        合规报告与初诊工具
                    </h2>
                    <p className="text-muted-foreground max-w-2xl mx-auto text-pretty">
                        基于 AI 大模型深度分析及全球实时法务数据库，自动生成非洲市场准入与经营合规评估报告。
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                    {features.map((f, i) => (
                        <Card key={i} className="border-none shadow-card">
                            <CardContent className="p-6 text-center">
                                <div
                                    className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mx-auto mb-4">
                                    <FileText className="w-5 h-5 text-primary"/>
                                </div>
                                <h3 className="font-semibold text-foreground mb-2">{f.title}</h3>
                                <p className="text-sm text-muted-foreground text-pretty">{f.desc}</p>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
                    <Card className="shadow-card flex flex-col">
                        <CardHeader className="pb-2">
                            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-3">
                                <FileText className="w-5 h-5 text-primary"/>
                            </div>
                            <CardTitle className="text-lg">查看报告示例</CardTitle>
                        </CardHeader>
                        <CardContent className="flex-1">
                            <p className="text-sm text-muted-foreground mb-4 text-pretty">
                                查看一份完整的非洲制造业出海合规报告示例，了解报告结构、分析维度和机构匹配结果。
                            </p>
                            <a href="/report" target="_blank" rel="noopener noreferrer">
                                <Button className="w-full">
                                    查看合规报告示例
                                    <ArrowRight className="ml-2 w-4 h-4"/>
                                </Button>
                            </a>
                        </CardContent>
                    </Card>

                    <Card className="shadow-card flex flex-col">
                        <CardHeader className="pb-2">
                            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-3">
                                <Stethoscope className="w-5 h-5 text-primary"/>
                            </div>
                            <CardTitle className="text-lg">合规初诊工具</CardTitle>
                        </CardHeader>
                        <CardContent className="flex-1">
                            <p className="text-sm text-muted-foreground mb-4 text-pretty">
                                输入目的国、企业规模、业务场景、预算区间，系统自动匹配法规要点，生成定制化合规初诊报告。
                            </p>
                            <Button
                                className="w-full"
                                onClick={() => {
                                    setDiagnoseOpen(true);
                                    setDiagnoseResult([]);
                                    setFormData({country: '', size: '', scenes: [], budget: ''});
                                }}
                            >
                                <Stethoscope className="w-4 h-4 mr-2"/>
                                立即体验合规初诊
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </div>

            <Dialog open={diagnoseOpen} onOpenChange={setDiagnoseOpen}>
                <DialogContent className="max-w-[calc(100%-2rem)] md:max-w-lg max-h-[90dvh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="text-xl">合规初诊工具</DialogTitle>
                    </DialogHeader>

                    {diagnoseResult.length === 0 ? (
                        <div className="space-y-5 py-2">
                            <div>
                                <Label className="text-sm font-medium mb-2 block">目的国</Label>
                                <Select value={formData.country}
                                        onValueChange={(v) => setFormData((p) => ({...p, country: v}))}>
                                    <SelectTrigger className="w-full">
                                        <SelectValue placeholder="选择目的国"/>
                                    </SelectTrigger>
                                    <SelectContent>
                                        {countryList.map((c) => (<SelectItem key={c} value={c}>{c}</SelectItem>))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div>
                                <Label className="text-sm font-medium mb-2 block">企业规模</Label>
                                <Select value={formData.size}
                                        onValueChange={(v) => setFormData((p) => ({...p, size: v}))}>
                                    <SelectTrigger className="w-full">
                                        <SelectValue placeholder="选择企业规模"/>
                                    </SelectTrigger>
                                    <SelectContent>
                                        {companySizes.map((s) => (<SelectItem key={s} value={s}>{s}</SelectItem>))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div>
                                <Label className="text-sm font-medium mb-2 block">业务场景（可多选）</Label>
                                <div className="flex flex-wrap gap-2">
                                    {scenes.map((scene) => (
                                        <Button
                                            key={scene.id}
                                            type="button"
                                            variant={formData.scenes.includes(scene.id) ? 'default' : 'outline'}
                                            size="sm"
                                            onClick={() => handleSceneToggle(scene.id)}
                                        >
                                            {scene.label}
                                        </Button>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <Label className="text-sm font-medium mb-2 block">预算区间</Label>
                                <Select value={formData.budget}
                                        onValueChange={(v) => setFormData((p) => ({...p, budget: v}))}>
                                    <SelectTrigger className="w-full">
                                        <SelectValue placeholder="选择预算区间"/>
                                    </SelectTrigger>
                                    <SelectContent>
                                        {budgetRanges.map((b) => (<SelectItem key={b} value={b}>{b}</SelectItem>))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <Button
                                className="w-full h-11"
                                onClick={handleDiagnose}
                                disabled={!formData.country || formData.scenes.length === 0}
                            >
                                <Stethoscope className="w-4 h-4 mr-2"/>
                                生成合规初诊报告
                            </Button>
                        </div>
                    ) : (
                        <div className="space-y-4 py-2">
                            <div className="flex items-center gap-2 p-3 bg-primary/5 rounded-lg">
                                <CheckCircle className="w-5 h-5 text-primary shrink-0"/>
                                <p className="text-sm text-foreground">
                                    已为 <span className="font-semibold">{formData.country}</span> 匹配到{' '}
                                    <span className="font-semibold">{diagnoseResult.length}</span> 条相关法规
                                </p>
                            </div>

                            {diagnoseResult.map((law) => (
                                <Card key={law.id} className="border-l-4 border-l-primary">
                                    <CardContent className="p-4">
                                        <h4 className="font-semibold text-sm mb-1">{law.title}</h4>
                                        <p className="text-xs text-muted-foreground mb-2 text-pretty">{law.summary}</p>
                                        <div className="text-xs text-muted-foreground flex items-center gap-1">
                                            <AlertTriangle className="w-3.5 h-3.5"/>
                                            <span>处罚：{law.penalty}</span>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}

                            <Button
                                variant="outline"
                                className="w-full"
                                onClick={() => {
                                    setDiagnoseResult([]);
                                    setFormData({country: '', size: '', scenes: [], budget: ''});
                                }}
                            >
                                重新初诊
                            </Button>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </section>
    );
};

export default ReportSection;
