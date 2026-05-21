import {Link} from 'react-router-dom';
import {Card, CardContent, CardHeader, CardTitle} from '@/components/ui/card';
import {Button} from '@/components/ui/button';
import {ArrowRight, FileText, Tag} from 'lucide-react';

const LawSection = () => {
    return (
        <section id="laws" className="py-16 md:py-24 scroll-mt-20">
            <div className="max-w-7xl mx-auto px-4 md:px-6">
                <div className="text-center mb-12 md:mb-16">
                    <h2 className="text-2xl md:text-4xl font-bold text-foreground mb-4 text-balance">
                        非洲制造业合规法规库
                    </h2>
                    <p className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto text-pretty">
                        聚焦非洲重点制造业国家，提供结构化、可检索、带场景标注的法律原文，帮你快速定位合规要点，避免踩坑。
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 mb-10 max-w-4xl mx-auto">
                    <Card className="h-full flex flex-col shadow-card">
                        <CardHeader className="pb-4">
                            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-3">
                                <FileText className="w-5 h-5 text-primary"/>
                            </div>
                            <CardTitle className="text-lg">人工标注+法规整合</CardTitle>
                        </CardHeader>
                        <CardContent className="flex-1">
                            <p className="text-sm text-muted-foreground leading-relaxed text-pretty">
                                基于非洲本地权威数据库，结合执业律师人工标注，收录制造业高频法规与判例。标注信息含：适用场景、效力层级、处罚条款、生效/修订时间，一眼看懂关键风险。
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="h-full flex flex-col shadow-card">
                        <CardHeader className="pb-4">
                            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-3">
                                <Tag className="w-5 h-5 text-primary"/>
                            </div>
                            <CardTitle className="text-lg">制造业高频场景分类</CardTitle>
                        </CardHeader>
                        <CardContent className="flex-1">
                            <p className="text-sm text-muted-foreground leading-relaxed text-pretty">
                                覆盖海关进出口、劳工雇佣、数据安全、环保合规、税务、产品认证、知识产权七大场景。按场景标签快速筛选，一键获取对应国家的核心合规要求与高频风险清单。
                            </p>
                        </CardContent>
                    </Card>
                </div>

                <div className="text-center">
                    <Link to="/laws">
                        <Button size="lg" className="text-base font-semibold px-8 h-12">
                            查看全部法规
                            <ArrowRight className="ml-2 w-4 h-4"/>
                        </Button>
                    </Link>
                </div>
            </div>
        </section>
    );
};

export default LawSection;
