/**
 * Mews API Transport Layer
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

import type {
	IExecuteFunctions,
	ILoadOptionsFunctions,
	IDataObject,
	IHttpRequestMethods,
	IHttpRequestOptions,
	JsonObject,
} from 'n8n-workflow';
import { NodeApiError, NodeOperationError } from 'n8n-workflow';

const API_ENDPOINTS = {
	production: 'https://api.mews.com/api/connector/v1',
	demo: 'https://api.mews-demo.com/api/connector/v1',
};

export interface IMewsCredentials {
	clientToken: string;
	accessToken: string;
	environment: 'production' | 'demo';
}

export interface IMewsResponse extends IDataObject {
	Cursor?: string;
}

export interface IMewsPaginationOptions {
	count?: number;
	cursor?: string;
}

/**
 * Make an authenticated request to the Mews API
 */
export async function mewsApiRequest(
	this: IExecuteFunctions | ILoadOptionsFunctions,
	operation: string,
	body: IDataObject = {},
	_method: IHttpRequestMethods = 'POST',
): Promise<IMewsResponse> {
	const credentials = await this.getCredentials('mewsApi') as IMewsCredentials;

	const baseUrl = credentials.environment === 'demo'
		? API_ENDPOINTS.demo
		: API_ENDPOINTS.production;

	const requestBody: IDataObject = {
		ClientToken: credentials.clientToken,
		AccessToken: credentials.accessToken,
		Client: 'n8n Mews Integration',
		...body,
	};

	const options: IHttpRequestOptions = {
		method: 'POST',
		url: `${baseUrl}/${operation}`,
		body: requestBody,
		headers: {
			'Content-Type': 'application/json',
		},
		json: true,
	};

	try {
		const response = await this.helpers.httpRequest(options);
		return response as IMewsResponse;
	} catch (error) {
		throw new NodeApiError(this.getNode(), error as JsonObject, {
			message: getErrorMessage(error),
		});
	}
}

/**
 * Make a paginated request to the Mews API
 */
export async function mewsApiRequestAllItems(
	this: IExecuteFunctions | ILoadOptionsFunctions,
	operation: string,
	dataProperty: string,
	body: IDataObject = {},
	limit?: number,
): Promise<IDataObject[]> {
	const returnData: IDataObject[] = [];
	let cursor: string | undefined;
	const pageSize = 1000;

	do {
		const requestBody: IDataObject = {
			...body,
			Limitation: {
				Count: pageSize,
				...(cursor ? { Cursor: cursor } : {}),
			},
		};

		const response = await mewsApiRequest.call(this, operation, requestBody);
		const items = response[dataProperty] as IDataObject[] || [];

		returnData.push(...items);
		cursor = response.Cursor as string | undefined;

		if (limit && returnData.length >= limit) {
			return returnData.slice(0, limit);
		}
	} while (cursor);

	return returnData;
}

/**
 * Extract error message from Mews API error response
 */
function getErrorMessage(error: unknown): string {
	if (error && typeof error === 'object') {
		const errorObj = error as Record<string, unknown>;
		if (errorObj.Message && typeof errorObj.Message === 'string') {
			let message = errorObj.Message;
			if (errorObj.Details && typeof errorObj.Details === 'string') {
				message += `: ${errorObj.Details}`;
			}
			return message;
		}
		if (errorObj.message && typeof errorObj.message === 'string') {
			return errorObj.message;
		}
	}
	return 'An unknown error occurred';
}

/**
 * Validate and format ISO date string
 */
export function formatDateToUtc(dateString: string): string {
	const date = new Date(dateString);
	if (isNaN(date.getTime())) {
		throw new Error(`Invalid date format: ${dateString}`);
	}
	return date.toISOString();
}

/**
 * Build extent object for controlling response fields
 */
export function buildExtent(options: IDataObject): IDataObject {
	const extent: IDataObject = {};

	if (options.includeCustomers) extent.Customers = true;
	if (options.includeSpaces) extent.Spaces = true;
	if (options.includeRates) extent.Rates = true;
	if (options.includeServices) extent.Services = true;
	if (options.includeProducts) extent.Products = true;
	if (options.includeResources) extent.Resources = true;
	if (options.includeItems) extent.Items = true;
	if (options.includePayments) extent.Payments = true;
	if (options.includeBills) extent.Bills = true;
	if (options.includeCompanies) extent.Companies = true;
	if (options.includeNotes) extent.Notes = true;
	if (options.includeQrCodeData) extent.QrCodeData = true;

	return extent;
}

/**
 * Process array input (comma-separated string or actual array)
 */
export function processArrayInput(input: string | string[]): string[] {
	if (Array.isArray(input)) {
		return input.filter(item => item && item.trim());
	}
	if (typeof input === 'string' && input.trim()) {
		return input.split(',').map(item => item.trim()).filter(item => item);
	}
	return [];
}

/**
 * Handle empty or undefined values
 */
export function cleanObject(obj: IDataObject): IDataObject {
	const cleaned: IDataObject = {};
	for (const [key, value] of Object.entries(obj)) {
		if (value !== undefined && value !== null && value !== '') {
			if (typeof value === 'object' && !Array.isArray(value)) {
				const cleanedNested = cleanObject(value as IDataObject);
				if (Object.keys(cleanedNested).length > 0) {
					cleaned[key] = cleanedNested;
				}
			} else if (Array.isArray(value) && value.length > 0) {
				cleaned[key] = value;
			} else if (!Array.isArray(value)) {
				cleaned[key] = value;
			}
		}
	}
	return cleaned;
}

/**
 * Validate required fields
 */
export function validateRequired(
	context: IExecuteFunctions,
	fields: { name: string; value: unknown }[],
): void {
	for (const field of fields) {
		if (field.value === undefined || field.value === null || field.value === '') {
			throw new NodeOperationError(
				context.getNode(),
				`Required field "${field.name}" is missing`,
			);
		}
	}
}
