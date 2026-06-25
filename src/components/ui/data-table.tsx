'use client';

import * as React from 'react';
import * as DropdownMenuPrimitive from '@radix-ui/react-dropdown-menu';
import { ChevronUp, ChevronDown, MoreHorizontal, Search, Filter, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuCheckboxItem, DropdownMenuSeparator, DropdownMenuLabel } from '@/components/ui/dropdown-menu';

export interface ColumnDef<T> {
  accessorKey: keyof T | string;
  header: string;
  cell?: (value: unknown, row: T) => React.ReactNode;
  enableSorting?: boolean;
  enableFiltering?: boolean;
  filterOptions?: { label: string; value: string }[];
  width?: string;
  align?: 'left' | 'center' | 'right';
  className?: string;
}

export interface DataTableProps<T> {
  columns: ColumnDef<T>[];
  data: T[];
  keyAccessor: (row: T) => string;
  isLoading?: boolean;
  emptyMessage?: string;
  onRowClick?: (row: T) => void;
  pagination?: {
    page: number;
    pageSize: number;
    total: number;
    onPageChange: (page: number) => void;
    onPageSizeChange: (pageSize: number) => void;
  };
  sorting?: {
    column: string;
    direction: 'asc' | 'desc';
    onSort: (column: string, direction: 'asc' | 'desc') => void;
  };
  filtering?: {
    filters: Record<string, string[]>;
    onFilterChange: (filters: Record<string, string[]>) => void;
  };
  selection?: {
    selectedKeys: Set<string>;
    onSelectionChange: (keys: Set<string>) => void;
    enableSelectAll?: boolean;
  };
  actions?: {
    label: string;
    icon?: React.ReactNode;
    onClick: (row: T) => void;
    variant?: 'default' | 'destructive' | 'outline';
    showCondition?: (row: T) => boolean;
  }[];
  className?: string;
}

