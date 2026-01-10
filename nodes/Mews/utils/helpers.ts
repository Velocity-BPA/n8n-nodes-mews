/**
 * Mews Utility Functions
 *
 * [Velocity BPA Licensing Notice]
 *
 * This n8n node is licensed under the Business Source License 1.1 (BSL 1.1).
 *
 * Use of this node by for-profit organizations in production environments requires
 * a commercial license from Velocity BPA.
 *
 * For licensing information, visit https://velobpa.com/licensing or contact licensing@velobpa.com.
 */

import type { IDataObject, INodePropertyOptions } from 'n8n-workflow';

/**
 * Reservation states
 */
export const RESERVATION_STATES: INodePropertyOptions[] = [
	{ name: 'Enquired', value: 'Enquired' },
	{ name: 'Requested', value: 'Requested' },
	{ name: 'Optional', value: 'Optional' },
	{ name: 'Confirmed', value: 'Confirmed' },
	{ name: 'Started', value: 'Started' },
	{ name: 'Processed', value: 'Processed' },
	{ name: 'Canceled', value: 'Canceled' },
];

/**
 * Space states
 */
export const SPACE_STATES: INodePropertyOptions[] = [
	{ name: 'Dirty', value: 'Dirty' },
	{ name: 'Clean', value: 'Clean' },
	{ name: 'Inspected', value: 'Inspected' },
	{ name: 'Out of Service', value: 'OutOfService' },
	{ name: 'Out of Order', value: 'OutOfOrder' },
];

/**
 * Bill types
 */
export const BILL_TYPES: INodePropertyOptions[] = [
	{ name: 'Invoice', value: 'Invoice' },
	{ name: 'Receipt', value: 'Receipt' },
];

/**
 * Service types
 */
export const SERVICE_TYPES: INodePropertyOptions[] = [
	{ name: 'Reservable', value: 'Reservable' },
	{ name: 'Orderable', value: 'Orderable' },
];

/**
 * Order states
 */
export const ORDER_STATES: INodePropertyOptions[] = [
	{ name: 'Pending', value: 'Pending' },
	{ name: 'Confirmed', value: 'Confirmed' },
	{ name: 'Started', value: 'Started' },
	{ name: 'Processed', value: 'Processed' },
	{ name: 'Canceled', value: 'Canceled' },
];

/**
 * Payment states
 */
export const PAYMENT_STATES: INodePropertyOptions[] = [
	{ name: 'Pending', value: 'Pending' },
	{ name: 'Verifying', value: 'Verifying' },
	{ name: 'Charged', value: 'Charged' },
	{ name: 'Canceled', value: 'Canceled' },
	{ name: 'Failed', value: 'Failed' },
];

/**
 * Payment types
 */
export const PAYMENT_TYPES: INodePropertyOptions[] = [
	{ name: 'Credit Card', value: 'CreditCard' },
	{ name: 'Cash', value: 'Cash' },
	{ name: 'Bank Transfer', value: 'BankTransfer' },
	{ name: 'Preauthorization', value: 'Preauthorization' },
	{ name: 'Invoice', value: 'Invoice' },
	{ name: 'Bad Debt', value: 'BadDebt' },
	{ name: 'External', value: 'External' },
	{ name: 'Ghost', value: 'Ghost' },
	{ name: 'Refund', value: 'Refund' },
	{ name: 'Alternative Payment', value: 'AlternativePayment' },
];

/**
 * Housekeeping task types
 */
export const HOUSEKEEPING_TASK_TYPES: INodePropertyOptions[] = [
	{ name: 'Cleaning', value: 'Cleaning' },
	{ name: 'Inspection', value: 'Inspection' },
	{ name: 'Turndown', value: 'Turndown' },
	{ name: 'Maintenance', value: 'Maintenance' },
];

/**
 * Report modes
 */
export const REPORT_MODES: INodePropertyOptions[] = [
	{ name: 'Day', value: 'Day' },
	{ name: 'Month', value: 'Month' },
];

/**
 * Common currency options
 */
