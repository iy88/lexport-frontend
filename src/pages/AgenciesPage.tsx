import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import api from '@/lib/api';
import {
  Scale, Calculator, Users, MapPin, Phone, Mail, Target, Star, Briefcase,
  Search, ChevronLeft, ChevronRight, Loader2,
} from 'lucide-react';

const CATEGORY_ICONS: Record<string, React.ElementType> = { Scale, Calculator, Users };
const PAGE_SIZE = 8;

interface Agency {
  id: number; name_zh: string; scene_id: string; region: string;
  phone: string; email: string; business: string; advantage: string; highlight: string | null;
}

interface AgencyScene { id: string; label_zh: string; }
interface AgencyCategory { id: string; label_zh: string; icon_name: string; scenes: AgencyScene[]; }

const getHighlightVariant = (h?: string | null) => {
  if (!h) return '';
  if (h.includes('国际') || h.includes('四大') || h.includes('全球')) return 'bg-primary/10 text-primary border-primary/20';
  if (h.includes('第一') || h.includes('顶尖') || h.includes('最大') || h.includes('领军') || h.includes('权威') || h.includes('头部')) return 'bg-info/10 text-info border-info/20';
  if (h.includes('金牌') || h.includes('资深') || h.includes('专家') || h.includes('深耕') || h.includes('稳定')) return 'bg-success/10 text-success border-success/20';
  return 'bg-accent text-accent-foreground';
};

