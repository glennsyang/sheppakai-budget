<script lang="ts" generics="TData extends RowData, TValue">
	import ChevronLeftIcon from '@lucide/svelte/icons/chevron-left';
	import ChevronRightIcon from '@lucide/svelte/icons/chevron-right';
	import SearchIcon from '@lucide/svelte/icons/search';
	import Settings2Icon from '@lucide/svelte/icons/settings-2';
	import {
		createTable,
		type Cell,
		type ColumnDef,
		type ColumnVisibilityState,
		type PaginationState,
		type Row,
		type RowData,
		type SortingState
	} from '@tanstack/svelte-table';
	import type { Snippet } from 'svelte';

	import { features, FlexRender, type Features } from '$lib/components/ui/data-table/index.js';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import * as Select from '$lib/components/ui/select/index.js';

	import { Button } from '../button';

	type DataTableProps<TData extends RowData, TValue> = {
		columns: ColumnDef<Features, TData, TValue>[];
		data: TData[];
		defaultPageSize?: number;
		defaultSorting?: SortingState;
		/** Client-side filter over the loaded rows. Off when the page searches server-side. */
		searchable?: boolean;
		searchPlaceholder?: string;
		/** Replaces the search field, e.g. with a server-side search. */
		toolbar?: Snippet;
		/** Groups consecutive phone-list rows under a heading, e.g. by date. */
		mobileGroupBy?: (row: TData) => string;
		emptyMessage?: string;
		empty?: Snippet;
		rowClassName?: (row: TData) => string;
		onRowClick?: (row: TData) => void;
		/** Accessible name for a clickable row, e.g. "Open Jane Smith". */
		rowLabel?: (row: TData) => string;
	};

	let {
		data,
		columns,
		defaultPageSize = 10,
		defaultSorting = [],
		searchable = true,
		searchPlaceholder = 'Search…',
		toolbar,
		mobileGroupBy,
		emptyMessage = 'Nothing here yet.',
		empty,
		rowClassName,
		onRowClick,
		rowLabel
	}: DataTableProps<TData, TValue> = $props();

	// svelte-ignore state_referenced_locally
	let pagination = $state<PaginationState>({ pageIndex: 0, pageSize: defaultPageSize });
	// svelte-ignore state_referenced_locally
	let sorting = $state<SortingState>(defaultSorting);
	let globalFilter = $state<string>('');
	let columnVisibility = $state<ColumnVisibilityState>({});

	const table = createTable({
		features,
		get data() {
			return data;
		},
		get columns() {
			return columns as ColumnDef<Features, TData>[];
		},
		onPaginationChange: (updater) => {
			pagination = typeof updater === 'function' ? updater(pagination) : updater;
		},
		onSortingChange: (updater) => {
			sorting = typeof updater === 'function' ? updater(sorting) : updater;
		},
		onGlobalFilterChange: (updater) => {
			globalFilter = typeof updater === 'function' ? updater(globalFilter) : updater;
			pagination = { ...pagination, pageIndex: 0 };
		},
		onColumnVisibilityChange: (updater) => {
			columnVisibility = typeof updater === 'function' ? updater(columnVisibility) : updater;
		},
		state: {
			get pagination() {
				return pagination;
			},
			get sorting() {
				return sorting;
			},
			get globalFilter() {
				return globalFilter;
			},
			get columnVisibility() {
				return columnVisibility;
			}
		},
		globalFilterFn: 'includesString',
		autoResetPageIndex: false
	});

	const PAGE_SIZES = [10, 20, 50, 100];

	let rows = $derived(table.getRowModel().rows);
	let totalRows = $derived(table.getFilteredRowModel().rows.length);
	let pageStart = $derived(totalRows === 0 ? 0 : pagination.pageIndex * pagination.pageSize + 1);
	let pageEnd = $derived(Math.min(totalRows, (pagination.pageIndex + 1) * pagination.pageSize));
	let hideableColumns = $derived(
		table
			.getAllColumns()
			.filter((col) => col.getCanHide() && col.id !== 'actions' && !col.columnDef.meta?.phoneOnly)
	);
	let showToolbar = $derived(searchable || !!toolbar);
	let showFooter = $derived(totalRows > PAGE_SIZES[0]);

	// Phone list: consecutive rows sharing a group key sit under one heading.
	let groups = $derived.by(() => {
		const out: { key: string; rows: Row<Features, TData>[] }[] = [];
		for (const row of rows) {
			const key = mobileGroupBy ? mobileGroupBy(row.original) : '';
			const last = out.at(-1);
			if (last && last.key === key) last.rows.push(row);
			else out.push({ key, rows: [row] });
		}
		return out;
	});

	function cellsFor(row: Row<Features, TData>, role: string) {
		return row
			.getAllCells()
			.filter((cell) =>
				role === 'actions' ? cell.column.id === 'actions' : cell.column.columnDef.meta?.mobile === role
			);
	}

	function hasContent(cell: Cell<Features, TData, unknown>) {
		// Accessor cells with nothing in them would only add a stray separator.
		const def = cell.column.columnDef;
		if (!('accessorKey' in def) && !('accessorFn' in def)) return true;
		const value = cell.getValue();
		return value !== null && value !== undefined && value !== '';
	}

	function onRowKeydown(event: KeyboardEvent, original: TData) {
		if (!onRowClick || (event.key !== 'Enter' && event.key !== ' ')) return;
		if (event.target !== event.currentTarget) return;
		event.preventDefault();
		onRowClick(original);
	}
