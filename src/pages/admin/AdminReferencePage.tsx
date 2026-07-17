import {useCallback, useEffect, useState} from 'react';
import {useSelector} from 'react-redux';
import {Button} from '@/components/ui/button';
import {Input} from '@/components/ui/input';
import {Label} from '@/components/ui/label';
import {Badge} from '@/components/ui/badge';
import {Dialog, DialogContent, DialogHeader, DialogTitle,} from '@/components/ui/dialog';
import api from '@/lib/api';
import type {RootState} from '@/store';
import type {RefTableConfig} from '@/lib/reference-config';
import {Loader2, Pencil, Plus, Trash2} from 'lucide-react';
import {toast} from 'sonner';

interface Props {
    config: RefTableConfig;
}

export default function AdminReferencePage({config}: Props) {
    const role = useSelector((s: RootState) => s.auth.user?.role);
    const isAdmin = role === 'admin';
    const canEdit = isAdmin || config.editorAllowed;

    const [items, setItems] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [dlgOpen, setDlgOpen] = useState(false);
    const [editId, setEditId] = useState<string | null>(null);
    const [form, setForm] = useState<Record<string, string>>({});
    const [saving, setSaving] = useState(false);

    const fetchList = useCallback(async () => {
        setLoading(true);
        try {
            const {data} = await api.get(`/admin/${config.resourceKey}`);
            setItems(data.data.items || []);
        } catch {
            // handled by global interceptor
        } finally {
            setLoading(false);
        }
    }, [config.resourceKey]);

    useEffect(() => {
        fetchList();
    }, [fetchList]);

    const openNew = () => {
        setEditId(null);
        const init: Record<string, string> = {};
        config.fields.forEach((f) => {
            init[f.name] = '';
        });
        setForm(init);
        setDlgOpen(true);
    };

    const openEdit = (item: any) => {
        setEditId(item.id);
        const init: Record<string, string> = {};
        config.fields.forEach((f) => {
            init[f.name] = item[f.name] != null ? String(item[f.name]) : '';
        });
        setForm(init);
        setDlgOpen(true);
    };

    const handleSave = async () => {
        if (saving) return;
        const pkField = config.fields[0].name;
        const pkValue = editId ?? form[pkField];
        if (!pkValue && !editId && !form[pkField]) {
            // creating new with auto-increment PK: validate first non-PK required field
            const firstRequired = config.fields.find((f) => f.required && f.name !== pkField);
            if (firstRequired && !form[firstRequired.name]) return;
        } else if (!pkValue) return;

        const body: Record<string, any> = {};
        config.fields.forEach((f) => {
            const val = form[f.name];
            if (val !== '' && val !== undefined) {
                body[f.name] = f.type === 'number' ? Number(val) : val;
            }
        });

        setSaving(true);
        try {
            if (editId) {
                await api.put(`/admin/${config.resourceKey}/${editId}`, body);
            } else {
                await api.post(`/admin/${config.resourceKey}`, body);
            }
            setDlgOpen(false);
            fetchList();
        } catch (err: any) {
            const msg = err.response?.status === 403
                ? '权限不足'
                : err.response?.data?.error?.message || '操作失败';
            toast.error(msg);
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('确定删除？')) return;
        try {
            await api.delete(`/admin/${config.resourceKey}/${id}`);
            fetchList();
        } catch (err: any) {
            const msg = err.response?.status === 403
                ? '权限不足'
                : err.response?.data?.error?.message || '删除失败';
            toast.error(msg);
        }
    };

    return (
        <div className="flex flex-col flex-1 min-h-0">
            <div className="flex items-center justify-between mb-4 shrink-0">
                <h2 className="text-xl font-bold">{config.title}管理</h2>
                {canEdit && (
                    <Button size="sm" onClick={openNew}>
                        <Plus className="w-4 h-4 mr-1"/>新建
                    </Button>
                )}
            </div>

            {loading ? (
                <div className="flex justify-center py-20">
                    <Loader2 className="w-8 h-8 animate-spin"/>
                </div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                        <tr className="border-b text-left text-muted-foreground">
                            {config.columns.map((col) => (
                                <th key={col.key} className="p-3">{col.label}</th>
                            ))}
                            <th className="p-3">操作</th>
                        </tr>
                        </thead>
                        <tbody>
                        {items.map((item: any) => (
                            <tr key={item.id} className="border-b hover:bg-muted/30">
                                {config.columns.map((col) => (
                                    <td key={col.key} className="p-3">
                                        {item[col.key] != null ? String(item[col.key]) : '-'}
                                    </td>
                                ))}
                                <td className="p-3">
                                    {canEdit && (
                                        <div className="flex gap-1">
                                            <Button variant="ghost" size="sm" onClick={() => openEdit(item)}>
                                                <Pencil className="w-3.5 h-3.5"/>
                                            </Button>
                                            {isAdmin && (
                                                <Button variant="ghost" size="sm" onClick={() => handleDelete(item.id)}>
                                                    <Trash2 className="w-3.5 h-3.5 text-destructive"/>
                                                </Button>
                                            )}
                                        </div>
                                    )}
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>
            )}

            <Dialog open={dlgOpen} onOpenChange={setDlgOpen}>
                <DialogContent className="max-w-lg max-h-[90dvh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>{editId ? '编辑' : '新建'}{config.title}</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-2">
                        {config.fields.map((f) => (
                            <div key={f.name}>
                                <Label>{f.label}{f.required ? ' *' : ''}</Label>
                                <Input
                                    value={form[f.name] ?? ''}
                                    disabled={!!editId && f.name === config.fields[0].name}
                                    type={f.type === 'number' ? 'number' : 'text'}
                                    onChange={(e) =>
                                        setForm((p) => ({...p, [f.name]: e.target.value}))
                                    }
                                />
                            </div>
                        ))}
                        <Button
                            className="w-full"
                            onClick={handleSave}
                            disabled={saving || (!form[config.fields[0].name] && !config.fields.find((f) => f.required && form[f.name]))}
                        >
                            {saving ? '保存中...' : '保存'}
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
