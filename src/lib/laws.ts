import api from '@/lib/api';

// --- Types ---

export type LawStatus = 'draft' | 'published';
export type ReviewStatus = 'pending' | 'none';

export interface PublicLaw {
    id: number;
    title_cn: string;
    title_en: string | null;
    law_number: string | null;
    country_id: string;
    scene_id: string;
    effective_date: string | null;
    summary: string | null;
    has_file: boolean;
    created_at: string;
}

export interface AdminLaw {
    id: number;
    title_cn: string;
    title_en: string | null;
    law_number: string | null;
    country_id: string;
    scene_id: string;
    effective_date: string | null;
    summary: string | null;
    status: LawStatus;
    object_name: string | null;
    has_file: boolean;
    has_draft: boolean;
    review_status: ReviewStatus;
    has_pending_file: boolean;
    pending_object_name: string | null;
    created_at: string;
    updated_at: string;
}

export interface LawCountry {
    id: string;
    name_zh: string;
}

export interface LawScene {
    id: string;
    label_zh: string;
}

export interface LawListMeta {
    page: number;
    per_page: number;
    total: number;
    countries: LawCountry[];
    scenes: LawScene[];
}

export interface BatchApproveResult {
    approved: number[];
    failed: Array<{ id: number; code: string; message: string }>;
}

// --- Filter types ---

export interface PublicLawFilters {
    page?: number;
    per_page?: number;
    country_id?: string;
    scene_id?: string;
    keyword?: string;
}

export interface AdminLawFilters {
    page?: number;
    per_page?: number;
    status?: LawStatus;
    review_status?: ReviewStatus;
    country_id?: string;
    scene_id?: string;
    keyword?: string;
}

// --- Error message extraction ---

export function extractLawError(err: unknown): string {
    if (err && typeof err === 'object' && 'response' in err) {
        const axiosErr = err as {
            response?: {
                status?: number;
                data?: { error?: { message?: string }; message?: string };
            };
        };
        const msg =
            axiosErr.response?.data?.error?.message ||
            axiosErr.response?.data?.message;
        if (msg) return msg;
        const status = axiosErr.response?.status;
        const fallbacks: Record<number, string> = {
            400: '参数或操作不合法',
            403: '权限不足',
            404: '记录、附件或 OSS 对象不存在',
            409: '存在冲突，请先审核或丢弃待审修改',
            413: '文件过大',
            502: '对象存储操作失败',
        };
        if (status && fallbacks[status]) return fallbacks[status];
    }
    return '操作失败，请稍后重试';
}

// --- Public API ---

export async function listPublicLaws(
    filters: PublicLawFilters = {},
): Promise<{ laws: PublicLaw[]; meta: LawListMeta }> {
    const params: Record<string, string | number> = {
        page: filters.page ?? 1,
        per_page: filters.per_page ?? 20,
    };
    if (filters.country_id) params.country_id = filters.country_id;
    if (filters.scene_id) params.scene_id = filters.scene_id;
    if (filters.keyword?.trim()) params.keyword = filters.keyword.trim();

    const { data } = await api.get('/laws', { params });
    return { laws: data.data.laws, meta: data.data.meta };
}

export async function getPublicLaw(id: number): Promise<PublicLaw> {
    const { data } = await api.get(`/laws/${id}`);
    return data.data;
}

/** Fetch countries/scenes from a minimal list request. */
let _publicRefCache: { countries: LawCountry[]; scenes: LawScene[] } | null = null;

export async function getPublicLawReferences(): Promise<{
    countries: LawCountry[];
    scenes: LawScene[];
}> {
    if (_publicRefCache) return _publicRefCache;
    const { meta } = await listPublicLaws({ page: 1, per_page: 1 });
    _publicRefCache = { countries: meta.countries, scenes: meta.scenes };
    return _publicRefCache;
}

// --- Admin API ---

export async function listAdminLaws(
    filters: AdminLawFilters = {},
): Promise<{ items: AdminLaw[]; meta: LawListMeta }> {
    const params: Record<string, string | number> = {
        page: filters.page ?? 1,
        per_page: filters.per_page ?? 20,
    };
    if (filters.status) params.status = filters.status;
    if (filters.review_status) params.review_status = filters.review_status;
    if (filters.country_id) params.country_id = filters.country_id;
    if (filters.scene_id) params.scene_id = filters.scene_id;
    if (filters.keyword?.trim()) params.keyword = filters.keyword.trim();

    const { data } = await api.get('/admin/laws', { params });
    return { items: data.data.items, meta: data.data.meta };
}

export async function getAdminLaw(id: number): Promise<AdminLaw> {
    const { data } = await api.get(`/admin/laws/${id}`);
    return data.data.item;
}

export async function createAdminLaw(formData: FormData): Promise<void> {
    await api.post('/admin/laws', formData);
}

export async function updateAdminLaw(
    id: number,
    formData: FormData,
): Promise<void> {
    await api.put(`/admin/laws/${id}`, formData);
}

export async function approveAdminLaw(id: number): Promise<void> {
    await api.post(`/admin/laws/${id}/approve`);
}

export async function approveAdminLaws(
    ids: number[],
): Promise<BatchApproveResult> {
    const { data } = await api.post('/admin/laws/approve-batch', { ids });
    return data.data;
}

export async function suspendAdminLaw(id: number): Promise<void> {
    await api.post(`/admin/laws/${id}/suspend`);
}

export async function discardAdminLawDraft(id: number): Promise<void> {
    await api.delete(`/admin/laws/${id}/draft`);
}

export async function deleteAdminLaw(id: number): Promise<void> {
    await api.delete(`/admin/laws/${id}`);
}
