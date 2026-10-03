/**
 * The single validation-failure response for every non-auth form action, per
 * `docs/ERROR_HANDLING_POLICY.md`: a 400 `message(...)` that superforms turns into
 * `fail(400, { form })`, carrying field errors and a banner in one call.
 *
 * The body lives in `auth-form-handler.ts` because that module is kept byte-identical
 * with synapse and sheppakai-mealplanner; this re-export gives non-auth callers a
 * neutral name without a second copy or cross-repo drift.
 */
export { invalidAuthForm as invalidForm } from './auth-form-handler';
