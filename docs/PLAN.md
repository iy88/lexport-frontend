# 合规报告前端接入与页面建设计划

## 目标与总体方案

对接后端 `/api/compliance-reports` 异步报告接口，移除诊断页现有的本地模拟法规逻辑，形成完整流程：

1. 登录用户填写诊断信息并选择可选附件。
2. 前端以 `multipart/form-data` 创建报告任务。
3. 创建成功后显示通知并进入报告详情页。
4. 详情页轮询任务状态；完成后严格解析 JSON，并传给现有 `ComplianceReport` 组件。
5. 普通用户查看自己的分页报告列表，管理员查看全部分页报告列表。

保留现有公开 `/report` 示例页面，不改变其用途。

## 数据接口与公共类型

新增合规报告 API 模块，统一封装请求和类型：

- `ReportStatus`：
  - `queued`
  - `in_progress`
  - `completed`
  - `failed`
  - `cancelled`
- `ComplianceReportSummary`：`id`、企业信息、国家、预算、业务模式、附件数量、状态、创建时间。
- `ComplianceReportDetail`：继承摘要并增加 `result_text: string | null`。
- `ComplianceReportPage`：`reports` 与 `meta { page, per_page, total }`。
- `CreatedComplianceReport`：摘要加 `task_id`。
- API 方法：
  - `createComplianceReport(formData)`
  - `listComplianceReports(page, perPage)`
  - `getComplianceReport(id)`

创建请求字段严格映射为：

- `requirements → query`
- `companyName → company_name`
- `industry → industry`
- `size → company_size`
- `country → target_country`
- `businessModel → business_model`
- `budget → budget_range`
- 每个附件以 `documents` 重复追加到 `FormData`

使用现有带 JWT 拦截器的 `api` 实例提交 `FormData`，不手动设置 `Content-Type`，让浏览器生成 multipart boundary。

将报告数据结构改为 Zod schema，并从 schema 推导 `ComplianceReportData` 类型。详情页必须对解析后的 JSON 做运行时校验，避免错误结构导致现有报告组件崩溃。

## 页面与交互修改

### 1. 合规诊断页面

将 `/diagnosis` 改为登录保护页面：

- 未登录访问时跳转 `/login`。
- 登录成功后返回原始 `/diagnosis` 路径，而不是首页。
- 页面仍使用公共站点 `MainLayout`，不进入用户后台布局。

表单调整：

- 删除 `demoLaws`、本地匹配结果和“重新初诊”模拟流程。
- 所有后端字段均设为必填；附件为可选。
- 将当前 `scenes: string[]` 改为单一 `businessModel: string`。
- “业务场景”字段改名为“业务模式/场景”。
- 目的国按后端要求使用单个字符串，不再提示输入多个国家。
- 提交前执行 trim 和前端校验：
  - 目的国不超过 30 字符。
  - 企业规模、业务模式、预算范围分别不超过 20 字符。
  - 需求描述、企业名称、行业等不得为空。

附件选择器使用 `react-dropzone` 创建受控组件，不复用 Supabase 上传逻辑：

- 最多 5 个文件。
- 单文件最大 20MB。
- 支持 PDF、DOC、DOCX、TXT、HTML。
- 展示文件名、大小、类型错误与删除按钮。
- 文件只在提交整个诊断表单时上传，不单独提前上传。
- 防止多次拖入后总数量超过 5。
- 提交期间禁用字段、文件操作和按钮，并显示上传/创建中的加载状态。

提交结果：

- HTTP 202：显示 Sonner 成功通知“报告任务已提交，正在生成”。
- 根据当前角色跳转：
  - 普通用户/editor：`/user/reports/{id}`
  - admin：`/admin/reports/{id}`
- 请求失败时保留表单和附件，显示后端 `error.message`。
- 为 400、413、502 和通用网络错误提供清晰中文通知。
- 防止重复提交。

### 2. 用户报告列表与详情

新增路由：

- `/user/reports`
- `/user/reports/:id`

在用户侧边栏为普通用户和 editor 增加“我的合规报告”；管理员使用管理入口，避免同一管理员账号出现两个实际都返回全量数据的入口。

列表固定请求 `per_page=20`，展示：

- 企业名称
- 行业
- 目的国
- 业务模式
- 预算范围
- 附件数量
- 状态
- 创建时间
- “查看详情”操作

状态显示统一为：

- `queued`：排队中
- `in_progress`：生成中
- `completed`：已完成
- `failed`：生成失败
- `cancelled`：已取消

列表提供加载、空数据、请求失败与重试状态。空列表为普通用户提供“发起合规初诊”按钮。

