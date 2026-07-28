/**
 * Reads a superforms banner message handed over through the query string, e.g.
 * `/auth/sign-in?message=Password%20reset%20successful&messageType=success`.
 *
 * The type is carried explicitly rather than inferred from the text, so callers
 * cannot accidentally style a success as a failure. Anything without an explicit
 * `messageType=success` is treated as an error, since the query string is
 * attacker-controllable and a green banner carries more authority than a red one.
 */
export function formMessageFromUrl(url: URL): App.Superforms.Message | undefined {
	const text = url.searchParams.get('message');
	if (!text) {
		return undefined;
	}

	return {
		type: url.searchParams.get('messageType') === 'success' ? 'success' : 'error',
		text
	};
}
