import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  FileText,
  Tag,
  Stethoscope,
  Shield,
  Search,
  Gavel,
  AlertTriangle,
  CheckCircle,
  ChevronRight,
} from 'lucide-react';

const scenes = [
  { id: 'customs', label: '海关进出口', icon: FileText },
  { id: 'labor', label: '劳工雇佣', icon: Shield },
  { id: 'data', label: '数据安全', icon: Search },
  { id: 'env', label: '环保合规', icon: CheckCircle },
  { id: 'tax', label: '税务', icon: Gavel },
  { id: 'cert', label: '产品认证', icon: Tag },
  { id: 'ip', label: '知识产权', icon: FileText },
];

const demoLaws = [
  {
    id: 1,
    title: '尼日利亚海关管理法（修订版）',
    country: '尼日利亚',
    scene: 'customs',
    level: '国家级',
    penalty: '货物扣押 + 罚款20-50%货值',
    date: '2024-01-15',
    risk: 'high',
    summary: '制造业进口原材料需提前30天备案，未备案货物将被扣押并处以货值20-50%的罚款。',
  },
  {
    id: 2,
    title: '肯尼亚劳工法典（2023年修订）',
    country: '肯尼亚',
    scene: 'labor',
    level: '国家级',
    penalty: '每项违规最高罚款50万肯尼亚先令',
    date: '2023-11-20',
    risk: 'high',
    summary: '外籍员工与本地员工比例不得低于1:4，加班工资为正常工资的1.5倍。',
  },
  {
    id: 3,
    title: '南非数据保护法（POPIA）',
    country: '南非',
    scene: 'data',
    level: '国家级',
    penalty: '最高罚款1000万南非兰特或营业额10%',
    date: '2021-07-01',
    risk: 'medium',
    summary: '处理个人数据的企业须注册信息官，数据跨境传输须通过合规评估。',
  },
  {
    id: 4,
    title: '埃塞俄比亚环境保护法',
    country: '埃塞俄比亚',
    scene: 'env',
    level: '国家级',
    penalty: '项目暂停 + 环境修复费用',
    date: '2022-06-10',
    risk: 'high',
    summary: '制造业项目须通过环境影响评估（EIA），未取得环评批复不得开工。',
  },
  {
    id: 5,
    title: '埃及增值税法实施细则',
    country: '埃及',
    scene: 'tax',
    level: '部门规章',
    penalty: '滞纳金每日0.5%，最高不超过本金',
    date: '2024-03-01',
    risk: 'medium',
    summary: '标准增值税率14%，出口适用零税率，须保留完整税务凭证至少5年。',
  },
  {
    id: 6,
    title: '坦桑尼亚产品认证标准（TBS）',
    country: '坦桑尼亚',
    scene: 'cert',
    level: '国家标准',
    penalty: '产品下架 + 销毁不合格批次',
    date: '2023-09-15',
    risk: 'medium',
    summary: '进口工业产品须取得TBS认证标志，每批次须附合格检验报告。',
  },
];

const countries = ['尼日利亚', '肯尼亚', '南非', '埃塞俄比亚', '埃及', '坦桑尼亚', '加纳', '乌干达'];
const companySizes = ['微型企业（<10人）', '小型企业（10-50人）', '中型企业（50-200人）', '大型企业（>200人）'];
const budgetRanges = ['< 10万元', '10-50万元', '50-200万元', '> 200万元'];