分页使用后端 `meta.total` 计算总页数，提供上一页、当前页/总页数、总记录数、下一页；切页时重新请求，并防止越界。

### 3. 管理员报告列表与详情

新增路由：

- `/admin/reports`
- `/admin/reports/:id`

管理员侧边栏新增“合规报告管理”，只对 `role === 'admin'` 显示。报告管理路由额外使用 admin 角色守卫；editor 直接访问时重定向用户后台或显示无权限，不能误用管理员页面查看自己的记录。

管理员页面复用用户侧的列表、分页、状态展示和详情逻辑，仅调整：

- 页面标题为“全部合规报告”。
- 详情返回路径为 `/admin/reports`。
- 空状态不显示“发起诊断”CTA。

管理员仍调用相同的 `/api/compliance-reports` 接口，由后端 JWT 角色自动返回全部记录。当前接口未返回提交用户身份，因此管理员列表不展示“提交用户”；本次不要求修改后端。

### 4. 共享详情页与报告渲染

实现共享详情容器，通过 `basePath` 或 `scope: 'user' | 'admin'` 控制返回地址。

详情页首次加载后：

- `queued` / `in_progress`：显示企业元数据和生成中状态，每 3 秒重新请求详情。
- `completed`：停止轮询，严格执行 `JSON.parse(result_text.trim())`，再通过 Zod schema 校验，成功后传入 `<ComplianceReport data={reportData}/>`。
- `failed`：停止轮询，显示“报告生成失败”；后端目前没有失败详情字段，因此不虚构具体原因。
- `cancelled`：停止轮询，显示“报告生成已取消”。
- 404：显示报告不存在或无权限。
- 临时网络错误：保留已有页面状态，提示刷新失败并继续稍后重试，同时提供手动重试按钮。
- 卸载组件或切换报告 ID 时清理计时器，避免重复请求。

严格遵循已确认的 JSON 策略：

- 不渲染 Markdown。
- 不展示无法解析的原始结果。
- `result_text` 为空、包含代码围栏、不是合法 JSON 或不符合 schema 时，显示“报告格式异常，请联系管理员或稍后刷新”。
- 不自动修复、截取或猜测模型输出。

为适配 `UserLayout` 的固定高度和 `overflow-hidden`，详情页自身提供纵向滚动容器；现有 `ComplianceReport` 继续负责报告主体展示。

## 路由与复用结构

建议新增共享实现而不是复制用户/管理员页面：

- 一个报告列表组件，接收标题、详情基础路径和空状态配置。
- 一个报告详情组件，接收列表返回路径和访问 scope。
- 一个附件选择组件。
- 一个 API/类型/schema 模块。

路由层只传入配置。现有 `/report` 继续加载临时 JSON 示例；动态详情页才使用后端 `result_text`。

登录页和 `RequireAuth` 增加来源路径恢复能力，但不得改变普通登录入口默认登录后回首页的行为。

## 验证与验收

静态验证：

- TypeScript 严格检查通过。
- Biome lint 通过。
- `yarn build` 成功。
- 若仓库 `.rules` 脚本权限或 `ast-grep` 环境问题仍存在，分别运行可用检查并记录环境阻塞。

手动验收场景：

1. 未登录访问 `/diagnosis`，登录后正确返回诊断页。
2. 无附件提交成功，显示成功通知并进入详情轮询。
3. 选择 1–5 个合法附件，FormData 中存在重复的 `documents` 字段。
4. 第 6 个附件、超过 20MB 或不支持格式在客户端被拒绝。
5. 400、413、502、网络失败均显示后端错误且不清空表单。
6. 提交过程中按钮不可重复点击。
7. `queued → in_progress → completed` 后停止轮询并渲染结构化报告。
8. `failed`、`cancelled`、404、网络错误显示对应状态。
9. 非 JSON 或 schema 不合法的 `result_text` 不进入报告组件。
10. 普通用户列表只能看到自己的记录，管理员列表能看到全部记录。
11. editor 不可访问管理员报告路由，但可查看自己的报告。
12. 用户和管理员列表的上一页、下一页、总数和边界页行为正确。
13. 详情页长报告可正常纵向滚动，返回按钮回到对应列表。

## 已确定的假设

- `/diagnosis` 必须登录后访问。
- 创建成功后立即进入详情页并自动轮询。
- 报告结果严格只接受合法 JSON，不提供 Markdown 降级展示。
- 后端接口和响应结构以 `lexport-backend/docs/api.md` 第 14 节及当前实现为准。
- 本次只修改前端；不增加管理员提交人字段、状态筛选、删除、取消或重新生成接口。
- 列表每页固定 20 条，不增加后端尚未支持的搜索与筛选参数。
