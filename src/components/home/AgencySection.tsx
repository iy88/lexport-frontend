import {Link} from 'react-router-dom';
import {Card, CardContent, CardHeader, CardTitle} from '@/components/ui/card';
import {Button} from '@/components/ui/button';
import {ArrowRight, Calculator, Scale, Users} from 'lucide-react';

const AgencySection = () => {
    return (
        <section id="agencies" className="py-16 md:py-24 scroll-mt-20">
            <div className="max-w-7xl mx-auto px-4 md:px-6">
                <div className="text-center mb-12 md:mb-16">
                    <h2 className="text-2xl md:text-4xl font-bold text-foreground mb-4 text-balance">
                        非洲制造业合规机构推荐
                    </h2>
                    <p className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto text-pretty">
                        覆盖南非、西非、东非、北非、法语区，按制造业场景精准匹配
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 mb-10">
                    <Card className="h-full flex flex-col shadow-card">
                        <CardHeader className="pb-4">
                            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-3">
                                <Scale className="w-5 h-5 text-primary"/>
                            </div>
                            <CardTitle className="text-lg">律师事务所</CardTitle>
                        </CardHeader>
                        <CardContent className="flex-1">
                            <p className="text-sm text-muted-foreground leading-relaxed text-pretty">
                                覆盖投资设立、劳工合规、海关贸易、税务筹划、环保安全等制造业全场景，精选非洲本地及国际顶尖律所。
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="h-full flex flex-col shadow-card">
                        <CardHeader className="pb-4">
                            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-3">
                                <Calculator className="w-5 h-5 text-primary"/>
                            </div>
                            <CardTitle className="text-lg">会计师事务所</CardTitle>
                        </CardHeader>
                        <CardContent className="flex-1">
                            <p className="text-sm text-muted-foreground leading-relaxed text-pretty">
                                涵盖财务审计、税务筹划、跨境财税、成本核算四大领域，从国际四大到区域专家，满足不同规模企业需求。
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="h-full flex flex-col shadow-card">
                        <CardHeader className="pb-4">
                            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-3">
                                <Users className="w-5 h-5 text-primary"/>
                            </div>
                            <CardTitle className="text-lg">人力资源机构</CardTitle>
                        </CardHeader>
                        <CardContent className="flex-1">
                            <p className="text-sm text-muted-foreground leading-relaxed text-pretty">
                                从普工招聘、技术人才猎聘到薪酬外包、用工派遣，一站式解决制造业出海的人力资源合规需求。
                            </p>
                        </CardContent>
                    </Card>
                </div>

                <div className="text-center">
                    <Link to="/agencies">
                        <Button size="lg" className="text-base font-semibold px-8 h-12">
                            查看全部机构
                            <ArrowRight className="ml-2 w-4 h-4"/>
                        </Button>
                    </Link>
                </div>
            </div>
        </section>
    );
};

export default AgencySection;