const LawSection: React.FC = () => {
  const [activeScene, setActiveScene] = useState<string | null>(null);
  const [diagnoseOpen, setDiagnoseOpen] = useState(false);
  const [diagnoseResult, setDiagnoseResult] = useState<typeof demoLaws>([]);
  const [formData, setFormData] = useState({
    country: '',
    size: '',
    scenes: [] as string[],
    budget: '',
  });

  const filteredLaws = activeScene
    ? demoLaws.filter((l) => l.scene === activeScene)
    : demoLaws;

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
    if (formData.country) {
      results = results.filter((l) => l.country === formData.country);
    }
    if (formData.scenes.length > 0) {
      results = results.filter((l) => formData.scenes.includes(l.scene));
    }
    setDiagnoseResult(results);
  };

  const getRiskBadge = (risk: string) => {
    if (risk === 'high')
      return <Badge variant="destructive" className="text-xs">高风险</Badge>;
    if (risk === 'medium')
      return <Badge className="bg-warning text-warning-foreground text-xs hover:bg-warning">中风险</Badge>;
    return <Badge className="bg-success text-success-foreground text-xs hover:bg-success">低风险</Badge>;
  };

  return (
    <section id="laws" className="py-16 md:py-24">
      <div className="max-w-7xl mx-auto px-4 md:px-6">
        {/* Section Header */}
        <div className="text-center mb-12 md:mb-16">
          <h2 className="text-2xl md:text-4xl font-bold text-foreground mb-4 text-balance">
            非洲制造业合规法规库
          </h2>
          <p className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto text-pretty">
            聚焦非洲重点制造业国家，提供结构化、可检索、带场景标注的法律原文，帮你快速定位合规要点，避免踩坑。
          </p>
        </div>

        {/* Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 mb-16">
          <Card className="h-full flex flex-col shadow-card hover:shadow-hover transition-shadow">
            <CardHeader className="pb-4">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-3">
                <FileText className="w-5 h-5 text-primary" />
              </div>
              <CardTitle className="text-lg">人工标注+法规整合</CardTitle>
            </CardHeader>
            <CardContent className="flex-1">
              <p className="text-sm text-muted-foreground leading-relaxed text-pretty">
                基于非洲本地权威数据库，结合执业律师人工标注，收录制造业高频法规与判例。标注信息含：适用场景、效力层级、处罚条款、生效/修订时间，一眼看懂关键风险。
              </p>
            </CardContent>
          </Card>

          <Card className="h-full flex flex-col shadow-card hover:shadow-hover transition-shadow">
            <CardHeader className="pb-4">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-3">
                <Tag className="w-5 h-5 text-primary" />
              </div>
              <CardTitle className="text-lg">制造业高频场景分类</CardTitle>
            </CardHeader>
            <CardContent className="flex-1">
              <p className="text-sm text-muted-foreground leading-relaxed text-pretty">
                覆盖海关进出口、劳工雇佣、数据安全、环保合规、税务、产品认证、知识产权七大场景。按场景标签快速筛选，一键获取对应国家的核心合规要求与高频风险清单。
              </p>
            </CardContent>
          </Card>

          <Card className="h-full flex flex-col shadow-card hover:shadow-hover transition-shadow">
            <CardHeader className="pb-4">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-3">
                <Stethoscope className="w-5 h-5 text-primary" />
              </div>
              <CardTitle className="text-lg">合规初诊工具</CardTitle>
            </CardHeader>
            <CardContent className="flex-1">
              <p className="text-sm text-muted-foreground leading-relaxed text-pretty">
                输入目的国、企业规模、业务场景、预算区间，系统自动匹配法规要点，生成定制化合规初诊报告，附法规原文链接与高风险提示。
              </p>
              <Button
                className="mt-4 w-full bg-primary hover:bg-primary/90"
                onClick={() => {
                  setDiagnoseOpen(true);
                  setDiagnoseResult([]);
                  setFormData({ country: '', size: '', scenes: [], budget: '' });
                }}
              >
                <Stethoscope className="w-4 h-4 mr-2" />
                立即体验合规初诊
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Scene Filter */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold mb-4">按场景筛选法规</h3>
          <div className="flex flex-wrap gap-2">
            <Button
              variant={activeScene === null ? 'default' : 'outline'}
              size="sm"
              className={activeScene === null ? 'bg-primary' : ''}
              onClick={() => setActiveScene(null)}
            >
              全部
            </Button>
            {scenes.map((scene) => (
              <Button
                key={scene.id}
                variant={activeScene === scene.id ? 'default' : 'outline'}
                size="sm"
                className={activeScene === scene.id ? 'bg-primary' : ''}
                onClick={() => setActiveScene(scene.id)}
              >
                <scene.icon className="w-3.5 h-3.5 mr-1.5" />
                {scene.label}
              </Button>
            ))}
          </div>
        </div>

        {/* Law List */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredLaws.map((law) => (
            <Card key={law.id} className="shadow-card hover:shadow-hover transition-shadow">
              <CardContent className="p-5">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-foreground text-base mb-1 truncate">{law.title}</h4>
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge variant="secondary" className="text-xs">{law.country}</Badge>
                      <Badge variant="outline" className="text-xs">{law.level}</Badge>
                      {getRiskBadge(law.risk)}
                    </div>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground mb-3 text-pretty">{law.summary}</p>
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    <span>处罚：{law.penalty}</span>
                  </div>
                  <span>{law.date}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Diagnose Dialog */}
      <Dialog open={diagnoseOpen} onOpenChange={setDiagnoseOpen}>
        <DialogContent className="max-w-[calc(100%-2rem)] md:max-w-lg max-h-[90dvh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl">合规初诊工具</DialogTitle>
          </DialogHeader>

          {diagnoseResult.length === 0 ? (
            <div className="space-y-5 py-2">
              <div>
                <Label className="text-sm font-medium mb-2 block">目的国</Label>
                <Select
                  value={formData.country}
                  onValueChange={(v) => setFormData((p) => ({ ...p, country: v }))}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="选择目的国" />
                  </SelectTrigger>
                  <SelectContent>
                    {countries.map((c) => (
                      <SelectItem key={c} value={c}>{c}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-sm font-medium mb-2 block">企业规模</Label>
                <Select
                  value={formData.size}
                  onValueChange={(v) => setFormData((p) => ({ ...p, size: v }))}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="选择企业规模" />
                  </SelectTrigger>
                  <SelectContent>
                    {companySizes.map((s) => (
                      <SelectItem key={s} value={s}>{s}</SelectItem>
                    ))}
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
                      className={formData.scenes.includes(scene.id) ? 'bg-primary' : ''}
                      onClick={() => handleSceneToggle(scene.id)}
                    >
                      {scene.label}
                    </Button>
                  ))}
                </div>
              </div>

              <div>
                <Label className="text-sm font-medium mb-2 block">预算区间</Label>
                <Select
                  value={formData.budget}
                  onValueChange={(v) => setFormData((p) => ({ ...p, budget: v }))}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="选择预算区间" />
                  </SelectTrigger>
                  <SelectContent>
                    {budgetRanges.map((b) => (
                      <SelectItem key={b} value={b}>{b}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Button
                className="w-full bg-primary hover:bg-primary/90 h-11"
                onClick={handleDiagnose}
                disabled={!formData.country || formData.scenes.length === 0}
              >
                <Stethoscope className="w-4 h-4 mr-2" />
                生成合规初诊报告
              </Button>
            </div>
          ) : (
            <div className="space-y-4 py-2">
              <div className="flex items-center gap-2 p-3 bg-primary/5 rounded-lg">
                <CheckCircle className="w-5 h-5 text-primary shrink-0" />
                <p className="text-sm text-foreground">
                  已为 <span className="font-semibold">{formData.country}</span> 匹配到{' '}
                  <span className="font-semibold">{diagnoseResult.length}</span> 条相关法规
                </p>
              </div>

              {diagnoseResult.map((law) => (
                <Card key={law.id} className="border-l-4 border-l-primary">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className="font-semibold text-sm">{law.title}</h4>
                      {getRiskBadge(law.risk)}
                    </div>
                    <p className="text-xs text-muted-foreground mb-2 text-pretty">{law.summary}</p>
                    <div className="text-xs text-muted-foreground">
                      <span className="font-medium">处罚：</span>{law.penalty}
                    </div>
                  </CardContent>
                </Card>
              ))}

              <Button
                variant="outline"
                className="w-full"
                onClick={() => {
                  setDiagnoseResult([]);
                  setFormData({ country: '', size: '', scenes: [], budget: '' });
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

export default LawSection;
