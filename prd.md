# LexPort 前端页面功能文档 (PRD)

> 律航出海 (LexPort) — 面向出海非洲的中国制造企业的法律 AI 平台
> 路由架构: React Router v7 + Redux Toolkit + shadcn/ui

---

## 一、公共页面

### 1. 首页 (`/`) — HomePage + 6 个 Section

| Section | 文件 | 说明 |
|---------|------|------|
| Hero | `HeroSection.tsx` | 平台简介 + 实时统计（调用 `GET /api/stats`） |
| Law | `LawSection.tsx` | 法规库入口展示 |
| News | `NewsSection.tsx` | 资讯库入口展示 |
| Agency | `AgencySection.tsx` | 机构推荐入口展示 |
| Report | `ReportSection.tsx` | 合规报告入口 |
| About | `AboutSection.tsx` | 关于我们 |

Features:
- Hero 展示 4 项实时统计（覆盖国家、法规条文、合规场景、合作机构）
- 导航栏锚点平滑滚动

### 2. 法规库 (`/laws`) — LawsPage

| 功能 | 状态 |
|------|------|
| 国家筛选 (来自 `meta.countries`) | ✅ |
| 场景筛选 (来自 `meta.scenes`) | ✅ |
| 关键词搜索 (中英文标题) | ✅ |
| 分页 (每页 6 条) | ✅ |
| 卡片展示 (中文标题 + law_number + scene badge + summary) | ✅ |
| 生效年份 (📅 图标 + 年份，固定在卡片底部) | ✅ |
| 字段: `title_cn`, `title_en`, `law_number`, `country_id`, `scene_id`, `effective_date`, `summary`, `filename` | ✅ |

### 3. 资讯库 (`/news`) — NewsPage

| 功能 | 状态 |
|------|------|
| 类型 Tab 切换 (中非合作 / 合规热点 / 法规更新) | ✅ |
| 国家筛选 | ✅ |
| 关键词搜索 | ✅ |
| 分页 (每页 6 条) | ✅ |
| 三种卡片布局 (cooperation / hotspot / update 各自不同) | ✅ |
| 标签 (tags) 展示 | ✅ |
| 标题可点击 → 跳转详情页 `/news/:id` | ✅ |

### 4. 资讯详情 (`/news/:id`) — NewsDetailPage

| 功能 | 状态 |
|------|------|
| 返回资讯列表链接 | ✅ |
| 标题、来源、日期、风险等级展示 | ✅ |
| 标签展示 | ✅ |
| 摘要卡片 | ✅ |
| 类型特定字段 (hotspot: 涉事法规+应对建议; update: 更新类型+变更+影响+建议) | ✅ |
| 正文 content 渲染 | ✅ |
| 空内容/不存在处理 | ✅ |

### 5. 机构推荐 (`/agencies`) — AgenciesPage

| 功能 | 状态 |
|------|------|
| 大类 Tab 切换 (律所 / 会计 / HR，含 icon) | ✅ |
| 场景筛选 (根据大类动态联动) | ✅ |
| 关键词搜索 | ✅ |
| 分页 (每页 8 条) | ✅ |
| 卡片展示 (名称、场景、区域、电话、邮箱、业务、优势) | ✅ |

### 6. 合规报告 (`/report`) — ReportPage

静态 Demo 页面，展示合规报告模板（AI 诊断、风险分析、机构匹配、执行清单）

### 7. 登录 (`/login`) — LoginPage

| 功能 | 状态 |
|------|------|
| 用户名/邮箱 + 密码登录 | ✅ |
| 注册入口 | ✅ |
| Redux auth state 管理 | ✅ |
| JWT token localStorage 持久化 | ✅ |

### 8. 邮箱验证 (`/verify-email/:token`) — VerifyEmailPage

### 9. 404 (`*`) — NotFound

---

## 二、认证后页面 (UserLayout 侧边栏)

### 10. 仪表盘 (`/user`) — UserDashboard

用户个人首页，基础信息展示。

---

## 三、Admin 管理页面

> 所有管理页面共用侧边栏 `UserLayout`，路由前缀 `/admin`，由 `RequireAuth` 保护。

### 权限矩阵

| 页面 | 路由 | admin | editor |
|------|------|-------|--------|
| 仪表盘 | `/user` | ✅ | ✅ |
| 用户管理 | `/admin/users` | ✅ | — |
| 法规管理 | `/admin/laws` | ✅ | ✅ |
| 资讯管理 | `/admin/news` | ✅ | ✅ |
| 机构管理 | `/admin/agencies` | ✅ | ✅ |
| 国家 | `/admin/reference/countries` | ✅ | ✅ |
| 合规场景 | `/admin/reference/compliance-scenes` | ✅ | ✅ |
| 机构大类 | `/admin/reference/agency-categories` | ✅ | ✅ |
| 机构场景 | `/admin/reference/agency-scenes` | ✅ | ✅ |
| 预算区间 | `/admin/reference/budget-ranges` | ✅ | — |
| 企业规模 | `/admin/reference/company-sizes` | ✅ | — |

### 11. 法规管理 (`/admin/laws`) — AdminLawsPage

