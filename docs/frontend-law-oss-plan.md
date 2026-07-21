# 法规 OSS 与审核流程前端实施计划

## 1. 目标与交付范围

本计划用于指导一个没有当前对话上下文的 agent，将 `lexport-frontend` 对接到新版法规 OSS 与审核 API。开始前必须完整阅读：

- `AGENTS.md`
- `docs/frontend-law-oss-update.md`（前端升级要求，主要事实来源）
- `../lexport-backend/docs/api.md` 的“法规列表”和“法规后台管理”章节（接口最终事实来源）

只修改前端。不要修改后端、数据库或 OSS 配置。最终应完成：

1. 公开法规列表和详情适配新版字段。
2. Admin/Editor 法规管理页支持发布状态与审核状态分离。
3. 正式文件下载、待审文件提示、审核、批量审核、挂起、删除和丢弃待审修改行为正确。
4. 所有 FormData 请求由浏览器生成 multipart boundary。
5. 所有变更操作有忙碌态、成功反馈、精确错误提示，并在成功后重新读取服务端状态。

## 2. 当前代码基线与已知缺陷

重点检查以下文件：

- `src/pages/admin/AdminLawsPage.tsx`：使用 `any` 和已删除的 `filename`；筛选、审核按钮和 checkbox 仍只依据 `status === 'draft'`；缺少丢弃草稿；批量审核忽略部分失败。
- `src/pages/LawsPage.tsx`：页面内 `Law` 类型仍包含旧 `filename`。
- `src/pages/LawDetailPage.tsx`：错误读取详情响应中不存在的 `data.meta`。
- `src/lib/api-file.ts`：固定设置 `Content-Type: multipart/form-data`，会阻止浏览器正确附加 boundary。
- `docs/prd.md`：仍描述 `filename` 和 `api-file.ts`，实现完成后需要同步。

开始实现前运行 `git status --short`，保留用户已有改动，不重写无关文件。

## 3. 不可违背的接口约束

- `status` 仅为 `draft | published`；`review_status` 仅为 `pending | none`，两者不能互相替代。
- Admin 响应不再包含 `filename`、`secure_name` 或本地路径。
- `object_name` 和 `pending_object_name` 仅用于展示服务端返回的文件标签；不得编辑、持久缓存、计算、提交或用于拼接 OSS URL。
- `pending_file_name` 不会返回，前端不得定义或引用它。
- 只有 `status === 'published' && object_name != null` 的后台记录可以显示正式文件下载入口。
- 公开详情只依据 `has_file` 显示下载入口。
- 下载地址固定为 `/api/laws/{id}/download`，使用普通 `<a>`，让浏览器跟随 302；不要用 Axios 下载，不要请求 OSS 地址。
- 创建、修改使用 `FormData` 和现有 `src/lib/api.ts`，不得手动设置 multipart Content-Type。
- 所有成功变更都重新请求列表或详情；禁止乐观修改法规状态或文件状态。
- 批量审核 HTTP 200 只表示批处理完成，不表示所有 ID 成功；必须解析 `approved` 与 `failed`。

## 4. 建议的文件与职责划分

### 4.1 新增 `src/lib/laws.ts`

集中定义法规契约和 API 调用，避免页面内重复类型与裸 Axios 调用。至少包含：

```ts
export type LawStatus = 'draft' | 'published';
export type ReviewStatus = 'pending' | 'none';

export interface PublicLaw { /* 严格采用升级说明字段 */ }
export interface AdminLaw { /* 严格采用升级说明字段 */ }
export interface LawCountry { id: string; name_zh: string }
export interface LawScene { id: string; label_zh: string }
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
```

提供有类型的函数：

- `listPublicLaws(filters)` → `{ laws, meta }`
- `getPublicLaw(id)` → `PublicLaw`
- `getPublicLawReferences()` → 通过 `GET /laws?page=1&per_page=1` 提取 `meta.countries/scenes`
- `listAdminLaws(filters)` → `{ items, meta }`
- `getAdminLaw(id)` → `AdminLaw`
- `createAdminLaw(formData)` / `updateAdminLaw(id, formData)`
- `approveAdminLaw(id)` / `approveAdminLaws(ids)`
- `suspendAdminLaw(id)` / `discardAdminLawDraft(id)` / `deleteAdminLaw(id)`

