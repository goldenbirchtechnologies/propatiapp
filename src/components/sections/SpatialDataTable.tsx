'use client'

import MaterialIcon from '@/components/icons/material-icon';

import * as React from 'react';
import { cn } from '@/lib/utils';
import { SpatialSection } from './SpatialSection';
import { ChevronUp, ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react';


export interface ColumnDef<T> {
  key: string;
  header: string;
  sortable?: boolean;
  width?: string;
  align?: 'left' | 'center' | 'right';
  className?: string;
  cell?: (row: T, index: number) => React.ReactNode;
}

export interface SpatialDataTableProps<T> {
  columns: ColumnDef<T>[];
  data: T[];
  keyAccessor?: (row: T) => string | number;
  page?: number;
  pageSize?: number;
  total?: number;
  onPageChange?: (page: number) => void;
  sort?: {
    column: string | null;
    direction: 'asc' | 'desc';
    onSort: (column: string, direction: 'asc' | 'desc') => void;
  };
  emptyMessage?: string;
  className?: string;
}

function SortIcon({ direction }: { direction: 'asc' | 'desc' | null }) {
  if (direction === 'asc') return <ChevronUp className="h-4 w-4" />;
  if (direction === 'desc') return <ChevronDown className="h-4 w-4" />;
  return (
    <span className="inline-flex flex-col opacity-40">
      <ChevronUp className="h-3 w-3 -mb-1" />
      <ChevronDown className="h-3 w-3" />
    </span>
  );
}

export function SpatialDataTable<T>({
  columns,
  data,
  keyAccessor = ((_, i) => i) as unknown,
  page = 1,
  pageSize = 10,
  total,
  onPageChange,
  sort,
  emptyMessage = 'No data available',
  className,
}: SpatialDataTableProps<T>) {
  const totalPages = total ? Math.ceil(total / pageSize) : Math.ceil(data.length / pageSize);
  const start = (page - 1) * pageSize + 1;
  const end = Math.min(page * pageSize, total ?? data.length);

  const handleSort = (key: string) => {
    if (!sort || !sort.column || sort.column !== key) {
      sort?.onSort(key, 'asc');
    } else if (sort.direction === 'asc') {
      sort.onSort(key, 'desc');
    } else {
      sort.onSort(key, 'asc');
    }
  };

  if (data.length === 0) {
    return (
      <SpatialSection elevation={1} spacing="md" className={cn('bg-card border border-default rounded-lg', className)}>
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <p className="text-muted-foreground">{emptyMessage}</p>
        </div>
      </SpatialSection>
    );
  }

  return (
    <SpatialSection elevation={1} spacing="md" className={cn('bg-card border border-default rounded-lg', className)}>
      <div className="overflow-x-auto">
        <table className="w-full caption-bottom text-sm">
          <thead>
            <tr className="border-b border-default">
              {columns.map((col) => {
                const isSorted = sort?.column === col.key;
                return (
                  <th
                    key={col.key}
                    scope="col"
                    className={cn(
                      'px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider',
                      'border-b border-default bg-muted/20',
                      col.align === 'center' && 'text-center',
                      col.align === 'right' && 'text-right',
                      col.sortable && 'cursor-pointer select-none transition-colors hover:bg-muted/40',
                      isSorted && 'text-primary bg-primary/5'
                    )}
                    style={{ width: col.width }}
                    onClick={() => col.sortable && handleSort(col.key)}
                  >
                    <div className="flex items-center gap-2">
                      <MaterialIcon name={col.header} className="material-symbols-outlined" />
                      {col.sortable && <SortIcon direction={isSorted ? sort.direction : null} />}
                    </div>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {data.slice((page - 1) * pageSize, page * pageSize).map((row, rowIndex) => (
              <tr
                key={keyAccessor(row) as string}
                className="border-b border-default transition-colors hover:bg-muted/20"
              >
                {columns.map((col, colIndex) => (
                  <td
                    key={colIndex}
                    className={cn(
                      'px-4 py-3 text-sm text-foreground',
                      col.align === 'center' && 'text-center',
                      col.align === 'right' && 'text-right',
                      col.className
                    )}
                    style={{ width: col.width }}
                  >
                    {col.cell ? col.cell(row, rowIndex) : String((row as Record<string, unknown>)[col.key] ?? '')}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-4 py-3 border-t border-default bg-muted/20">
          <div className="text-sm text-muted-foreground">
            Showing <span className="font-medium text-foreground">{start}</span> to{' '}
            <span className="font-medium text-foreground">{end}</span> of{' '}
            <span className="font-medium text-foreground">{total ?? data.length}</span> results
          </div>
          <div className="flex items-center gap-2">
            <select
              value={pageSize}
              onChange={(e) => onPageChange?.(1)}
              className="h-8 rounded-md border border-default bg-card px-2 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              {[10, 25, 50, 100].map((size) => (
                <option key={size} value={size}>
                  {size} / page
                </option>
              ))}
            </select>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => onPageChange?.(page - 1)}
                disabled={page <= 1}
                className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-default bg-card text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:opacity-50 disabled:pointer-events-none"
                aria-label="Previous page"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <span className="px-3 text-sm font-medium text-foreground">
                Page {page} of {totalPages}
              </span>
              <button
                type="button"
                onClick={() => onPageChange?.(page + 1)}
                disabled={page >= totalPages}
                className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-default bg-card text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:opacity-50 disabled:pointer-events-none"
                aria-label="Next page"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </SpatialSection>
  );
}
