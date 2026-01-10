/**
 * Mews Client Unit Tests
 *
 * [Velocity BPA Licensing Notice]
 *
 * This n8n node is licensed under the Business Source License 1.1 (BSL 1.1).
 */

import {
	formatDateToUtc,
	buildExtent,
	processArrayInput,
	cleanObject,
} from '../../nodes/Mews/transport/mewsClient';

describe('Mews Client Utilities', () => {
	describe('formatDateToUtc', () => {
		it('should format valid date to ISO string', () => {
			const result = formatDateToUtc('2024-03-15');
			expect(result).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z$/);
		});

		it('should throw error for invalid date', () => {
			expect(() => formatDateToUtc('invalid-date')).toThrow('Invalid date format');
		});
	});

	describe('buildExtent', () => {
		it('should build extent object from options', () => {
			const options = {
				includeCustomers: true,
				includeSpaces: true,
				includeServices: false,
			};
			const result = buildExtent(options);
			expect(result).toEqual({
				Customers: true,
				Spaces: true,
			});
		});

		it('should return empty object when no options enabled', () => {
			const result = buildExtent({});
			expect(result).toEqual({});
		});
	});

	describe('processArrayInput', () => {
		it('should process comma-separated string', () => {
			const result = processArrayInput('id1, id2, id3');
			expect(result).toEqual(['id1', 'id2', 'id3']);
		});

		it('should process array input', () => {
			const result = processArrayInput(['id1', 'id2', 'id3']);
			expect(result).toEqual(['id1', 'id2', 'id3']);
		});

		it('should filter empty values from string', () => {
			const result = processArrayInput('id1, , id3, ');
			expect(result).toEqual(['id1', 'id3']);
		});

		it('should return empty array for empty string', () => {
			const result = processArrayInput('');
			expect(result).toEqual([]);
		});
	});

	describe('cleanObject', () => {
		it('should remove undefined and null values', () => {
			const obj = {
				a: 'value',
				b: undefined,
				c: null,
				d: '',
			};
			const result = cleanObject(obj);
			expect(result).toEqual({ a: 'value' });
		});

		it('should keep arrays with values', () => {
			const obj = {
				arr: ['a', 'b'],
				emptyArr: [],
			};
			const result = cleanObject(obj);
			expect(result).toEqual({ arr: ['a', 'b'] });
		});

		it('should recursively clean nested objects', () => {
			const obj = {
				nested: {
					a: 'value',
					b: undefined,
				},
			};
			const result = cleanObject(obj);
			expect(result).toEqual({
				nested: { a: 'value' },
			});
		});

		it('should remove empty nested objects', () => {
			const obj = {
				nested: {
					a: undefined,
					b: null,
				},
			};
			const result = cleanObject(obj);
			expect(result).toEqual({});
		});
	});
});
