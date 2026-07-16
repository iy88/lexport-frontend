export interface RefField {
    name: string;
    label: string;
    type: 'text' | 'number' | 'select';
    required?: boolean;
    options?: { value: string; label: string }[];
}

export interface RefColumn {
    key: string;
    label: string;
}

export interface RefTableConfig {
    resourceKey: string;
    title: string;
    editorAllowed: boolean;
    fields: RefField[];
    columns: RefColumn[];
}

export const referenceConfigs: RefTableConfig[] = [
    {
        resourceKey: 'countries',
        title: '国家',
        editorAllowed: true,
        columns: [
            { key: 'id', label: '代码' },
            { key: 'name_zh', label: '中文名' },
            { key: 'name_en', label: '英文名' },
            { key: 'sort_order', label: '排序' },
        ],
        fields: [
            { name: 'id', label: '代码', type: 'text', required: true },
            { name: 'name_zh', label: '中文名', type: 'text', required: true },
            { name: 'name_en', label: '英文名', type: 'text' },
            { name: 'sort_order', label: '排序', type: 'number' },
        ],
    },
    {
        resourceKey: 'compliance-scenes',
        title: '合规场景',
        editorAllowed: true,
        columns: [
            { key: 'id', label: '代码' },
            { key: 'label_zh', label: '名称' },
            { key: 'sort_order', label: '排序' },
        ],
        fields: [
            { name: 'id', label: '代码', type: 'text', required: true },
            { name: 'label_zh', label: '名称', type: 'text', required: true },
            { name: 'sort_order', label: '排序', type: 'number' },
        ],
    },
    {
        resourceKey: 'agency-categories',
        title: '机构大类',
        editorAllowed: true,
        columns: [
            { key: 'id', label: '代码' },
            { key: 'label_zh', label: '名称' },
            { key: 'icon_name', label: '图标' },
            { key: 'sort_order', label: '排序' },
        ],
        fields: [
            { name: 'id', label: '代码', type: 'text', required: true },
            { name: 'label_zh', label: '名称', type: 'text', required: true },
            { name: 'icon_name', label: 'Lucide 图标名', type: 'text' },
            { name: 'sort_order', label: '排序', type: 'number' },
        ],
    },
    {
        resourceKey: 'agency-scenes',
        title: '机构场景',
        editorAllowed: true,
        columns: [
            { key: 'id', label: '代码' },
            { key: 'category_id', label: '大类' },
            { key: 'label_zh', label: '名称' },
            { key: 'sort_order', label: '排序' },
        ],
        fields: [
            { name: 'id', label: '代码', type: 'text', required: true },
            { name: 'category_id', label: '所属大类代码', type: 'text', required: true },
            { name: 'label_zh', label: '名称', type: 'text', required: true },
            { name: 'sort_order', label: '排序', type: 'number' },
        ],
    },
    {
        resourceKey: 'budget-ranges',
        title: '预算区间',
        editorAllowed: false,
        columns: [
            { key: 'id', label: '代码' },
            { key: 'label_zh', label: '名称' },
            { key: 'min_amount', label: '下限(万元)' },
            { key: 'max_amount', label: '上限(万元)' },
            { key: 'sort_order', label: '排序' },
        ],
        fields: [
            { name: 'id', label: '代码', type: 'text', required: true },
            { name: 'label_zh', label: '名称', type: 'text', required: true },
            { name: 'min_amount', label: '金额下限(万元)', type: 'number' },
            { name: 'max_amount', label: '金额上限(万元)', type: 'number' },
            { name: 'sort_order', label: '排序', type: 'number' },
        ],
    },
    {
        resourceKey: 'company-sizes',
        title: '企业规模',
        editorAllowed: false,
        columns: [
            { key: 'id', label: '代码' },
            { key: 'label_zh', label: '名称' },
            { key: 'min_employees', label: '人数下限' },
            { key: 'max_employees', label: '人数上限' },
            { key: 'sort_order', label: '排序' },
        ],
        fields: [
            { name: 'id', label: '代码', type: 'text', required: true },
            { name: 'label_zh', label: '名称', type: 'text', required: true },
            { name: 'min_employees', label: '人数下限', type: 'number' },
            { name: 'max_employees', label: '人数上限', type: 'number' },
            { name: 'sort_order', label: '排序', type: 'number' },
        ],
    },
];
