import {
	columnFilteringFeature,
	columnVisibilityFeature,
	createFilteredRowModel,
	createPaginatedRowModel,
	createSortedRowModel,
	filterFn_includesString,
	globalFilteringFeature,
	rowPaginationFeature,
	rowSortingFeature,
	tableFeatures
} from '@tanstack/svelte-table';
import type { CellData, RowData, TableFeatures } from '@tanstack/table-core';

export const features = tableFeatures({
	columnFilteringFeature,
	globalFilteringFeature,
	filteredRowModel: createFilteredRowModel(),
	filterFns: { includesString: filterFn_includesString },
	rowSortingFeature,
	sortedRowModel: createSortedRowModel(),
	rowPaginationFeature,
	paginatedRowModel: createPaginatedRowModel(),
	columnVisibilityFeature
});

export type Features = typeof features;

declare module '@tanstack/table-core' {
	// oxlint-disable-next-line no-unused-vars -- must repeat the library's type parameters to merge
	interface ColumnMeta<
		in out TFeatures extends TableFeatures,
		in out TData extends RowData,
		TValue extends CellData = CellData
	> {
		/**
		 * Where this column lands in the phone ledger list (below `md`). `title` is the row's
		 * name, `detail` cells join into the muted line beneath it, `value` sits right-aligned
		 * on the first line and `subvalue` under it; `lead` sits before everything (a toggle or
		 * avatar). Columns without a role stay off the phone
		 * list; an `actions` column is picked up by id.
		 */
		mobile?: 'lead' | 'title' | 'detail' | 'value' | 'subvalue';
		/** Right-align header and cells (amounts). */
		align?: 'end';
		/** Only in the phone list, e.g. a combined "GST $4.20" line the table shows as its own column. */
		phoneOnly?: boolean;
		/** Fixed width class for the desktop column, e.g. `w-12`. */
		width?: string;
	}
}
