import {useState} from 'react';
import {AlertTriangle, CheckCircle, Stethoscope} from 'lucide-react';
import PageMeta from '@/components/common/PageMeta';
import {Button} from '@/components/ui/button';
import {Card, CardContent} from '@/components/ui/card';
import {Input} from '@/components/ui/input';
import {Label} from '@/components/ui/label';
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from '@/components/ui/select';
import {Textarea} from '@/components/ui/textarea';

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
    {id: 1, title: '南非海关管理法（修订版）', country: '南非', scene: 'customs', penalty: '货物扣押 + 罚款20-50%货值', summary: '制造业进口原材料需提前30天备案，未备案货物将被扣押并处以货值20-50%的罚款。'},
    {id: 2, title: '南非劳工法典（2023年修订）', country: '南非', scene: 'labor', penalty: '每项违规最高罚款100万南非兰特', summary: '外籍员工与本地员工比例需符合要求，加班工资为正常工资的1.5倍。'},
    {id: 3, title: '刚果（金）矿业法及制造业配套法规', country: '刚果（金）', scene: 'env', penalty: '项目暂停 + 环境修复费用', summary: '制造业项目须通过环境影响评估（EIA），未取得环评批复不得开工。'},
    {id: 4, title: '刚果（金）增值税法实施细则', country: '刚果（金）', scene: 'tax', penalty: '滞纳金每日0.5%，最高不超过本金', summary: '标准增值税率16%，出口适用零税率，制造业进口设备可退税。'},
    {id: 5, title: '尼日利亚海关管理法（修订版）', country: '尼日利亚', scene: 'customs', penalty: '货物扣押 + 罚款20-50%货值', summary: '制造业进口原材料需提前30天备案，未备案货物将被扣押。'},
    {id: 6, title: '尼日利亚数据保护法（NDPR）', country: '尼日利亚', scene: 'data', penalty: '最高罚款年营业额2%或1000万奈拉', summary: '处理个人数据的企业须注册数据保护官，数据跨境传输须通过合规评估。'},
    {id: 7, title: '安哥拉制造业投资法', country: '安哥拉', scene: 'customs', penalty: '投资许可撤销 + 资产冻结', summary: '制造业外资投资须取得私人投资局（ANIP）许可，进口设备享受关税减免。'},
    {id: 8, title: '安哥拉劳动法（2022年修订）', country: '安哥拉', scene: 'labor', penalty: '每项违规最高罚款500万宽扎', summary: '本地员工比例须达70%以上，外籍员工须申请工作许可。'},
    {id: 9, title: '埃及增值税法实施细则', country: '埃及', scene: 'tax', penalty: '滞纳金每日0.5%，最高不超过本金', summary: '标准增值税率14%，苏伊士运河经济区制造业享税收优惠。'},
    {id: 10, title: '埃及环境保护法', country: '埃及', scene: 'env', penalty: '项目暂停 + 环境修复费用', summary: '制造业项目须通过环境影响评估（EIA），工业废水须达到排放标准。'},
    {id: 11, title: '加纳海关关税法', country: '加纳', scene: 'customs', penalty: '货物扣押 + 罚款25-50%货值', summary: '制造业进口原材料须在海关提前申报，自由贸易区企业享受关税豁免。'},
    {id: 12, title: '加纳劳动法（2023年修订）', country: '加纳', scene: 'labor', penalty: '每项违规最高罚款10万塞地', summary: '制造业须遵守每日8小时工作制，加班须支付1.5倍工资。'},
];

const initialFormData = {
    companyName: '',
    industry: '',
    country: '',
    size: '',
    scenes: [] as string[],
    requirements: '',
    budget: '',
};

