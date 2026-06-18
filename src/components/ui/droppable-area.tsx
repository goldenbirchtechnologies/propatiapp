'use client';

import * as React from 'react';
import { Upload, FileText, X, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';

interface DroppableAreaProps {
  onFilesSelected: (files: File[]) => void;
  accept?: string;
  maxFiles?: number;
  maxSize?: number; // in bytes
  multiple?: boolean;
  disabled?: boolean;
  className?: string;
  children?: React.ReactNode;
  showFileList?: boolean;
  files?: { file: File; progress: number; status: 'pending' | 'uploading' | 'completed' | 'error'; error?: string }[];
  onRemoveFile?: (index: number) => void;
  onRetryFile?: (index: number) => void;
}

export function DroppableArea({
  onFilesSelected,
  accept,
  maxFiles = 1,
  maxSize = 10 * 1024 * 1024, // 10MB default
  multiple = false,
  disabled = false,
  className,
  children,
  showFileList = true,
  files = [],
  onRemoveFile,
  onRetryFile,
}: DroppableAreaProps) {
  const [isDragActive, setIsDragActive] = React.useState(false);
  const [fileInputRef, setFileInputRef] = React.useState<HTMLInputElement | null>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setIsDragActive(true);
    } else if (e.type === 'dragleave') {
      setIsDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);

    if (disabled) return;

    const droppedFiles = Array.from(e.dataTransfer.files);
    processFiles(droppedFiles);
  };

  const handleClick = () => {
    if (!disabled && fileInputRef) {
      fileInputRef.click();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      processFiles(Array.from(e.target.files));
      e.target.value = '';
    }
  };

  const processFiles = (newFiles: File[]) => {
    const validFiles: File[] = [];
    const errors: string[] = [];

    for (const file of newFiles) {
      if (validFiles.length >= maxFiles) {
        errors.push(`Maximum ${maxFiles} file(s) allowed`);
        break;
      }

      if (file.size > maxSize) {
        errors.push(`${file.name} exceeds maximum size of ${formatFileSize(maxSize)}`);
        continue;
      }

      if (accept && !matchesAccept(file, accept)) {
        errors.push(`${file.name} is not an accepted file type`);
        continue;
      }

      validFiles.push(file);
    }

    if (errors.length > 0) {
      console.warn(errors.join(', '));
    }

    if (validFiles.length > 0) {
      onFilesSelected(validFiles);
    }
  };

  const matchesAccept = (file: File, accept: string): boolean => {
    const acceptTypes = accept.split(',').map((t) => t.trim());
    return acceptTypes.some((type) => {
      if (type.startsWith('.')) {
        return file.name.toLowerCase().endsWith(type.toLowerCase());
      }
      if (type.endsWith('/*')) {
        return file.type.startsWith(type.slice(0, -1));
      }
      return file.type === type;
    });
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div
      className={cn(
        'relative border-2 border-dashed rounded-xl transition-all',
        'flex flex-col items-center justify-center p-8 text-center',
        disabled && 'opacity-50 cursor-not-allowed',
        isDragActive && !disabled
          ? 'border-accent bg-accent/5'
          : 'border-border hover:border-accent/50 hover:bg-muted/30',
        className
      )}
      onDragEnter={handleDrag}
      onDragLeave={handleDrag}
      onDragOver={handleDrag}
      onDrop={handleDrop}
      onClick={handleClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && handleClick()}
    >
      <input
        ref={setFileInputRef}
        type="file"
        accept={accept}
        multiple={multiple}
        disabled={disabled}
        onChange={handleFileChange}
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        aria-label="Upload files"
      />

      {children || (
        <>
          <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-4" style={{ color: 'var(--muted)' }}>
            <Upload className="h-6 w-6" />
          </div>
          <p className="font-medium text-base mb-1" style={{ color: 'var(--text)' }}>
            {isDragActive ? 'Drop files here...' : 'Drag & drop files here, or click to browse'}
          </p>
          <p className="text-sm" style={{ color: 'var(--muted)' }}>
            {accept ? `Accepted: ${accept}` : 'All file types accepted'}
            {maxFiles > 1 && ` · Up to ${maxFiles} files`}
            {maxSize && ` · Max ${formatFileSize(maxSize)} each`}
          </p>
        </>
      )}

      {showFileList && files.length > 0 && (
        <div className="w-full mt-6 space-y-3">
          <h4 className="text-sm font-medium" style={{ color: 'var(--muted)' }}>Selected Files</h4>
          {files.map((fileData, index) => (
            <div
              key={index}
              className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg border border-border"
            >
              <div className="w-10 h-10 rounded-lg bg-background flex items-center justify-center flex-shrink-0">
                {fileData.status === 'completed' ? (
                  <CheckCircle className="h-5 w-5 text-green-500" />
                ) : fileData.status === 'error' ? (
                  <AlertCircle className="h-5 w-5 text-red-500" />
                ) : fileData.status === 'uploading' ? (
                  <Loader2 className="h-5 w-5 animate-spin text-accent" />
                ) : (
                  <FileText className="h-5 w-5 text-muted-foreground" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm truncate" style={{ color: 'var(--text)' }}>
                  {fileData.file.name}
                </p>
                <p className="text-xs" style={{ color: 'var(--muted)' }}>
                  {formatFileSize(fileData.file.size)}
                </p>
                {fileData.status === 'uploading' && (
                  <Progress value={fileData.progress} className="mt-1 h-1.5" />
                )}
                {fileData.status === 'error' && fileData.error && (
                  <p className="text-xs text-red-500 mt-1">{fileData.error}</p>
                )}
              </div>
              <div className="flex items-center gap-2">
                {fileData.status === 'error' && onRetryFile && (
                  <Button variant="ghost" size="icon" onClick={() => onRetryFile(index)} className="h-8 w-8">
                    <Loader2 className="h-4 w-4" />
                  </Button>
                )}
                {onRemoveFile && (
                  <Button variant="ghost" size="icon" onClick={() => onRemoveFile(index)} className="h-8 w-8 text-destructive hover:text-destructive">
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}