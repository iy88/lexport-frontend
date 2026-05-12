import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  AlertTriangle,
  Building2,
  Calendar,
  CheckCircle2,
  ClipboardList,
  FileText,
  Globe,
  Scale,
  Shield,
  TrendingUp,
  Users,
  Leaf,
  DollarSign,
  Lock,
  Truck,
  Clock,
  User,
  BookOpen,
  Info,
  ChevronDown,
  ChevronUp,
  Star,
  MapPin,
} from 'lucide-react';

/* ─── 报告数据 ─── */
const reportMeta = {
  reportNo: 'LH-2026-050001',
  generatedAt: '2026-05-10 14:32:07',
  aiVersion: 'LegalNav AI v2.1.0',
  dataDate: '2026-04-30',
};

const companyInfo = {
  name: '广州宏远制造有限公司',
  industry: '电子元器件制造',
  size: '中型企业（50-200人）',
  targetCountry: '南非',
  mode: '设立独资工厂',
};

const diagnosisResult = {
  level: '高',
  levelColor: 'destructive' as const,
  top3: [
    { rank: 1, risk: '劳工本地化比例不足', area: '劳工合规', urgency: '立即处理' },
    { rank: 2, risk: '外汇利润汇回管制', area: '外汇合规', urgency: '3个月内' },
    { rank: 3, risk: '进口设备关税优惠资质未取得', area: '税务合规', urgency: '设立前' },
  ],
  gaps: [
    '未取得南非工业开发公司（IDC）资质认定',
    '未完成外籍员工工作许可预申请',
    '尚未建立POPIA个人数据合规体系',
    '环境影响评估（EIA）尚未启动',
  ],
  priorities: [
    { label: '优先级1', content: '立即启动劳工本地化方案，聘请本地HR合规顾问' },
    { label: '优先级2', content: '向南非储备银行提交外汇循环审批预申请' },
    { label: '优先级3', content: '委托ENSafrica完成公司注册及IDC资质申请' },
  ],
};

const riskItems = [
  {
    id: 'admission',
    icon: Building2,
    label: '准入合规',
    level: '高',
    levelColor: 'destructive' as const,
    details: [
      '外资企业须在南非公司事务所（CIPC）完成注册，注册周期约15-30个工作日',
      '制造业需申请特定行业许可（Industry-specific licence），涉及ITAC审批',
      '投资金额超过1亿兰特须向南非竞争委员会备案',
    ],
    suggestion: '建议委托ENSafrica或Bowmans代理注册，同步启动ITAC行业许可申请。',
  },
  {
    id: 'tax',
    icon: DollarSign,
    label: '税务合规',
    level: '中',
    levelColor: 'secondary' as const,
    details: [
      '企业所得税率27%，制造业可申请特别折旧抵扣（Section 12C/12I）',
      '增值税标准税率15%，出口货物零税率，须月度/双月度申报',
      '制造业设备进口关税，可凭ITAC豁免证书申请减免',
    ],
    suggestion: '建议委托Werksmans Attorneys进行税务架构设计，申请12I投资优惠资质。',
  },
  {
    id: 'forex',
    icon: TrendingUp,
    label: '外汇合规',
    level: '高',
    levelColor: 'destructive' as const,
    details: [
      '南非外汇管制由南非储备银行（SARB）主导，利润汇回须提前申请循环批准',
      '每笔境外支付超1000万兰特须单独审批，周期约10-20个工作日',
      '股东贷款及关联方资金往来须符合转让定价要求',
    ],
    suggestion: '建议通过Standard Bank Advisory预设外汇通道，同步建立关联方价格文档。',
  },
  {
    id: 'data',
    icon: Lock,
    label: '数据安全',
    level: '中',
    levelColor: 'secondary' as const,
    details: [
      '南非《个人信息保护法》（POPIA）已全面生效，违规最高罚款1000万兰特',
      '制造业须为员工及客户个人数据指定信息官（Information Officer）',
      '数据跨境传输需通过合规评估或合同标准条款',
    ],
    suggestion: '建议建立POPIA合规手册，在系统上线前完成数据流图梳理与员工培训。',
  },
  {
    id: 'labor',
    icon: Users,
    label: '劳工合规',
    level: '高',
    levelColor: 'destructive' as const,
    details: [
      '《基本就业条件法》（BCEA）规定每日工时不超8小时，加班须支付1.5倍工资',
      '《宽泛就业平等法》（EEA）要求制造业本地员工比例，外籍员工须取得工作许可',
      '规模50人以上须提交年度就业平等报告（EEA2/EEA4）',
    ],
    suggestion: '建议委托Webber Wentzel制定用工合规方案，并通过Adcorp Group批量招募本地技工。',
  },
  {
    id: 'env',
    icon: Leaf,
    label: '环保合规',
    level: '中',
    levelColor: 'secondary' as const,
    details: [
      '制造业项目须完成环境影响评估（EIA），审批周期约90-180天',
      '废水排放须达到南非《国家水法》标准，违规可暂停经营许可',
      '须申请大气排放许可证（Atmospheric Emission Licence）',
    ],
    suggestion: '建议项目筹备阶段即委托IKM Law启动EIA，与工厂建设并行推进以压缩时间成本。',
  },
];

