/**
 * Order Actions
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
import { ORDER_STATES } from '../../utils/helpers';

export const orderOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['order'],
			},
		},
		options: [
			{
				name: 'Add Items',
				value: 'addItems',
				description: 'Add items to an order',
				action: 'Add items to order',
			},
			{
				name: 'Cancel',
				value: 'cancel',
				description: 'Cancel an order',
				action: 'Cancel an order',
			},
			{
				name: 'Create',
				value: 'create',
				description: 'Create a new order',
				action: 'Create an order',
			},
			{
				name: 'Get',
				value: 'get',
				description: 'Get an order by ID',
				action: 'Get an order',
			},
			{
				name: 'Get Many',
				value: 'getAll',
				description: 'Get many orders',
				action: 'Get many orders',
			},
			{
				name: 'Process',
				value: 'process',
				description: 'Process an order',
				action: 'Process an order',
			},
			{
				name: 'Update',
				value: 'update',
				description: 'Update an order',
				action: 'Update an order',
			},
		],
		default: 'getAll',
	},
];

export const orderFields: INodeProperties[] = [
	// ----------------------------------
	//         getAll
	// ----------------------------------
	{
		displayName: 'Return All',
		name: 'returnAll',
		type: 'boolean',
		displayOptions: {
			show: {
				resource: ['order'],
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
				resource: ['order'],
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
				resource: ['order'],
				operation: ['getAll'],
			},
		},
		options: [
			{
				displayName: 'Order IDs',
				name: 'orderIds',
				type: 'string',
				default: '',
				description: 'Comma-separated list of order IDs',
			},
			{
				displayName: 'Service IDs',
				name: 'serviceIds',
				type: 'string',
				default: '',
				description: 'Comma-separated list of service IDs',
			},
			{
				displayName: 'Customer IDs',
				name: 'customerIds',
				type: 'string',
				default: '',
				description: 'Comma-separated list of customer IDs',
			},
			{
				displayName: 'States',
				name: 'states',
				type: 'multiOptions',
				options: ORDER_STATES,
				default: [],
				description: 'Filter by order states',
			},
			{
				displayName: 'Start Date',
				name: 'startUtc',
				type: 'dateTime',
				default: '',
				description: 'Filter orders starting after this date',
			},
			{
				displayName: 'End Date',
				name: 'endUtc',
				type: 'dateTime',
				default: '',
				description: 'Filter orders starting before this date',
			},
		],
	},
	// ----------------------------------
	//         get
	// ----------------------------------
	{
		displayName: 'Order ID',
		name: 'orderId',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['order'],
				operation: ['get', 'cancel', 'process', 'update', 'addItems'],
			},
		},
		default: '',
		description: 'The ID of the order',
	},
	// ----------------------------------
	//         create
	// ----------------------------------
	{
		displayName: 'Service ID',
		name: 'serviceId',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['order'],
				operation: ['create'],
			},
		},
		default: '',
		description: 'The ID of the service for the order',
	},
	{
		displayName: 'Customer ID',
		name: 'customerId',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['order'],
				operation: ['create'],
			},
		},
		default: '',
		description: 'The ID of the customer placing the order',
	},
	{
		displayName: 'Additional Fields',
		name: 'additionalFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: {
			show: {
				resource: ['order'],
				operation: ['create'],
			},
		},
		options: [
			{
				displayName: 'Start Date',
				name: 'startUtc',
				type: 'dateTime',
				default: '',
				description: 'When the service should start',
			},
			{
				displayName: 'Notes',
				name: 'notes',
				type: 'string',
				typeOptions: {
					rows: 3,
				},
				default: '',
				description: 'Notes for the order',
			},
			{
				displayName: 'Product Orders',
				name: 'productOrders',
				type: 'json',
				default: '[]',
				description: 'Array of product orders: [{"ProductId": "...", "Count": 1}]',
			},
		],
	},
	// ----------------------------------
	//         update
	// ----------------------------------
	{
		displayName: 'Update Fields',
		name: 'updateFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: {
			show: {
				resource: ['order'],
				operation: ['update'],
			},
		},
		options: [
			{
				displayName: 'Start Date',
				name: 'startUtc',
				type: 'dateTime',
				default: '',
				description: 'Updated start date',
			},
			{
				displayName: 'Notes',
				name: 'notes',
				type: 'string',
				typeOptions: {
					rows: 3,
				},
				default: '',
				description: 'Updated notes',
			},
		],
	},
	// ----------------------------------
	//         addItems
	// ----------------------------------
	{
		displayName: 'Items',
		name: 'items',
		type: 'json',
		required: true,
		displayOptions: {
			show: {
				resource: ['order'],
				operation: ['addItems'],
			},
		},
		default: '[{"ProductId": "", "Count": 1}]',
		description: 'Array of items to add: [{"ProductId": "...", "Count": 1}]',
	},
];

export async function executeOrder(
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

			if (filters.orderIds) {
				body.OrderIds = processArrayInput(filters.orderIds as string);
			}
			if (filters.serviceIds) {
				body.ServiceIds = processArrayInput(filters.serviceIds as string);
			}
			if (filters.customerIds) {
				body.CustomerIds = processArrayInput(filters.customerIds as string);
			}
			if (filters.states && (filters.states as string[]).length > 0) {
				body.States = filters.states;
			}
			if (filters.startUtc) {
				body.StartUtc = new Date(filters.startUtc as string).toISOString();
			}
			if (filters.endUtc) {
				body.EndUtc = new Date(filters.endUtc as string).toISOString();
			}

			if (returnAll) {
				responseData = await mewsApiRequestAllItems.call(
					this,
					'orders/getAll',
					'Orders',
					body,
				);
			} else {
				body.Limitation = { Count: limit };
				const response = await mewsApiRequest.call(this, 'orders/getAll', body);
				responseData = (response.Orders as IDataObject[]) || [];
			}
			break;
		}

		case 'get': {
			const orderId = this.getNodeParameter('orderId', i) as string;

			const body: IDataObject = {
				OrderIds: [orderId],
			};

			const response = await mewsApiRequest.call(this, 'orders/getAll', body);
			const orders = (response.Orders as IDataObject[]) || [];
			responseData = orders[0] || {};
			break;
		}

		case 'create': {
			const serviceId = this.getNodeParameter('serviceId', i) as string;
			const customerId = this.getNodeParameter('customerId', i) as string;
			const additionalFields = this.getNodeParameter('additionalFields', i, {}) as IDataObject;

			const order: IDataObject = {
				ServiceId: serviceId,
				CustomerId: customerId,
			};

			if (additionalFields.startUtc) {
				order.StartUtc = new Date(additionalFields.startUtc as string).toISOString();
			}
			if (additionalFields.notes) {
				order.Notes = additionalFields.notes;
			}
			if (additionalFields.productOrders) {
				try {
					order.ProductOrders = JSON.parse(additionalFields.productOrders as string);
				} catch {
					throw new Error('Invalid JSON in Product Orders field');
				}
			}

			const body: IDataObject = {
				Orders: [order],
			};

			const response = await mewsApiRequest.call(this, 'orders/add', cleanObject(body));
			const orders = (response.Orders as IDataObject[]) || [];
			responseData = orders[0] || response;
			break;
		}

		case 'update': {
			const orderId = this.getNodeParameter('orderId', i) as string;
			const updateFields = this.getNodeParameter('updateFields', i, {}) as IDataObject;

			const body: IDataObject = {
				OrderId: orderId,
			};

			if (updateFields.startUtc) {
				body.StartUtc = { Value: new Date(updateFields.startUtc as string).toISOString() };
			}
			if (updateFields.notes) {
				body.Notes = { Value: updateFields.notes };
			}

			responseData = await mewsApiRequest.call(this, 'orders/update', cleanObject(body));
			break;
		}

		case 'cancel': {
			const orderId = this.getNodeParameter('orderId', i) as string;

			const body: IDataObject = {
				OrderIds: [orderId],
			};

			responseData = await mewsApiRequest.call(this, 'orders/cancel', body);
			break;
		}

		case 'process': {
			const orderId = this.getNodeParameter('orderId', i) as string;

			const body: IDataObject = {
				OrderIds: [orderId],
			};

			responseData = await mewsApiRequest.call(this, 'orders/process', body);
			break;
		}

		case 'addItems': {
			const orderId = this.getNodeParameter('orderId', i) as string;
			const items = this.getNodeParameter('items', i) as string;

			let parsedItems;
			try {
				parsedItems = JSON.parse(items);
			} catch {
				throw new Error('Invalid JSON in Items field');
			}

			const body: IDataObject = {
				OrderId: orderId,
				Items: parsedItems,
			};

			responseData = await mewsApiRequest.call(this, 'orders/addItems', body);
			break;
		}

		default:
			throw new Error(`Operation ${operation} not supported`);
	}

	return responseData;
}
