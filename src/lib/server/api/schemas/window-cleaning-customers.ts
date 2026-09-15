import { windowCleaningCustomerSchema } from '$lib/formSchemas';

// Reuses the field rules the customer form action already validates against. `id` is
// server-generated (create) or taken from the URL path param (update), never accepted
// in the body.
export const apiCreateWindowCleaningCustomerSchema = windowCleaningCustomerSchema.omit({
	id: true
});

// Matches the UI's `updateCustomer` action: a full replace of the editable fields, not a
// partial patch, so the API and UI can't drift on what a "complete" customer record looks
// like.
export const apiUpdateWindowCleaningCustomerSchema = windowCleaningCustomerSchema.omit({
	id: true
});