const recommendedAgencies = [
  {
    type: '律师事务所',
    name: 'ENSafrica',
    icon: Scale,
    match: '公司注册 / 准入合规',
    reason: '全非最大律所，多国执业，大型制造项目落地能力强',
    region: '南非 · 全非',
  },
  {
    type: '律师事务所',
    name: 'Webber Wentzel',
    icon: Shield,
    match: '劳工用工 / 雇佣合规',
    reason: '南非劳工法第一，服务大型制造企业，熟悉罢工谈判与裁撤合规',
    region: '南非',
  },
  {
    type: '会计师事务所',
    name: 'Werksmans Attorneys',
    icon: DollarSign,
    match: '税务架构 / 转让定价',
    reason: '南非资深税法律所，擅长制造业避税架构合规及12I优惠申请',
    region: '南非',
  },
  {
    type: '会计师事务所',
    name: 'KPMG Africa',
    icon: FileText,
    match: '财务审计 / 年度报表',
    reason: '国际四大，南非网络完善，适配大型跨国工厂审计需求',
    region: '南非 · 全非',
  },
  {
    type: '人力资源机构',
    name: 'Adcorp Group',
    icon: Users,
    match: '本地技工 / 批量招聘',
    reason: '南非及非洲南部蓝领/技工招募领军者，制造业用工经验丰富',
    region: '南非 · 南部非洲',
  },
  {
    type: '人力资源机构',
    name: 'Standard Bank Advisory',
    icon: TrendingUp,
    match: '外汇通道 / 资金管理',
    reason: '银行背景，利润汇回与外汇对冲方案安全合规，与SARB沟通渠道畅通',
    region: '南非 · 全非',
  },
];

const executionItems = [
  { no: '01', task: '启动公司注册（CIPC）', deadline: '2026-06-01', owner: '法务负责人', materials: '章程草案、董事身份证明、注册地址证明', warning: '注册证书到手前不得签署工厂租约' },
  { no: '02', task: '申请ITAC行业许可', deadline: '2026-06-15', owner: '法务负责人 + 外部律所', materials: '商业计划书、投资规模说明、产品目录', warning: '许可审批周期约30-60天，须提前递交' },
  { no: '03', task: '启动环境影响评估（EIA）', deadline: '2026-06-20', owner: '项目负责人', materials: '选址规划、设备清单、废水废气预估报告', warning: 'EIA周期最长180天，须与工厂建设并行' },
  { no: '04', task: '申请外籍员工工作许可预批', deadline: '2026-07-01', owner: 'HR负责人', materials: '员工护照、学历证明、岗位必要性说明', warning: '许可审批约90天，晚于6月底递交将影响开厂' },
  { no: '05', task: '建立POPIA数据合规体系', deadline: '2026-07-15', owner: '信息官（需指定）', materials: '数据流图、隐私政策草案、员工培训记录', warning: '违规最高罚款1000万兰特，系统上线前须完成' },
  { no: '06', task: '完成税务架构设计及12I申请', deadline: '2026-08-01', owner: '财务负责人 + 会计师事务所', materials: '投资方案、预计产能数据、设备清单', warning: '12I优惠须在设立前申请，设立后不可补办' },
  { no: '07', task: '设立外汇循环审批通道', deadline: '2026-08-15', owner: '财务负责人', materials: '股权结构图、资金流向说明、银行开户资料', warning: '首笔利润汇回前须完成SARB审批，周期约20天' },
  { no: '08', task: '本地员工批量招募与培训', deadline: '2026-09-01', owner: 'HR负责人 + Adcorp Group', materials: '岗位描述、薪酬方案、培训计划', warning: '本地员工比例不达标将面临就业平等罚款' },
];

