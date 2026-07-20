# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# Development
npm run dev        # Start Vite dev server on port 7080, proxies /api → localhost:6768

# Linting (runs tsgo, biome, ast-grep custom rules, tailwind check, test build)
npm run lint

# Build
npm run build      # Production build via Vite (rolldown-vite)
```

## Architecture

这是**律航出海 (LexPort)**，一个面向出海非洲的中国制造企业的法律 AI 平台。它是一个基于**秒哒 (Miaoda)** 低代码平台构建的 SPA。

**核心栈**: Vite (rolldown-vite) + React 18 + TypeScript (strict) + Tailwind CSS v3 + shadcn/ui (New York 风格，CSS 变量) + Redux Toolkit

### 路由

- `src/routes.tsx` — 扁平路由配置数组，使用 `RouteConfig`（name、path、element、public?、visible?）。标记为 `public: true` 的路由跳过认证检查。
- `src/App.tsx` — 将所有非登录/报告页面包装在 `<MainLayout>` 中。不匹配的路径重定向到 `/`（通过 `NotFound` 包罗万象的路由）。
- `react-router-dom` v7，使用 `BrowserRouter`。
- 认证后的路由（`/user/*`、`/admin/*`）使用带有侧边栏的 `UserLayout`，并通过 `<Outlet>` 渲染子路由。

### 认证与状态管理

- **Redux store** (`src/store/`) — 使用 Redux Toolkit 的 `configureStore` 和 `createAsyncThunk`。
  - `authSlice.ts` — 通过 `createAsyncThunk`（`login`、`register`、`fetchProfile`）处理登录/注册/获取个人资料。状态：`{ user, token, loading, error, init }`。
  - Token 在登录/注册时持久化到 `localStorage`（键名 `'token'`），并在 `logout` reducer 中移除。
  - 用户角色：`'user'` | `'admin'` | `'editor'`。Admin 路由仅对 admin/editor 角色可见。
- **API 层** (`src/lib/api.ts`) — Axios 实例，baseURL 为 `/api`。请求拦截器自动将 `Authorization: Bearer <token>` 从 localStorage 附加到每个请求中。
- **AuthGuard** (`src/components/common/AuthGuard.tsx`) — 包装整个应用。在挂载时，如果有 token 但无 user 数据，则派发 `fetchProfile()`。在初始加载期间显示旋转图标。
- **RequireAuth** (`src/components/common/RequireAuth.tsx`) — 保护 `/user/*` 和 `/admin/*` 路由。如果未认证，重定向到 `/login`。

### 布局与页面

- **MainLayout** (`src/components/layouts/MainLayout.tsx`) — 用于公共页面的 Navbar + 主要内容 + Footer。默认显示 Footer（在特定页面上可禁用）。
- **UserLayout** (`src/components/layouts/UserLayout.tsx`) — 用于 `/user` 和 `/admin` 路由的带侧边栏布局。侧边栏根据角色显示导航链接（admin 可看到用户管理 + 内容管理链接；editor 仅看到内容管理）。包含退出登录按钮。
- **Navbar** (`src/components/layouts/Navbar.tsx`) — 固定顶部导航栏。混合使用锚点滚动（首页章节如 `#hero`、`#about`）和路由链接（`/laws`、`/news`、`/agencies`、`/report`）。滚动时从透明过渡到实色背景。在非首页上，锚点链接会导航回 `/#<锚点>`。
- 页面：`HomePage`（包含 Hero、Laws、News、Agencies、About 章节）、`ReportPage`（合规报告）、`LoginPage`、`LawsPage`、`NewsPage`、`AgenciesPage`、`VerifyEmailPage`、`UserDashboard`、`NotFound`。
- Admin 页面（`src/pages/admin/`）：`AdminLawsPage`、`AdminNewsPage`、`AdminAgenciesPage`、`AdminUsersPage` — 位于各自的 `/admin/*` 路由下的 CRUD 管理页面。

### UI 组件

- `src/components/ui/` — shadcn/ui 原语（基于 Radix），通过 `components.json` 配置生成。约 50 个组件。
- `src/components/common/` — `PageMeta`（react-helmet-async 包装器，也通过 `AppWrapper` 导出 `HelmetProvider` + `TooltipProvider`），`AuthGuard`，`RequireAuth`，`IntersectObserver`，`ScrollToTop`。
- `src/components/home/` — 首页特定组件。
- `src/lib/utils.ts` — 标准 `cn()` 辅助函数（clsx + tailwind-merge），以及 `createQueryString()` 和 `formatDate()`。

### 路径别名

`@/` 映射到 `src/`（在 `tsconfig.json` 和 `vite.config.ts` 中均有配置）。

### 关键依赖

- **表单**: `react-hook-form` + `zod` + `@hookform/resolvers`
- **图表**: `recharts`
- **动画**: `motion`（原 framer-motion）
- **Markdown 渲染**: `streamdown`
- **Toast**: `sonner`（通过 `@/components/ui/sonner` 的 `Toaster` 组件）
- **其他**: `date-fns`、`ky`、`react-dropzone`、`embla-carousel-react`

### 代码检查栈

`npm run lint` 命令按顺序运行：

1. `tsgo -p tsconfig.check.json` — 原生 TypeScript 类型检查（使用 `@typescript/native-preview`）
2. `npx biome lint` — 仅 linter（格式化器已禁用），规则：`noUndeclaredDependencies`、`noRedeclare`、`noCommonJs`
3. `.rules/check.sh` — ast-grep 扫描项目特定规则（SelectItem 使用、对比度检查、Supabase 模式、toast hooks、slot 嵌套、按钮交互、auth provider 包装）
4. Tailwind CSS 语法检查
5. `.rules/testBuild.sh` — 冒烟测试 Vite 构建以捕获编译错误

### 秒哒平台集成

该项目运行在秒哒（百度）低代码平台上。开发服务器应**从秒哒平台**启动，而非独立启动。平台提供：
- 注入的 GUI 监听器
- 错误监控（Sentry）
- 用于 postMessage IDE 通信的 HMR 切换端点
- 用于平台 IDE 通信的 `editor-update` 虚拟模块
