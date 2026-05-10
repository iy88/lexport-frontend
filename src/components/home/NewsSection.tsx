import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Newspaper, TrendingUp, FileEdit, Calendar, ExternalLink } from 'lucide-react';

const newsItems = [
  {
    id: 1,
    type: 'cooperation',
    title: '中非合作论坛达成制造业投资新共识',
    source: '中国驻非使馆',
    date: '2026-05-08',
    summary: '中非合作论坛部长级会议就制造业投资便利化达成新共识，中国企业赴非投资将享受更优惠的关税待遇和更简化的审批流程。',
    country: '全非洲',
    tags: ['政策利好', '关税优惠'],
  },
  {
    id: 2,
    type: 'cooperation',
    title: '肯尼亚推出制造业外资税收减免计划',
    source: '肯尼亚投资局',
    date: '2026-04-22',
    summary: '肯尼亚政府发布新的制造业外资激励政策，符合条件的制造业企业可享受前5年企业所得税减免50%的优惠。',
    country: '肯尼亚',
    tags: ['税收优惠', '制造业'],
  },
  {
    id: 3,
    type: 'cooperation',
    title: '尼日利亚与中国签署双边投资保护协定更新版',
    source: '商务部',
    date: '2026-03-15',
    summary: '新版双边投资保护协定扩大了投资者保护范围，增加了争端解决机制条款，为中国制造业企业提供更强法律保障。',
    country: '尼日利亚',
    tags: ['投资保护', '双边协定'],
  },
  {
    id: 4,
    type: 'hotspot',
    title: '南非数据跨境传输合规风波：多家制造企业被罚',
    source: '合规追踪',
    date: '2026-04-30',
    summary: '南非信息监管机构对未履行数据跨境传输评估义务的企业开出罚单，涉及制造业企业需立即自查数据处理流程。',
    riskLevel: 'high',
    involvedLaws: '南非数据保护法（POPIA）',
    response: '立即注册信息官，完成数据跨境传输影响评估',
    tags: ['数据安全', '行政处罚'],
  },
  {
    id: 5,
    type: 'hotspot',
    title: '埃塞俄比亚环保新规导致多个工业项目停工',
    source: '合规追踪',
    date: '2026-03-20',
    summary: '埃塞俄比亚环境部强化环评执法，多个未取得完整环评批复的制造业项目被勒令停工整顿。',
    riskLevel: 'high',
    involvedLaws: '埃塞俄比亚环境保护法',
    response: '开工前必须完成EIA并取得正式批复文件',
    tags: ['环保合规', '项目停工'],
  },
  {
    id: 6,
    type: 'hotspot',
    title: '埃及新劳动法外籍员工配额争议',
    source: '合规追踪',
    date: '2026-02-28',
    summary: '埃及劳工部加强外籍员工配额检查，制造业企业需确保本地员工比例符合新修订的劳动法要求。',
    riskLevel: 'medium',
    involvedLaws: '埃及劳动法（2025年修订）',
    response: '调整人力资源结构，确保本地员工占比不低于60%',
    tags: ['劳工合规', '外籍员工'],
  },
  {
    id: 7,
    type: 'update',
    title: '尼日利亚增值税法实施细则修订',
    country: '尼日利亚',
    updateType: '修订',
    date: '2026-05-01',
    change: '进口原材料增值税抵扣条件放宽，企业可凭进口报关单直接抵扣',
    impact: '降低制造业进口原材料税务成本约5-8%',
    advice: '及时更新税务申报流程，确保合规享受新抵扣政策',
  },
  {
    id: 8,
    type: 'update',
    title: '肯尼亚新增产品强制认证目录',
    country: '肯尼亚',
    updateType: '新增',
    date: '2026-04-10',
    change: '12类工业制成品纳入KEBS强制认证范围，未认证产品禁止销售',
    impact: '出口肯尼亚的制造业企业需额外申请产品认证',
    advice: '核查产品是否在新增目录内，提前3个月启动认证申请',
  },
  {
    id: 9,
    type: 'update',
    title: '南非废止旧版工业产权法',
    country: '南非',
    updateType: '废止',
    date: '2026-03-01',
    change: '2010年版工业产权法正式废止，统一适用新版知识产权法',
    impact: '专利申请和知识产权保护程序发生变更',
    advice: '已在旧法下申请的专利需在新法框架下补充材料',
  },
];