函数只负责请求和解包 `data.data`，不在 API 层做 UI toast 或乐观更新。若为参考数据加模块级缓存，只缓存 countries/scenes；不得缓存对象名或详情响应。

### 4.2 删除 `src/lib/api-file.ts`

先用 `rg "apiFile|api-file" src` 确认只有法规管理页使用。将法规上传切换到 `api.post/put(..., formData)` 后删除该文件，并再次确认无残留导入。

### 4.3 页面文件

- 重构 `src/pages/admin/AdminLawsPage.tsx`，使用 `AdminLaw`，移除所有 `any`。
- 重构 `src/pages/LawsPage.tsx`，使用 `PublicLaw`。
- 重构 `src/pages/LawDetailPage.tsx`，使用 `PublicLaw`，不再读取详情 `data.meta`。
- 完成后更新 `docs/prd.md` 中的旧字段和 multipart 描述。

## 5. 分阶段实施步骤

### 阶段 A：共享契约与 API 层

1. 按升级说明逐字段建立 `PublicLaw` 和 `AdminLaw`，不要保留兼容性的 `filename?`。
2. 为公开/后台列表过滤器建立明确类型；只有非 `all` 值才发送 query 参数。
3. 用 `src/lib/api.ts` 发送 FormData，确认调用处没有 headers 覆盖。
4. 添加统一的法规错误消息提取函数，优先使用 `error.response.data.error.message`，再使用按状态码的中文 fallback：
   - 400：参数或操作不合法；
   - 403：权限不足；
   - 404：记录、附件或 OSS 对象不存在；
   - 409：同名文件冲突，或必须先审核/丢弃草稿；
   - 413：文件过大；
   - 502：对象存储操作失败。
5. 保持现有 `api.ts` 的 401 全局登录跳转行为，不重复实现认证清理。

### 阶段 B：公开法规列表与详情

#### `LawsPage.tsx`

1. 删除页面内旧 `Law` 接口，改用 `PublicLaw`。
2. 列表只读取新版公开字段，不显示或推断对象名。
3. 保留分页、国家、场景和关键词参数；切换筛选时回到第 1 页。
4. 正常消费列表响应中的 `meta.countries` 和 `meta.scenes`。
5. 为请求失败增加可见错误与重试入口，确保 `finally` 总能结束 loading。

#### `LawDetailPage.tsx`

1. 请求 `GET /laws/{id}` 只设置详情数据，不访问 `data.meta`。
2. 并行或随后调用 `getPublicLawReferences()` 获取国家/场景名称；参考数据失败时仍展示详情，并回退到 `country_id`/`scene_id`。
3. 详情 404 显示“法规不存在或已下架”，其他错误显示可重试状态，不把所有错误伪装成不存在。
4. 仅当 `law.has_file` 为真时渲染：

```tsx
<a href={`/api/laws/${law.id}/download`}>下载法规原件</a>
```

5. 不预取下载链接、不解析 302、不把签名 URL 放入状态。

### 阶段 C：后台列表状态与筛选

在 `AdminLawsPage.tsx` 中采用以下状态：

- `items: AdminLaw[]`
- `statusFilter: 'all' | LawStatus`
- `reviewFilter: 'all' | ReviewStatus`
- 分页、国家、场景、输入关键词和已提交关键词
- `selectedIds: Set<number>`（仅当前筛选/页内待审项）
- `activeAction`（例如 `{ type: 'approve' | 'suspend' | 'discard' | 'delete'; id: number } | null`）
- `batchApproving`, `batchFailures`, `saving`, `listError`

具体步骤：

1. `fetchList` 增加 `review_status` 参数，并在每次成功响应后同步 items、total、countries、scenes。
2. 新增审核状态筛选：“全部审核状态 / 待审核 / 无待审核”。发布状态筛选仍独立存在。
3. 页码、筛选或查询条件变化时清理不可见选择和旧的批量失败提示，避免隐藏 ID 被误提交。
4. 列表加载失败时保留页面结构，显示错误和重试按钮。
5. 状态列严格按矩阵展示：
   - `published + none`：“已发布”；
   - `published + pending`：“已发布”与“待审核修改”两个 badge；
   - `draft + pending`：“待首次审核”。
