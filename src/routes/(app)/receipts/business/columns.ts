import { createReceiptColumns } from '$lib/utils/receipt-columns';

export const columns = createReceiptColumns(
	'/receipts/business?/delete',
	'Are you sure you want to delete this business receipt?'
);