export default function AgenciesPage() {
  const [categories, setCategories] = useState<AgencyCategory[]>([]);
  const [agencies, setAgencies] = useState<Agency[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('');
  const [sceneId, setSceneId] = useState<string | null>(null);
  const [keyword, setKeyword] = useState('');
  const [searchKeyword, setSearchKeyword] = useState('');
  const [page, setPage] = useState(1);
  const [detailOpen, setDetailOpen] = useState(false);
  const [selectedAgency, setSelectedAgency] = useState<Agency | null>(null);
  const initialized = useRef(false);

  const fetchAgencies = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, string | number> = { page, per_page: PAGE_SIZE };
      if (activeCategory) params.category_id = activeCategory;
      if (sceneId) params.scene_id = sceneId;
      if (searchKeyword.trim()) params.keyword = searchKeyword.trim();
      const { data: res } = await api.get('/agencies', { params });
      setAgencies(res.data.agencies);
      setTotal(res.data.meta.total);
      if (!initialized.current) {
        initialized.current = true;
        const cats: AgencyCategory[] = res.data.meta.categories;
        if (cats.length > 0) { setActiveCategory(cats[0].id); setCategories(cats); }
      }
    } finally {
      setLoading(false);
    }
  }, [page, activeCategory, sceneId, searchKeyword]);

  useEffect(() => { fetchAgencies(); }, [fetchAgencies]);

  const handleSearch = () => {
    setSearchKeyword(keyword.trim());
    setPage(1);
  };

  const currentCategory = useMemo(() => categories.find((c) => c.id === activeCategory), [categories, activeCategory]);
  const currentScenes = currentCategory?.scenes ?? [];

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const sceneLabel = (id: string) => currentScenes.find((s) => s.id === id)?.label_zh ?? categories.flatMap((c) => c.scenes).find((s) => s.id === id)?.label_zh ?? id;

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-6 py-8 md:py-12">
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-2">非洲制造业合规机构推荐</h1>
        <p className="text-muted-foreground">覆盖南非、西非、东非、北非、法语区，按制造业场景精准匹配</p>
      </div>

      <Tabs value={activeCategory} onValueChange={(v) => { setActiveCategory(v); setSceneId(null); setPage(1); }}>
        <TabsList className="grid w-full grid-cols-3 mb-8">
          {categories.map((cat) => (
            <TabsTrigger key={cat.id} value={cat.id} className="flex items-center gap-2">
              {(() => { const I = CATEGORY_ICONS[cat.icon_name] ?? Scale; return <I className="w-4 h-4 hidden md:inline" />; })()}
              {cat.label_zh}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value={activeCategory} className="mt-0">
          {/* Filters */}
          <div className="space-y-4 mb-6">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm text-muted-foreground shrink-0">场景</span>
              <Button variant={sceneId === null ? 'default' : 'outline'} size="sm" onClick={() => { setSceneId(null); setPage(1); }}>
                全部场景
              </Button>
              {currentScenes.map((s) => (
                <Button key={s.id} variant={sceneId === s.id ? 'default' : 'outline'} size="sm" onClick={() => { setSceneId(s.id); setPage(1); }}>
                  {s.label_zh}
                </Button>
              ))}
            </div>
          </div>

          {/* Search */}
          <div className="flex gap-2 mb-6">
            <Input placeholder="搜索机构名称或地区..." value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') handleSearch(); }}
              className="max-w-xs" />
            <Button variant="outline" size="icon" onClick={handleSearch}>
              <Search className="w-4 h-4" />
            </Button>
          </div>

          <p className="text-sm text-muted-foreground mb-4">共 {total} 家机构</p>

          {loading ? (
            <div className="flex items-center justify-center py-20"><Loader2 className="w-8 h-8 text-primary animate-spin" /></div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {agencies.map((agency) => (
                  <div key={agency.id} className="flex items-start gap-3 p-4 rounded-lg bg-card border border-border hover:border-primary/30 hover:bg-primary/5 transition-all cursor-pointer"
                    onClick={() => { setSelectedAgency(agency); setDetailOpen(true); }}
                    role="button" tabIndex={0}
                    onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { setSelectedAgency(agency); setDetailOpen(true); } }}>
                    <Star className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span className="font-semibold text-sm">{agency.name_zh}</span>
                        {agency.highlight && <Badge variant="outline" className={`text-[10px] h-5 px-1.5 ${getHighlightVariant(agency.highlight)}`}>{agency.highlight}</Badge>}
                        <Badge variant="secondary" className="text-[10px] h-5 px-1.5">{sceneLabel(agency.scene_id)}</Badge>
                      </div>
                      <div className="text-xs text-muted-foreground space-y-0.5">
                        <div className="flex items-center gap-1"><MapPin className="w-3 h-3 shrink-0" /><span>{agency.region}</span></div>
                        <div>{agency.business}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              {agencies.length === 0 && (
                <div className="text-center py-12"><p className="text-muted-foreground">暂无匹配机构，请调整筛选条件</p></div>
              )}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-8">
                  <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}><ChevronLeft className="w-4 h-4" /></Button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                    <Button key={p} variant={p === page ? 'default' : 'outline'} size="sm" className="w-9 h-9" onClick={() => setPage(p)}>{p}</Button>
                  ))}
                  <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}><ChevronRight className="w-4 h-4" /></Button>
                </div>
              )}
            </>
          )}
        </TabsContent>
      </Tabs>

      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="max-w-[calc(100%-2rem)] md:max-w-lg max-h-[90dvh] overflow-y-auto">
          {selectedAgency && (
            <>
              <DialogHeader>
                <DialogTitle className="text-xl flex items-center gap-2"><Star className="w-5 h-5 text-primary" />{selectedAgency.name_zh}</DialogTitle>
              </DialogHeader>
              <div className="space-y-5 py-2">
                {selectedAgency.highlight && <Badge className={`${getHighlightVariant(selectedAgency.highlight)} text-xs`}>{selectedAgency.highlight}</Badge>}
                <div className="flex items-start gap-3"><MapPin className="w-4 h-4 text-primary mt-0.5" /><div><p className="text-xs text-muted-foreground">覆盖区域</p><p className="text-sm font-medium">{selectedAgency.region}</p></div></div>
                <div className="flex items-start gap-3"><Phone className="w-4 h-4 text-primary mt-0.5" /><div><p className="text-xs text-muted-foreground">联系电话</p><p className="text-sm font-medium">{selectedAgency.phone}</p></div></div>
                <div className="flex items-start gap-3"><Mail className="w-4 h-4 text-primary mt-0.5" /><div><p className="text-xs text-muted-foreground">联系邮箱</p><p className="text-sm font-medium">{selectedAgency.email}</p></div></div>
                <div className="flex items-start gap-3"><Briefcase className="w-4 h-4 text-primary mt-0.5" /><div><p className="text-xs text-muted-foreground">主攻业务</p><p className="text-sm">{selectedAgency.business}</p></div></div>
                <div className="bg-primary/5 border border-primary/10 rounded-lg p-4">
                  <div className="flex items-start gap-3"><Target className="w-4 h-4 text-primary mt-0.5" /><div><p className="text-xs text-muted-foreground">核心优势</p><p className="text-sm font-medium">{selectedAgency.advantage}</p></div></div>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