6. 不使用 `status === 'draft'` 推断是否可审核；审核按钮、checkbox、全选和批量审核候选都必须使用 `review_status === 'pending'`。

### 阶段 D：后台文件展示和编辑表单

#### 文件列

把文件列拆成最多两行：

1. `object_name` 非空：显示“正式文件：{object_name}”。仅当记录已发布时包裹 `/api/laws/{id}/download` 链接。
2. `has_pending_file === true`：显示“待审新文件”，并显示 `pending_object_name ?? '审核后确定文件名'`；禁止下载。
3. `pending_object_name != null && has_pending_file === false`：显示“审核后将重命名为：{pending_object_name}”。
4. `has_file === true && object_name === null`：不得显示正式下载入口；这表示仅存在待审文件。
5. 都不存在时显示 `-`。长对象名用 CSS 截断并通过 `title` 提供完整文本，不手动按字符切片。

#### 编辑流程

1. 点击编辑时请求 `GET /admin/laws/{id}`，以最新的合并待审预览填充表单；请求期间显示加载态，404 时刷新列表。
2. 用 `selectedFile: File | null` 取代 `fileRef as any`；对文件 input 做显式类型处理。
3. 表单展示正式文件和待审目标的只读说明，但不要将对象名放入可编辑 form 对象。
4. 提交前 trim 文本；验证中文标题、国家、场景；如果选中文件没有扩展名，直接提示并停止。
5. FormData 只追加文档列出的业务字段和可选 `file`。绝不追加 `object_name`、`pending_object_name` 或任何本地路径。
6. Admin 编辑 `published + has_draft` 时应阻止直接保存，并明确要求先审核或丢弃；即使 UI 防护失效，也必须展示后端 409 原因。
7. 保存期间禁用所有表单控件、文件选择、关闭和保存按钮，防止 OSS 慢操作产生重复请求。
8. 保存成功后关闭弹窗、toast 成功并 `await fetchList()`；失败时保留用户输入和已选文件。

### 阶段 E：单项操作、确认和角色权限

操作显示条件必须集中成小型判断函数或清晰常量，避免 JSX 中重复且不一致：

| 操作 | Admin | Editor |
|---|---|---|
| 编辑 | 可编辑无待审冲突的记录；draft 可编辑 | 可编辑允许的记录并生成/更新 draft |
| 审核 | `review_status === 'pending'` | 不显示 |
| 丢弃修改 | `status === 'published' && has_draft` | 不显示 |
| 挂起 | `status === 'published'` | 不显示 |
| 删除 | 任意记录 | 仅 `status === 'draft'` |

实施要求：

1. 使用仓库已有 `AlertDialog`（或同等明确确认 UI），不要只靠含糊的“确定删除？”：
   - 删除 published 时说明会删除正式 OSS 文件且公开页不可访问；
   - 挂起时说明公开详情和下载会失效；
   - 若挂起项 `has_draft`，额外强调待审修改会被丢弃；
   - 丢弃草稿时说明线上正式版本保持不变。
2. 每个 mutation 在发送期间禁用同一行全部破坏性/审核操作，并在按钮中显示 loading；防止重复点击。
3. 审核、挂起、删除和丢弃成功后 toast 对应结果，并重新获取列表。
4. 404 时提示记录已变化并刷新；409/502 时保留当前列表，不推断操作已成功。
5. 不对状态、文件名或行删除做乐观更新。

### 阶段 F：批量审核的部分成功语义

1. 只有 Admin 能看到 checkbox 和批量审核按钮。
2. 单选和全选只包含当前页 `review_status === 'pending'` 的记录。
3. 提交前对 ID 去重；批量请求期间禁用 checkbox、分页、筛选和相关操作。
4. 解析响应：

```ts
const { approved, failed } = await approveAdminLaws([...selectedIds]);
```

