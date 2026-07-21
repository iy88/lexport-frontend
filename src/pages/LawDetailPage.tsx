import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Calendar, Download, Globe, Loader2, Scale } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { getPublicLaw, getPublicLawReferences, type PublicLaw, type LawCountry, type LawScene } from '@/lib/laws';

export default function LawDetailPage() {
    const { id } = useParams<{ id: string }>();
    const [law, setLaw] = useState<PublicLaw | null>(null);
    const [countries, setCountries] = useState<LawCountry[]>([]);
    const [scenes, setScenes] = useState<LawScene[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!id) return;
        let cancelled = false;

        setLoading(true);
        setError(null);
        setLaw(null);

        getPublicLaw(Number(id))
            .then((lawData) => {
                if (!cancelled) setLaw(lawData);
            })
            .catch((err: unknown) => {
                if (cancelled) return;
                if (
                    err &&
                    typeof err === 'object' &&
                    'response' in err &&
                    (err as { response?: { status?: number } }).response?.status === 404
                ) {
                    setError('法规不存在或已下架');
                } else {
                    setError('加载失败，请稍后重试');
                }
            })
            .finally(() => {
                if (!cancelled) setLoading(false);
            });

        // Reference labels are optional; the detail can fall back to raw IDs.
        getPublicLawReferences()
            .then((refs) => {
                if (cancelled) return;
                setCountries(refs.countries);
                setScenes(refs.scenes);
            })
            .catch(() => {
                // Keep rendering the law detail with country/scene IDs.
            });

        return () => {
            cancelled = true;
        };
    }, [id]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-primary animate-spin" />
            </div>
        );
    }

    if (error || !law) {
        return (
            <div className="max-w-3xl mx-auto px-4 py-20 text-center">
                <p className="text-muted-foreground mb-4">{error || '法规不存在或已删除'}</p>
                <div className="flex items-center justify-center gap-3">
                    <Button variant="outline" asChild>
                        <Link to="/laws">返回法规库</Link>
                    </Button>
                    {error && error !== '法规不存在或已下架' && (
                        <Button variant="outline" onClick={() => window.location.reload()}>
                            重试
                        </Button>
                    )}
                </div>
            </div>
        );
    }

    const countryName =
        countries.find((c) => c.id === law.country_id)?.name_zh ?? law.country_id;
    const sceneName =
        scenes.find((s) => s.id === law.scene_id)?.label_zh ?? law.scene_id;

    return (
        <div className="max-w-3xl mx-auto px-4 md:px-6 py-8 md:py-12">
            <Button variant="ghost" className="mb-6 -ml-3" asChild>
                <Link to="/laws">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    返回法规库
                </Link>
            </Button>

            {/* Header */}
            <div className="mb-6">
                <div className="flex items-center gap-2 flex-wrap mb-3">
                    <Badge variant="secondary" className="text-xs gap-1">
                        <Globe className="w-3 h-3" />
                        {countryName}
                    </Badge>
                    <Badge className="bg-primary/10 text-primary border-primary/20 text-xs">
                        {sceneName}
                    </Badge>
                    {law.law_number && (
                        <Badge variant="outline" className="text-xs">
                            {law.law_number}
                        </Badge>
                    )}
                </div>
                <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
                    <Scale className="w-6 h-6 inline mr-2 text-primary" />
                    {law.title_cn}
                </h1>
                {law.title_en && (
                    <p className="text-base text-muted-foreground mb-2">
                        {law.title_en}
                    </p>
                )}
                <div className="flex items-center gap-4 text-sm text-muted-foreground mt-4">
                    <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" />
                        生效日期：
                        {law.effective_date ? law.effective_date.slice(0, 4) : '--'}
                    </span>
                    {law.has_file && (
                        <a
                            href={`/api/laws/${law.id}/download`}
                            className="flex items-center gap-1 text-primary hover:underline"
                        >
                            <Download className="w-3.5 h-3.5" />
                            下载法规原件
                        </a>
                    )}
                </div>
            </div>

            {/* Summary */}
            {law.summary && (
                <Card className="mb-6 bg-muted/30">
                    <CardContent className="p-4">
                        <h3 className="text-sm font-semibold text-foreground mb-2">
                            法规摘要
                        </h3>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                            {law.summary}
                        </p>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
