import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import {
  Scale,
  Calculator,
  Users,
  MapPin,
  Phone,
  Mail,
  Target,
  Star,
  Briefcase,
} from 'lucide-react';

interface AgencyDetail {
  name: string;
  region: string;
  phone: string;
  email: string;
  business: string;
  advantage: string;
  highlight?: string;
}

interface AgencyScene {
  id: string;
  label: string;
  agencies: AgencyDetail[];
}

interface AgencyCategory {
  id: string;
  label: string;
  icon: React.ElementType;
  scenes: AgencyScene[];
}

const agencyData: AgencyCategory[] = [
  {
    id: 'law',
    label: '律师事务所',
    icon: Scale,
    scenes: [
      {
        id: 'law-establishment',
        label: '投资设立 / 公司注册合规',
        agencies: [
          { name: 'ENS (ENSafrica)', region: '南非、尼日利亚、肯尼亚、加纳、全非', phone: '+27 11 888 8000', email: 'info@ensafrica.com', business: '制造业投资架构、公司注册、准入合规、跨境设立', advantage: '全非最大律所，多国执业，大型制造项目落地能力强', highlight: '全非最大' },
          { name: 'Bowmans', region: '南非、肯尼亚、坦桑尼亚、乌干达、西非', phone: '+27 21 657 2000', email: 'info@bowmanslaw.com', business: '跨国收并购、工业项目选址、合规架构设计', advantage: '泛非顶尖律所，国际权威榜单推荐', highlight: '泛非顶尖' },
          { name: 'Shalakany Law Office', region: '埃及、北非', phone: '+20 2 2574 4440', email: 'info@shalakany.com', business: '北非工业准入、外资设立、自贸区合规', advantage: '埃及权威，北非制造业头部律所', highlight: '北非权威' },
          { name: 'Anjarwalla & Khanna (A&K)', region: '肯尼亚、东非', phone: '+254 20 287 3000', email: 'info@ak.co.ke', business: '东非外资准入、制造企业设立、合规落地', advantage: '东非门户律所，深耕制造业', highlight: '东非门户' },
          { name: 'Udo Udoma & Belo-Osagie (UUBO)', region: '尼日利亚、西非', phone: '+234 1 460 6600', email: 'info@uubo.com', business: '公司注册、商业合规、制造业准入', advantage: '尼日利亚顶级商业律所', highlight: '尼日利亚顶级' },
        ],
      },
      {
        id: 'law-labor',
        label: '劳工用工 / 雇佣合规',
        agencies: [
          { name: 'Webber Wentzel', region: '南非', phone: '+27 10 800 3000', email: 'info@webberwentzel.com', business: '劳工纠纷、罢工谈判、大规模用工合规', advantage: '南非劳工法第一，服务大型制造企业', highlight: '劳工第一' },
          { name: 'Bentsi-Enchill', region: '加纳、西非', phone: '+233 302 779 000', email: 'info@bentsi-enchill.com', business: '雇佣合规、劳工福利、工厂用工管理', advantage: '西非金牌律所，中资友好', highlight: '西非金牌' },
          { name: 'Kaplan & Stratton', region: '肯尼亚、东非', phone: '+254 20 271 7000', email: 'info@kaplanstratton.com', business: '雇佣法、福利体系、用工合规', advantage: '东非资深劳工法专家', highlight: '东非资深' },
          { name: 'Sy & Partners', region: '塞内加尔、几内亚、法语区西非', phone: '+221 33 867 7000', email: 'contact@sy-partners.sn', business: '法语区劳动合规、用工管理', advantage: '法语区制造业劳工权威', highlight: '法语区' },
          { name: '非洲重点华人律所', region: '全非重点国家', phone: '400-888-9999（预留）', email: 'africalaw@163.com（预留）', business: '中文服务、用工对接、合规翻译', advantage: '无语言障碍，适配中资管理', highlight: '华人律所' },
        ],
      },
      {
        id: 'law-customs',
        label: '海关贸易 / 进出口合规',
        agencies: [
          { name: 'Cliffe Dekker Hofmeyr (CDH)', region: '南非、肯尼亚、纳米比亚', phone: '+27 11 888 7000', email: 'info@cdhlegal.com', business: '自贸区合规、贸易壁垒、进出口审核', advantage: '泛非贸易合规头部', highlight: '贸易头部' },
          { name: 'DLA Piper Africa', region: '全非', phone: '+44 (0) 20 7321 3000', email: 'africa@dlapiper.com', business: '跨国贸易、内部贸易合规、关税咨询', advantage: '全球网络，全非洲覆盖', highlight: '全球网络' },
          { name: 'Aelex', region: '尼日利亚、加纳', phone: '+234 1 461 3333', email: 'info@aelex.com', business: '跨境贸易、物流、关税、进出口许可', advantage: '西非贸易法律专家', highlight: '西非专家' },
          { name: 'Coulson Harney', region: '东非、南非', phone: '+254 20 287 1000', email: 'info@coulsonharney.com', business: '制造业进出口许可、原产地规则', advantage: '专注制造企业贸易合规', highlight: '专注制造' },
          { name: 'Trilegal Africa', region: '东非、南部非洲', phone: '+254 20 221 1000', email: 'info@trilegal.africa', business: '新兴市场贸易准入、审查', advantage: '灵活高效，适配中小制造企业', highlight: '灵活高效' },
        ],
      },
      {
        id: 'law-tax',
        label: '税务合规 / 争议解决',
        agencies: [
          { name: 'TripleOKLaw', region: '肯尼亚、东非', phone: '+254 20 273 1000', email: 'info@tripleoklaw.com', business: '税务诉讼、转让定价、税务争议', advantage: '东非税务顶尖', highlight: '税务顶尖' },
          { name: 'Sarkis & Associates', region: '埃及、北非', phone: '+20 2 2578 1110', email: 'info@sarkis-law.com', business: '税务复议、制造业税务合规', advantage: '北非税务权威', highlight: '北非权威' },
          { name: 'Templars', region: '尼日利亚', phone: '+234 1 460 5500', email: 'info@templars-law.com', business: '税务筹划、税务审计应对', advantage: '尼日利亚税务领军', highlight: '税务领军' },
          { name: 'Werksmans Attorneys', region: '南非', phone: '+27 11 571 1111', email: 'info@werksmans.com', business: '商税、制造业税务架构', advantage: '南非资深税法律所', highlight: '南非资深' },
          { name: 'Savjani & Co', region: '马拉维、东南非', phone: '+265 1 820 100', email: 'info@savjani.co.mw', business: '税务合规、申报、筹划', advantage: '东南非垂直深耕', highlight: '垂直深耕' },
        ],
      },
      {
        id: 'law-env',
        label: '环保合规 / 安全生产',
        agencies: [
          { name: 'Iseme, Kamau & Maema (IKM)', region: '肯尼亚、东非', phone: '+254 20 271 8000', email: 'info@ikmlaw.com', business: '环评、安全生产、工业园合规', advantage: '东非环评专家', highlight: '环评专家' },
          { name: 'Banwo & Ighodalo', region: '尼日利亚', phone: '+234 1 461 2222', email: 'info@bani-law.com', business: '环境评估、合规审计、生产安全', advantage: '尼日利亚制造环保权威', highlight: '环保权威' },
          { name: 'OAA Law', region: '加纳', phone: '+233 302 771 000', email: 'info@oaalaw.com', business: '环境许可、社会责任、安全生产', advantage: '加纳制造环保专家', highlight: '加纳专家' },
          { name: 'Gide Loyrette Nouel', region: '北非、法语区西非', phone: '+33 1 46 96 96 96', email: 'contact@gide.com', business: '环境法规、安全生产、合规', advantage: '法语区环境法头部', highlight: '法语区头部' },
          { name: 'Matouk Bassiouny', region: '埃及、北非', phone: '+20 2 2579 9990', email: 'info@matoukbassiouny.com', business: '工业项目安全、生产合规', advantage: '北非大型工业项目顾问', highlight: '大型项目' },
        ],
      },
    ],
  },
  {
    id: 'accounting',
    label: '会计师事务所',
    icon: Calculator,
    scenes: [
      {
        id: 'acct-audit',
        label: '财务审计 / 年度报表',
        agencies: [
          { name: 'Deloitte Africa', region: '全非主要工业国', phone: '+27 11 806 3000', email: 'africa@deloitte.com', business: '全球标准审计、财报、内控', advantage: '国际四大，适配大型跨国工厂', highlight: '国际四大' },
          { name: 'KPMG Africa', region: '南非、安哥拉、埃及、尼日利亚', phone: '+27 11 647 1000', email: 'info@kpmg.co.za', business: '审计、税务、合规', advantage: '国际四大，非洲网络完善', highlight: '国际四大' },
          { name: 'EY Africa', region: '南非、埃及、尼日利亚、肯尼亚', phone: '+27 11 773 1000', email: 'info@za.ey.com', business: '财务审计、税务合规', advantage: '国际四大，英语区服务稳定', highlight: '国际四大' },
          { name: 'PwC Africa', region: '南非、尼日利亚、肯尼亚', phone: '+27 10 797 5000', email: 'info@pwc.com', business: '跨境税务、审计、制造业咨询', advantage: '国际四大，制造业经验成熟', highlight: '国际四大' },
          { name: 'BDO Africa', region: '全非', phone: '+27 11 658 9000', email: 'info@bdo.africa', business: '中大型制造企业年度审计', advantage: '性价比高，覆盖广', highlight: '性价比高' },
          { name: 'Grant Thornton Africa', region: '全非', phone: '+27 11 571 3000', email: 'info@za.gt.com', business: '年度审计、合规财报', advantage: '流程严谨，非洲深耕', highlight: '流程严谨' },
          { name: 'Mazars', region: '全非（法语区强势）', phone: '+33 1 49 97 00 00', email: 'contact@mazars.com', business: '审计、合规、财报', advantage: '法语区第一梯队', highlight: '法语区第一' },
          { name: 'PKF Africa', region: '全非', phone: '+27 11 286 9000', email: 'info@pkf.africa', business: '中等制造企业定制审计', advantage: '灵活、专业、适配中型厂', highlight: '灵活专业' },
        ],
      },
      {
        id: 'acct-tax',
        label: '制造业税务筹划 / 申报',
        agencies: [
          { name: 'RSM Africa', region: '全非', phone: '+27 11 783 9000', email: 'info@rsm.africa', business: '增值税退税、所得税优惠、筹划', advantage: '制造业税筹精准', highlight: '税筹精准' },
          { name: 'Bakertilly', region: '全非', phone: '+1 800 822 1110', email: 'africa@bakertilly.com', business: '设备折旧、固定资产财税处理', advantage: '制造企业资产财税专家', highlight: '资产财税' },
          { name: 'Crowe Africa', region: '全非', phone: '+27 11 282 9000', email: 'info@crowe.africa', business: '税务合规、风险评估、申报', advantage: '全流程税务服务', highlight: '全流程' },
          { name: 'Pedabo', region: '尼日利亚', phone: '+234 1 291 2000', email: 'info@pedabo.com', business: '本土财税申报、合规', advantage: '尼日利亚名气最大', highlight: '名气最大' },
          { name: 'Nexia SAB&T', region: '南部非洲', phone: '+27 11 571 2000', email: 'info@nexiasabt.com', business: '税优申请、合规、筹划', advantage: '南部非洲制造税务专家', highlight: '制造税务' },
        ],
      },
      {
        id: 'acct-crossborder',
        label: '跨境财税 / 外汇合规',
        agencies: [
          { name: 'Standard Bank Advisory', region: '全非', phone: '+27 11 373 1000', email: 'advisory@standardbank.co.za', business: '利润汇回、外汇对冲、跨境资金', advantage: '银行背景，资金安全合规', highlight: '银行背景' },
          { name: 'Ecobank 商业服务部', region: '全非', phone: '+225 20 20 20 20', email: 'corporate@ecobank.com', business: '外币清算、资本出入境、外汇合规', advantage: '全非网络，资金通道稳定', highlight: '全非网络' },
          { name: 'Absa Group Advisory', region: '南部非洲、东非', phone: '+27 11 284 8000', email: 'advisory@absa.africa', business: '资本输出、筹资合规、外汇管理', advantage: '制造业跨境资本专家', highlight: '跨境资本' },
          { name: 'Moore Global Africa', region: '全非', phone: '+44 (0) 20 7716 1000', email: 'africa@moore-global.com', business: '利润分配、外汇申报、跨境协调', advantage: '全球网络，跨国财税专家', highlight: '全球网络' },
          { name: 'HLB International Africa', region: '全非', phone: '+44 (0) 20 7405 1000', email: 'africa@hlb-global.com', business: '中小制造企业跨境财税', advantage: '轻量化、高效、低成本', highlight: '轻量高效' },
        ],
      },
      {
        id: 'acct-cost',
        label: '成本核算 / 薪酬记账',
        agencies: [
          { name: 'SNG Grant Thornton', region: '全非', phone: '+27 11 381 3000', email: 'info@snggt.com', business: '计件工资、成本核算、加班费合规', advantage: '制造企业财务核算专家', highlight: '核算专家' },
          { name: 'ADP Africa', region: '全非', phone: '+1 800 422 7237', email: 'africa@adp.com', business: '全球薪酬外包、社保、个税', advantage: '国际级，覆盖非洲各国政策', highlight: '国际级' },
          { name: 'Sage 认证服务商', region: '全非', phone: '+27 11 628 2000', email: 'africa@sage.com', business: 'ERP、成本核算、财税系统', advantage: '系统稳定，本地适配', highlight: '系统稳定' },
          { name: 'Wylie & Bisset', region: '南部非洲', phone: '+27 11 883 7000', email: 'info@wyliebisset.com', business: '库存核算、生产流程审计', advantage: '制造财务垂直深耕', highlight: '垂直深耕' },
          { name: 'TMF Group Africa', region: '全非', phone: '+31 20 778 2888', email: 'africa@tmf-group.com', business: '多国薪酬代发、合规管理', advantage: '一站式托管，多国协同', highlight: '一站式' },
        ],
      },
    ],
  },
  {
    id: 'hr',
    label: '人力资源匹配机构',
    icon: Users,
    scenes: [
      {
        id: 'hr-worker',
        label: '普工 / 技工 / 操作工招聘',
        agencies: [
          { name: 'Adcorp Group', region: '南非、南部非洲', phone: '+27 11 233 7000', email: 'info@adcorp.co.za', business: '蓝领、技工、操作工批量招聘', advantage: '南部非洲蓝领第一', highlight: '蓝领第一' },
          { name: 'Jobberman', region: '尼日利亚、加纳', phone: '+234 1 454 0000', email: 'info@jobberman.com', business: '基层工人、操作工招聘', advantage: '西非最大基层人才平台', highlight: '西非最大' },
          { name: 'BrighterMonday', region: '肯尼亚、坦桑尼亚', phone: '+254 20 521 7000', email: 'info@brightermonday.com', business: '蓝领、技工、测评', advantage: '东非核心招聘机构', highlight: '东非核心' },
          { name: 'KaziNow', region: '东非', phone: '+254 20 224 5000', email: 'info@kazinow.com', business: '按需雇佣、蓝领匹配', advantage: '新兴高效，制造业友好', highlight: '新兴高效' },
          { name: 'ManpowerGroup Africa', region: '全非', phone: '+1 414 961 1000', email: 'africa@manpowergroup.com', business: '标准化技工筛选、派遣', advantage: '全球标准，质量稳定', highlight: '全球标准' },
        ],
      },
      {
        id: 'hr-talent',
        label: '技术人才 / 管理岗招聘',
        agencies: [
          { name: 'Andela', region: '尼日利亚、肯尼亚、加纳、埃及', phone: '+1 800 123 4567', email: 'hello@andela.com', business: '自动化工程师、技术管理岗', advantage: '非洲高端技术人才库第一', highlight: '技术第一' },
          { name: 'TalentQL', region: '西非、东非', phone: '+234 801 234 5678', email: 'hello@talentql.com', business: '高级工程师、管理岗猎聘', advantage: '精准匹配制造技术岗', highlight: '精准匹配' },
          { name: 'Michael Page Africa', region: '全非', phone: '+27 11 284 9000', email: 'africa@michaelpage.com', business: '高管、外籍专家、制造业管理层', advantage: '全球猎头，制造领域资深', highlight: '全球猎头' },
          { name: 'Robert Walters Africa', region: '全非', phone: '+27 11 282 8000', email: 'africa@robertwalters.com', business: '中高层招聘、薪酬调研', advantage: '国际视野，制造业资源丰富', highlight: '国际视野' },
          { name: 'Shortlist', region: '东非、西非', phone: '+254 20 224 6000', email: 'hello@shortlist.co', business: '大数据匹配技术人才、工程师', advantage: '高效精准，成本可控', highlight: '高效精准' },
        ],
      },
      {
        id: 'hr-payroll',
        label: '薪酬发放 / 社保公积金',
        agencies: [
          { name: 'SeamlessHR', region: '全非', phone: '+234 1 291 3000', email: 'info@seamlesshr.com', business: '数字化HR、假勤、社保、薪酬', advantage: '非洲多国政策适配', highlight: '多国适配' },
          { name: 'PaySpace', region: '40+非洲国家', phone: '+27 11 286 8000', email: 'info@payspace.com', business: '薪酬管理、个税合规、云系统', advantage: '覆盖最广的非洲薪酬平台', highlight: '覆盖最广' },
          { name: 'Workpay', region: '东非', phone: '+254 20 224 7000', email: 'hello@workpay.co', business: '薪酬发放、社保代缴、预支工资', advantage: '东非本地化最强', highlight: '东非最强' },
          { name: 'BrioHR', region: '全非', phone: '+60 3 2772 8888', email: 'info@briohr.com', business: '成长型工厂一站式HR、薪酬', advantage: '轻量化，适合中小制造企业', highlight: '轻量化' },
          { name: 'Zambizi Payroll', region: '南部非洲', phone: '+27 11 783 8000', email: 'info@zambizi.com', business: '薪酬合规、个税、社保', advantage: '南部非洲垂直深耕', highlight: '垂直深耕' },
        ],
      },
      {
        id: 'hr-outsourcing',
        label: '用工外包 / 岗位派遣',
        agencies: [
          { name: 'Employ Africa', region: '全非', phone: '+27 11 234 7000', email: 'info@employafrica.com', business: 'PEO全托管、用工关系外包', advantage: '非洲顶尖专业PEO', highlight: '顶尖PEO' },
          { name: 'Africa HR Solutions', region: '全非', phone: '+27 11 784 9000', email: 'info@africahr.com', business: '劳务外包、派遣、合规', advantage: '全非范围，一站式服务', highlight: '全非范围' },
          { name: 'Tower Group', region: '南非、南部非洲', phone: '+27 11 881 7000', email: 'info@towergroup.co.za', business: '岗位派遣、劳务外包', advantage: '资深稳定，制造业长期合作', highlight: '资深稳定' },
          { name: 'Global PEO Services', region: '全非', phone: '+1 800 822 1110', email: 'africa@globalpeo.com', business: '名义雇主、初期落地外包', advantage: '适合新进入非洲企业', highlight: '新企适配' },
          { name: 'Elite Resources', region: '尼日利亚、西非', phone: '+234 1 291 4000', email: 'info@eliteresources.com', business: '工业园劳务派遣、外包', advantage: '西非制造园区专家', highlight: '园区专家' },
        ],
      },
    ],
  },
];

