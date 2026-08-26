import { describe, expect, it } from 'vitest';

import { buildGoogleMapsUrl } from './maps';

describe('buildGoogleMapsUrl', () => {
	it('builds a maps search URL from address and city', () => {
		expect(buildGoogleMapsUrl('123 Main St', 'Toronto')).toBe(
			'https://www.google.com/maps/search/?api=1&query=123%20Main%20St%2C%20Toronto'
		);
	});

	it('includes the unit number when provided', () => {
		expect(buildGoogleMapsUrl('123 Main St', 'Toronto', '4B')).toBe(
			'https://www.google.com/maps/search/?api=1&query=123%20Main%20St%2C%20Unit%204B%2C%20Toronto'
		);
	});

	it('omits the unit segment when unit number is null or undefined', () => {
		expect(buildGoogleMapsUrl('123 Main St', 'Toronto', null)).toBe(
			buildGoogleMapsUrl('123 Main St', 'Toronto')
		);
		expect(buildGoogleMapsUrl('123 Main St', 'Toronto', undefined)).toBe(
			buildGoogleMapsUrl('123 Main St', 'Toronto')
		);
	});

	it('url-encodes special characters', () => {
		const url = buildGoogleMapsUrl('456 Elm St #2', 'St. Catharines');
		expect(url).toBe(
			'https://www.google.com/maps/search/?api=1&query=456%20Elm%20St%20%232%2C%20St.%20Catharines'
		);
	});
});
