/**
 * Service Actions
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

import type { IExecuteFunctions, IDataObject, INodeProperties } from 'n8n-workflow';
import {
	mewsApiRequest,
	mewsApiRequestAllItems,
	processArrayInput,
	cleanObject,
} from '../../transport/mewsClient';
import { SERVICE_TYPES } from '../../utils/helpers';

export const serviceOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['service'],
			},
		},
		options: [
			{
				name: 'Get',
				value: 'get',
				description: 'Get a service by ID',
				action: 'Get a service',
			},
			{
				name: 'Get Availability',
				value: 'getAvailability',
				description: 'Check service availability',
				action: 'Get service availability',
			},
			{
				name: 'Get Many',
				value: 'getAll',
				description: 'Get many services',
				action: 'Get many services',
			},
			{
				name: 'Get Pricing',
				value: 'getPricing',
				description: 'Get pricing for a service',
				action: 'Get service pricing',
			},
			{
				name: 'Get Products',
				value: 'getProducts',
				description: 'Get products for a service',
				action: 'Get service products',
			},
			{
				name: 'Get Rates',
				value: 'getRates',
				description: 'Get rate configurations',
				action: 'Get service rates',
			},
		],
		default: 'getAll',
	},
];

export const serviceFields: INodeProperties[] = [
	// ----------------------------------
	//         getAll
	// ----------------------------------
	{
		displayName: 'Return All',
		name: 'returnAll',
		type: 'boolean',
		displayOptions: {
			show: {
				resource: ['service'],
				operation: ['getAll'],
			},
		},
		default: false,
		description: 'Whether to return all results or only up to a given limit',
	},
	{
		displayName: 'Limit',
		name: 'limit',
		type: 'number',
		displayOptions: {
			show: {
				resource: ['service'],
				operation: ['getAll'],
				returnAll: [false],
			},
		},
		typeOptions: {
			minValue: 1,
			maxValue: 1000,
		},
		default: 100,
		description: 'Max number of results to return',
	},
	{
		displayName: 'Filters',
		name: 'filters',
		type: 'collection',
		placeholder: 'Add Filter',
		default: {},
		displayOptions: {
			show: {
				resource: ['service'],
				operation: ['getAll'],
			},
		},
		options: [
			{
				displayName: 'Service IDs',
				name: 'serviceIds',
				type: 'string',
				default: '',
				description: 'Comma-separated list of service IDs',
			},
			{
				displayName: 'Type',
				name: 'type',
				type: 'options',
				options: SERVICE_TYPES,
				default: '',
				description: 'Filter by service type',
			},
		],
	},
	// ----------------------------------
	//         get
	// ----------------------------------
	{
		displayName: 'Service ID',
		name: 'serviceId',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['service'],
				operation: ['get', 'getProducts', 'getPricing', 'getRates'],
			},
		},
		default: '',
		description: 'The ID of the service',
	},
	// ----------------------------------
	//         getAvailability
	// ----------------------------------
	{
		displayName: 'Service ID',
		name: 'serviceId',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['service'],
				operation: ['getAvailability'],
			},
		},
		default: '',
		description: 'The ID of the service to check availability',
	},
	{
		displayName: 'Start Date',
		name: 'startUtc',
		type: 'dateTime',
		required: true,
		displayOptions: {
			show: {
				resource: ['service'],
				operation: ['getAvailability'],
			},
		},
		default: '',
		description: 'Start of the availability period',
	},
	{
		displayName: 'End Date',
		name: 'endUtc',
		type: 'dateTime',
		required: true,
		displayOptions: {
			show: {
				resource: ['service'],
				operation: ['getAvailability'],
			},
		},
		default: '',
		description: 'End of the availability period',
	},
	// ----------------------------------
	//         getProducts - additional options
	// ----------------------------------
	{
		displayName: 'Options',
		name: 'options',
		type: 'collection',
		placeholder: 'Add Option',
		default: {},
		displayOptions: {
			show: {
				resource: ['service'],
				operation: ['getProducts'],
			},
		},
		options: [
			{
				displayName: 'Product IDs',
				name: 'productIds',
				type: 'string',
				default: '',
				description: 'Comma-separated list of product IDs to filter',
			},
		],
	},
	// ----------------------------------
	//         getPricing
	// ----------------------------------
	{
		displayName: 'Start Date',
		name: 'startUtc',
		type: 'dateTime',
		required: true,
		displayOptions: {
			show: {
				resource: ['service'],
				operation: ['getPricing'],
			},
		},
		default: '',
		description: 'Start of the pricing period',
	},
	{
		displayName: 'End Date',
		name: 'endUtc',
		type: 'dateTime',
		required: true,
		displayOptions: {
			show: {
				resource: ['service'],
				operation: ['getPricing'],
			},
		},
		default: '',
		description: 'End of the pricing period',
	},
	{
		displayName: 'Options',
		name: 'options',
		type: 'collection',
		placeholder: 'Add Option',
		default: {},
		displayOptions: {
			show: {
				resource: ['service'],
				operation: ['getPricing'],
			},
		},
		options: [
			{
				displayName: 'Rate IDs',
				name: 'rateIds',
				type: 'string',
				default: '',
				description: 'Comma-separated list of rate IDs',
			},
			{
				displayName: 'Space Category IDs',
				name: 'spaceCategoryIds',
				type: 'string',
				default: '',
				description: 'Comma-separated list of room type IDs',
			},
		],
	},
	// ----------------------------------
	//         getRates - additional options
	// ----------------------------------
	{
		displayName: 'Options',
		name: 'options',
		type: 'collection',
		placeholder: 'Add Option',
		default: {},
		displayOptions: {
			show: {
				resource: ['service'],
				operation: ['getRates'],
			},
		},
		options: [
			{
				displayName: 'Rate IDs',
				name: 'rateIds',
				type: 'string',
				default: '',
				description: 'Comma-separated list of rate IDs to filter',
			},
			{
				displayName: 'Include Inactive',
				name: 'includeInactive',
				type: 'boolean',
				default: false,
				description: 'Whether to include inactive rates',
			},
		],
	},
];

export async function executeService(
	this: IExecuteFunctions,
	operation: string,
	i: number,
): Promise<IDataObject | IDataObject[]> {
	let responseData: IDataObject | IDataObject[];

	switch (operation) {
		case 'getAll': {
			const returnAll = this.getNodeParameter('returnAll', i) as boolean;
			const limit = this.getNodeParameter('limit', i, 100) as number;
			const filters = this.getNodeParameter('filters', i, {}) as IDataObject;

			const body: IDataObject = {};

			if (filters.serviceIds) {
				body.ServiceIds = processArrayInput(filters.serviceIds as string);
			}
			if (filters.type) {
				body.Types = [filters.type];
			}

			if (returnAll) {
				responseData = await mewsApiRequestAllItems.call(
					this,
					'services/getAll',
					'Services',
					body,
				);
			} else {
				body.Limitation = { Count: limit };
				const response = await mewsApiRequest.call(this, 'services/getAll', body);
				responseData = (response.Services as IDataObject[]) || [];
			}
			break;
		}

		case 'get': {
			const serviceId = this.getNodeParameter('serviceId', i) as string;

			const body: IDataObject = {
				ServiceIds: [serviceId],
			};

			const response = await mewsApiRequest.call(this, 'services/getAll', body);
			const services = (response.Services as IDataObject[]) || [];
			responseData = services[0] || {};
			break;
		}

		case 'getAvailability': {
			const serviceId = this.getNodeParameter('serviceId', i) as string;
			const startUtc = this.getNodeParameter('startUtc', i) as string;
			const endUtc = this.getNodeParameter('endUtc', i) as string;

			const body: IDataObject = {
				ServiceId: serviceId,
				StartUtc: new Date(startUtc).toISOString(),
				EndUtc: new Date(endUtc).toISOString(),
			};

			responseData = await mewsApiRequest.call(this, 'services/getAvailability', body);
			break;
		}

		case 'getProducts': {
			const serviceId = this.getNodeParameter('serviceId', i) as string;
			const options = this.getNodeParameter('options', i, {}) as IDataObject;

			const body: IDataObject = {
				ServiceIds: [serviceId],
			};

			if (options.productIds) {
				body.ProductIds = processArrayInput(options.productIds as string);
			}

			const response = await mewsApiRequest.call(this, 'products/getAll', cleanObject(body));
			responseData = (response.Products as IDataObject[]) || [];
			break;
		}

		case 'getPricing': {
			const serviceId = this.getNodeParameter('serviceId', i) as string;
			const startUtc = this.getNodeParameter('startUtc', i) as string;
			const endUtc = this.getNodeParameter('endUtc', i) as string;
			const options = this.getNodeParameter('options', i, {}) as IDataObject;

			const body: IDataObject = {
				ServiceId: serviceId,
				StartUtc: new Date(startUtc).toISOString(),
				EndUtc: new Date(endUtc).toISOString(),
			};

			if (options.rateIds) {
				body.RateIds = processArrayInput(options.rateIds as string);
			}
			if (options.spaceCategoryIds) {
				body.SpaceCategoryIds = processArrayInput(options.spaceCategoryIds as string);
			}

			responseData = await mewsApiRequest.call(this, 'rates/getPricing', cleanObject(body));
			break;
		}

		case 'getRates': {
			const serviceId = this.getNodeParameter('serviceId', i) as string;
			const options = this.getNodeParameter('options', i, {}) as IDataObject;

			const body: IDataObject = {
				ServiceIds: [serviceId],
			};

			if (options.rateIds) {
				body.RateIds = processArrayInput(options.rateIds as string);
			}
			if (options.includeInactive) {
				body.ActivityStates = ['Active', 'Inactive'];
			}

			const response = await mewsApiRequest.call(this, 'rates/getAll', cleanObject(body));
			responseData = (response.Rates as IDataObject[]) || [];
			break;
		}

		default:
			throw new Error(`Operation ${operation} not supported`);
	}

	return responseData;
}
