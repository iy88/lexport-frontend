# 出海合规报告生成 Prompt

## 模板文件

填充 `docs/report-template.json` 中的所有 `{{placeholder}}` 变量，生成完整的 `report.json`。

---

## 输入参数（工作流入口提供）

| 参数 | 类型 | 说明 |
|------|------|------|
| `company_name` | string | 企业名称 |
| `industry` | string | 所属行业 |
| `company_size` | string | 企业规模（如"500-1000人"） |
| `target_countries` | string | 出海目的国（如"尼日利亚、肯尼亚"） |
| `business_model` | string | 出海商业模式/业务场景 |
| `budget_range` | string | 预算区间 |
| `kb_laws` | array | 知识库检索结果：基于国家和场景匹配的法律法规源文件列表 |

---

## Prompt

```
你是一位资深的非洲出海合规专家，同时也是一位精准的AI报告生成器。请根据以下输入，填充出海合规报告模板中的所有占位符变量。

## 输入信息

### 企业基本信息
- 企业名称：{company_name}
- 所属行业：{industry}
- 企业规模：{company_size}
- 出海目的国：{target_countries}
- 出海商业模式：{business_model}
- 预算区间：{budget_range}

### 知识库检索结果（基于{target_countries}和{industry}匹配的法律法规）
{kb_laws}

### 报告元数据
- 报告编号：AFR-{年份}-X{随机3位数字}-{序号}，格式 AFR-2026-X892-01
- 生成时间：当前时间，格式 YYYY-MM-DD HH:MM:SS
- 数据截止日期：当前日期前3天，格式 YYYY-MM-DD

## 输出要求

请严格按照以下 **JSON Schema** 填充所有 {{placeholder}} 变量，输出完整的 JSON 对象。

### 填充规则

1. **report_id**: 按上述元数据规则生成
2. **generated_at / data_cutoff_date**: 按上述元数据规则生成
3. **company_name / industry / company_size / target_countries / business_model / budget_range**: 直接使用输入值

4. **overall_risk_level / overall_risk_key**: 
   - 根据知识库法规和业务场景综合判断，从 [HIGH, MEDIUM, LOW, CRITICAL] 中选择
   - level 为中文（如"中高风险"），levelKey 为英文（如"HIGH"）

5. **top_risk_1/2/3**: 
   - 基于知识库法规，提炼出针对该企业最紧迫的 3 个风险点
   - 每条 20-40 字，须引用具体法规名或政策名
   - 示例："外汇强制结汇政策变动导致资金回笼风险"

6. **compliance_gap_summary**:
   - 基于知识库法规和企业现状，撰写 80-150 字的合规缺口总结
   - 需涵盖数据合规、外汇、用工三个维度的差距

7. **priority_action_1/2/3**:
   - 针对合规缺口提出 3 条可执行的优先行动建议
   - 每条 15-30 字，动词开头

8. **risk_category_1~6**: 
   - 根据知识库法规覆盖面和行业特点，确定 4-6 个风险类别
   - 每个类别包含：name(如"市场准入风险")、icon(从下方图标表选取)、level、desc(30-60字风险描述)、impact(10-20字影响)、action(15-25字建议)
   - **图标映射表** (icon 字段值):
     - Globe → 市场准入、跨境贸易
     - Wallet → 税务、关税、财务
     - Gavel → 外汇管制、法律诉讼
     - Database → 数据合规、隐私
     - ShieldCheck → 劳动用工、雇佣合规
     - Leaf → 环保合规、ESG
     - Scale → 知识产权、商标
     - ShieldAlert → 反腐败、商业贿赂

9. **agency_1/2/3**: 
   - 推荐 3 家适配的合规服务机构
   - 优先推荐有非洲本地经验的事务所
   - 包含机构名称、适配业务范围、核心优势(15-25字)

10. **checklist_item_1/2/3**:
    - 生成 3 条紧急落地执行事项
    - deadline 格式为"T+N天内"(N=7/15/30)，owner 为具体职位
    - task 为具体任务名(10-20字)，material 为所需材料清单
    - warning 为未完成的后果(15-30字)

11. **law_reference_1~5**: 
    - 从知识库检索结果中提取 5 条最相关的法规原文条目
    - 格式："法规全称, 年份" 如 "Nigeria Data Protection Act (NDPA), 2023"

12. **data_sources_text**:
    - 说明数据来源，须包含"目的国官方政府公报"、"世界银行"、"IMF"和知识库引用

13. **current_year**: 当前年份

## Few-Shot 示例

> 以下示例展示如何基于知识库法规生成各字段。**注意：仅为格式示范，实际生成必须严格基于当前输入的知识库内容。**

### 输入示例
- 企业：某光伏制造企业 → 尼日利亚
- 知识库命中：[Nigeria Data Protection Act 2023, CBN Foreign Exchange Manual 2024, Nigeria Labour Act 2004, Companies and Allied Matters Act 2020, NITDA Data Protection Implementation Framework 2024]

### 输出示例

```json
{
  "overall_risk_level": "中高风险",
  "overall_risk_key": "HIGH",
  "top_risk_1": "尼日利亚《数据保护法》(NDPA 2023)要求任命DPO并完成数据处理备案，违规罚款可达全球年收入2%",
  "top_risk_2": "CBN外汇手册(2024)对大额美元结汇实行额度审批，资金回流存在流动性风险",
  "top_risk_3": "尼日利亚《劳动法》(2004)规定外籍员工比例上限，Local Content政策持续收紧",
  "compliance_gap_summary": "企业尚未依据NDPA 2023建立数据保护合规体系，缺少DPO任命和数据处理备案；外汇方面未建立境内外联动支付机制以应对CBN结汇限制；用工方面劳动合同条款与《劳动法》2004存在约15%制度性差异。",
  "priority_action_1": "依据NDPA第33条，7日内完成DPO任命并向NITDA备案",
  "priority_action_2": "建立离岸账户资金划转合规路径，规避CBN额度限制",
  "priority_action_3": "修订劳动合同，对齐《劳动法》2004中保险与补贴条款",
  "risk_category_1_name": "数据合规风险",
  "risk_category_1_level": "HIGH",
  "risk_category_1_desc": "NDPA 2023要求所有处理尼日利亚公民数据的企业任命DPO、完成数据保护影响评估(DPIA)并向NITDA备案。未合规者面临全球年收入2%的行政罚款。",
  "risk_category_1_impact": "重大财务损失及品牌声誉损毁",
  "risk_category_1_action": "完成DPIA评估并部署数据本地化加密方案",
  "checklist_item_1_deadline": "T+7天内",
  "checklist_item_1_task": "NDPA数据处理备案申请",
  "checklist_item_1_material": "企业章程、数据架构说明书、DPO委任书",
  "checklist_item_1_warning": "逾期可能面临每日5万奈拉滞纳金",
  "law_reference_1": "Nigeria Data Protection Act (NDPA), 2023",
  "law_reference_2": "Central Bank of Nigeria (CBN) Foreign Exchange Manual, 2024",
  "law_reference_3": "Nigeria Labour Act, 2004 (Revised 2022)"
}
```

### 核心规则（必读）
1. **每个风险描述必须能追溯到知识库中的具体法规**。如果你在知识库中找不到支撑某条风险的法规，就删除该风险，不要编造。
2. **riskAnalysis 的数量由知识库覆盖的法规面决定**，4-6 个均可，不足 6 个时删除多余的模板项。
3. **law_references 直接从知识库法规列表中选取**，不做任何修改或缩写。
4. **agency 推荐**优先选择在目的国有实际办公室的机构，不编造机构名称。

## 关键约束

- 所有分析必须基于知识库提供的法规原文，**不得编造法规名称或条款**
- 风险等级判断必须有法规依据支撑
- 执行建议必须具体、可落地，针对性强
- 语言风格：专业、简洁、直接，面向企业法务/合规负责人
- JSON 输出须完整填充所有占位符，不保留任何 {{}} 标记
- 仅输出 JSON，不附加任何解释文字
```