export default function ComplianceDiagnosisPage() {
    const [formData, setFormData] = useState(initialFormData);
    const [diagnoseResult, setDiagnoseResult] = useState<typeof demoLaws | null>(null);

    const handleSceneToggle = (sceneId: string) => {
        setFormData((previous) => ({
            ...previous,
            scenes: previous.scenes.includes(sceneId)
                ? previous.scenes.filter((scene) => scene !== sceneId)
                : [...previous.scenes, sceneId],
        }));
    };

    const handleDiagnose = () => {
        const results = demoLaws.filter((law) => (
            law.country === formData.country && formData.scenes.includes(law.scene)
        ));
        setDiagnoseResult(results);
    };

    const resetDiagnosis = () => {
        setFormData(initialFormData);
        setDiagnoseResult(null);
    };

    return (
        <div className="bg-primary/[0.03] px-4 py-10 md:py-16">
            <PageMeta title="合规初诊工具｜律航出海" description="填写企业出海信息，快速获取目的国相关法规与合规风险提示。"/>
            <div className="mx-auto max-w-2xl">
                <div className="mb-8 text-center">
                    <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                        <Stethoscope className="h-6 w-6 text-primary"/>
                    </div>
                    <h1 className="text-3xl font-bold text-foreground md:text-4xl">合规初诊工具</h1>
                    <p className="mt-3 text-muted-foreground">填写企业基本信息，快速匹配目的国法规要点与风险提示。</p>
                </div>

                <Card className="shadow-card">
                    <CardContent className="p-6 md:p-8">
                        {diagnoseResult === null ? (
                            <div className="space-y-5">
                                <div>
                                    <Label className="mb-2 block text-sm font-medium" htmlFor="company-name">企业名称</Label>
                                    <Input id="company-name" value={formData.companyName} onChange={(event) => setFormData((previous) => ({...previous, companyName: event.target.value}))} placeholder="请输入企业名称"/>
                                </div>
                                <div>
                                    <Label className="mb-2 block text-sm font-medium" htmlFor="industry">所属行业</Label>
                                    <Input id="industry" value={formData.industry} onChange={(event) => setFormData((previous) => ({...previous, industry: event.target.value}))} placeholder="如：数字基础设施、纺织制造、光伏"/>
                                </div>
                                <div>
                                    <Label className="mb-2 block text-sm font-medium">目的国</Label>
                                    <Select value={formData.country} onValueChange={(country) => setFormData((previous) => ({...previous, country}))}>
                                        <SelectTrigger className="w-full"><SelectValue placeholder="选择目的国"/></SelectTrigger>
                                        <SelectContent>{countryList.map((country) => <SelectItem key={country} value={country}>{country}</SelectItem>)}</SelectContent>
                                    </Select>
                                </div>
                                <div>
                                    <Label className="mb-2 block text-sm font-medium">企业规模</Label>
                                    <Select value={formData.size} onValueChange={(size) => setFormData((previous) => ({...previous, size}))}>
                                        <SelectTrigger className="w-full"><SelectValue placeholder="选择企业规模"/></SelectTrigger>
                                        <SelectContent>{companySizes.map((size) => <SelectItem key={size} value={size}>{size}</SelectItem>)}</SelectContent>
                                    </Select>
                                </div>
                                <div>
                                    <Label className="mb-2 block text-sm font-medium">业务场景（可多选）</Label>
                                    <div className="flex flex-wrap gap-2">
                                        {scenes.map((scene) => (
                                            <Button key={scene.id} type="button" variant={formData.scenes.includes(scene.id) ? 'default' : 'outline'} size="sm" onClick={() => handleSceneToggle(scene.id)}>
                                                {scene.label}
                                            </Button>
                                        ))}
                                    </div>
                                </div>
                                <div>
                                    <Label className="mb-2 block text-sm font-medium">预算区间</Label>
                                    <Select value={formData.budget} onValueChange={(budget) => setFormData((previous) => ({...previous, budget}))}>
                                        <SelectTrigger className="w-full"><SelectValue placeholder="选择预算区间"/></SelectTrigger>
                                        <SelectContent>{budgetRanges.map((budget) => <SelectItem key={budget} value={budget}>{budget}</SelectItem>)}</SelectContent>
                                    </Select>
                                </div>
                                <div>
                                    <Label className="mb-2 block text-sm font-medium" htmlFor="requirements">需求描述</Label>
                                    <Textarea
                                        id="requirements"
                                        value={formData.requirements}
                                        onChange={(event) => setFormData((previous) => ({...previous, requirements: event.target.value}))}
                                        placeholder="请简要描述企业当前的出海计划、重点关注事项或需要解决的合规问题"
                                        className="min-h-28 resize-y"
                                    />
                                </div>
                                <Button className="h-11 w-full" onClick={handleDiagnose} disabled={!formData.country || formData.scenes.length === 0}>
                                    <Stethoscope className="mr-2 h-4 w-4"/>生成合规初诊报告
                                </Button>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                <div className="flex items-center gap-2 rounded-lg bg-primary/5 p-3">
                                    <CheckCircle className="h-5 w-5 shrink-0 text-primary"/>
                                    <p className="text-sm">已为 <span className="font-semibold">{formData.country}</span> 匹配到 <span className="font-semibold">{diagnoseResult.length}</span> 条相关法规</p>
                                </div>
                                {diagnoseResult.length === 0 && <p className="py-8 text-center text-sm text-muted-foreground">当前条件下暂无匹配法规，请调整业务场景后重试。</p>}
                                {diagnoseResult.map((law) => (
                                    <Card key={law.id} className="border-l-4 border-l-primary">
                                        <CardContent className="p-4">
                                            <h2 className="mb-1 text-sm font-semibold">{law.title}</h2>
                                            <p className="mb-2 text-xs text-muted-foreground">{law.summary}</p>
                                            <div className="flex items-center gap-1 text-xs text-muted-foreground"><AlertTriangle className="h-3.5 w-3.5"/><span>处罚：{law.penalty}</span></div>
                                        </CardContent>
                                    </Card>
                                ))}
                                <Button variant="outline" className="w-full" onClick={resetDiagnosis}>重新初诊</Button>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
