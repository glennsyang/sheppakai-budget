export function buildGoogleMapsUrl(
	address: string,
	city: string,
	unitNumber?: string | null
): string {
	const query = [address, unitNumber ? `Unit ${unitNumber}` : null, city]
		.filter(Boolean)
		.join(', ');
	return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
}
