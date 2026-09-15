import { contributionSchema } from '$lib/formSchemas/savings';

// The goal a contribution belongs to comes from the URL path param
// (`/api/v1/savings/goals/:id/contributions`), not the body, so `goalId` is omitted
// alongside the server-generated `id`.
export const apiCreateContributionSchema = contributionSchema.omit({ id: true, goalId: true });