const appendix = {
  laws: [
    { code: 'CIPC Act 71/2008', name: '《公司法》', note: '公司注册主要依据' },
    { code: 'ITAC Act 71/2002', name: '《国际贸易管理法》', note: '进出口许可及关税减免' },
    { code: 'BCEA 75/1997', name: '《基本就业条件法》', note: '用工与劳工合规' },
    { code: 'EEA 55/1998', name: '《就业平等法》', note: '本地用工比例要求' },
    { code: 'POPIA 4/2013', name: '《个人信息保护法》', note: '数据安全合规' },
    { code: 'NEMA 107/1998', name: '《国家环境管理法》', note: '环评（EIA）主要依据' },
    { code: 'Income Tax Act 58/1962', name: '《所得税法》', note: '12I投资优惠税收减免' },
    { code: 'SARB ExControl', name: '南非储备银行外汇管制规定', note: '利润汇回及跨境资金' },
  ],
  dataSources: [
    'ENSafrica 法律数据库（2026年4月）',
    '南非公司事务所（CIPC）官网',
    '南非国际贸易管理委员会（ITAC）公告',
    '南非储备银行（SARB）外汇政策指引',
    '南非信息监管机构（IRSA）POPIA执法公告',
    '律航出海法规库 v2.1（数据截止2026-04-30）',
  ],
  disclaimer:
    '本报告由律航出海AI系统依据公开法律数据库及平台知识库自动生成，仅供参考，不构成正式法律意见。企业在做出具体商业决策前，应咨询持牌执业律师或专业顾问机构。律航出海对因直接依赖本报告内容所产生的任何损失不承担法律责任。数据截止日期为2026年4月30日，请关注最新法规动态。',
};

/* ─── 子组件 ─── */
const RiskLevelBadge: React.FC<{ level: string }> = ({ level }) => {
  const map: Record<string, string> = {
    高: 'bg-destructive/10 text-destructive border-destructive/20',
    中: 'bg-warning/10 text-warning border-warning/20',
    低: 'bg-success/10 text-success border-success/20',
    极高: 'bg-destructive text-destructive-foreground border-destructive',
  };
  return (
    <Badge variant="outline" className={`font-semibold ${map[level] ?? ''}`}>
      {level}风险
    </Badge>
  );
};

const SectionTitle: React.FC<{ icon: React.ElementType; label: string; no: string }> = ({
  icon: Icon,
  label,
  no,
}) => (
  <div className="flex items-center gap-3 mb-6">
    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground text-sm font-bold shrink-0">
      {no}
    </div>
    <Icon className="w-5 h-5 text-primary shrink-0" />
    <h2 className="text-xl md:text-2xl font-bold text-foreground text-balance">{label}</h2>
  </div>
);

