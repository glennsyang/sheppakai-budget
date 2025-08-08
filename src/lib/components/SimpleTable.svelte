<script lang="ts">
	import * as Table from '$lib/components/ui/table/index.js';
	import { Skeleton } from '$lib/components/ui/skeleton';
	import { Button } from '$lib/components/ui/button';

	type Column<T> = {
		key: keyof T;
		label: string;
		align?: 'left' | 'center' | 'right';
		width?: string;
		format?: (value: any, row: T) => string;
	};

	interface Props<T> {
		data: T[];
		columns: Column<T>[];
		loading?: boolean;
		title: string;
		titleClass?: string;
		caption?: string;
		captionClass?: string;
		emptyMessage?: string;
		tableClass?: string;
		actionButton?: {
			label: string;
			href?: string;
			onClick?: () => void;
			class?: string;
		};
	}

	let {
		data,
		columns,
		loading = false,
		title,
		titleClass = '',
		caption,
		captionClass = '',
		emptyMessage = 'No data available.',
		tableClass = '',
		actionButton
	}: Props<any> = $props();
</script>

<div>
	<div>
		<div class="mb-4 flex items-center justify-between">
			<h2 class={`text-lg font-medium ${titleClass}`}>{title}</h2>
			{#if actionButton}
				{#if actionButton.href}
					<Button variant="outline" size="sm" class={actionButton.class || ''}>
						<a href={actionButton.href} class="text-sm">
							{actionButton.label}
						</a>
					</Button>
				{:else if actionButton.onClick}
					<Button
						variant="outline"
						size="sm"
						onclick={actionButton.onClick}
						class={actionButton.class || ''}
					>
						{actionButton.label}
					</Button>
				{/if}
			{/if}
		</div>
		{#if loading}
			<div class="space-y-3">
				<!-- Table header skeleton -->
				<div
					class="grid gap-4 border-b border-white/20 pb-2"
					style="grid-template-columns: repeat({columns.length}, 1fr);"
				>
					{#each columns as _}
						<Skeleton class="h-4 w-16 bg-white/30" />
					{/each}
				</div>
				<!-- Table rows skeleton -->
				{#each Array(3) as _}
					<div
						class="grid gap-4 py-2"
						style="grid-template-columns: repeat({columns.length}, 1fr);"
					>
						{#each columns as _}
							<Skeleton class="h-4 w-20 bg-white/30" />
						{/each}
					</div>
				{/each}
			</div>
		{:else if data.length === 0}
			<div class="flex items-center justify-center py-8">
				<div class="text-muted-foreground">{emptyMessage}</div>
			</div>
		{:else}
			<Table.Root class={tableClass || ''}>
				{#if caption}
					<Table.Caption class={captionClass || 'text-muted-foreground'}>{caption}</Table.Caption>
				{/if}
				<Table.Header>
					<Table.Row>
						{#each columns as column}
							<Table.Head
								class={column.align === 'right'
									? 'text-right'
									: column.align === 'center'
										? 'text-center'
										: ''}
								style={column.width ? `width: ${column.width}` : ''}
							>
								{column.label}
							</Table.Head>
						{/each}
					</Table.Row>
				</Table.Header>
				<Table.Body>
					{#each data as row}
						<Table.Row>
							{#each columns as column}
								<Table.Cell
									class={`${column.align === 'right' ? 'text-right' : column.align === 'center' ? 'text-center' : ''} ${column.key === columns[0].key ? 'font-medium' : ''}`}
								>
									{#if column.format}
										{column.format(row[column.key], row)}
									{:else}
										{row[column.key] || ''}
									{/if}
								</Table.Cell>
							{/each}
						</Table.Row>
					{/each}
				</Table.Body>
			</Table.Root>
		{/if}
	</div>
</div>