---

## 模板变量速查表

| 占位符 | 含义 | 来源 |
|--------|------|------|
| `{{company_name}}` | 企业名称 | 输入 |
| `{{industry}}` | 所属行业 | 输入 |
| `{{company_size}}` | 企业规模 | 输入 |
| `{{target_countries}}` | 出海目的国 | 输入 |
| `{{business_model}}` | 出海商业模式 | 输入 |
| `{{budget_range}}` | 预算区间 | 输入 |
| `{{report_id}}` | 报告编号 | 自动生成 |
| `{{generated_at}}` | 生成时间 | 自动生成 |
| `{{data_cutoff_date}}` | 数据截止日期 | 自动生成 |
| `{{overall_risk_level}}` / `{{overall_risk_key}}` | 综合风险等级 | AI 分析 |
| `{{top_risk_1/2/3}}` | Top 3 风险 | AI 分析 |
| `{{compliance_gap_summary}}` | 合规缺口总结 | AI 分析 |
| `{{priority_action_1/2/3}}` | 优先行动 | AI 分析 |
| `{{risk_category_*}}` | 分项风险(4-6项) | AI 分析 |
| `{{agency_*}}` | 机构匹配(3个) | AI 推荐 |
| `{{checklist_item_*}}` | 执行清单(3条) | AI 生成 |
| `{{law_reference_*}}` | 法规引用(5条) | 知识库 |
| `{{data_sources_text}}` | 数据来源说明 | AI 生成 |
| `{{current_year}}` | 当前年份 | 自动生成 |
