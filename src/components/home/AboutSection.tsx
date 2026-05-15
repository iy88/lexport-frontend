import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Target, Shield, Zap, BookOpen } from 'lucide-react';

const values = [
  {
    icon: BookOpen,
    title: '权威数据',
    desc: '整合非洲本地权威法律数据库与执业律师专业标注，确保信息准确可靠。',
  },
  {
    icon: Zap,
    title: 'AI赋能',
    desc: '运用AI技术实现法规智能匹配、风险自动识别和初诊报告自动生成。',
  },
  {
    icon: Shield,
    title: '全程合规',
    desc: '覆盖出海前、运营中、纠纷后全流程，提供嵌入式合规支持服务。',
  },
  {
    icon: Target,
    title: '精准匹配',
    desc: '根据企业规模、业务场景和预算，精准匹配合规要求与服务机构。',
  },
];

const AboutSection: React.FC = () => {
  return (
    <section id="about" className="py-16 md:py-24 bg-secondary/30 scroll-mt-20">
      <div className="max-w-7xl mx-auto px-4 md:px-6">
        {/* Section Header */}
        <div className="text-center mb-12 md:mb-16">
          <h2 className="text-2xl md:text-4xl font-bold text-foreground mb-4 text-balance">
            关于律航出海
          </h2>
        </div>

        {/* About Content */}
        <div className="max-w-3xl mx-auto mb-16">
          <Card className="shadow-card">
            <CardContent className="p-6 md:p-10">
              <p className="text-base md:text-lg text-foreground leading-relaxed text-pretty">
                律航出海是由高校法学专业团队打造的法律AI智能体，聚焦非洲制造业出海企业的合规痛点，通过整合权威法律数据库、AI技术与本地合规资源，提供
                <span className="font-semibold text-primary">低成本、可追踪、嵌入式</span>
                的合规支持服务。
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Value Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {values.map((value, index) => (
            <Card key={index} className="shadow-card hover:shadow-hover transition-shadow h-full flex flex-col">
              <CardContent className="p-5 flex flex-col h-full">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <value.icon className="w-5 h-5 text-primary" />
                </div>
                <h3 className="font-semibold text-foreground mb-2">{value.title}</h3>
                <p className="text-sm text-muted-foreground flex-1 text-pretty">{value.desc}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default AboutSection;
