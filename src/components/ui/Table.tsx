import clsx from 'clsx'

export interface Column<T> {
  key: string
  header: string
  render?: (row: T) => React.ReactNode
  className?: string
}

interface Props<T> {
  columns: Column<T>[]
  data: T[]
  keyExtractor: (row: T) => string | number
  loading?: boolean
  emptyText?: string
  onRowClick?: (row: T) => void
}

export default function Table<T>({
  columns, data, keyExtractor, loading, emptyText = 'No data found.', onRowClick
}: Props<T>) {
  return (
    <div className="overflow-x-auto rounded-xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 shadow-sm dark:shadow-none">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-900/80">
            {columns.map((col) => (
              <th
                key={col.key}
                className={clsx('px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-stone-500', col.className)}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr>
              <td colSpan={columns.length} className="px-4 py-12 text-center text-stone-500">
                <div className="flex justify-center">
                  <div className="h-5 w-5 rounded-full border-2 border-stone-700 border-t-brand-500 animate-spin" />
                </div>
              </td>
            </tr>
          ) : data.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="px-4 py-12 text-center text-stone-500">
                {emptyText}
              </td>
            </tr>
          ) : (
            data.map((row) => (
              <tr
                key={keyExtractor(row)}
                onClick={() => onRowClick?.(row)}
                className={clsx(
                  'border-b border-stone-100 dark:border-stone-800/60 bg-white dark:bg-stone-900 transition-colors',
                  onRowClick && 'cursor-pointer hover:bg-stone-50 dark:hover:bg-stone-800/60'
                )}
              >
                {columns.map((col) => (
                  <td key={col.key} className={clsx('px-4 py-3 text-stone-700 dark:text-stone-300', col.className)}>
                    {col.render ? col.render(row) : String((row as Record<string, unknown>)[col.key] ?? '—')}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  )
}
