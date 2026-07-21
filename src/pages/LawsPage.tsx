import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Calendar, ChevronLeft, ChevronRight, Globe, Loader2, Search } from 'lucide-react';
import { listPublicLaws, type PublicLaw, type LawCountry, type LawScene } from '@/lib/laws';

const PAGE_SIZE = 6;

export default function LawsPage() {
    const [laws, setLaws] = useState<PublicLaw[]>([]);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [page, setPage] = useState(1);
    const [countryId, setCountryId] = useState<string | null>(null);
    const [sceneId, setSceneId] = useState<string | null>(null);
    const [keyword, setKeyword] = useState('');
    const [searchKeyword, setSearchKeyword] = useState('');
    const [countries, setCountries] = useState<LawCountry[]>([]);
    const [scenes, setScenes] = useState<LawScene[]>([]);
    const metaLoaded = useRef(false);

    const fetchLaws = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const result = await listPublicLaws({
                page,
                per_page: PAGE_SIZE,
                country_id: countryId ?? undefined,
                scene_id: sceneId ?? undefined,
                keyword: searchKeyword.trim() || undefined,
            });
            setLaws(result.laws);
            setTotal(result.meta.total);
            if (!metaLoaded.current) {
                metaLoaded.current = true;
                setCountries(result.meta.countries);
                setScenes(result.meta.scenes);
            }
        } catch {
            setError('加载法规失败，请稍后重试');
        } finally {
            setLoading(false);
        }
    }, [page, countryId, sceneId, searchKeyword]);

    useEffect(() => {
        fetchLaws();
    }, [fetchLaws]);

    const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

    const handleCountryChange = (id: string | null) => {
        setCountryId(id);
        setSceneId(null);
        setPage(1);
        setSearchKeyword('');
        setKeyword('');
    };

    const handleSceneChange = (id: string | null) => {
        setSceneId(id);
        setPage(1);
    };

    const handleSearch = () => {
        setSearchKeyword(keyword.trim());
        setPage(1);
    };

    // Memoize country/scene lookups
    const countryMap = useMemo(
        () => new Map(countries.map((c) => [c.id, c.name_zh])),
        [countries],
    );
    const sceneMap = useMemo(
        () => new Map(scenes.map((s) => [s.id, s.label_zh])),
        [scenes],
    );

    return (
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-8 md:py-12">
            <div className="mb-8">
                <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
                    非洲制造业合规法规库
                </h1>
                <p className="text-muted-foreground">
                    按国家与场景筛选，快速定位制造业合规要点
                </p>
            </div>

            {/* Country Filter */}
            <div className="mb-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <Globe className="w-5 h-5 text-primary" />
                    选择国家
                </h3>
                <div className="flex flex-wrap gap-2">
                    <Button
                        variant={countryId === null ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => handleCountryChange(null)}
                    >
                        全部国家
                    </Button>
                    {countries.map((c) => (
                        <Button
                            key={c.id}
                            variant={countryId === c.id ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => handleCountryChange(c.id)}
                        >
                            {c.name_zh}
                        </Button>
                    ))}
                </div>
            </div>

            {/* Scene Filter */}
            <div className="mb-8">
                <h3 className="text-sm font-medium text-muted-foreground mb-3">
                    按场景筛选
                </h3>
                <div className="flex flex-wrap gap-2">
                    <Button
                        variant={sceneId === null ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => handleSceneChange(null)}
                    >
                        全部场景
                    </Button>
                    {scenes.map((s) => (
                        <Button
                            key={s.id}
                            variant={sceneId === s.id ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => handleSceneChange(s.id)}
                        >
                            {s.label_zh}
                        </Button>
                    ))}
                </div>
            </div>

            {/* Search */}
            <div className="flex gap-2 mb-6">
                <Input
                    placeholder="搜索法规标题..."
                    value={keyword}
                    onChange={(e) => setKeyword(e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter') handleSearch();
                    }}
                    className="max-w-xs"
                />
                <Button variant="outline" size="icon" onClick={handleSearch}>
                    <Search className="w-4 h-4" />
                </Button>
            </div>

            {/* Law List */}
            <p className="text-sm text-muted-foreground mb-4">共 {total} 条法规</p>

            {error && (
                <Card className="mb-4 border-destructive/50">
                    <CardContent className="p-4 text-center">
                        <p className="text-sm text-destructive mb-2">{error}</p>
                        <Button variant="outline" size="sm" onClick={fetchLaws}>
                            重试
                        </Button>
                    </CardContent>
                </Card>
            )}

            {loading ? (
                <div className="flex items-center justify-center py-20">
                    <Loader2 className="w-8 h-8 text-primary animate-spin" />
                </div>
            ) : (
                <>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {laws.map((law) => (
                            <Card key={law.id} className="shadow-card h-full">
                                <CardContent className="p-5 flex flex-col h-full">
                                    <Link
                                        to={`/laws/${law.id}`}
                                        className="hover:underline"
                                    >
                                        <h4 className="font-semibold text-foreground text-base mb-2">
                                            {law.title_cn}
                                        </h4>
                                    </Link>
                                    <div className="flex items-center gap-2 flex-wrap mb-3">
                                        <Badge variant="secondary" className="text-xs">
                                            {countryMap.get(law.country_id) ?? law.country_id}
                                        </Badge>
                                        {law.law_number && (
                                            <Badge variant="outline" className="text-xs">
                                                {law.law_number}
                                            </Badge>
                                        )}
                                        {(() => {
                                            const s = sceneMap.get(law.scene_id);
                                            return s ? (
                                                <Badge className="bg-primary/10 text-primary border-primary/20 text-xs hover:bg-primary/20 cursor-default">
                                                    {s}
                                                </Badge>
                                            ) : null;
                                        })()}
                                    </div>
                                    <p className="text-sm text-muted-foreground mb-3 text-pretty">
                                        {law.summary}
                                    </p>
                                    <div className="flex items-center justify-between text-xs text-muted-foreground mt-auto">
                                        <span className="flex items-center gap-1">
                                            <Calendar className="w-3 h-3" />
                                            {law.effective_date
                                                ? law.effective_date.slice(0, 4)
                                                : ''}
                                        </span>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>

                    {laws.length === 0 && (
                        <div className="text-center py-12">
                            <p className="text-muted-foreground">
                                暂无匹配法规，请调整筛选条件
                            </p>
                        </div>
                    )}

                    {totalPages > 1 && (
                        <div className="flex items-center justify-center gap-2 mt-8">
                            <Button
                                variant="outline"
                                size="sm"
                                disabled={page <= 1}
                                onClick={() => setPage((p) => p - 1)}
                            >
                                <ChevronLeft className="w-4 h-4" />
                            </Button>
                            {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                                (p) => (
                                    <Button
                                        key={p}
                                        variant={p === page ? 'default' : 'outline'}
                                        size="sm"
                                        className="w-9 h-9"
                                        onClick={() => setPage(p)}
                                    >
                                        {p}
                                    </Button>
                                ),
                            )}
                            <Button
                                variant="outline"
                                size="sm"
                                disabled={page >= totalPages}
                                onClick={() => setPage((p) => p + 1)}
                            >
                                <ChevronRight className="w-4 h-4" />
                            </Button>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}
