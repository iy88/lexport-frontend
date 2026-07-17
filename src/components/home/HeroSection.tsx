import {useEffect, useState} from 'react';
import {Button} from '@/components/ui/button';
import {ArrowRight, Sparkles} from 'lucide-react';
import api from '@/lib/api';

const labels: Record<string, string> = {
    countries: '覆盖国家（持续拓展中）',
    laws: '法规条文收录',
    scenes: '高频合规场景',
    agencies: '合作合规机构',
};

const fallback = [
    {id: 'countries', value: '6'},
    {id: 'laws', value: '19,370'},
    {id: 'scenes', value: '7'},
    {id: 'agencies', value: '50+'},
];

const HeroSection = () => {
    const [stats, setStats] = useState(fallback);

    useEffect(() => {
        api.get('/stats').then(({data}) => {
            if (data.success && data.data.stats) {
                setStats(data.data.stats);
            }
        }).catch(() => {
        });
    }, []);

    const scrollToSection = (id: string) => {
        window.location.hash = id;
    };

    return (
        <section id="hero" className="relative overflow-hidden scroll-mt-20">
            {/* Background */}
            <div
                className="absolute inset-0 bg-primary/5 pointer-events-none"/>
            <div
                className="absolute top-20 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[100px] pointer-events-none"/>
            <div className="relative max-w-7xl mx-auto px-4 md:px-6 py-20 md:py-32 lg:py-40">
                <div className="max-w-3xl mx-auto text-center">
                    {/* Badge */}
                    <div
                        className="inline-flex items-center gap-2 px-4 py-2 mb-6 rounded-full bg-primary/10 text-primary text-sm font-medium">
                        <Sparkles className="w-4 h-4"/>
                        <span>高校法学专业团队打造</span>
                    </div>

                    {/* Main Title */}
                    <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold text-foreground leading-tight mb-4 text-balance">
                        律航出海 · 法律AI智能体
                    </h1>

                    {/* Subtitle */}
                    <p className="text-lg md:text-xl lg:text-2xl text-primary font-semibold mb-6 text-balance">
                        非洲制造业法律数据整合 + 合规机构智能筛选匹配
                    </p>

                    {/* Description */}
                    <p className="text-base md:text-lg text-muted-foreground leading-relaxed mb-8 max-w-2xl mx-auto text-pretty">
                        依托高校法学专业资源，融合AI技术与权威法律数据库，为出海企业提供
                        <span className="text-foreground font-medium">低成本、可追踪、嵌入式</span>
                        全流程合规支持，高效打通非洲出海合规「最后一公里」。
                    </p>

                    {/* CTA Buttons */}
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                        <Button
                            size="lg"
                            className="w-full sm:w-auto text-base font-semibold bg-primary hover:bg-primary/90 px-8 h-12"
                            onClick={() => scrollToSection('report-section')}
                        >
                            立即体验合规初诊
                            <ArrowRight className="ml-2 w-4 h-4"/>
                        </Button>
                        <Button
                            variant="outline"
                            size="lg"
                            className="w-full sm:w-auto text-base font-semibold px-8 h-12"
                            onClick={() => scrollToSection('about')}
                        >
                            了解我们的服务
                        </Button>
                    </div>
                </div>

                {/* Stats */}
                <div className="mt-16 md:mt-24 grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 max-w-4xl mx-auto">
                    {stats.map((stat) => (
                        <div
                            key={stat.id}
                            className="text-center p-4 md:p-6 rounded-xl bg-card border border-border shadow-card"
                        >
                            <div className="text-2xl md:text-3xl font-bold text-primary mb-1">{stat.value}</div>
                            <div className="text-sm text-muted-foreground">{labels[stat.id]}</div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default HeroSection;
