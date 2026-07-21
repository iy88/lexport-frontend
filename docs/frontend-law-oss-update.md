# 法规 OSS 与审核流程前端升级指南

本文用于指导 `lexport-frontend` 对接新版法规 API。此次升级将法规原件由后端本地目录迁移到独立 OSS 知识库 Bucket，并区分“发布状态”和“审核状态”。前端不得再依赖本地文件名或拼接 OSS 地址。

## 1. 必须处理的破坏性变更

Admin Law 响应已删除 `filename`、`secure_name` 和本地路径，替换为以下字段：

| 字段 | 含义 | 前端用途 |
|---|---|---|
| `object_name` | 当前正式 OSS 对象名；无正式文件时为 `null` | 后台展示正式文件名，不用于拼 URL |
| `has_file` | 存在正式文件或待审文件 | 只表示“有文件”，不能单独决定能否下载 |
| `has_draft` | 已发布记录是否存在 `LawDraft` | 显示“有待审修改”、决定能否丢弃草稿 |
| `review_status` | `pending` / `none` | 决定审核按钮、筛选和批量选择 |
| `has_pending_file` | 本次待审修改是否上传了新文件 | 显示待审文件标识 |
| `pending_object_name` | 审核后预计采用的对象名 | 展示审核目标；不代表 OSS 中已存在 |

`pending_file_name` 永远不会返回。不要在前端展示、缓存或提交 `object_name`、`pending_object_name`。

当前前端需要立即修改：

- `AdminLawsPage.tsx`：删除所有 `item.filename` 访问，否则 `has_file=true` 时调用 `item.filename.length` 会报错。
- `LawsPage.tsx`：从公开 `Law` 类型中删除未使用的 `filename`。
- `api-file.ts`：不要固定设置 `Content-Type: multipart/form-data`，应让浏览器为 `FormData` 自动生成 boundary。
- 批量审核和审核按钮必须依据 `review_status === 'pending'`，不能只判断 `status === 'draft'`。
- 增加“丢弃待审修改”操作：`DELETE /api/admin/laws/{id}/draft`。

## 2. 推荐 TypeScript 类型

```ts
export type LawStatus = 'draft' | 'published';
export type ReviewStatus = 'pending' | 'none';

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
```

Admin 详情和列表中的字段可能已经合并待审 `LawDraft`，因此它们表示“审核预览”。但 `object_name` 始终指向当前正式文件，公开 API 在审核前仍返回旧的已发布数据。

## 3. 状态与页面行为

| `status` | `review_status` | 场景 | 推荐展示 |
|---|---|---|---|
| `published` | `none` | 正常线上版本 | “已发布” |
| `published` | `pending` | 线上版本仍有效，Editor 提交了修改 | “已发布” + “待审核修改” |
| `draft` | `pending` | Editor 新建或 Admin 挂起，尚未发布 | “待首次审核” |

文件展示应拆成两行：

```ts
const canDownload =
  law.status === 'published' && Boolean(law.object_name);

const officialFileLabel = law.object_name;
const pendingFileLabel = law.pending_object_name;
```

- `object_name` 非空：展示“正式文件”，允许通过后端下载接口下载。
- `has_pending_file=true`：展示“待审新文件”，但禁止下载；该文件仍在后端临时目录。
- `pending_object_name` 非空且 `has_pending_file=false`：表示仅名称变化，审核后 OSS 对象会重命名。
- `has_file=true` 但 `object_name=null`：只有待审文件，不能调用公开下载接口。

Admin 操作建议：

| 操作 | 显示条件 |
|---|---|
| 审核 | `review_status === 'pending'` |
| 批量选择 | `review_status === 'pending'` |
| 丢弃修改 | `status === 'published' && has_draft` |
| 挂起 | `status === 'published'`；若 `has_draft`，先提示挂起会丢弃待审修改 |
| 删除 | Admin 任意记录；Editor 仅 `status === 'draft'` |

## 4. Axios 与 FormData

现有 `api` 实例已经注入 Bearer token，可以直接发送 `FormData`。不要手动指定 Content-Type：

```ts
const formData = new FormData();
formData.append('title_cn', form.title_cn.trim());
formData.append('country_id', form.country_id);
formData.append('scene_id', form.scene_id);

if (form.title_en.trim()) formData.append('title_en', form.title_en.trim());
if (form.law_number.trim()) formData.append('law_number', form.law_number.trim());
if (form.effective_date) formData.append('effective_date', form.effective_date);
if (form.summary.trim()) formData.append('summary', form.summary.trim());
if (selectedFile) formData.append('file', selectedFile);

await api.post('/admin/laws', formData);
await api.put(`/admin/laws/${id}`, formData);
```

上传文件必须带后缀名。整个请求受后端 `MAX_CONTENT_LENGTH` 限制。保存期间应禁用表单和重复提交，因为 OSS 上传、复制或删除可能比普通数据库更新慢。

对象名由后端生成：

```text
<中文标题>[-<英文标题>]<小写后缀>
```

修改中英文标题可能触发 OSS 重命名；修改文件可能触发上传并删除旧对象。前端只提交标题和 `file`，不要自行计算或提交对象名。

## 5. API 使用方式

所有后台接口使用：

```http
Authorization: Bearer <access_token>
```

### 5.1 后台列表与详情

```ts
const {data} = await api.get('/admin/laws', {
  params: {
    page: 1,
    per_page: 20,
    status: 'published',       // 可选：draft | published
    review_status: 'pending',  // 可选：pending | none
    country_id: 'ZA',          // 可选
    scene_id: 'customs',       // 可选
    keyword: 'Customs Act',    // 匹配中英文标题或法号
  },
});

const laws: AdminLaw[] = data.data.items;
const meta = data.data.meta;

const detail = await api.get(`/admin/laws/${id}`);
const law: AdminLaw = detail.data.data.item;
```