function DataTableHeaderCell<T>({
  column,
  sorting,
  filtering,
  onFilterChange,
}: {
  column: ColumnDef<T>;
  sorting?: DataTableProps<T>['sorting'];
  filtering?: DataTableProps<T>['filtering'];
  onFilterChange?: (columnKey: string, values: string[]) => void;
}) {
  const [filterOpen, setFilterOpen] = React.useState(false);
  const isSorted = sorting?.column === column.accessorKey;
  const sortDirection = isSorted ? sorting.direction : null;
  const activeFilters = filtering?.filters[column.accessorKey as string]?.length || 0;

  const handleSort = () => {
    if (!column.enableSorting || !sorting) return;
    sorting.onSort(
      column.accessorKey as string,
      isSorted && sortDirection === 'asc' ? 'desc' : 'asc'
    );
  };

  const handleFilterChange = (values: string[]) => {
    onFilterChange?.(column.accessorKey as string, values);
  };

  const handleCheckboxChange = (value: string, checked: boolean) => {
    const current = filtering?.filters[column.accessorKey as string] || [];
    const next = checked ? [...current, value] : current.filter((v) => v !== value);
    handleFilterChange(next);
  };

  return (
    <th
      scope="col"
      className={cn(
        'px-4 py-3 text-left font-semibold text-xs uppercase tracking-wider',
        'border-b border-border bg-muted/30',
        'transition-colors',
        column.enableSorting && 'cursor-pointer hover:bg-muted/50 select-none',
        column.align === 'center' && 'text-center',
        column.align === 'right' && 'text-right',
        column.className
      )}
      style={{ width: column.width }}
      onClick={handleSort}
    >
      <div className="flex items-center gap-2 justify-between">
        <span>{column.header}</span>
        <div className="flex items-center gap-1">
          {column.enableSorting && (
            <span className={cn('flex items-center', isSorted && 'text-accent')}>
              {sortDirection === 'asc' ? (
                <ChevronUp className="h-4 w-4" />
              ) : sortDirection === 'desc' ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <svg className="h-4 w-4 opacity-40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="m3 15 4-4 4 4" />
                  <path d="m3 9 4 4 4-4" />
                </svg>
              )}
            </span>
          )}
          {column.enableFiltering && column.filterOptions && column.filterOptions.length > 0 && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  className={cn(
                    'p-1.5 rounded-lg transition-colors',
                    'hover:bg-muted',
                    activeFilters > 0 && 'text-accent bg-accent/10'
                  )}
                  aria-label={`Filter ${column.header}`}
                >
                  <Filter className="h-4 w-4" />
                  {activeFilters > 0 && (
                    <span className="absolute -top-1 -right-1 w-4 h-4 text-[10px] font-bold text-accent-foreground bg-accent rounded-full flex items-center justify-center">
                      {activeFilters}
                    </span>
                  )}
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-64">
                <DropdownMenuLabel className="flex items-center gap-2">
                  <Filter className="h-4 w-4" />
                  Filter by {column.header}
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                {column.filterOptions.map((option) => (
                  <DropdownMenuCheckboxItem
                    key={option.value}
                    checked={filtering?.filters[column.accessorKey as string]?.includes(option.value) || false}
                    onCheckedChange={(checked) => handleCheckboxChange(option.value, checked)}
                  >
                    {option.label}
                  </DropdownMenuCheckboxItem>
                ))}
                {activeFilters > 0 && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onSelect={() => handleFilterChange([])}
                      className="text-accent"
                      inset
                    >
                      <X className="mr-2 h-3 w-3" />
                      Clear filters
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>
    </th>
  );
}

function DataTableRow<T>({
  row,
  columns,
  keyAccessor,
  onClick,
  selection,
  actions,
  rowIndex,
}: {
  row: T;
  columns: ColumnDef<T>[];
  keyAccessor: (row: T) => string;
  onClick?: (row: T) => void;
  selection?: DataTableProps<T>['selection'];
  actions?: DataTableProps<T>['actions'];
  rowIndex: number;
}) {
  const rowKey = keyAccessor(row);
  const isSelected = selection?.selectedKeys.has(rowKey);

  const handleCheckboxChange = (checked: boolean) => {
    const nextSelected = new Set(selection?.selectedKeys);
    if (checked) {
      nextSelected.add(rowKey);
    } else {
      nextSelected.delete(rowKey);
    }
    selection?.onSelectionChange(nextSelected);
  };

  return (
    <tr
      className={cn(
        'border-b border-border transition-colors',
        'hover:bg-muted/30',
        isSelected && 'bg-accent/5',
        onClick && 'cursor-pointer'
      )}
      onClick={() => onClick?.(row)}
      style={{ animationDelay: `${rowIndex * 30}ms` }}
    >
      {selection && (
        <td className="px-4 py-3 w-12">
          <input
            type="checkbox"
            checked={isSelected}
            onChange={(e) => handleCheckboxChange(e.target.checked)}
            onClick={(e) => e.stopPropagation()}
            className="h-4 w-4 rounded border-border text-accent focus:ring-accent"
            aria-label="Select row"
          />
        </td>
      )}
      {columns.map((column, colIndex) => (
        <td
          key={colIndex}
          className={cn(
            'px-4 py-3 text-sm',
            column.align === 'center' && 'text-center',
            column.align === 'right' && 'text-right',
            column.className
          )}
          style={{ width: column.width }}
        >
          {column.cell
            ? column.cell(row[column.accessorKey], row)
            : String(row[column.accessorKey] ?? '')}
        </td>
      ))}
      {actions && actions.length > 0 && (
        <td className="px-4 py-3 w-12 text-right">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                className="p-1.5 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                aria-label="Row actions"
              >
                <MoreHorizontal className="h-4 w-4" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {actions.map((action, index) => (
                action.showCondition && !action.showCondition(row) ? null : (
                  <DropdownMenuItem
                    key={index}
                    onSelect={() => action.onClick(row)}
                    className={cn(action.variant === 'destructive' && 'text-destructive')}
                    inset={false}
                  >
                    {action.icon && <span className="mr-2 flex h-4 w-4">{action.icon}</span>}
                    {action.label}
                  </DropdownMenuItem>
                )
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </td>
      )}
    </tr>
  );
}

function DataTablePagination({
  page,
  pageSize,
  total,
  onPageChange,
  onPageSizeChange,
}: DataTableProps<any>['pagination']) {
  const totalPages = Math.ceil(total / pageSize);
  const start = (page - 1) * pageSize + 1;
  const end = Math.min(page * pageSize, total);

  if (totalPages <= 1) return null;

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-4 py-3 border-t border-border bg-muted/30">
      <div className="text-sm text-muted-foreground">
        Showing <span className="font-medium">{start}</span> to{' '}
        <span className="font-medium">{end}</span> of{' '}
        <span className="font-medium">{total}</span> results
      </div>
      <div className="flex items-center gap-2">
        <select
          value={pageSize}
          onChange={(e) => onPageSizeChange(Number(e.target.value))}
          className="h-8 px-2 text-sm border border-input rounded-lg bg-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          {[10, 25, 50, 100].map((size) => (
            <option key={size} value={size}>
              {size} per page
            </option>
          ))}
        </select>
        <div className="flex items-center gap-1">
          <Button
            variant="outline"
            size="icon"
            onClick={() => onPageChange(page - 1)}
            disabled={page <= 1}
            aria-label="Previous page"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="px-3 text-sm font-medium">
            Page {page} of {totalPages}
          </span>
          <Button
            variant="outline"
            size="icon"
            onClick={() => onPageChange(page + 1)}
            disabled={page >= totalPages}
            aria-label="Next page"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}

function DataTableToolbar({
  searchValue,
  onSearchChange,
  filtering,
  onClearFilters,
  className,
}: {
  searchValue: string;
  onSearchChange: (value: string) => void;
  filtering?: DataTableProps<any>['filtering'];
  onClearFilters?: () => void;
  className?: string;
}) {
  const hasActiveFilters = filtering && Object.values(filtering.filters).some((v) => v.length > 0);

  return (
    <div className={cn('flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4', className)}>
      <div className="relative max-w-sm w-full sm:w-72">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search..."
          value={searchValue}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10"
          aria-label="Search table"
        />
      </div>
      {hasActiveFilters && onClearFilters && (
        <Button variant="ghost" size="sm" onClick={onClearFilters} className="gap-1">
          <X className="h-3.5 w-3.5" />
          Clear filters
        </Button>
      )}
    </div>
  );
}

function DataTableSkeleton({ columns, rows = 5 }: { columns: ColumnDef<any>[]; rows?: number }) {
  return (
    <div className="rounded-lg border bg-card">
      <div className="overflow-x-auto">
        <table className="w-full caption-bottom text-sm">
          <thead className="[&_tr]:border-b">
            <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
              {columns.map((column, index) => (
                <th
                  key={index}
                  className="h-12 px-4 text-left align-middle font-semibold text-xs uppercase tracking-wider border-b border-border bg-muted/30"
                  style={{ width: column.width }}
                >
                  <div className="h-4 w-3/4 animate-pulse bg-muted-foreground/10 rounded" />
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="[&_tr:last-child]:border-0">
            {Array.from({ length: rows }).map((_, rowIndex) => (
              <tr key={rowIndex} className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                {columns.map((_, colIndex) => (
                  <td key={colIndex} className="p-4 align-middle">
                    <div className="h-4 w-full animate-pulse bg-muted-foreground/10 rounded" />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function DataTable<T>({
  columns,
  data,
  keyAccessor,
  isLoading = false,
  emptyMessage = 'No data available',
  onRowClick,
  pagination,
  sorting,
  filtering,
  selection,
  actions,
  className,
  searchValue = '',
  onSearchChange,
  onClearFilters,
}: DataTableProps<T> & {
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  onClearFilters?: () => void;
}) {
  const hasActiveFilters = filtering && Object.values(filtering.filters).some((v) => v.length > 0);

  if (isLoading) {
    return <DataTableSkeleton columns={columns} />;
  }

  if (data.length === 0) {
    return (
      <div className="rounded-lg border bg-card p-12 text-center">
        <div className="mx-auto w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-4">
          <Search className="h-6 w-6 text-muted-foreground" />
        </div>
        <p className="text-muted-foreground">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className={cn('rounded-lg border bg-card overflow-hidden', className)}>
      {(searchValue || onClearFilters || hasActiveFilters) && (
        <DataTableToolbar
          searchValue={searchValue}
          onSearchChange={onSearchChange || (() => {})}
          filtering={filtering}
          onClearFilters={onClearFilters}
        />
      )}
      <div className="overflow-x-auto">
        <table className="w-full caption-bottom text-sm" role="grid">
          <thead className="[&_tr]:border-b">
            <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
              {selection && (
                <th
                  scope="col"
                  className="h-12 px-4 w-12 text-left align-middle"
                >
                  <input
                    type="checkbox"
                    checked={selection.selectedKeys.size === data.length && data.length > 0}
                    indeterminate={selection.selectedKeys.size > 0 && selection.selectedKeys.size < data.length}
                    onChange={(e) => {
                      if (e.target.checked) {
                        selection.onSelectionChange(new Set(data.map(keyAccessor)));
                      } else {
                        selection.onSelectionChange(new Set());
                      }
                    }}
                    className="h-4 w-4 rounded border-border text-accent focus:ring-accent"
                    aria-label="Select all rows"
                  />
                </th>
              )}
              {columns.map((column) => (
                <DataTableHeaderCell
                  key={column.accessorKey as string}
                  column={column}
                  sorting={sorting}
                  filtering={filtering}
                  onFilterChange={filtering?.onFilterChange}
                />
              ))}
              {actions && actions.length > 0 && (
                <th scope="col" className="h-12 px-4 w-12 text-right align-middle" />
              )}
            </tr>
          </thead>
          <tbody className="[&_tr:last-child]:border-0">
            {data.map((row, index) => (
              <DataTableRow
                key={keyAccessor(row)}
                row={row}
                columns={columns}
                keyAccessor={keyAccessor}
                onClick={onRowClick}
                selection={selection}
                actions={actions}
                rowIndex={index}
              />
            ))}
          </tbody>
        </table>
      </div>
      {pagination && <DataTablePagination {...pagination} />}
    </div>
  );
}

import { ChevronLeft, ChevronRight } from 'lucide-react';