| 功能 | 状态 |
|------|------|
| 筛选: status(draft/published) + country + scene + keyword | ✅ |
| 表格: 标题、国家、场景、文件(filename)、状态、更新时间、操作 | ✅ |
| 创建/编辑 (Dialog 表单, multipart/form-data + 文件上传) | ✅ |
| 删除 (admin 任意 / editor 仅 draft) | ✅ |
| 审核通过 (admin, 单条) | ✅ |
| 挂起 (admin, published → draft) | ✅ |
| 批量审核 (admin, checkbox 多选 draft) | ✅ |
| 防重复提交 (saving state) | ✅ |
| 文件名列中间省略显示 | ✅ |
| 分页 | ✅ |

### 12. 资讯管理 (`/admin/news`) — AdminNewsPage

| 功能 | 状态 |
|------|------|
| 筛选: status + type + country + date_from/to + keyword | ✅ |
| 表格: 标题、类型、国家、状态、更新时间、操作 | ✅ |
| 创建/编辑 (含 content 正文 + tag_ids 多选标签) | ✅ |
| 删除 (admin 任意 / editor 仅 draft) | ✅ |
| 审核通过 (admin, 单条) | ✅ |
| 挂起 (admin, published → draft) | ✅ |
| 批量审核 (admin, checkbox 多选 draft) | ✅ |
| 防重复提交 (saving state) | ✅ |
| 分页 | ✅ |

Editor 角色: 创建/编辑自动进入 draft，不可直接发布。

### 13. 机构管理 (`/admin/agencies`) — AdminAgenciesPage

| 功能 | 状态 |
|------|------|
| 筛选: status + category + scene(联动) + region + keyword | ✅ |
| 表格: 名称、场景、区域、状态、更新时间、操作 | ✅ |
| 创建/编辑 (Dialog 表单) | ✅ |
| 删除 (admin 任意 / editor 仅 draft) | ✅ |
| 审核通过 (admin, 单条) | ✅ |
| 挂起 (admin, published → draft) | ✅ |
| 批量审核 (admin, checkbox 多选 draft) | ✅ |
| 防重复提交 (saving state) | ✅ |
| 分页 | ✅ |

### 14. 用户管理 (`/admin/users`) — AdminUsersPage

| 功能 | 状态 |
|------|------|
| 表格: ID、用户名、邮箱、邮箱验证、角色、注册时间、更新时间 | ✅ |
| 角色修改 (inline select, 不能改管理员) | ✅ |
| 403 错误 toast 提示 | ✅ |
| 分页 | ✅ |

### 15-20. 参考表管理 — AdminReferencePage

| 参考表 | route | 字段 |
|--------|-------|------|
| 国家 | `/admin/reference/countries` | id, name_zh, name_en, sort_order |
| 合规场景 | `/admin/reference/compliance-scenes` | id, label_zh, sort_order |
| 机构大类 | `/admin/reference/agency-categories` | id, label_zh, icon_name, sort_order |
| 机构场景 | `/admin/reference/agency-scenes` | id, category_id, label_zh, sort_order |
| 预算区间 | `/admin/reference/budget-ranges` | id, label_zh, min_amount, max_amount, sort_order |
| 企业规模 | `/admin/reference/company-sizes` | id, label_zh, min_employees, max_employees, sort_order |

通用 CRUD 组件，无分页（全量），无 draft/approve 机制。admin 全部可操作，editor 仅前 4 张表。

---

## 四、布局与导航

| 组件 | 说明 |
|------|------|
| `MainLayout` | Navbar + main + Footer (公共页面) |
| `UserLayout` | 侧边栏 + Outlet (认证后页面) |
| `Navbar` | 固定顶部，锚点滚动 + 路由链接混合，当前路由高亮 |
| `Footer` | 全局页脚 |

---

## 五、API 对接总结

| 模块 | 端点 | 状态 |
|------|------|------|
| Auth | POST /api/auth/login, register, verify-email | ✅ |
| Auth | GET /api/user/profile | ✅ |
| Laws | GET /api/laws | ✅ |
| Laws | CRUD /api/admin/laws + multipart + approve/suspend/batch | ✅ |
| News | GET /api/news, /api/news/:id | ✅ |
| News | CRUD /api/admin/news + approve/suspend/batch | ✅ |
| Agencies | GET /api/agencies | ✅ |
| Agencies | CRUD /api/admin/agencies + approve/suspend/batch | ✅ |
| Stats | GET /api/stats | ✅ |
| Users | GET/PUT /api/admin/users | ✅ |
| Reference | CRUD /api/admin/{resource} (6 tables) | ✅ |

---

## 六、技术要点

- **认证**: Redux Toolkit (`authSlice`), JWT 存在 localStorage, axios 拦截器自动附加 `Authorization` header
- **401 处理**: response 拦截器自动清 token 并跳转登录
- **权限**: admin 全部权限, editor 部分受限 (不能管理用户/预算/企业规模, 创建自动 draft)
- **Multipart**: laws 创建/更新使用 `api-file.ts` (FormData)
- **防重复提交**: 所有管理页面 Dialog 保存按钮均有 `saving` 状态锁
- **批量操作**: laws/news/agencies 管理页支持 checkbox 多选 + 批量审核
- **Draft 机制**: editor 创建/修改自动进入 draft; admin 审核通过后对外发布; admin 可挂起回退
