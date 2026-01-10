/**
 * Helpers Unit Tests
 *
 * [Velocity BPA Licensing Notice]
 *
 * This n8n node is licensed under the Business Source License 1.1 (BSL 1.1).
 */

import {
	buildDateFilter,
	buildIdFilter,
	parseResponseData,
	formatAmount,
	getCurrentUtc,
	addDaysToDate,
	calculateNights,
	isValidUuid,
	simplifyResponse,
	RESERVATION_STATES,
	SPACE_STATES,
	CURRENCY_OPTIONS,
} from '../../nodes/Mews/utils/helpers';

describe('Helper Functions', () => {
	describe('buildDateFilter', () => {
		it('should build date filter with both dates', () => {
			const result = buildDateFilter('2024-03-01', '2024-03-15');
			expect(result).toHaveProperty('StartUtc');
			expect(result).toHaveProperty('EndUtc');
		});

		it('should build filter with only start date', () => {
			const result = buildDateFilter('2024-03-01');
			expect(result).toHaveProperty('StartUtc');
			expect(result).not.toHaveProperty('EndUtc');
		});

		it('should return empty object with no dates', () => {
			const result = buildDateFilter();
			expect(result).toEqual({});
		});
	});

	describe('buildIdFilter', () => {
		it('should build filter from comma-separated string', () => {
			const result = buildIdFilter('id1, id2, id3', 'ReservationIds');
			expect(result).toEqual({
				ReservationIds: ['id1', 'id2', 'id3'],
			});
		});

		it('should build filter from array', () => {
			const result = buildIdFilter(['id1', 'id2'], 'CustomerIds');
			expect(result).toEqual({
				CustomerIds: ['id1', 'id2'],
			});
		});

		it('should return empty object for undefined input', () => {
			const result = buildIdFilter(undefined, 'SpaceIds');
			expect(result).toEqual({});
		});

		it('should return empty object for empty string', () => {
			const result = buildIdFilter('', 'BillIds');
			expect(result).toEqual({});
		});
	});

	describe('parseResponseData', () => {
		it('should extract array from response', () => {
			const response = {
				Reservations: [{ id: 1 }, { id: 2 }],
			};
			const result = parseResponseData(response, 'Reservations');
			expect(result).toEqual([{ id: 1 }, { id: 2 }]);
		});

		it('should return empty array for missing key', () => {
			const response = {};
			const result = parseResponseData(response, 'Reservations');
			expect(result).toEqual([]);
		});

		it('should return empty array for non-array value', () => {
			const response = { Reservations: 'not-an-array' };
			const result = parseResponseData(response, 'Reservations');
			expect(result).toEqual([]);
		});
	});

	describe('formatAmount', () => {
		it('should format USD amount', () => {
			const result = formatAmount(1234.56, 'USD');
			expect(result).toContain('1,234.56');
		});

		it('should format EUR amount', () => {
			const result = formatAmount(1000, 'EUR');
			expect(result).toContain('1,000');
		});
	});

	describe('getCurrentUtc', () => {
		it('should return valid ISO date string', () => {
			const result = getCurrentUtc();
			expect(result).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z$/);
		});
	});

	describe('addDaysToDate', () => {
		it('should add days to date string', () => {
			const result = addDaysToDate('2024-03-01', 5);
			const resultDate = new Date(result);
			expect(resultDate.getDate()).toBe(6);
		});

		it('should add days to Date object', () => {
			const result = addDaysToDate(new Date('2024-03-01'), 10);
			const resultDate = new Date(result);
			expect(resultDate.getDate()).toBe(11);
		});
	});

	describe('calculateNights', () => {
		it('should calculate nights between dates', () => {
			const result = calculateNights('2024-03-01', '2024-03-05');
			expect(result).toBe(4);
		});

		it('should handle same day', () => {
			const result = calculateNights('2024-03-01', '2024-03-01');
			expect(result).toBe(0);
		});
	});

	describe('isValidUuid', () => {
		it('should validate correct UUID', () => {
			const result = isValidUuid('550e8400-e29b-41d4-a716-446655440000');
			expect(result).toBe(true);
		});

		it('should reject invalid UUID', () => {
			const result = isValidUuid('not-a-uuid');
			expect(result).toBe(false);
		});

		it('should reject empty string', () => {
			const result = isValidUuid('');
			expect(result).toBe(false);
		});
	});

	describe('simplifyResponse', () => {
		it('should extract specified fields', () => {
			const items = [
				{ id: '1', name: 'Test', extra: 'data' },
				{ id: '2', name: 'Test2', extra: 'data2' },
			];
			const result = simplifyResponse(items, ['id', 'name']);
			expect(result).toEqual([
				{ id: '1', name: 'Test' },
				{ id: '2', name: 'Test2' },
			]);
		});

		it('should handle missing fields', () => {
			const items = [{ id: '1' }];
			const result = simplifyResponse(items, ['id', 'name']);
			expect(result).toEqual([{ id: '1' }]);
		});
	});

	describe('Constants', () => {
		it('should have reservation states', () => {
			expect(RESERVATION_STATES.length).toBeGreaterThan(0);
			expect(RESERVATION_STATES.find(s => s.value === 'Confirmed')).toBeTruthy();
		});

		it('should have space states', () => {
			expect(SPACE_STATES.length).toBeGreaterThan(0);
			expect(SPACE_STATES.find(s => s.value === 'Clean')).toBeTruthy();
		});

		it('should have currency options', () => {
			expect(CURRENCY_OPTIONS.length).toBeGreaterThan(0);
			expect(CURRENCY_OPTIONS.find(c => c.value === 'USD')).toBeTruthy();
			expect(CURRENCY_OPTIONS.find(c => c.value === 'EUR')).toBeTruthy();
		});
	});
});