5. 从 `selectedIds` 中只移除 `approved`；失败 ID 保持选中，方便重试。
6. 显示成功数量摘要，并在表格上方渲染可关闭的失败面板；每条至少包含法规 ID、可解析时的标题、错误 code 和 message。不能只显示“部分失败”。
7. 无论是否部分失败，都重新请求列表，以服务端最终状态为准。
8. 若整个 HTTP 请求失败，不清空选择，使用统一错误提取逻辑提示。

## 6. 边界情况与防回归检查

实现时显式覆盖：

- `has_file=true, object_name=null`：仅待审文件，不可下载。
- `published + pending`：公开页继续显示旧数据；后台可审核但不能按普通 published 直接覆盖。
- 仅标题变化、未上传文件：`pending_object_name` 可能表示审核后的重命名目标。
- Admin 创建无文件法规：立即 published，但没有下载入口。
- 文件名无后缀：前端提示，后端 400 仍需正确显示。
- OSS 409/502：对话框或列表状态不得假装成功。
- 删除/挂起导致总页数减少：若当前页变为空且 `page > 1`，回退一页后重新请求。
- 直接刷新 `/laws/{id}`：国家和场景名称仍可通过独立 meta 请求得到。
- 下载接口 404：由浏览器导航处理；前端不构造备用 OSS 地址。

使用以下静态搜索确认旧协议已清除：

```bash
rg "filename|secure_name|pending_file_name|apiFile|api-file" src
rg "status === 'draft'" src/pages/admin/AdminLawsPage.tsx
rg "data\.meta" src/pages/LawDetailPage.tsx
rg "multipart/form-data" src
```

第一条允许命中普通浏览器 `File.name`，但不得命中法规 API 记录字段；第二条仅允许用于 Editor 删除条件或状态文案，不能用于审核资格。

## 7. 验证顺序

### 自动检查

1. `./node_modules/.bin/tsgo -p tsconfig.check.json`
2. `./node_modules/.bin/biome lint`（至少覆盖所有修改文件）
3. `yarn build`
4. `yarn lint`

若仓库脚本因执行权限、缺少本机工具或固定输出目录失败，记录基础设施原因，但仍需单独完成 TypeScript、Biome 和 Vite 构建；不要用修改业务代码掩盖环境问题。

### 手工验收：公开用户

1. 法规列表筛选、搜索、分页正常，卡片不依赖 `filename`。
2. 直接打开和从列表进入详情都能显示国家/场景名称。
3. 有文件的已发布法规点击下载，浏览器经 302 下载；无文件不显示入口。
4. 已挂起或删除的法规详情显示 404 状态。

### 手工验收：Editor

1. 新建带文件法规后显示 `draft + pending`、“待首次审核”和不可下载的待审文件。
2. 修改 published 后后台显示合并预览与“待审核修改”，公开页仍是旧内容。
3. Editor 不看到审核、批量审核、挂起或丢弃草稿操作。
4. Editor 只能删除 draft，403 错误可见。

### 手工验收：Admin

1. 新建带文件法规立即 published，正式文件可下载。
2. 修改标题触发对象重命名后，仍通过同一法规 ID 下载。
3. 能审核首次发布和 published 的待审修改。
4. 能丢弃 published 的待审修改，公开版本不变。
5. 挂起含 draft 的记录前显示强警告，成功后公开详情与下载不可用。
6. 删除 published 前显示 OSS 删除说明，成功后列表与公开入口消失。
7. 制造批量审核部分失败场景，确认成功项取消选择、失败项保留并逐条展示原因。

## 8. 完成定义

只有同时满足以下条件才算完成：

- `src` 中不再把 `filename`/`secure_name` 当作法规响应字段。
- 法规上传不再使用固定 multipart Content-Type，`api-file.ts` 已删除且无引用。
- 公开详情不读取不存在的 `data.meta`。
- 状态、筛选、审核按钮和 checkbox 均正确使用 `review_status`。
- 正式文件和待审文件视觉与行为明确区分，所有下载都通过后端 ID 路由。
- 丢弃草稿与挂起强警告已实现。
- 批量审核正确处理部分成功并展示每条失败原因。
- mutation 均有防重复状态、标准错误提示和成功后重新获取。
- `docs/prd.md` 与新字段/请求方式一致。
- 自动检查通过，三类角色的验收场景均有记录；没有顺手修改无关业务。
