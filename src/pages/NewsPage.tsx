import {useCallback, useEffect, useRef, useState} from 'react';
import {Card, CardContent} from '@/components/ui/card';
import {Badge} from '@/components/ui/badge';
import {Tabs, TabsContent, TabsList, TabsTrigger} from '@/components/ui/tabs';
import {Button} from '@/components/ui/button';
import {Input} from '@/components/ui/input';
import api from '@/lib/api';
import {Calendar, ChevronLeft, ChevronRight, FileEdit, Loader2, Newspaper, Search, TrendingUp,} from 'lucide-react';

const PAGE_SIZE = 6;
const typeIcons: Record<string, React.ElementType> = {cooperation: Newspaper, hotspot: TrendingUp, update: FileEdit};

interface NewsItem {
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
    tags: { id: number; name_zh: string }[];
}

export default function NewsPage() {
    const [news, setNews] = useState<NewsItem[]>([]);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(true);
    const [activeType, setActiveType] = useState('cooperation');
    const [countryId, setCountryId] = useState<string | null>(null);
    const [keyword, setKeyword] = useState('');
    const [searchKeyword, setSearchKeyword] = useState('');
    const [page, setPage] = useState(1);
    const [types, setTypes] = useState<{ value: string; label_zh: string }[]>([]);
    const [countries, setCountries] = useState<{ id: string; name_zh: string }[]>([]);
    const metaLoaded = useRef(false);

    const fetchNews = useCallback(async () => {
        setLoading(true);
        try {
            const params: Record<string, string | number> = {page, per_page: PAGE_SIZE, type: activeType};
            if (countryId) params.country_id = countryId;
            if (searchKeyword.trim()) params.keyword = searchKeyword.trim();
            const {data} = await api.get('/news', {params});
            setNews(data.data.news);
            setTotal(data.data.meta.total);
            if (!metaLoaded.current) {
                metaLoaded.current = true;
                if (data.data.meta.types) setTypes(data.data.meta.types);
                if (data.data.meta.countries) setCountries(data.data.meta.countries);
            }
        } finally {
            setLoading(false);
        }
    }, [page, activeType, countryId, searchKeyword]);

    useEffect(() => {
        fetchNews();
    }, [fetchNews]);

    const handleSearch = () => {
        setSearchKeyword(keyword.trim());
        setPage(1);
    };

    const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

    const getUpdateBadge = (type: string) => {
        if (type === '新增') return <Badge className="bg-success text-success-foreground text-xs">新增</Badge>;
        if (type === '修订') return <Badge className="bg-info text-info-foreground text-xs">修订</Badge>;
        return <Badge variant="destructive" className="text-xs">废止</Badge>;
    };

    return (
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-8 md:py-12">
            <div className="mb-8">
                <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-2">非洲合规动态资讯库</h1>
                <p className="text-muted-foreground">实时更新中非合作政策、法规修订动态与行业合规热点</p>
            </div>

            <Tabs value={activeType} onValueChange={(v) => {
                setActiveType(v);
                setCountryId(null);
                setPage(1);
            }}>
                <TabsList className="grid w-full grid-cols-3 mb-8">
                    {types.map((t) => {
                        const I = typeIcons[t.value] ?? Newspaper;
                        return <TabsTrigger key={t.value} value={t.value}><I
                            className="w-4 h-4 mr-2 hidden md:inline"/>{t.label_zh}</TabsTrigger>;
                    })}
                </TabsList>

                <TabsContent value={activeType} className="mt-0">
                    {/* Country Filter */}
                    <div className="mb-4">
                        <div className="flex flex-wrap gap-2">
                            <Button variant={countryId === null ? 'default' : 'outline'} size="sm" onClick={() => {
                                setCountryId(null);
                                setPage(1);
                            }}>
                                全部国家
                            </Button>
                            {countries.map((c) => (
                                <Button key={c.id} variant={countryId === c.id ? 'default' : 'outline'} size="sm"
                                        onClick={() => {
                                            setCountryId(c.id);
                                            setPage(1);
                                        }}>
                                    {c.name_zh}
                                </Button>
                            ))}
                        </div>
                    </div>

                    {/* Search */}
                    <div className="flex gap-2 mb-6">
                        <Input placeholder="搜索资讯标题..." value={keyword}
                               onChange={(e) => setKeyword(e.target.value)}
                               onKeyDown={(e) => {
                                   if (e.key === 'Enter') handleSearch();
                               }}
                               className="max-w-xs"/>
                        <Button variant="outline" size="icon" onClick={handleSearch}>
                            <Search className="w-4 h-4"/>
                        </Button>
                    </div>

                    <p className="text-sm text-muted-foreground mb-4">共 {total} 条资讯</p>

                    {loading ? (
                        <div className="flex items-center justify-center py-20">
                            <Loader2 className="w-8 h-8 text-primary animate-spin"/>
                        </div>
                    ) : (
                        <>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {news.map((item) => (
                                    <Card key={item.id} className="shadow-card">
                                        <CardContent className="p-5">
                                            {item.type === 'cooperation' && (
                                                <>
                                                    <div className="flex items-center gap-2 mb-3 flex-wrap">
                                                        {item.country_id && <Badge variant="secondary"
                                                                                   className="text-xs">{countries.find((c) => c.id === item.country_id)?.name_zh}</Badge>}
                                                        {item.tags?.map((t) => <Badge key={t.id} variant="outline"
                                                                                      className="text-xs">{t.name_zh}</Badge>)}
                                                    </div>
                                                    <h4 className="font-semibold text-foreground text-base mb-2">{item.title}</h4>
                                                    <p className="text-sm text-muted-foreground mb-4">{item.summary}</p>
                                                    <div
                                                        className="flex items-center justify-between text-xs text-muted-foreground">
                                                        <span>{item.source}</span>
                                                        <span className="flex items-center gap-1"><Calendar
                                                            className="w-3 h-3"/>{item.date}</span>
                                                    </div>
                                                </>
                                            )}
                                            {item.type === 'hotspot' && (
                                                <>
                                                    <div className="flex items-center gap-2 mb-3">
                                                        <Badge
                                                            variant={item.risk_level === 'high' ? 'destructive' : 'secondary'}
                                                            className="text-xs">{item.risk_level === 'high' ? '高风险' : '中风险'}</Badge>
                                                        {item.tags?.map((t) => <Badge key={t.id} variant="outline"
                                                                                      className="text-xs">{t.name_zh}</Badge>)}
                                                    </div>
                                                    <h4 className="font-semibold text-foreground text-base mb-2">{item.title}</h4>
                                                    <p className="text-sm text-muted-foreground mb-3">{item.summary}</p>
                                                    <div
                                                        className="space-y-2 text-xs bg-secondary/50 rounded-lg p-3 mb-3">
                                                        {item.involved_laws && <div><span
                                                            className="font-medium">涉事法规：</span>{item.involved_laws}
                                                        </div>}
                                                        {item.response && <div><span
                                                            className="font-medium">应对建议：</span>{item.response}
                                                        </div>}
                                                    </div>
                                                    <div
                                                        className="text-xs text-muted-foreground flex items-center gap-1">
                                                        <Calendar className="w-3 h-3"/>{item.date}</div>
                                                </>
                                            )}
                                            {item.type === 'update' && (
                                                <>
                                                    <div className="flex items-center gap-2 mb-3">
                                                        {item.update_type && getUpdateBadge(item.update_type)}
                                                        {item.country_id && <Badge variant="secondary"
                                                                                   className="text-xs">{countries.find((c) => c.id === item.country_id)?.name_zh}</Badge>}
                                                    </div>
                                                    <h4 className="font-semibold text-foreground text-base mb-3">{item.title}</h4>
                                                    <div className="space-y-2 text-sm mb-3">
                                                        {item.change_desc &&
                                                            <div><span className="font-medium">核心更新：</span><span
                                                                className="text-muted-foreground">{item.change_desc}</span>
                                                            </div>}
                                                        {item.impact &&
                                                            <div><span className="font-medium">对企业影响：</span><span
                                                                className="text-muted-foreground">{item.impact}</span>
                                                            </div>}
                                                        {item.advice &&
                                                            <div><span className="font-medium">合规建议：</span><span
                                                                className="text-muted-foreground">{item.advice}</span>
                                                            </div>}
                                                    </div>
                                                    <div
                                                        className="text-xs text-muted-foreground flex items-center gap-1">
                                                        <Calendar className="w-3 h-3"/>{item.date}</div>
                                                </>
                                            )}
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>

                            {news.length === 0 && (
                                <div className="text-center py-12"><p
                                    className="text-muted-foreground">暂无匹配资讯，请调整筛选条件</p></div>
                            )}

                            {totalPages > 1 && (
                                <div className="flex items-center justify-center gap-2 mt-8">
                                    <Button variant="outline" size="sm" disabled={page <= 1}
                                            onClick={() => setPage((p) => p - 1)}><ChevronLeft
                                        className="w-4 h-4"/></Button>
                                    {Array.from({length: totalPages}, (_, i) => i + 1).map((p) => (
                                        <Button key={p} variant={p === page ? 'default' : 'outline'} size="sm"
                                                className="w-9 h-9" onClick={() => setPage(p)}>{p}</Button>
                                    ))}
                                    <Button variant="outline" size="sm" disabled={page >= totalPages}
                                            onClick={() => setPage((p) => p + 1)}><ChevronRight
                                        className="w-4 h-4"/></Button>
                                </div>
                            )}
                        </>
                    )}
                </TabsContent>
            </Tabs>
        </div>
    );
}
