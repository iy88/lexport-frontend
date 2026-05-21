import {Link} from 'react-router-dom';
import {Card, CardContent, CardHeader, CardTitle} from '@/components/ui/card';
import {Button} from '@/components/ui/button';
import {ArrowRight, FileEdit, Newspaper, TrendingUp} from 'lucide-react';

const NewsSection = () => {
    return (
        <section id="news" className="py-16 md:py-24 bg-secondary/30 scroll-mt-20">
            <div className="max-w-7xl mx-auto px-4 md:px-6">
                <div className="text-center mb-12 md:mb-16">
                    <h2 className="text-2xl md:text-4xl font-bold text-foreground mb-4 text-balance">
                        非洲合规动态资讯库
                    </h2>
                    <p className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto text-pretty">
                        实时更新中非合作政策、法规修订动态与行业合规热点，让你随时掌握出海环境变化。
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 mb-10">
                    <Card className="h-full flex flex-col shadow-card">
                        <CardHeader className="pb-4">
                            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-3">
                                <Newspaper className="w-5 h-5 text-primary"/>
                            </div>
                            <CardTitle className="text-lg">中非合作新闻</CardTitle>
                        </CardHeader>
                        <CardContent className="flex-1">
                            <p className="text-sm text-muted-foreground leading-relaxed text-pretty">
                                收录中非合作论坛、中国驻非使馆公告、主流财经媒体发布的制造业投资政策与合作动态。按国家、行业、政策类型分类，快速找到对你有用的投资机遇与政策支持信息。
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="h-full flex flex-col shadow-card">
                        <CardHeader className="pb-4">
                            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-3">
                                <TrendingUp className="w-5 h-5 text-primary"/>
                            </div>
                            <CardTitle className="text-lg">合规热点追踪</CardTitle>
                        </CardHeader>
                        <CardContent className="flex-1">
                            <p className="text-sm text-muted-foreground leading-relaxed text-pretty">
                                基于行业热议度识别热点事件，人工核实真实性与相关性，提炼事件背景、涉事法规与企业应对案例。生成「热点合规风险提示」，帮你快速了解行业共性风险。
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="h-full flex flex-col shadow-card">
                        <CardHeader className="pb-4">
                            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-3">
                                <FileEdit className="w-5 h-5 text-primary"/>
                            </div>
                            <CardTitle className="text-lg">法规更新动态</CardTitle>
                        </CardHeader>
                        <CardContent className="flex-1">
                            <p className="text-sm text-muted-foreground leading-relaxed text-pretty">
                                由非洲本地成员实时搜集各国法规修订信息，捕捉"修订/新增/废止"关键词。用统一模板呈现更新内容，一目了然。
                            </p>
                        </CardContent>
                    </Card>
                </div>

                <div className="text-center">
                    <Link to="/news">
                        <Button size="lg" className="text-base font-semibold px-8 h-12">
                            查看全部资讯
                            <ArrowRight className="ml-2 w-4 h-4"/>
                        </Button>
                    </Link>
                </div>
            </div>
        </section>
    );
};

export default NewsSection;