const RiskCard: React.FC<{ item: (typeof riskItems)[number] }> = ({ item }) => {
  const [expanded, setExpanded] = useState(false);
  const Icon = item.icon;
  return (
    <Card className="shadow-card">
      <CardContent className="p-5">
        <div
          className="flex items-center justify-between cursor-pointer select-none"
          onClick={() => setExpanded((v) => !v)}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') setExpanded((v) => !v);
          }}
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
              <Icon className="w-5 h-5 text-primary" />
            </div>
            <span className="font-semibold text-foreground">{item.label}</span>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <RiskLevelBadge level={item.level} />
            {expanded ? (
              <ChevronUp className="w-4 h-4 text-muted-foreground" />
            ) : (
              <ChevronDown className="w-4 h-4 text-muted-foreground" />
            )}
          </div>
        </div>
        {expanded && (
          <div className="mt-4 pt-4 border-t border-border space-y-3">
            <ul className="space-y-2">
              {item.details.map((d, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                  <CheckCircle2 className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                  <span className="text-pretty">{d}</span>
                </li>
              ))}
            </ul>
            <div className="bg-primary/5 border border-primary/10 rounded-lg p-3">
              <p className="text-xs font-semibold text-primary mb-1">律航建议</p>
              <p className="text-sm text-foreground text-pretty">{item.suggestion}</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

/* ─── 主页面 ─── */
const ReportPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Page Header */}
      <div className="bg-primary text-primary-foreground py-10 md:py-14 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center gap-3 mb-4">
            <Scale className="w-7 h-7" />
            <span className="text-lg font-semibold opacity-90">律航出海</span>
          </div>
          <h1 className="text-2xl md:text-4xl font-bold mb-2 text-balance">
            非洲制造业出海合规报告
          </h1>
          <p className="text-primary-foreground/80 text-sm md:text-base">
            AI 智能生成 · 专业合规参考 · 仅供参考，不构成法律意见
          </p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 md:px-6 py-8 md:py-12 space-y-10">

        {/* ── Section 1: 基础信息 ── */}
        <section>
          <SectionTitle icon={Info} label="基础信息" no="1" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* 报告元信息 */}
            <Card className="shadow-card h-full">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <FileText className="w-4 h-4 text-primary" />
                  报告元信息
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {[
                  { label: '报告编号', value: reportMeta.reportNo },
                  { label: '生成时间', value: reportMeta.generatedAt },
                  { label: 'AI 版本', value: reportMeta.aiVersion },
                  { label: '数据截止日期', value: reportMeta.dataDate },
                ].map((row) => (
                  <div key={row.label} className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">{row.label}</span>
                    <span className="font-medium text-foreground text-right">{row.value}</span>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* 企业信息 */}
            <Card className="shadow-card h-full">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-primary" />
                  企业信息
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {[
                  { label: '企业名称', value: companyInfo.name },
                  { label: '行业', value: companyInfo.industry },
                  { label: '企业规模', value: companyInfo.size },
                  { label: '出海目的国', value: companyInfo.targetCountry },
                  { label: '出海模式', value: companyInfo.mode },
                ].map((row) => (
                  <div key={row.label} className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">{row.label}</span>
                    <span className="font-medium text-foreground text-right">{row.value}</span>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </section>

        <Separator />

        {/* ── Section 2: AI 初诊结论 ── */}
        <section>
          <SectionTitle icon={ClipboardList} label="AI 初诊结论" no="2" />

          {/* Risk Level */}
          <Card className="shadow-card mb-6 border-l-4 border-l-destructive">
            <CardContent className="p-6">
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">综合风险等级</p>
                  <div className="flex items-center gap-3">
                    <span className="text-3xl md:text-4xl font-bold text-destructive">
                      {diagnosisResult.level}风险
                    </span>
                    <AlertTriangle className="w-7 h-7 text-destructive" />
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    基于{companyInfo.targetCountry}制造业准入、劳工、税务、环保等6维度评估
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-muted-foreground">目的国</p>
                  <p className="text-lg font-bold text-foreground">{companyInfo.targetCountry}</p>
                  <p className="text-xs text-muted-foreground">出海模式</p>
                  <p className="text-sm font-medium text-foreground">{companyInfo.mode}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Top 3 Risks */}
          <Card className="shadow-card mb-6">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Star className="w-4 h-4 text-primary" />
                核心风险 Top 3
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {diagnosisResult.top3.map((item) => (
                  <div
                    key={item.rank}
                    className="flex items-center gap-4 p-3 rounded-lg bg-muted/40 border border-border"
                  >
                    <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold text-sm shrink-0">
                      {item.rank}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm text-foreground">{item.risk}</p>
                      <p className="text-xs text-muted-foreground">{item.area}</p>
                    </div>
                    <Badge
                      variant="outline"
                      className={
                        item.urgency === '立即处理'
                          ? 'bg-destructive/10 text-destructive border-destructive/20 text-xs shrink-0'
                          : 'bg-warning/10 text-warning border-warning/20 text-xs shrink-0'
                      }
                    >
                      {item.urgency}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Compliance Gaps */}
            <Card className="shadow-card h-full">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-warning" />
                  合规缺口
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {diagnosisResult.gaps.map((gap, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm">
                      <span className="w-1.5 h-1.5 rounded-full bg-destructive mt-2 shrink-0" />
                      <span className="text-muted-foreground text-pretty">{gap}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            {/* Priorities */}
            <Card className="shadow-card h-full">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-primary" />
                  优先级建议
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {diagnosisResult.priorities.map((p, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <Badge className="bg-primary text-primary-foreground text-xs shrink-0 mt-0.5">
                        P{i + 1}
                      </Badge>
                      <p className="text-sm text-muted-foreground text-pretty">{p.content}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        <Separator />

        {/* ── Section 3: 风险分析 ── */}
        <section>
          <SectionTitle icon={Shield} label="风险分析" no="3" />
          <p className="text-sm text-muted-foreground mb-5">点击展开各维度详细分析与律航建议</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {riskItems.map((item) => (
              <RiskCard key={item.id} item={item} />
            ))}
          </div>
        </section>

        <Separator />

        {/* ── Section 4: AI 机构匹配 ── */}
        <section>
          <SectionTitle icon={Globe} label="AI 机构匹配结果" no="4" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {recommendedAgencies.map((agency, i) => {
              const Icon = agency.icon;
              return (
                <Card key={i} className="shadow-card hover:shadow-hover transition-shadow h-full flex flex-col">
                  <CardContent className="p-5 flex-1 flex flex-col">
                    <div className="flex items-start gap-3 mb-3">
                      <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                        <Icon className="w-5 h-5 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-bold text-foreground">{agency.name}</span>
                          <Badge variant="secondary" className="text-xs">{agency.type}</Badge>
                        </div>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
                          <MapPin className="w-3 h-3 shrink-0" />
                          <span>{agency.region}</span>
                        </div>
                      </div>
                    </div>
                    <div className="bg-primary/5 border border-primary/10 rounded-md px-3 py-2 mb-3">
                      <p className="text-xs font-semibold text-primary">匹配场景：{agency.match}</p>
                    </div>
                    <p className="text-sm text-muted-foreground text-pretty mt-auto">{agency.reason}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </section>

        <Separator />

        {/* ── Section 5: 落地执行清单 ── */}
        <section>
          <SectionTitle icon={Calendar} label="落地执行清单" no="5" />
          <div className="overflow-x-auto">
            <table className="w-full min-w-max text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/40">
                  <th className="text-left px-3 py-3 font-semibold text-foreground whitespace-nowrap">序号</th>
                  <th className="text-left px-3 py-3 font-semibold text-foreground whitespace-nowrap">任务</th>
                  <th className="text-left px-3 py-3 font-semibold text-foreground whitespace-nowrap">节点</th>
                  <th className="text-left px-3 py-3 font-semibold text-foreground whitespace-nowrap">责任人</th>
                  <th className="text-left px-3 py-3 font-semibold text-foreground whitespace-nowrap">所需材料</th>
                  <th className="text-left px-3 py-3 font-semibold text-foreground whitespace-nowrap">预警提醒</th>
                </tr>
              </thead>
              <tbody>
                {executionItems.map((item) => (
                  <tr key={item.no} className="border-b border-border hover:bg-muted/20 transition-colors">
                    <td className="px-3 py-4 whitespace-nowrap">
                      <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs">
                        {item.no}
                      </div>
                    </td>
                    <td className="px-3 py-4 whitespace-nowrap font-medium text-foreground">{item.task}</td>
                    <td className="px-3 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <Clock className="w-3.5 h-3.5 shrink-0" />
                        {item.deadline}
                      </div>
                    </td>
                    <td className="px-3 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <User className="w-3.5 h-3.5 shrink-0" />
                        {item.owner}
                      </div>
                    </td>
                    <td className="px-3 py-4 text-muted-foreground max-w-[220px]">
                      <p className="text-pretty">{item.materials}</p>
                    </td>
                    <td className="px-3 py-4">
                      <div className="flex items-start gap-1 text-destructive max-w-[220px]">
                        <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                        <p className="text-pretty text-xs">{item.warning}</p>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <Separator />

        {/* ── Section 6: 附录 ── */}
        <section>
          <SectionTitle icon={BookOpen} label="附录" no="6" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            {/* Legal Basis */}
            <Card className="shadow-card h-full">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Scale className="w-4 h-4 text-primary" />
                  法规依据
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {appendix.laws.map((law, i) => (
                    <div key={i} className="flex items-start gap-2 text-sm">
                      <Badge variant="outline" className="text-xs shrink-0 mt-0.5 font-mono">
                        {law.code}
                      </Badge>
                      <div>
                        <p className="font-medium text-foreground">{law.name}</p>
                        <p className="text-xs text-muted-foreground">{law.note}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Data Sources */}
            <Card className="shadow-card h-full">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <FileText className="w-4 h-4 text-primary" />
                  数据来源
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {appendix.dataSources.map((src, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                      <span className="w-1.5 h-1.5 rounded-full bg-primary mt-2 shrink-0" />
                      {src}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>

          {/* Disclaimer */}
          <Card className="shadow-card border-warning/20 bg-warning/5">
            <CardContent className="p-5">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-warning shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-foreground mb-1">免责声明</p>
                  <p className="text-sm text-muted-foreground leading-relaxed text-pretty">
                    {appendix.disclaimer}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Footer */}
        <div className="text-center pt-4 pb-8 text-xs text-muted-foreground">
          <p>© 2026 律航出海 · 报告编号：{reportMeta.reportNo} · 数据截止：{reportMeta.dataDate}</p>
        </div>

      </div>
    </div>
  );
};

export default ReportPage;
