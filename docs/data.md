# 数据表设计（MySQL）

> 基于首页（Hero、法规库、资讯库、机构推荐、合规报告、关于我们）及登录/注册页面梳理。

---

## 1. 用户

**对应页面**：LoginPage（登录/注册）

### users

| 字段 | 类型 | 说明 |
|------|------|------|
| `id` | BIGINT AUTO_INCREMENT (PK) | 主键 |
| `username` | VARCHAR(50) UNIQUE NOT NULL | 用户名 |
| `password_hash` | VARCHAR(255) NOT NULL | 密码哈希（bcrypt） |
| `email` | VARCHAR(255) | 邮箱 |
| `role` | ENUM('user','admin') DEFAULT 'user' | 角色 |
| `created_at` | DATETIME DEFAULT CURRENT_TIMESTAMP | 创建时间 |
| `updated_at` | DATETIME ON UPDATE CURRENT_TIMESTAMP | 更新时间 |

---

## 2. 法规库

**对应页面**：LawSection

### countries

| 字段 | 类型 | 说明 |
|------|------|------|
| `id` | VARCHAR(10) (PK) | 如 `ZA`、`NG` |
| `name_zh` | VARCHAR(50) NOT NULL | 中文名，如「南非」 |
| `name_en` | VARCHAR(100) | 英文名 |
| `sort_order` | INT DEFAULT 0 | 排序 |

### compliance_scenes

| 字段 | 类型 | 说明 |
|------|------|------|
| `id` | VARCHAR(20) (PK) | 如 `customs`、`labor` |
| `label_zh` | VARCHAR(30) NOT NULL | 中文名，如「海关进出口」 |
| `icon_name` | VARCHAR(30) | Lucide 图标名，如 `FileText` |
| `sort_order` | INT DEFAULT 0 | 排序 |

### laws

| 字段 | 类型 | 说明 |
|------|------|------|
| `id` | BIGINT AUTO_INCREMENT (PK) | 主键 |
| `title` | VARCHAR(300) NOT NULL | 法规标题 |
| `country_id` | VARCHAR(10) NOT NULL (FK → countries) | 所属国家 |
| `scene_id` | VARCHAR(20) NOT NULL (FK → compliance_scenes) | 适用场景 |
| `level` | VARCHAR(30) | 效力层级，如「国家级」「部门规章」 |
| `penalty` | TEXT | 处罚条款描述 |
| `effective_date` | DATE | 生效/修订日期 |
| `summary` | TEXT | 法规要点摘要 |
| `full_text_url` | VARCHAR(500) | 法规原文链接 |
| `created_at` | DATETIME DEFAULT CURRENT_TIMESTAMP | 创建时间 |

### company_sizes

| 字段 | 类型 | 说明 |
|------|------|------|
| `id` | VARCHAR(20) (PK) | 如 `micro`、`small`、`medium`、`large` |
| `label_zh` | VARCHAR(50) NOT NULL | 中文标签，如「中型企业（50-200人）」 |
| `min_employees` | INT | 人数下限 |
| `max_employees` | INT | 人数上限 |
| `sort_order` | INT DEFAULT 0 | 排序 |

### budget_ranges

| 字段 | 类型 | 说明 |
|------|------|------|
| `id` | VARCHAR(20) (PK) | 如 `lt100k`、`100k-500k` |
| `label_zh` | VARCHAR(50) NOT NULL | 中文标签，如「10-50万元」 |
| `min_amount` | INT | 金额下限（万元） |
| `max_amount` | INT | 金额上限（万元） |
| `sort_order` | INT DEFAULT 0 | 排序 |

### diagnosis_records

| 字段 | 类型 | 说明 |
|------|------|------|
| `id` | BIGINT AUTO_INCREMENT (PK) | 主键 |
| `user_id` | BIGINT (FK → users) | 操作用户（未登录可为空） |
| `country_id` | VARCHAR(10) (FK → countries) | 选择的目的国 |
| `size_id` | VARCHAR(20) (FK → company_sizes) | 企业规模 |
| `budget_id` | VARCHAR(20) (FK → budget_ranges) | 预算区间 |
| `created_at` | DATETIME DEFAULT CURRENT_TIMESTAMP | 生成时间 |

### diagnosis_record_scenes

| 字段 | 类型 | 说明 |
|------|------|------|
| `record_id` | BIGINT (FK → diagnosis_records) | 诊断记录 |
| `scene_id` | VARCHAR(20) (FK → compliance_scenes) | 选择的场景 |

- PRIMARY KEY (`record_id`, `scene_id`)

### diagnosis_record_laws

| 字段 | 类型 | 说明 |
|------|------|------|
| `record_id` | BIGINT (FK → diagnosis_records) | 诊断记录 |
| `law_id` | BIGINT (FK → laws) | 匹配到的法规 |

