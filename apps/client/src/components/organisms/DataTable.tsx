import {
  type ColumnDef,
  type ColumnFiltersState,
  type PaginationState,
  type SortingState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table';
import {
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  Download,
  GripVertical,
  Printer,
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Button } from '@/components/atoms/Button';
import { Input } from '@/components/atoms/Input';
import { Select } from '@/components/atoms/Select';
import { cn } from '@/lib/utils';

type DataTableProps<TData> = {
  columns: ColumnDef<TData, unknown>[];
  data: TData[];
  caption?: string;
  emptyLabel?: string;
  searchPlaceholder?: string;
  statusFilterLabel?: string;
  statusAllLabel?: string;
  exportCsvLabel?: string;
  printLabel?: string;
  rowsPerPageLabel?: string;
  prevLabel?: string;
  nextLabel?: string;
  enableColumnReorder?: boolean;
  className?: string;
};

export const DataTable = <TData,>({
  columns,
  data,
  caption,
  emptyLabel = 'No data',
  searchPlaceholder = 'Search...',
  statusFilterLabel = 'Status',
  statusAllLabel = 'All',
  exportCsvLabel = 'Export CSV',
  printLabel = 'Print',
  rowsPerPageLabel = 'Rows per page',
  prevLabel = 'Prev',
  nextLabel = 'Next',
  enableColumnReorder = true,
  className,
}: DataTableProps<TData>) => {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = useState('');
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 5,
  });
  const [columnOrder, setColumnOrder] = useState<string[]>(() =>
    columns.map((column, index) => getColumnId(column, index))
  );
  const [draggingColumnId, setDraggingColumnId] = useState<string | null>(null);

  const table = useReactTable({
    data,
    columns,
    state: { sorting, globalFilter, columnFilters, pagination, columnOrder },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    onColumnFiltersChange: setColumnFilters,
    onPaginationChange: setPagination,
    onColumnOrderChange: setColumnOrder,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  useEffect(() => {
    setColumnOrder(columns.map((column, index) => getColumnId(column, index)));
  }, [columns]);

  const statusColumn = table.getColumn('status');
  const statusOptions = useMemo(() => {
    if (!statusColumn) return [];
    const values = new Set<string>();
    table
      .getPreFilteredRowModel()
      .rows.forEach(row => values.add(String(row.getValue('status'))));
    return Array.from(values);
  }, [statusColumn, table]);

  const exportCsv = () => {
    const columnsForExport = table.getAllLeafColumns();
    const header = columnsForExport.map(column =>
      columnHeaderToString(column.columnDef.header, column.id)
    );

    const rows = table.getFilteredRowModel().rows.map(row =>
      columnsForExport.map(column => stringifyCell(row.getValue(column.id)))
    );

    const csv = [header, ...rows].map(line => line.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'data-table.csv';
    link.click();
    URL.revokeObjectURL(url);
  };

  const printTable = () => {
    const columnsForExport = table.getAllLeafColumns();
    const header = columnsForExport.map(column =>
      columnHeaderToString(column.columnDef.header, column.id)
    );

    const rows = table.getFilteredRowModel().rows.map(row =>
      columnsForExport.map(column => toPlainText(row.getValue(column.id)))
    );

    const html = `
      <html>
        <head>
          <title>Data table</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 16px; }
            table { width: 100%; border-collapse: collapse; }
            th, td { border: 1px solid #ccc; padding: 8px; text-align: left; }
            th { background: #f5f5f5; }
          </style>
        </head>
        <body>
          <table>
            <thead>
              <tr>${header.map(cell => `<th>${escapeHtml(cell)}</th>`).join('')}</tr>
            </thead>
            <tbody>
              ${rows
                .map(
                  row =>
                    `<tr>${row.map(cell => `<td>${escapeHtml(cell)}</td>`).join('')}</tr>`
                )
                .join('')}
            </tbody>
          </table>
        </body>
      </html>
    `;

    const iframe = document.createElement('iframe');
    iframe.style.position = 'fixed';
    iframe.style.right = '0';
    iframe.style.bottom = '0';
    iframe.style.width = '0';
    iframe.style.height = '0';
    iframe.style.border = '0';
    document.body.appendChild(iframe);

    const iframeDoc = iframe.contentDocument ?? iframe.contentWindow?.document;
    if (!iframeDoc) {
      document.body.removeChild(iframe);
      return;
    }
    iframeDoc.open();
    iframeDoc.write(html);
    iframeDoc.close();

    const targetWindow = iframe.contentWindow;
    if (!targetWindow) {
      document.body.removeChild(iframe);
      return;
    }
    targetWindow.focus();
    targetWindow.print();
    setTimeout(() => {
      document.body.removeChild(iframe);
    }, 500);
  };

  return (
    <div className={cn('rounded-md border', className)}>
      <div className="flex flex-col gap-3 border-b bg-muted/10 px-4 py-3">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm text-muted-foreground">{rowsPerPageLabel}</span>
          <Select
            value={String(table.getState().pagination.pageSize)}
            onValueChange={value => table.setPageSize(Number(value))}
            options={[
              { label: '5', value: '5' },
              { label: '10', value: '10' },
              { label: '20', value: '20' },
            ]}
          />
        </div>
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-wrap items-center gap-2">
            <Input
              value={globalFilter ?? ''}
              onChange={event => setGlobalFilter(event.target.value)}
              placeholder={searchPlaceholder}
              className="h-9 w-full md:w-60"
            />
            {statusColumn ? (
              <Select
                value={(statusColumn.getFilterValue() as string | undefined) ?? 'all'}
                onValueChange={value => {
                  statusColumn.setFilterValue(value === 'all' ? undefined : value);
                }}
                placeholder={statusFilterLabel}
                options={[
                  { label: statusAllLabel, value: 'all' },
                  ...statusOptions.map(value => ({ label: value, value })),
                ]}
              />
            ) : null}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button variant="outline" size="sm" onClick={exportCsv}>
              <Download className="size-4" />
              <span>{exportCsvLabel}</span>
            </Button>
            <Button variant="outline" size="sm" onClick={printTable}>
              <Printer className="size-4" />
              <span>{printLabel}</span>
            </Button>
          </div>
        </div>
      </div>
      <table className="w-full text-sm">
        {caption ? <caption className="sr-only">{caption}</caption> : null}
        <thead className="bg-muted/40">
          {table.getHeaderGroups().map(headerGroup => (
            <tr key={headerGroup.id} className="text-left">
              {headerGroup.headers.map(header => {
                const canSort = header.column.getCanSort();
                const isSorted = header.column.getIsSorted();
                const sortIcon =
                  isSorted === 'asc' ? (
                    <ArrowUp className="size-4" />
                  ) : isSorted === 'desc' ? (
                    <ArrowDown className="size-4" />
                  ) : (
                    <ArrowUpDown className="size-4 text-muted-foreground" />
                  );
                return (
                  <th
                    key={header.id}
                    className={cn(
                      'px-4 py-2 font-medium text-foreground',
                      canSort && 'cursor-pointer select-none'
                    )}
                    onClick={canSort ? header.column.getToggleSortingHandler() : undefined}
                    draggable={enableColumnReorder}
                    onDragStart={event => {
                      if (!enableColumnReorder) return;
                      event.dataTransfer.effectAllowed = 'move';
                      event.dataTransfer.setData('text/plain', header.column.id);
                      setDraggingColumnId(header.column.id);
                    }}
                    onDragOver={event => {
                      if (!enableColumnReorder) return;
                      event.preventDefault();
                    }}
                    onDrop={event => {
                      if (!enableColumnReorder) return;
                      event.preventDefault();
                      const sourceId =
                        draggingColumnId ?? event.dataTransfer.getData('text/plain');
                      const targetId = header.column.id;
                      if (!sourceId || sourceId === targetId) return;
                      setColumnOrder(prevOrder => moveColumn(prevOrder, sourceId, targetId));
                      setDraggingColumnId(null);
                    }}
                    onDragEnd={() => setDraggingColumnId(null)}
                  >
                    <div className="inline-flex items-center gap-2">
                      {enableColumnReorder ? (
                        <GripVertical className="size-4 text-muted-foreground" />
                      ) : null}
                      {header.isPlaceholder
                        ? null
                        : flexRender(header.column.columnDef.header, header.getContext())}
                      {canSort ? sortIcon : null}
                    </div>
                  </th>
                );
              })}
            </tr>
          ))}
        </thead>
        <tbody>
          {table.getRowModel().rows.length ? (
            table.getRowModel().rows.map(row => (
              <tr key={row.id} className="border-t">
                {row.getVisibleCells().map(cell => (
                  <td key={cell.id} className="px-4 py-2">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))
          ) : (
            <tr className="border-t">
              <td className="px-4 py-6 text-center text-muted-foreground" colSpan={columns.length}>
                {emptyLabel}
              </td>
            </tr>
          )}
        </tbody>
      </table>
      <div className="flex flex-col gap-3 border-t px-4 py-3 text-sm md:flex-row md:items-center md:justify-end">
        <div className="flex flex-wrap items-center gap-1">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
            aria-label={prevLabel}
          >
            <ChevronLeft className="size-4" />
          </Button>
          {getPaginationItems(table.getPageCount(), table.getState().pagination.pageIndex).map(
            item =>
              item.type === 'page' ? (
                <Button
                  key={item.page}
                  variant={item.page === table.getState().pagination.pageIndex ? 'secondary' : 'outline'}
                  size="sm"
                  onClick={() => table.setPageIndex(item.page)}
                >
                  {item.page + 1}
                </Button>
              ) : (
                <span key={item.key} className="px-1 text-muted-foreground">
                  ...
                </span>
              )
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
            aria-label={nextLabel}
          >
            <ChevronRight className="size-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

const stringifyCell = (value: unknown) => {
  if (value === null || value === undefined) return '';
  if (typeof value === 'string') return `"${value.replace(/"/g, '""')}"`;
  if (typeof value === 'number' || typeof value === 'boolean') return String(value);
  return `"${JSON.stringify(value).replace(/"/g, '""')}"`;
};

const toPlainText = (value: unknown) => {
  if (value === null || value === undefined) return '';
  if (typeof value === 'string') return value;
  if (typeof value === 'number' || typeof value === 'boolean') return String(value);
  return JSON.stringify(value);
};

const escapeHtml = (value: string) =>
  value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

const columnHeaderToString = (header: unknown, fallback: string) => {
  if (typeof header === 'string') return header;
  if (typeof header === 'number') return String(header);
  return fallback;
};

type PaginationItem =
  | { type: 'page'; page: number }
  | { type: 'ellipsis'; key: string };

const getPaginationItems = (pageCount: number, pageIndex: number): PaginationItem[] => {
  if (pageCount <= 1) return [{ type: 'page', page: 0 }];
  const pages = new Set<number>();
  pages.add(0);
  pages.add(pageCount - 1);
  pages.add(pageIndex);
  pages.add(pageIndex - 1);
  pages.add(pageIndex + 1);

  const sortedPages = Array.from(pages)
    .filter(page => page >= 0 && page < pageCount)
    .sort((a, b) => a - b);

  const items: PaginationItem[] = [];
  let lastPage = -1;
  sortedPages.forEach(page => {
    if (page - lastPage > 1) {
      items.push({ type: 'ellipsis', key: `ellipsis-${page}` });
    }
    items.push({ type: 'page', page });
    lastPage = page;
  });
  return items;
};

const getColumnId = <TData,>(column: ColumnDef<TData, unknown>, index: number) => {
  if ('id' in column && column.id) return String(column.id);
  if ('accessorKey' in column && column.accessorKey) return String(column.accessorKey);
  return `col-${index}`;
};

const moveColumn = (order: string[], sourceId: string, targetId: string) => {
  const sourceIndex = order.indexOf(sourceId);
  const targetIndex = order.indexOf(targetId);
  if (sourceIndex === -1 || targetIndex === -1) return order;
  const next = [...order];
  const [moved] = next.splice(sourceIndex, 1);
  if (!moved) return order;
  next.splice(targetIndex, 0, moved);
  return next;
};
