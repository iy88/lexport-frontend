import React from 'react';
import PageMeta from "@/components/common/PageMeta";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Separator } from "@/components/ui/separator";
import { ShieldAlert, Info, AlertTriangle, CheckCircle2, FileText, Building2, MapPin, Briefcase, Users, LayoutList, History, Cpu, Calendar, Gavel, Globe, Wallet, ShieldCheck, Database, Scale, Leaf } from "lucide-react";

const RISK_LEVELS = {
  LOW: { label: "低", color: "bg-green-500/10 text-green-600 border-green-200" },
  MEDIUM: { label: "中", color: "bg-yellow-500/10 text-yellow-600 border-yellow-200" },
  HIGH: { label: "高", color: "bg-orange-500/10 text-orange-600 border-orange-200" },
  CRITICAL: { label: "极高", color: "bg-red-500/10 text-red-600 border-red-200" },
} as const;

type RiskLevel = keyof typeof RISK_LEVELS;

interface AnalysisItem {
  title: string;
  icon: React.ElementType;
  level: RiskLevel;
  desc: string;
  impact: string;
  action: string;
}

export default function ReportPage() {
  return (
    <div className="min-h-screen bg-background text-foreground py-8 md:py-12 px-4">
      <PageMeta title="非洲企业出海合规报告" description="非洲企业出海合规报告最终成品展示" />

      <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-1000">
        {/* Header Section */}
        <div className="text-center md:text-left space-y-4">
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-primary">非洲企业出海合规报告</h1>
          <p className="text-muted-foreground max-w-2xl text-pretty">
            基于AI大模型深度分析及全球实时法务数据库生成的非洲市场准入与经营合规评估。
          </p>
        </div>

        {/* 1. 基础信息板块 */}
        <Card className="border-none shadow-sm overflow-hidden">
          <CardHeader className="bg-primary/5 border-b border-primary/10">
            <div className="flex items-center gap-2">
              <History className="w-5 h-5 text-primary" />
              <CardTitle className="text-xl">基础信息板块</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">报告元数据</h3>
                <div className="grid grid-cols-2 gap-y-3 text-sm">
                  <div className="text-muted-foreground flex items-center gap-2"><LayoutList className="w-4 h-4" /> 报告编号</div>
                  <div className="font-medium">AFR-2026-X892-01</div>
                  <div className="text-muted-foreground flex items-center gap-2"><Calendar className="w-4 h-4" /> 生成时间</div>
                  <div className="font-medium">2026-05-12 14:30:22</div>
                  <div className="text-muted-foreground flex items-center gap-2"><Cpu className="w-4 h-4" /> AI版本</div>
                  <div className="font-medium">Miaoda-Compliance v4.5</div>
                  <div className="text-muted-foreground flex items-center gap-2"><History className="w-4 h-4" /> 数据截止日期</div>
                  <div className="font-medium">2026-05-10</div>
                </div>
              </div>
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">企业背景</h3>
                <div className="grid grid-cols-2 gap-y-3 text-sm">
                  <div className="text-muted-foreground flex items-center gap-2"><Building2 className="w-4 h-4" /> 企业名称</div>
                  <div className="font-medium">中非科创出海科技有限公司</div>
                  <div className="text-muted-foreground flex items-center gap-2"><Briefcase className="w-4 h-4" /> 所属行业</div>
                  <div className="font-medium">数字基础设施与金融科技</div>
                  <div className="text-muted-foreground flex items-center gap-2"><Users className="w-4 h-4" /> 企业规模</div>
                  <div className="font-medium">500-1000人</div>
                  <div className="text-muted-foreground flex items-center gap-2"><MapPin className="w-4 h-4" /> 出海目的国</div>
                  <div className="font-medium">尼日利亚、肯尼亚</div>
                  <div className="text-muted-foreground flex items-center gap-2"><Globe className="w-4 h-4" /> 出海商业模式</div>
                  <div className="font-medium">当地直营 + 跨境电商服务</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 2. AI初诊结论板块 */}
        <Card className="border-none shadow-sm">
          <CardHeader className="bg-primary/5 border-b border-primary/10">
            <div className="flex items-center gap-2">
              <Cpu className="w-5 h-5 text-primary" />
              <CardTitle className="text-xl">AI 初诊结论板块</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="p-6 space-y-8">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 p-6 bg-muted/30 rounded-lg">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">整体风险等级评估</p>
                <div className="flex items-center gap-3">
                  <h4 className="text-3xl font-bold text-orange-600">中高风险</h4>
                  <Badge variant="outline" className={RISK_LEVELS.HIGH.color}>重点关注</Badge>
                </div>
              </div>
              <div className="flex gap-2">
                {Object.entries(RISK_LEVELS).map(([key, value]) => (
                  <div key={key} className={`flex flex-col items-center gap-1 opacity-${key === 'HIGH' ? '100' : '40'}`}>
                    <div className={`w-12 h-2 rounded-full ${key === 'LOW' ? 'bg-green-500' : key === 'MEDIUM' ? 'bg-yellow-500' : key === 'HIGH' ? 'bg-orange-500' : 'bg-red-500'}`} />
                    <span className="text-[10px] font-medium">{value.label}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 text-orange-600" />
                  <h3 className="font-semibold text-primary">核心风险 Top 3</h3>
                </div>
                <div className="space-y-3">
                  {[
                    "外汇强制结汇政策变动导致资金回笼风险",
                    "尼日利亚《数据保护法》(NDPA) 落地引发的跨境传输限制",
                    "肯尼亚当地用工比例（Local Content）政策收紧"
                  ].map((risk, index) => (
                    <div key={index} className="flex gap-3 text-sm p-3 bg-white border rounded-md shadow-sm">
                      <span className="font-bold text-primary">0{index + 1}</span>
                      <p>{risk}</p>
                    </div>
                  ))}
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Info className="w-4 h-4 text-primary" />
                  <h3 className="font-semibold text-primary">当前合规缺口总结</h3>
                </div>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  企业尚未在目的国建立完善的数据隐私合规体系，且缺乏针对西非/东非地区复杂的外汇管制应对预案。此外，当地员工的福利体系与当地《劳动法》存在约15%的制度性差异，存在潜在的法律追索风险。
                </p>
                <div className="p-4 bg-primary/5 rounded-md border border-primary/10">
                  <p className="text-xs font-bold text-primary uppercase mb-2">优先级行动建议</p>
                  <ul className="text-sm space-y-1 list-disc list-inside">
                    <li>启动肯尼亚子公司《数据隐私政策》本地化审计</li>
                    <li>建立离岸离岸账户资金划转合规路径优化方案</li>
                    <li>重新评估当地劳工合同中的保险与补贴条款</li>
                  </ul>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 3. 分项风险分析板块 */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 px-1">
            <LayoutList className="w-5 h-5 text-primary" />
            <h2 className="text-2xl font-bold text-primary">分项风险分析板块</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {([
              { title: "市场准入风险", icon: Globe, level: "MEDIUM", desc: "尼日利亚外商独资政策稳定，但特定行业如电信、石油需特许经营证照，审批周期预计6-12个月。", impact: "项目落地时间可能超预期。", action: "提前开展行业准入专项调研。" },
              { title: "税务合规风险", icon: Wallet, level: "HIGH", desc: "东非共同体(EAC)近期调整关税起征点，企业面临双重征税协定应用不熟练导致的成本溢价。", impact: "预计年度运营成本上升8.5%。", action: "聘请当地专业税务师进行年度税务筹划。" },
              { title: "外汇管制风险", icon: Gavel, level: "CRITICAL", desc: "尼日利亚央行(CBN)对大额美元汇兑实行额度管理，存在资金无法及时汇回国内的流动性风险。", impact: "资金安全及供应链支付受阻。", action: "建立境内外联动支付机制，采用对冲策略。" },
              { title: "数据合规风险", icon: Database, level: "HIGH", desc: "当地政府对用户个人信息存留在境外的监管趋严，违反规定可能面临全球年收入2%的罚款。", impact: "重大财务损失及品牌声誉损毁。", action: "实施数据服务器本地化部署或加密传输方案。" },
              { title: "劳工用工风险", icon: ShieldCheck, level: "MEDIUM", desc: "肯尼亚工会力量强大，关于加班费和医疗保险的集体谈判可能引发罢工停产风险。", impact: "生产线中断，订单交付延期。", action: "完善员工手册，与当地工会建立预沟通机制。" },
              { title: "环保合规风险", icon: Leaf, level: "LOW", desc: "目前业务主要为互联网技术，对环境直接影响较小，需关注办公场所的能耗及废弃物处理规定。", impact: "轻微合规负担。", action: "遵循绿色办公指南，定期进行碳排自测。" }
            ] as AnalysisItem[]).map((item, index) => (
              <Card key={index} className="border-none shadow-sm flex flex-col">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <item.icon className="w-5 h-5 text-primary" />
                      <CardTitle className="text-lg">{item.title}</CardTitle>
                    </div>
                    <Badge variant="outline" className={RISK_LEVELS[item.level].color}>
                      {RISK_LEVELS[item.level].label}风险
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="text-sm space-y-4 flex-1">
                  <p className="text-muted-foreground leading-relaxed">{item.desc}</p>
                  <div className="space-y-2 pt-2 border-t border-muted">
                    <div className="flex gap-2">
                      <span className="font-semibold text-primary shrink-0">风险影响:</span>
                      <span>{item.impact}</span>
                    </div>
                    <div className="flex gap-2">
                      <span className="font-semibold text-primary shrink-0">应对建议:</span>
                      <span>{item.action}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* 4. AI智能机构匹配结果板块 */}
        <Card className="border-none shadow-sm">
          <CardHeader className="bg-primary/5 border-b border-primary/10">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-primary" />
              <CardTitle className="text-xl">AI 智能机构匹配结果板块</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/30">
                    <TableHead className="w-[200px] whitespace-nowrap">推荐机构</TableHead>
                    <TableHead className="w-[250px] whitespace-nowrap">适配业务</TableHead>
                    <TableHead className="whitespace-nowrap">核心优势</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {[
                    { name: "Baker McKenzie 非洲分所", business: "跨境合规、外汇法律、知识产权", advantage: "全球顶尖法律服务网络，深耕非洲市场30余年，政府关系卓越。" },
                    { name: "PwC (普华永道) 尼日利亚", business: "税务筹划、审计评估、市场准入咨询", advantage: "熟悉西非地区税制变化，提供从架构设计到落地的一站式财税服务。" },
                    { name: "Miaoda Legal AI Expert", business: "法律文本实时监控、合规文档自动生成", advantage: "24/7 实时政策抓取与智能研判，极低成本满足日常合规自查需求。" }
                  ].map((org, i) => (
                    <TableRow key={i}>
                      <TableCell className="font-semibold whitespace-nowrap">{org.name}</TableCell>
                      <TableCell className="text-sm whitespace-nowrap">{org.business}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">{org.advantage}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* 5. 落地执行清单板块 */}
        <Card className="border-none shadow-sm">
          <CardHeader className="bg-primary/5 border-b border-primary/10">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-primary" />
              <CardTitle className="text-xl">落地执行清单板块</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-6">
              {[
                { date: "T+7天内", owner: "法务部总监", task: "尼日利亚数据处理备案申请", material: "企业章程、数据架构说明书、DPO委任书", warn: "如未在规定日期前提交，可能面临每日5万奈拉的滞纳金。" },
                { date: "T+15天内", owner: "财务部主管", task: "外汇结汇合规审计", material: "年度外汇流入明细、CBN备案凭证", warn: "需严格核对结汇金额与实际贸易金额的一致性。" },
                { date: "T+30天内", owner: "人力资源负责人", task: "员工手册本地化修订发布", material: "现行员工手册、肯尼亚劳动法合规建议稿", warn: "修订内容需经当地工会书面确认以避免集体争议。" }
              ].map((item, i) => (
                <div key={i} className="flex flex-col md:flex-row gap-4 p-4 border rounded-lg bg-white relative">
                  <div className="md:w-32 shrink-0">
                    <Badge className="bg-primary text-white mb-2">{item.date}</Badge>
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <Users className="w-3 h-3" /> {item.owner}
                    </p>
                  </div>
                  <div className="flex-1 space-y-2">
                    <h4 className="font-bold text-primary">{item.task}</h4>
                    <div className="text-sm">
                      <span className="text-muted-foreground">办理材料：</span>
                      <span>{item.material}</span>
                    </div>
                    <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-100 rounded-md">
                      <AlertTriangle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                      <p className="text-xs text-red-700">{item.warn}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* 6. 附录板块 */}
        <Card className="border-none shadow-sm bg-muted/20">
          <CardHeader>
            <div className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-primary" />
              <CardTitle className="text-xl">附录板块</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="p-6 space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-3">
                <h3 className="text-sm font-bold text-primary flex items-center gap-2">
                  <Gavel className="w-4 h-4" /> 引用法规依据列表
                </h3>
                <ul className="text-xs space-y-2 text-muted-foreground list-decimal list-inside">
                  <li>Nigeria Data Protection Act (NDPA), 2023</li>
                  <li>Central Bank of Nigeria (CBN) Foreign Exchange Manual</li>
                  <li>Kenya Employment Act, 2007 (Revised 2022)</li>
                  <li>East African Community (EAC) Common External Tariff</li>
                  <li>ECOWAS Regional Trade Liberalization Scheme</li>
                </ul>
              </div>
              <div className="space-y-3">
                <h3 className="text-sm font-bold text-primary flex items-center gap-2">
                  <Database className="w-4 h-4" /> 数据来源说明
                </h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  本报告数据源自：目的国官方政府公报、世界银行(World Bank)非洲地区年度营商环境数据库、国际货币基金组织(IMF)外汇管理政策报告、以及Baker McKenzie非洲实操案例库。AI分析模型通过Miaoda Compliance引擎实时交叉核验。
                </p>
              </div>
            </div>

            <Separator className="bg-muted-foreground/20" />

            <div className="space-y-3">
              <h3 className="text-sm font-bold text-primary flex items-center gap-2">
                <Scale className="w-4 h-4" /> 专业法律免责声明
              </h3>
              <p className="text-[10px] text-muted-foreground leading-relaxed text-pretty">
                1. 本报告仅作为企业决策的参考依据，不构成正式的法律、财务或税务建议。在执行任何具体业务前，请咨询当地持牌执业律师及税务专家。<br/>
                2. AI生成内容可能存在一定的时效性滞后，报告中的法规条款应以目的国政府实时公布的官方文件为准。<br/>
                3. 因使用本报告所载信息而导致的任何直接或间接投资损失，报告生成机构及平台不承担任何法律责任。<br/>
                4. 本报告版权归"中非科创出海科技有限公司"所有，未经授权不得用于商业转售。
              </p>
            </div>

            <div className="pt-4 text-center">
              <p className="text-[10px] text-muted-foreground">© 2026 Miaoda Compliance System. All Rights Reserved.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
