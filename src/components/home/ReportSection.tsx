import React from 'react';
import { FileText, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

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
  return (
    <section id="report-section" className="py-16 md:py-24 scroll-mt-20">
      <div className="max-w-7xl mx-auto px-4 md:px-6">
        <div className="text-center mb-12 md:mb-16">
          <h2 className="text-2xl md:text-4xl font-bold text-foreground mb-4 text-balance">
            合规报告示例
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto text-pretty">
            基于 AI 大模型深度分析及全球实时法务数据库，自动生成非洲市场准入与经营合规评估报告，为企业出海决策提供专业参考。
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {features.map((f, i) => (
            <Card key={i} className="border-none shadow-card">
              <CardContent className="p-6 text-center">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <FileText className="w-5 h-5 text-primary" />
                </div>
                <h3 className="font-semibold text-foreground mb-2">{f.title}</h3>
                <p className="text-sm text-muted-foreground text-pretty">{f.desc}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center">
          <a href="/report" target="_blank" rel="noopener noreferrer">
            <Button size="lg" className="text-base font-semibold px-8 h-12">
              查看合规报告示例
              <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
          </a>
        </div>
      </div>
    </section>
  );
};

export default ReportSection;