export const CURRENCY_OPTIONS: INodePropertyOptions[] = [
	{ name: 'USD - US Dollar', value: 'USD' },
	{ name: 'EUR - Euro', value: 'EUR' },
	{ name: 'GBP - British Pound', value: 'GBP' },
	{ name: 'CHF - Swiss Franc', value: 'CHF' },
	{ name: 'JPY - Japanese Yen', value: 'JPY' },
	{ name: 'AUD - Australian Dollar', value: 'AUD' },
	{ name: 'CAD - Canadian Dollar', value: 'CAD' },
	{ name: 'CNY - Chinese Yuan', value: 'CNY' },
	{ name: 'HKD - Hong Kong Dollar', value: 'HKD' },
	{ name: 'NZD - New Zealand Dollar', value: 'NZD' },
	{ name: 'SEK - Swedish Krona', value: 'SEK' },
	{ name: 'NOK - Norwegian Krone', value: 'NOK' },
	{ name: 'DKK - Danish Krone', value: 'DKK' },
	{ name: 'SGD - Singapore Dollar', value: 'SGD' },
	{ name: 'INR - Indian Rupee', value: 'INR' },
	{ name: 'MXN - Mexican Peso', value: 'MXN' },
	{ name: 'BRL - Brazilian Real', value: 'BRL' },
	{ name: 'AED - UAE Dirham', value: 'AED' },
	{ name: 'THB - Thai Baht', value: 'THB' },
	{ name: 'CZK - Czech Koruna', value: 'CZK' },
	{ name: 'PLN - Polish Zloty', value: 'PLN' },
	{ name: 'ZAR - South African Rand', value: 'ZAR' },
];

/**
 * Build date range filter
 */
export function buildDateFilter(
	startDate?: string,
	endDate?: string,
): IDataObject {
	const filter: IDataObject = {};

	if (startDate) {
		filter.StartUtc = new Date(startDate).toISOString();
	}
	if (endDate) {
		filter.EndUtc = new Date(endDate).toISOString();
	}

	return filter;
}

/**
 * Build ID filter from comma-separated string or array
 */
export function buildIdFilter(
	ids: string | string[] | undefined,
	fieldName: string,
): IDataObject {
	if (!ids) return {};

	let idArray: string[];
	if (typeof ids === 'string') {
		idArray = ids.split(',').map(id => id.trim()).filter(id => id);
	} else {
		idArray = ids.filter(id => id && id.trim());
	}

	if (idArray.length === 0) return {};

	return { [fieldName]: idArray };
}

/**
 * Parse response data safely
 */
export function parseResponseData<T>(
	response: IDataObject,
	dataKey: string,
): T[] {
	const data = response[dataKey];
	if (Array.isArray(data)) {
		return data as T[];
	}
	return [];
}

/**
 * Format currency amount
 */
export function formatAmount(
	amount: number,
	currency: string,
): string {
	return new Intl.NumberFormat('en-US', {
		style: 'currency',
		currency,
	}).format(amount);
}

/**
 * Get current UTC timestamp
 */
export function getCurrentUtc(): string {
	return new Date().toISOString();
}

/**
 * Add days to date
 */
export function addDaysToDate(date: Date | string, days: number): string {
	const d = new Date(date);
	d.setDate(d.getDate() + days);
	return d.toISOString();
}

/**
 * Calculate nights between two dates
 */
export function calculateNights(startDate: string, endDate: string): number {
	const start = new Date(startDate);
	const end = new Date(endDate);
	const diffTime = Math.abs(end.getTime() - start.getTime());
	return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

/**
 * Validate UUID format
 */
export function isValidUuid(id: string): boolean {
	const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
	return uuidRegex.test(id);
}

/**
 * Simplify response by extracting specific fields
 */
export function simplifyResponse(
	items: IDataObject[],
	fields: string[],
): IDataObject[] {
	return items.map(item => {
		const simplified: IDataObject = {};
		for (const field of fields) {
			if (item[field] !== undefined) {
				simplified[field] = item[field];
			}
		}
		return simplified;
	});
}
