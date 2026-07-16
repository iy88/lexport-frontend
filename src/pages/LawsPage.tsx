import {useCallback, useEffect, useRef, useState} from 'react';
import {Button} from '@/components/ui/button';
import {Card, CardContent} from '@/components/ui/card';
import {Badge} from '@/components/ui/badge';
import {Input} from '@/components/ui/input';
import api from '@/lib/api';
import {ChevronLeft, ChevronRight, FileText, Globe, Loader2, Search,} from 'lucide-react';

const PAGE_SIZE = 6;

interface Law {
    id: number;
    title_cn: string;
    title_en: string | null;
    law_number: string | null;
    country_id: string;
    scene_id: string;
    effective_date: string | null;
    summary: string | null;
    filename: string | null;
}

export default function LawsPage() {
    const [laws, setLaws] = useState<Law[]>([]);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [countryId, setCountryId] = useState<string | null>(null);
    const [sceneId, setSceneId] = useState<string | null>(null);
    const [keyword, setKeyword] = useState('');
    const [countries, setCountries] = useState<{ id: string; name_zh: string }[]>([]);
    const [scenes, setScenes] = useState<{ id: string; label_zh: string }[]>([]);
    const metaLoaded = useRef(false);

    const fetchLaws = useCallback(async () => {
        setLoading(true);
        try {
            const params: Record<string, string | number> = {page, per_page: PAGE_SIZE};
            if (countryId) params.country_id = countryId;
            if (sceneId) params.scene_id = sceneId;
            if (keyword.trim()) params.keyword = keyword.trim();

            const {data} = await api.get('/laws', {params});
            setLaws(data.data.laws);
            setTotal(data.data.meta.total);
            if (!metaLoaded.current) {
                metaLoaded.current = true;
                if (data.data.meta.countries) setCountries(data.data.meta.countries);
                if (data.data.meta.scenes) setScenes(data.data.meta.scenes);
            }
        } finally {
            setLoading(false);
        }
    }, [page, countryId, sceneId, keyword]);

    useEffect(() => {
        fetchLaws();
    }, [fetchLaws]);

    const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

    const handleCountryChange = (id: string | null) => {
        setCountryId(id);
        setSceneId(null);
        setPage(1);
        setKeyword('');
    };
    const handleSceneChange = (id: string | null) => {
        setSceneId(id);
        setPage(1);
    };
    const handleSearch = () => {
        setPage(1);
        fetchLaws();
    };

    return (
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-8 md:py-12">
            <div className="mb-8">
                <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-2">非洲制造业合规法规库</h1>
                <p className="text-muted-foreground">按国家与场景筛选，快速定位制造业合规要点</p>
            </div>

            {/* Country Filter */}
            <div className="mb-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <Globe className="w-5 h-5 text-primary"/>
                    选择国家
                </h3>
                <div className="flex flex-wrap gap-2">
                    <Button variant={countryId === null ? 'default' : 'outline'} size="sm"
                            onClick={() => handleCountryChange(null)}>
                        全部国家
                    </Button>
                    {countries.map((c) => (
                        <Button key={c.id} variant={countryId === c.id ? 'default' : 'outline'} size="sm"
                                onClick={() => handleCountryChange(c.id)}>
                            {c.name_zh}
                        </Button>
                    ))}
                </div>
            </div>

            {/* Scene Filter */}
            <div className="mb-8">
                <h3 className="text-sm font-medium text-muted-foreground mb-3">按场景筛选</h3>
                <div className="flex flex-wrap gap-2">
                    <Button variant={sceneId === null ? 'default' : 'outline'} size="sm"
                            onClick={() => handleSceneChange(null)}>
                        全部场景
                    </Button>
                    {scenes.map((s) => (
                        <Button key={s.id} variant={sceneId === s.id ? 'default' : 'outline'} size="sm"
                                onClick={() => handleSceneChange(s.id)}>
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
                    <Search className="w-4 h-4"/>
                </Button>
            </div>

            {/* Law List */}
            <p className="text-sm text-muted-foreground mb-4">共 {total} 条法规</p>

            {loading ? (
                <div className="flex items-center justify-center py-20">
                    <Loader2 className="w-8 h-8 text-primary animate-spin"/>
                </div>
            ) : (
                <>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {laws.map((law) => (
                            <Card key={law.id} className="shadow-card">
                                <CardContent className="p-5">
                                    <h4 className="font-semibold text-foreground text-base mb-2">{law.title_cn}</h4>
                                    <div className="flex items-center gap-2 flex-wrap mb-3">
                                        <Badge variant="secondary" className="text-xs">
                                            {countries.find((c) => c.id === law.country_id)?.name_zh ?? law.country_id}
                                        </Badge>
                                        {law.law_number && <Badge variant="outline" className="text-xs">{law.law_number}</Badge>}
                                        {(() => {
                                            const s = scenes.find((sc) => sc.id === law.scene_id);
                                            return s ? <Badge
                                                className="bg-primary/10 text-primary border-primary/20 text-xs">{s.label_zh}</Badge> : null;
                                        })()}
                                    </div>
                                    <p className="text-sm text-muted-foreground mb-3 text-pretty">{law.summary}</p>
                                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                                        <span>{law.effective_date}</span>
                                        {law.filename && <span className="flex items-center gap-1"><FileText className="w-3 h-3"/>{law.filename}</span>}
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>

                    {laws.length === 0 && (
                        <div className="text-center py-12">
                            <p className="text-muted-foreground">暂无匹配法规，请调整筛选条件</p>
                        </div>
                    )}

                    {totalPages > 1 && (
                        <div className="flex items-center justify-center gap-2 mt-8">
                            <Button variant="outline" size="sm" disabled={page <= 1}
                                    onClick={() => setPage((p) => p - 1)}>
                                <ChevronLeft className="w-4 h-4"/>
                            </Button>
                            {Array.from({length: totalPages}, (_, i) => i + 1).map((p) => (
                                <Button key={p} variant={p === page ? 'default' : 'outline'} size="sm"
                                        className="w-9 h-9" onClick={() => setPage(p)}>
                                    {p}
                                </Button>
                            ))}
                            <Button variant="outline" size="sm" disabled={page >= totalPages}
                                    onClick={() => setPage((p) => p + 1)}>
                                <ChevronRight className="w-4 h-4"/>
                            </Button>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}