const getHighlightVariant = (highlight?: string): string => {
  if (!highlight) return 'bg-secondary text-secondary-foreground border-border';
  const h = highlight.toLowerCase();
  if (h.includes('国际') || h.includes('四大') || h.includes('全球')) {
    return 'bg-primary/10 text-primary border-primary/20';
  }
  if (h.includes('第一') || h.includes('顶尖') || h.includes('最大') || h.includes('领军') || h.includes('权威') || h.includes('头部')) {
    return 'bg-info/10 text-info border-info/20';
  }
  if (h.includes('金牌') || h.includes('资深') || h.includes('专家') || h.includes('深耕') || h.includes('稳定')) {
    return 'bg-success/10 text-success border-success/20';
  }
  return 'bg-accent text-accent-foreground border-border';
};

const AgencySection: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState('law');
  const [detailOpen, setDetailOpen] = useState(false);
  const [selectedAgency, setSelectedAgency] = useState<AgencyDetail | null>(null);

  const handleOpenDetail = (agency: AgencyDetail) => {
    setSelectedAgency(agency);
    setDetailOpen(true);
  };

  return (
    <section id="agencies" className="py-16 md:py-24 scroll-mt-20">
      <div className="max-w-7xl mx-auto px-4 md:px-6">
        {/* Section Header */}
        <div className="text-center mb-12 md:mb-16">
          <h2 className="text-2xl md:text-4xl font-bold text-foreground mb-4 text-balance">
            非洲制造业合规机构推荐
          </h2>
          <p className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto text-pretty">
            覆盖南非、西非、东非、北非、法语区，按制造业场景精准匹配
          </p>
        </div>

        {/* Category Tabs */}
        <Tabs value={activeCategory} onValueChange={setActiveCategory} className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-8">
            {agencyData.map((cat) => (
              <TabsTrigger
                key={cat.id}
                value={cat.id}
                className="text-sm md:text-base flex items-center gap-2"
              >
                <cat.icon className="w-4 h-4 hidden md:inline" />
                {cat.label}
              </TabsTrigger>
            ))}
          </TabsList>

          {agencyData.map((category) => (
            <TabsContent key={category.id} value={category.id} className="mt-0">
              <div className="space-y-6">
                {category.scenes.map((scene) => (
                  <Card key={scene.id} className="shadow-card border-l-4 border-l-primary">
                    <CardContent className="p-5 md:p-6">
                      {/* Scene Header */}
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg md:text-xl font-bold text-foreground text-balance">
                          {scene.label}
                        </h3>
                        <Badge variant="secondary" className="text-xs shrink-0">
                          {scene.agencies.length} 家机构
                        </Badge>
                      </div>

                      {/* Agency List */}
                      <div className="space-y-3">
                        {scene.agencies.map((agency) => (
                          <div
                            key={agency.name}
                            className="flex items-start gap-3 p-3 md:p-4 rounded-lg bg-card border border-border hover:border-primary/30 hover:bg-primary/5 transition-all cursor-pointer group"
                            onClick={() => handleOpenDetail(agency)}
                            role="button"
                            tabIndex={0}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter' || e.key === ' ') {
                                handleOpenDetail(agency);
                              }
                            }}
                          >
                            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5 group-hover:bg-primary/20 transition-colors">
                              <Star className="w-4 h-4 text-primary" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1 flex-wrap">
                                <span className="font-semibold text-sm text-foreground group-hover:text-primary transition-colors">
                                  {agency.name}
                                </span>
                                {agency.highlight && (
                                  <Badge
                                    variant="outline"
                                    className={`text-[10px] h-5 px-1.5 ${getHighlightVariant(agency.highlight)}`}
                                  >
                                    {agency.highlight}
                                  </Badge>
                                )}
                              </div>
                              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                <MapPin className="w-3 h-3 shrink-0" />
                                <span className="truncate">{agency.region}</span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Legend */}
              <div className="mt-6 flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-sm bg-primary/10 border border-primary/20" />
                  <span>国际四大/全球网络</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-sm bg-info/10 border border-info/20" />
                  <span>行业领军/权威头部</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-sm bg-success/10 border border-success/20" />
                  <span>资深专家/垂直深耕</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-sm bg-accent border border-border" />
                  <span>区域特色/灵活适配</span>
                </div>
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </div>

      {/* Agency Detail Dialog */}
      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="max-w-[calc(100%-2rem)] md:max-w-lg max-h-[90dvh] overflow-y-auto">
          {selectedAgency && (
            <>
              <DialogHeader>
                <DialogTitle className="text-xl flex items-center gap-2">
                  <Star className="w-5 h-5 text-primary" />
                  {selectedAgency.name}
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-5 py-2">
                {/* Highlight Badge */}
                {selectedAgency.highlight && (
                  <div className="flex items-center gap-2">
                    <Badge className={`${getHighlightVariant(selectedAgency.highlight)} text-xs`}>
                      {selectedAgency.highlight}
                    </Badge>
                  </div>
                )}

                {/* Region */}
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                    <MapPin className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-0.5">覆盖区域</p>
                    <p className="text-sm font-medium text-foreground">{selectedAgency.region}</p>
                  </div>
                </div>

                {/* Phone */}
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                    <Phone className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-0.5">联系电话</p>
                    <p className="text-sm font-medium text-foreground">{selectedAgency.phone}</p>
                  </div>
                </div>

                {/* Email */}
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                    <Mail className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-0.5">联系邮箱</p>
                    <p className="text-sm font-medium text-foreground">{selectedAgency.email}</p>
                  </div>
                </div>

                {/* Business */}
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                    <Briefcase className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-0.5">主攻业务</p>
                    <p className="text-sm text-foreground text-pretty">{selectedAgency.business}</p>
                  </div>
                </div>

                {/* Advantage */}
                <div className="bg-primary/5 border border-primary/10 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                      <Target className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground mb-0.5">核心优势</p>
                      <p className="text-sm font-medium text-foreground text-pretty">{selectedAgency.advantage}</p>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </section>
  );
};

export default AgencySection;