- PRIMARY KEY (`record_id`, `law_id`)

> `result_law_ids` 改用此关联表替代 PostgreSQL 数组类型。

---

## 3. 资讯库

**对应页面**：NewsSection

### news

| 字段 | 类型 | 说明 |
|------|------|------|
| `id` | BIGINT AUTO_INCREMENT (PK) | 主键 |
| `type` | ENUM('cooperation','hotspot','update') NOT NULL | 新闻类型 |
| `title` | VARCHAR(300) NOT NULL | 标题 |
| `source` | VARCHAR(200) | 来源 |
| `country_id` | VARCHAR(10) (FK → countries) | 关联国家 |
| `date` | DATE NOT NULL | 发布日期 |
| `summary` | TEXT | 摘要（cooperation / hotspot 类型） |
| `risk_level` | ENUM('high','medium','low') | 风险等级（hotspot 类型） |
| `involved_laws` | TEXT | 涉事法规（hotspot 类型） |
| `response` | TEXT | 应对建议（hotspot 类型） |
| `update_type` | ENUM('修订','新增','废止') | 更新类型（update 类型） |
| `change_desc` | TEXT | 核心更新内容（update 类型） |
| `impact` | TEXT | 对企业影响（update 类型） |
| `advice` | TEXT | 合规建议（update 类型） |
| `created_at` | DATETIME DEFAULT CURRENT_TIMESTAMP | 创建时间 |

### news_tags

| 字段 | 类型 | 说明 |
|------|------|------|
| `id` | BIGINT AUTO_INCREMENT (PK) | 主键 |
| `name_zh` | VARCHAR(30) NOT NULL UNIQUE | 标签名，如「政策利好」 |

### news_tag_relations

| 字段 | 类型 | 说明 |
|------|------|------|
| `news_id` | BIGINT (FK → news) | 新闻 |
| `tag_id` | BIGINT (FK → news_tags) | 标签 |

- PRIMARY KEY (`news_id`, `tag_id`)

---

## 4. 机构推荐

**对应页面**：AgencySection

### agency_categories

| 字段 | 类型 | 说明 |
|------|------|------|
| `id` | VARCHAR(20) (PK) | 如 `law`、`accounting`、`hr` |
| `label_zh` | VARCHAR(50) NOT NULL | 中文名，如「律师事务所」 |
| `icon_name` | VARCHAR(30) | Lucide 图标名 |
| `sort_order` | INT DEFAULT 0 | 排序 |

### agency_scenes

| 字段 | 类型 | 说明 |
|------|------|------|
| `id` | VARCHAR(30) (PK) | 如 `law-labor`、`acct-tax` |
| `category_id` | VARCHAR(20) NOT NULL (FK → agency_categories) | 所属大类 |
| `label_zh` | VARCHAR(50) NOT NULL | 中文名，如「劳工用工 / 雇佣合规」 |
| `sort_order` | INT DEFAULT 0 | 排序 |

### agencies

| 字段 | 类型 | 说明 |
|------|------|------|
| `id` | BIGINT AUTO_INCREMENT (PK) | 主键 |
| `name_zh` | VARCHAR(200) NOT NULL | 机构中文名 |
| `scene_id` | VARCHAR(30) NOT NULL (FK → agency_scenes) | 所属场景 |
| `region` | VARCHAR(300) | 覆盖区域 |
| `phone` | VARCHAR(50) | 联系电话 |
| `email` | VARCHAR(200) | 联系邮箱 |
| `business` | TEXT | 主攻业务描述 |
| `advantage` | TEXT | 核心优势描述 |
| `highlight` | VARCHAR(50) | 亮点标签，如「全非最大」 |
| `sort_order` | INT DEFAULT 0 | 排序 |

---

## 5. 平台统计

**对应页面**：HeroSection

### platform_stats


| 字段 | 类型 | 说明 |
|------|------|------|
| `id` | VARCHAR(20) (PK) | 如 `countries`、`laws`、`scenes`、`agencies` |
| `value` | VARCHAR(20) NOT NULL | 展示值，如 `6`、`19370` |
| `label_zh` | VARCHAR(50) NOT NULL | 中文说明 |
| `sort_order` | INT DEFAULT 0 | 排序 |

---

## ER 关系概览

```
users ──< diagnosis_records >── diagnosis_record_scenes ──< compliance_scenes
                  │
                  └── diagnosis_record_laws ──< laws
                  │
countries ──< laws
countries ──< news
news >── news_tag_relations ──< news_tags

agency_categories ──< agency_scenes ──< agencies
```

索引建议：
- `laws(country_id, scene_id)` — 按国家+场景筛选法规
- `agencies(scene_id)` — 按场景查机构
- `news(type, country_id)` — 按类型+国家查资讯
- `diagnosis_records(user_id)` — 按用户查历史诊断