const NewsSection: React.FC = () => {
  const [activeTab, setActiveTab] = useState('cooperation');

  const getUpdateTypeBadge = (type: string) => {
    switch (type) {
      case '修订':
        return <Badge className="bg-info text-info-foreground text-xs hover:bg-info">修订</Badge>;
      case '新增':
        return <Badge className="bg-success text-success-foreground text-xs hover:bg-success">新增</Badge>;
      case '废止':
        return <Badge variant="destructive" className="text-xs">废止</Badge>;
      default:
        return null;
    }
  };

  const filteredNews = newsItems.filter((n) => n.type === activeTab);

  return (
    <section id="news" className="py-16 md:py-24 bg-secondary/30">
      <div className="max-w-7xl mx-auto px-4 md:px-6">
        {/* Section Header */}
        <div className="text-center mb-12 md:mb-16">
          <h2 className="text-2xl md:text-4xl font-bold text-foreground mb-4 text-balance">
            非洲合规动态资讯库
          </h2>
          <p className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto text-pretty">
            实时更新中非合作政策、法规修订动态与行业合规热点，让你随时掌握出海环境变化。
          </p>
        </div>

        {/* Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 mb-12">
          <Card className="h-full flex flex-col shadow-card hover:shadow-hover transition-shadow">
            <CardHeader className="pb-4">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-3">
                <Newspaper className="w-5 h-5 text-primary" />
              </div>
              <CardTitle className="text-lg">中非合作新闻</CardTitle>
            </CardHeader>
            <CardContent className="flex-1">
              <p className="text-sm text-muted-foreground leading-relaxed text-pretty">
                收录中非合作论坛、中国驻非使馆公告、主流财经媒体发布的制造业投资政策与合作动态。按国家、行业、政策类型分类，快速找到对你有用的投资机遇与政策支持信息。
              </p>
            </CardContent>
          </Card>

          <Card className="h-full flex flex-col shadow-card hover:shadow-hover transition-shadow">
            <CardHeader className="pb-4">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-3">
                <TrendingUp className="w-5 h-5 text-primary" />
              </div>
              <CardTitle className="text-lg">合规热点追踪</CardTitle>
            </CardHeader>
            <CardContent className="flex-1">
              <p className="text-sm text-muted-foreground leading-relaxed text-pretty">
                基于行业热议度识别热点事件，人工核实真实性与相关性，提炼事件背景、涉事法规与企业应对案例。生成「热点合规风险提示」，帮你快速了解行业共性风险与应对思路。
              </p>
            </CardContent>
          </Card>

          <Card className="h-full flex flex-col shadow-card hover:shadow-hover transition-shadow">
            <CardHeader className="pb-4">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-3">
                <FileEdit className="w-5 h-5 text-primary" />
              </div>
              <CardTitle className="text-lg">法规更新动态</CardTitle>
            </CardHeader>
            <CardContent className="flex-1">
              <p className="text-sm text-muted-foreground leading-relaxed text-pretty">
                由非洲本地成员实时搜集各国法规修订信息，捕捉"修订/新增/废止"关键词。用统一模板呈现更新内容：法规名称+核心更新点+对制造业企业的影响+合规建议，一目了然。
              </p>
            </CardContent>
          </Card>
        </div>

        {/* News Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-8">
            <TabsTrigger value="cooperation" className="text-sm md:text-base">
              <Newspaper className="w-4 h-4 mr-2 hidden md:inline" />
              中非合作新闻
            </TabsTrigger>
            <TabsTrigger value="hotspot" className="text-sm md:text-base">
              <TrendingUp className="w-4 h-4 mr-2 hidden md:inline" />
              合规热点追踪
            </TabsTrigger>
            <TabsTrigger value="update" className="text-sm md:text-base">
              <FileEdit className="w-4 h-4 mr-2 hidden md:inline" />
              法规更新动态
            </TabsTrigger>
          </TabsList>

          <TabsContent value="cooperation" className="mt-0">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredNews.map((item) => (
                <Card key={item.id} className="shadow-card hover:shadow-hover transition-shadow h-full flex flex-col">
                  <CardContent className="p-5 flex flex-col h-full">
                    <div className="flex items-center gap-2 mb-3 flex-wrap">
                      <Badge variant="secondary" className="text-xs">{item.country}</Badge>
                      {item.tags?.map((tag) => (
                        <Badge key={tag} variant="outline" className="text-xs">{tag}</Badge>
                      ))}
                    </div>
                    <h4 className="font-semibold text-foreground text-base mb-2 text-balance">{item.title}</h4>
                    <p className="text-sm text-muted-foreground mb-4 flex-1 text-pretty">{item.summary}</p>
                    <div className="flex items-center justify-between text-xs text-muted-foreground mt-auto">
                      <span>{item.source}</span>
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {item.date}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="hotspot" className="mt-0">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredNews.map((item) => (
                <Card key={item.id} className="shadow-card hover:shadow-hover transition-shadow h-full flex flex-col">
                  <CardContent className="p-5 flex flex-col h-full">
                    <div className="flex items-center gap-2 mb-3">
                      {item.riskLevel === 'high' ? (
                        <Badge variant="destructive" className="text-xs">高风险</Badge>
                      ) : (
                        <Badge className="bg-warning text-warning-foreground text-xs hover:bg-warning">中风险</Badge>
                      )}
                      {item.tags?.map((tag) => (
                        <Badge key={tag} variant="outline" className="text-xs">{tag}</Badge>
                      ))}
                    </div>
                    <h4 className="font-semibold text-foreground text-base mb-2 text-balance">{item.title}</h4>
                    <p className="text-sm text-muted-foreground mb-3 text-pretty">{item.summary}</p>
                    <div className="space-y-2 text-xs bg-secondary/50 rounded-lg p-3 mb-3">
                      <div className="flex gap-2">
                        <span className="font-medium text-foreground shrink-0">涉事法规：</span>
                        <span className="text-muted-foreground">{item.involvedLaws}</span>
                      </div>
                      <div className="flex gap-2">
                        <span className="font-medium text-foreground shrink-0">应对建议：</span>
                        <span className="text-muted-foreground">{item.response}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground mt-auto">
                      <Calendar className="w-3 h-3" />
                      {item.date}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="update" className="mt-0">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredNews.map((item) => (
                <Card key={item.id} className="shadow-card hover:shadow-hover transition-shadow h-full flex flex-col">
                  <CardContent className="p-5 flex flex-col h-full">
                    <div className="flex items-center gap-2 mb-3">
                      {getUpdateTypeBadge(item.updateType || '')}
                      <Badge variant="secondary" className="text-xs">{item.country}</Badge>
                    </div>
                    <h4 className="font-semibold text-foreground text-base mb-3 text-balance">{item.title}</h4>
                    <div className="space-y-2 text-sm flex-1">
                      <div className="flex gap-2">
                        <span className="font-medium text-foreground shrink-0">核心更新：</span>
                        <span className="text-muted-foreground text-pretty">{item.change}</span>
                      </div>
                      <div className="flex gap-2">
                        <span className="font-medium text-foreground shrink-0">对企业影响：</span>
                        <span className="text-muted-foreground text-pretty">{item.impact}</span>
                      </div>
                      <div className="flex gap-2">
                        <span className="font-medium text-foreground shrink-0">合规建议：</span>
                        <span className="text-muted-foreground text-pretty">{item.advice}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground mt-4">
                      <Calendar className="w-3 h-3" />
                      {item.date}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </section>
  );
};

export default NewsSection;
