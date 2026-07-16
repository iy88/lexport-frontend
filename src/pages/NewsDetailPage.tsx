import {useEffect, useState} from 'react';
import {useParams, Link} from 'react-router-dom';
import {ArrowLeft, Calendar, Globe, Loader2, Tag} from 'lucide-react';
import {Button} from '@/components/ui/button';
import {Badge} from '@/components/ui/badge';
import {Card, CardContent} from '@/components/ui/card';
import api from '@/lib/api';

interface NewsDetail {
    id: number;
    type: string;
    title: string;
    source: string | null;
    country_id: string | null;
    date: string;
    summary: string | null;
    risk_level: string | null;
    involved_laws: string | null;
    response: string | null;
    update_type: string | null;
    change_desc: string | null;
    impact: string | null;
    advice: string | null;
    content: string | null;
    tags: { id: number; name_zh: string }[];
    created_at: string;
}

const typeLabels: Record<string, string> = {
    cooperation: '中非合作',
    hotspot: '合规热点',
    update: '法规更新',
};

const riskLabels: Record<string, { text: string; variant: 'default' | 'destructive' | 'secondary' }> = {
    high: {text: '高风险', variant: 'destructive'},
    medium: {text: '中风险', variant: 'default'},
    low: {text: '低风险', variant: 'secondary'},
};

export default function NewsDetailPage() {
    const {id} = useParams<{ id: string }>();
    const [news, setNews] = useState<NewsDetail | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!id) return;
        setLoading(true);
        api.get(`/news/${id}`).then(({data}) => {
            if (data.success) setNews(data.data);
        }).finally(() => setLoading(false));
    }, [id]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-primary animate-spin"/>
            </div>
        );
    }

    if (!news) {
        return (
            <div className="max-w-3xl mx-auto px-4 py-20 text-center">
                <p className="text-muted-foreground mb-4">资讯不存在或已删除</p>
                <Button variant="outline" asChild>
                    <Link to="/news">返回资讯列表</Link>
                </Button>
            </div>
        );
    }

    return (
        <div className="max-w-3xl mx-auto px-4 md:px-6 py-8 md:py-12">
            {/* Back */}
            <Button variant="ghost" className="mb-6 -ml-3" asChild>
                <Link to="/news">
                    <ArrowLeft className="w-4 h-4 mr-2"/>
                    返回资讯列表
                </Link>
            </Button>

            {/* Header */}
            <div className="mb-6">
                <div className="flex items-center gap-2 flex-wrap mb-3">
                    <Badge variant="outline" className="text-xs">
                        {typeLabels[news.type] ?? news.type}
                    </Badge>
                    {news.country_id && (
                        <Badge variant="secondary" className="text-xs gap-1">
                            <Globe className="w-3 h-3"/>{news.country_id}
                        </Badge>
                    )}
                    {news.risk_level && (
                        <Badge variant={riskLabels[news.risk_level]?.variant ?? 'secondary'} className="text-xs">
                            {riskLabels[news.risk_level]?.text ?? news.risk_level}
                        </Badge>
                    )}
                </div>
                <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-3">{news.title}</h1>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    {news.source && <span>来源：{news.source}</span>}
                    <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5"/>
                        {news.date}
                    </span>
                </div>
            </div>

            {/* Tags */}
            {news.tags.length > 0 && (
                <div className="flex items-center gap-2 mb-6">
                    <Tag className="w-4 h-4 text-muted-foreground"/>
                    {news.tags.map((t) => (
                        <Badge key={t.id} variant="secondary" className="text-xs">{t.name_zh}</Badge>
                    ))}
                </div>
            )}

            {/* Summary */}
            {news.summary && (
                <Card className="mb-6 bg-muted/30">
                    <CardContent className="p-4">
                        <p className="text-sm text-muted-foreground leading-relaxed">{news.summary}</p>
                    </CardContent>
                </Card>
            )}

            {/* Type-specific fields */}
            {news.type === 'hotspot' && (
                <div className="space-y-4 mb-6">
                    {news.involved_laws && (
                        <div>
                            <h3 className="text-sm font-semibold text-foreground mb-1">涉事法规</h3>
                            <p className="text-sm text-muted-foreground">{news.involved_laws}</p>
                        </div>
                    )}
                    {news.response && (
                        <div>
                            <h3 className="text-sm font-semibold text-foreground mb-1">应对建议</h3>
                            <p className="text-sm text-muted-foreground">{news.response}</p>
                        </div>
                    )}
                </div>
            )}

            {news.type === 'update' && (
                <div className="space-y-4 mb-6">
                    {news.update_type && (
                        <div>
                            <h3 className="text-sm font-semibold text-foreground mb-1">更新类型</h3>
                            <Badge variant="outline">{news.update_type}</Badge>
                        </div>
                    )}
                    {news.change_desc && (
                        <div>
                            <h3 className="text-sm font-semibold text-foreground mb-1">核心变更</h3>
                            <p className="text-sm text-muted-foreground">{news.change_desc}</p>
                        </div>
                    )}
                    {news.impact && (
                        <div>
                            <h3 className="text-sm font-semibold text-foreground mb-1">对企业影响</h3>
                            <p className="text-sm text-muted-foreground">{news.impact}</p>
                        </div>
                    )}
                    {news.advice && (
                        <div>
                            <h3 className="text-sm font-semibold text-foreground mb-1">合规建议</h3>
                            <p className="text-sm text-muted-foreground">{news.advice}</p>
                        </div>
                    )}
                </div>
            )}

            {/* Body Content */}
            {news.content && (
                <div className="border-t border-border pt-6 mt-6">
                    <article className="prose prose-slate max-w-none dark:prose-invert">
                        <div dangerouslySetInnerHTML={{__html: news.content}}/>
                    </article>
                </div>
            )}
        </div>
    );
}
