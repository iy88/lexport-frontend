import { useCallback } from 'react';
import { useDropzone, type FileRejection } from 'react-dropzone';
import { FileText, Upload, X } from 'lucide-react';
import { cn } from '@/lib/utils';

const MAX_FILES = 5;
const MAX_SIZE = 20 * 1024 * 1024; // 20MB
const ACCEPT: Record<string, string[]> = {
    'application/pdf': ['.pdf'],
    'application/msword': ['.doc'],
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
    'text/plain': ['.txt'],
    'text/html': ['.html'],
};

function formatSize(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export interface AttachmentFile {
    file: File;
    error?: string;
}

interface AttachmentSelectorProps {
    files: AttachmentFile[];
    onChange: (files: AttachmentFile[]) => void;
    disabled?: boolean;
}

export default function AttachmentSelector({ files, onChange, disabled }: AttachmentSelectorProps) {
    const onDrop = useCallback(
        (accepted: File[], rejected: FileRejection[]) => {
            const remaining = MAX_FILES - files.length;
            if (remaining <= 0) return;

            const valid: AttachmentFile[] = [];
            for (let i = 0; i < Math.min(accepted.length, remaining); i++) {
                valid.push({ file: accepted[i] });
            }

            for (const r of rejected) {
                const err = r.errors[0];
                if (err?.code === 'file-too-large') {
                    valid.push({ file: r.file, error: '文件超过 20MB' });
                } else if (err?.code === 'file-invalid-type') {
                    valid.push({ file: r.file, error: '不支持的文件格式' });
                } else {
                    valid.push({ file: r.file, error: err?.message || '文件无效' });
                }
            }

            onChange([...files, ...valid].slice(0, MAX_FILES));
        },
        [files, onChange],
    );

    const removeFile = (idx: number) => {
        onChange(files.filter((_, i) => i !== idx));
    };

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: ACCEPT,
        maxSize: MAX_SIZE,
        maxFiles: MAX_FILES - files.length,
        disabled: disabled || files.length >= MAX_FILES,
    });

    return (
        <div className="space-y-2">
            <div
                {...getRootProps()}
                className={cn(
                    'border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition-colors',
                    isDragActive && 'border-primary bg-primary/5',
                    (disabled || files.length >= MAX_FILES) && 'opacity-50 cursor-not-allowed',
                    !isDragActive && 'border-muted-foreground/25 hover:border-primary/50',
                )}
            >
                <input {...getInputProps()} />
                <Upload className="w-5 h-5 mx-auto mb-1 text-muted-foreground" />
                <p className="text-xs text-muted-foreground">
                    {files.length >= MAX_FILES
                        ? `已达上限（${MAX_FILES} 个文件）`
                        : '拖入文件或点击选择（最多 5 个，每个 ≤ 20MB）'}
                </p>
                <p className="text-[10px] text-muted-foreground/70 mt-0.5">
                    PDF / DOC / DOCX / TXT / HTML
                </p>
            </div>

            {files.length > 0 && (
                <ul className="space-y-1.5">
                    {files.map((f, i) => (
                        <li
                            key={`${f.file.name}-${i}`}
                            className={cn(
                                'flex items-center gap-2 text-xs p-2 rounded border',
                                f.error
                                    ? 'border-destructive/50 bg-destructive/5'
                                    : 'border-border bg-muted/30',
                            )}
                        >
                            <FileText className="w-3.5 h-3.5 shrink-0 text-muted-foreground" />
                            <span className="flex-1 truncate font-medium">{f.file.name}</span>
                            <span className="text-muted-foreground shrink-0">
                                {formatSize(f.file.size)}
                            </span>
                            {f.error && (
                                <span className="text-destructive text-[10px] shrink-0">{f.error}</span>
                            )}
                            {!disabled && (
                                <button
                                    type="button"
                                    className="shrink-0 text-muted-foreground hover:text-destructive transition-colors"
                                    onClick={() => removeFile(i)}
                                >
                                    <X className="w-3.5 h-3.5" />
                                </button>
                            )}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}