Admin 列表的 `meta` 同时包含分页信息、`countries` 和 `scenes`。

### 5.2 新增和修改

```ts
await api.post('/admin/laws', formData);       // 201
await api.put(`/admin/laws/${id}`, formData); // 200
```

- Admin 新增：立即 `published`；有文件时直接上传 OSS。
- Editor 新增：创建 `draft`，文件等待 Admin 审核后上传。
- Admin 修改 published：立即生效；如果已有 Editor 待审修改则返回 409。
- Editor 修改 published：只更新待审预览，公开页面仍展示原版本。
- Admin 或 Editor 修改 draft：仍保持 draft，必须另行审核。

### 5.3 审核、批量审核和丢弃

```ts
await api.post(`/admin/laws/${id}/approve`);

const {data} = await api.post('/admin/laws/approve-batch', {
  ids: selectedIds,
});

// HTTP 200 不代表每项都成功，必须读取以下两个数组：
const approved: number[] = data.data.approved;
const failed: Array<{id: number; code: string; message: string}> =
  data.data.failed;

await api.delete(`/admin/laws/${id}/draft`);
```

批量审核是逐项事务。前端应展示 `failed` 中每条失败原因，并只从选中集合移除 `approved` 项。

### 5.4 挂起与删除

```ts
await api.post(`/admin/laws/${id}/suspend`);
await api.delete(`/admin/laws/${id}`);
```

挂起会把正式 OSS 文件下载回待审目录、删除 OSS 对象，并将记录变为 `draft`。删除 published 法规会同时删除正式 OSS 对象，应使用二次确认且等待请求完成后再刷新列表。

### 5.5 公开查询与下载

```ts
const list = await api.get('/laws', {
  params: {page: 1, per_page: 20, country_id: 'ZA', keyword: 'customs'},
});
const publicLaws: PublicLaw[] = list.data.data.laws;

const detail = await api.get(`/laws/${id}`);
const publicLaw: PublicLaw = detail.data.data;
```

公开详情响应不附带 `countries` / `scenes` 元数据。`LawDetailPage.tsx` 应复用列表、全局 reference store 或独立参考数据请求，不要读取当前不存在的 `data.meta`。

下载不要先请求 OSS，也不要使用 `object_name` 拼接 URL：

```tsx
{law.has_file && (
  <a href={`/api/laws/${law.id}/download`}>下载法规原件</a>
)}
```

`GET /api/laws/{id}/download` 返回 `302` 并跳转到临时 OSS 签名 URL。浏览器 `<a>` 会自动跟随重定向；不要用 Axios 获取后再尝试解析 JSON。

## 6. 错误处理

失败响应统一为：

```json
{
  "success": false,
  "error": {"code": "CONFLICT", "message": "同名法规文件已存在"}
}
```

| HTTP / code | 前端处理 |
|---|---|
| `400 VALIDATION_ERROR` | 展示字段或操作错误，例如缺少标题、文件无后缀、没有待审修改 |
| `401/403 AUTH_ERROR` | 401 清理登录态；403 提示角色权限不足 |
| `404 NOT_FOUND` | 列表刷新并提示记录、附件或 OSS 对象不存在 |
| `409 CONFLICT` | 提示同名对象冲突，或要求先审核/丢弃已有草稿 |
| `413 FILE_TOO_LARGE` | 提示压缩或减少文件大小 |
| `502 OSS_ERROR` | 提示对象存储操作失败；不要在前端假定操作已经成功 |

所有变更接口成功后重新请求列表或详情，不做乐观更新。OSS 与数据库由后端负责补偿，前端只应以最终响应为准。

## 7. 针对当前前端的实施清单

1. 建立共享 `AdminLaw`、`PublicLaw` 类型，移除页面内的 `any` 和旧 `filename`。
2. 修改 `AdminLawsPage.tsx` 文件列，分别显示正式对象和待审目标；只有正式 published 文件可下载。
3. 增加 `review_status` 筛选，并让审核按钮和 checkbox 覆盖 published + pending 的记录。
4. 增加“丢弃待审修改”按钮和确认对话框。
5. 对挂起且 `has_draft=true` 的记录显示强警告。
6. 修改 `api-file.ts` 或直接使用 `api`，删除固定 multipart Content-Type。
7. 保存、审核、挂起、删除期间禁用对应按钮；捕获并展示 `error.message`。
8. 批量审核逐项展示失败结果，不把整个 HTTP 200 当作全部成功。
9. 保留 `LawDetailPage.tsx` 的后端下载链接；公开页面只依赖 `has_file`。
10. 完成后执行管理员、Editor 和公开页面三套验收流程。

## 8. 验收场景

- Admin 新增带文件法规：立即公开可见且可下载。
- Admin 修改标题：正式对象名更新，旧下载链接仍通过同一个法规 ID 工作。
- Editor 新增带文件法规：公开列表不可见，后台显示“待首次审核”，审核后公开可见。
- Editor 修改已发布法规：公开页面保持旧内容，后台显示“已发布 + 待审核修改”。
- Admin 丢弃 Editor 修改：公开内容不变，待审标记消失。
- Admin 审核 Editor 修改：公开内容和正式文件切换到新版本。
- 批量审核部分失败：成功项刷新，失败项保留并显示原因。
- 挂起法规：公开详情和下载返回 404；重新审核后恢复。
- 删除法规：后台、公开列表和 OSS 下载均不可再访问。
