import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, FileSpreadsheet } from 'lucide-react';
import { clsx } from 'clsx';
import { Button } from '../ui/Button';

interface UploadZoneProps {
  onUpload: (file: File) => Promise<void>;
  compact?: boolean;
}

export function UploadZone({ onUpload, compact = false }: UploadZoneProps) {
  const [uploading, setUploading] = useState(false);

  const onDrop = useCallback(async (accepted: File[]) => {
    if (accepted.length === 0) return;
    setUploading(true);
    try {
      for (const file of accepted) {
        await onUpload(file);
      }
    } finally {
      setUploading(false);
    }
  }, [onUpload]);

  const { getRootProps, getInputProps, isDragActive, isDragReject } = useDropzone({
    onDrop,
    accept: {
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'application/vnd.ms-excel': ['.xls'],
      'application/vnd.ms-excel.sheet.macroEnabled.12': ['.xlsm'],
    },
    multiple: true,
    disabled: uploading,
  });

  if (compact) {
    return (
      <div {...getRootProps()} className="cursor-pointer">
        <input {...getInputProps()} />
        <Button loading={uploading} variant="primary">
          <Upload size={16} />
          Upload Excel
        </Button>
      </div>
    );
  }

  return (
    <div
      {...getRootProps()}
      className={clsx(
        'border-2 border-dashed rounded-xl p-12 flex flex-col items-center justify-center text-center cursor-pointer transition-all',
        isDragActive && !isDragReject && 'border-brand-500 bg-brand-50 dark:bg-brand-900/20',
        isDragReject && 'border-red-400 bg-red-50 dark:bg-red-900/20',
        !isDragActive && !isDragReject && 'border-slate-300 dark:border-slate-600 hover:border-brand-400 dark:hover:border-brand-500 hover:bg-slate-50 dark:hover:bg-slate-800/50',
        uploading && 'opacity-60 cursor-not-allowed'
      )}
    >
      <input {...getInputProps()} />
      <div className={clsx(
        'w-14 h-14 rounded-full flex items-center justify-center mb-4 transition-colors',
        isDragActive ? 'bg-brand-100 dark:bg-brand-900/40' : 'bg-slate-100 dark:bg-slate-700'
      )}>
        {uploading ? (
          <svg className="animate-spin h-7 w-7 text-brand-600" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
          </svg>
        ) : (
          <FileSpreadsheet size={28} className={isDragActive ? 'text-brand-600' : 'text-slate-400'} />
        )}
      </div>
      {uploading ? (
        <p className="text-slate-600 dark:text-slate-300 font-medium">Uploading...</p>
      ) : isDragActive ? (
        <p className="text-brand-600 dark:text-brand-400 font-medium">Drop your Excel files here</p>
      ) : (
        <>
          <p className="text-slate-700 dark:text-slate-200 font-medium mb-1">
            Drag & drop Excel files here
          </p>
          <p className="text-slate-500 dark:text-slate-400 text-sm mb-4">or click to browse your files</p>
          <p className="text-slate-400 dark:text-slate-500 text-xs">Supports .xlsx, .xls, .xlsm • Up to 50 MB</p>
        </>
      )}
    </div>
  );
}