</script>

{#snippet emptyState()}
	<div class="text-muted-foreground px-4 py-12 text-center text-sm">
		{#if globalFilter}
			No matches for “<span class="text-foreground font-medium">{globalFilter}</span>”.
		{:else if empty}
			{@render empty()}
		{:else}
			{emptyMessage}
		{/if}
	</div>
{/snippet}

<div class="bg-card text-card-foreground overflow-hidden rounded-xl border shadow-sm">
	{#if showToolbar}
		<div class="flex items-center gap-2 border-b px-3 py-2.5 sm:px-4">
			<div class="min-w-0 flex-1">
				{#if toolbar}
					{@render toolbar()}
				{:else}
					<div class="relative max-w-sm">
						<SearchIcon
							class="text-muted-foreground pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2"
							aria-hidden="true"
						/>
						<Input
							type="search"
							placeholder={searchPlaceholder}
							aria-label={searchPlaceholder.replace('…', '')}
							value={globalFilter}
							oninput={(e) => table.setGlobalFilter(e.currentTarget.value)}
							class="h-11 pl-9 md:h-9"
						/>
					</div>
				{/if}
			</div>
			{#if hideableColumns.length > 2}
				<DropdownMenu.Root>
					<DropdownMenu.Trigger>
						{#snippet child({ props })}
							<Button
								{...props}
								variant="ghost"
								size="sm"
								class="text-muted-foreground hidden md:inline-flex"
							>
								<Settings2Icon />
								Columns
							</Button>
						{/snippet}
					</DropdownMenu.Trigger>
					<DropdownMenu.Content align="end">
						{#each hideableColumns as column (column.id)}
							<DropdownMenu.CheckboxItem
								bind:checked={() => column.getIsVisible(), (v) => column.toggleVisibility(!!v)}
							>
								{typeof column.columnDef.header === 'string'
									? column.columnDef.header
									: column.id.replace(/([A-Z])/g, ' $1').replace(/^./, (c) => c.toUpperCase())}
							</DropdownMenu.CheckboxItem>
						{/each}
					</DropdownMenu.Content>
				</DropdownMenu.Root>
			{/if}
		</div>
	{/if}

	<!-- Phone: stacked ledger rows -->
	<div class="md:hidden">
		{#if rows.length === 0}
			{@render emptyState()}
		{:else}
			{#each groups as group, gi (`${group.key}-${gi}`)}
				{#if group.key}
					<div
						class="bg-muted/50 text-muted-foreground border-b px-4 py-1.5 text-xs font-medium"
						class:border-t={gi > 0}
					>
						{group.key}
					</div>
				{/if}
				<ul class="divide-y">
					{#each group.rows as row (row.id)}
						{@const leads = cellsFor(row, 'lead')}
						{@const titles = cellsFor(row, 'title')}
						{@const details = cellsFor(row, 'detail').filter(hasContent)}
						{@const values = cellsFor(row, 'value')}
						{@const subvalues = cellsFor(row, 'subvalue').filter(hasContent)}
						{@const actions = cellsFor(row, 'actions')}
						<li
							class={[
								'relative flex min-h-14 items-center gap-3 py-2.5 ps-4 pe-2',
								onRowClick && 'active:bg-muted/60',
								rowClassName?.(row.original)
							]}
						>
							{#if leads.length}
								<div class="relative z-10 -ms-1.5 shrink-0">
									{#each leads as cell (cell.id)}<FlexRender {cell} />{/each}
								</div>
							{/if}
							<div class="min-w-0 flex-1">
								<div class="truncate text-sm font-medium">
									{#if onRowClick}
										<button
											type="button"
											class="max-w-full truncate text-left outline-none after:absolute after:inset-0 focus-visible:after:ring-[3px] focus-visible:after:ring-ring/50 focus-visible:after:ring-inset"
											aria-label={rowLabel?.(row.original)}
											onclick={() => onRowClick(row.original)}
										>
											{#each titles as cell (cell.id)}<FlexRender {cell} />{/each}
										</button>
									{:else}
										{#each titles as cell (cell.id)}<FlexRender {cell} />{/each}
									{/if}
								</div>
								{#if details.length}
									<div
										class="text-muted-foreground mt-0.5 flex min-w-0 items-center gap-1.5 text-xs [&>span:not(:first-child)]:before:me-1.5 [&>span:not(:first-child)]:before:content-['·']"
									>
										{#each details as cell (cell.id)}
											<span class="block min-w-0 truncate last:flex-1"
												><FlexRender {cell} /></span
											>
										{/each}
									</div>
								{/if}
							</div>
							{#if values.length || subvalues.length}
								<div class="shrink-0 text-right text-sm">
									{#each values as cell (cell.id)}<FlexRender {cell} />{/each}
									{#if subvalues.length}
										<div class="text-muted-foreground mt-0.5 text-xs">
											{#each subvalues as cell (cell.id)}<FlexRender {cell} />{/each}
										</div>
									{/if}
								</div>
							{/if}
							{#if actions.length}
								<div class="relative z-10 shrink-0">
									{#each actions as cell (cell.id)}<FlexRender {cell} />{/each}
								</div>
							{/if}
						</li>
					{/each}
				</ul>
			{/each}
		{/if}
	</div>

	<!-- Desk: hairline table -->
	<div class="table-scroll-container hidden overflow-x-auto md:block">
		<table class="w-full caption-bottom text-sm">
			<thead class="border-b">
				{#each table.getHeaderGroups() as headerGroup (headerGroup.id)}
					<tr>
						{#each headerGroup.headers.filter((h) => !h.column.columnDef.meta?.phoneOnly) as header (header.id)}
							{@const meta = header.column.columnDef.meta}
							<th
								colspan={header.colSpan}
								class={[
									'text-muted-foreground h-10 px-3 text-xs font-medium whitespace-nowrap first:ps-4 last:pe-4 lg:first:ps-5 lg:last:pe-5',
									meta?.align === 'end' ? 'text-right' : 'text-left',
									header.column.id === 'actions' && 'w-12',
									meta?.width
								]}
							>
								{#if !header.isPlaceholder}
									<FlexRender {header} />
								{/if}
							</th>
						{/each}
					</tr>
				{/each}
			</thead>
			<tbody class="divide-y">
				{#each rows as row (row.id)}
					<tr
						class={[
							'hover:bg-muted/60 transition-colors',
							onRowClick &&
								'focus-visible:bg-muted/60 cursor-pointer outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:ring-inset',
							rowClassName?.(row.original)
						]}
						tabindex={onRowClick ? 0 : undefined}
						aria-label={onRowClick ? rowLabel?.(row.original) : undefined}
						onclick={() => onRowClick?.(row.original)}
						onkeydown={(e) => onRowKeydown(e, row.original)}
					>
						{#each row
							.getVisibleCells()
							.filter((c) => !c.column.columnDef.meta?.phoneOnly) as cell (cell.id)}
							{@const meta = cell.column.columnDef.meta}
							<td
								class={[
									'h-12 px-3 py-2 align-middle first:ps-4 last:pe-4 lg:first:ps-5 lg:last:pe-5',
									meta?.align === 'end' && 'text-right',
									cell.column.id === 'actions' ? 'w-12' : 'max-w-72 truncate'
								]}
							>
								<FlexRender {cell} />
							</td>
						{/each}
					</tr>
				{:else}
					<tr>
						<td colspan={columns.length}>{@render emptyState()}</td>
					</tr>
				{/each}
			</tbody>
		</table>
	</div>

	{#if showFooter}
		<div
			class="text-muted-foreground flex items-center justify-between gap-3 border-t px-3 py-2 text-xs sm:px-4"
		>
			<span class="tabular-nums">{pageStart}–{pageEnd} of {totalRows}</span>
			<div class="flex items-center gap-1">
				<div class="me-2 hidden items-center gap-2 md:flex">
					<span>Rows</span>
					<Select.Root
						type="single"
						bind:value={() => `${pagination.pageSize}`, (v) => table.setPageSize(Number(v))}
					>
						<Select.Trigger size="sm" class="h-8 w-18 tabular-nums" aria-label="Rows per page">
							{pagination.pageSize}
						</Select.Trigger>
						<Select.Content side="top">
							{#each PAGE_SIZES as pageSize (pageSize)}
								<Select.Item value={pageSize.toString()}>{pageSize}</Select.Item>
							{/each}
						</Select.Content>
					</Select.Root>
				</div>
				<Button
					variant="ghost"
					size="icon"
					class="size-11 md:size-8"
					aria-label="Previous page"
					onclick={() => table.previousPage()}
					disabled={!table.getCanPreviousPage()}
				>
					<ChevronLeftIcon />
				</Button>
				<Button
					variant="ghost"
					size="icon"
					class="size-11 md:size-8"
					aria-label="Next page"
					onclick={() => table.nextPage()}
					disabled={!table.getCanNextPage()}
				>
					<ChevronRightIcon />
				</Button>
			</div>
		</div>
	{/if}
</div>
