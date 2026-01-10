/**
 * Outlet Actions
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

export const outletOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['outlet'],
			},
		},
		options: [
			{
				name: 'Create Bill',
				value: 'createBill',
				description: 'Create an outlet bill',
				action: 'Create outlet bill',
			},
			{
				name: 'Get',
				value: 'get',
				description: 'Get an outlet by ID',
				action: 'Get an outlet',
			},
			{
				name: 'Get Items',
				value: 'getItems',
				description: 'Get items from outlet bills',
				action: 'Get outlet items',
			},
			{
				name: 'Get Many',
				value: 'getAll',
				description: 'Get many outlets',
				action: 'Get many outlets',
			},
		],
		default: 'getAll',
	},
];

export const outletFields: INodeProperties[] = [
	// ----------------------------------
	//         getAll
	// ----------------------------------
	{
		displayName: 'Return All',
		name: 'returnAll',
		type: 'boolean',
		displayOptions: {
			show: {
				resource: ['outlet'],
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
				resource: ['outlet'],
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
				resource: ['outlet'],
				operation: ['getAll'],
			},
		},
		options: [
			{
				displayName: 'Outlet IDs',
				name: 'outletIds',
				type: 'string',
				default: '',
				description: 'Comma-separated list of outlet IDs',
			},
			{
				displayName: 'Name',
				name: 'name',
				type: 'string',
				default: '',
				description: 'Filter by outlet name',
			},
		],
	},
	// ----------------------------------
	//         get
	// ----------------------------------
	{
		displayName: 'Outlet ID',
		name: 'outletId',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['outlet'],
				operation: ['get'],
			},
		},
		default: '',
		description: 'The ID of the outlet',
	},
	// ----------------------------------
	//         getItems
	// ----------------------------------
	{
		displayName: 'Start Date',
		name: 'startUtc',
		type: 'dateTime',
		required: true,
		displayOptions: {
			show: {
				resource: ['outlet'],
				operation: ['getItems'],
			},
		},
		default: '',
		description: 'Start of the transaction period',
	},
	{
		displayName: 'End Date',
		name: 'endUtc',
		type: 'dateTime',
		required: true,
		displayOptions: {
			show: {
				resource: ['outlet'],
				operation: ['getItems'],
			},
		},
		default: '',
		description: 'End of the transaction period',
	},
	{
		displayName: 'Filters',
		name: 'filters',
		type: 'collection',
		placeholder: 'Add Filter',
		default: {},
		displayOptions: {
			show: {
				resource: ['outlet'],
				operation: ['getItems'],
			},
		},
		options: [
			{
				displayName: 'Outlet IDs',
				name: 'outletIds',
				type: 'string',
				default: '',
				description: 'Comma-separated list of outlet IDs',
			},
			{
				displayName: 'Bill IDs',
				name: 'outletBillIds',
				type: 'string',
				default: '',
				description: 'Comma-separated list of outlet bill IDs',
			},
		],
	},
	// ----------------------------------
	//         createBill
	// ----------------------------------
	{
		displayName: 'Outlet ID',
		name: 'outletId',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['outlet'],
				operation: ['createBill'],
			},
		},
		default: '',
		description: 'The ID of the outlet',
	},
	{
		displayName: 'Customer ID',
		name: 'customerId',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['outlet'],
				operation: ['createBill'],
			},
		},
		default: '',
		description: 'The ID of the customer',
	},
	{
		displayName: 'Items',
		name: 'items',
		type: 'json',
		required: true,
		displayOptions: {
			show: {
				resource: ['outlet'],
				operation: ['createBill'],
			},
		},
		default: '[{"Name": "Item Name", "UnitCount": 1, "UnitAmount": {"Value": 10.00, "Currency": "USD"}}]',
		description: 'Array of items for the outlet bill',
	},
	{
		displayName: 'Additional Fields',
		name: 'additionalFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: {
			show: {
				resource: ['outlet'],
				operation: ['createBill'],
			},
		},
		options: [
			{
				displayName: 'Notes',
				name: 'notes',
				type: 'string',
				typeOptions: {
					rows: 3,
				},
				default: '',
				description: 'Notes for the outlet bill',
			},
			{
				displayName: 'Closed Date',
				name: 'closedUtc',
				type: 'dateTime',
				default: '',
				description: 'When the bill was closed',
			},
		],
	},
];

export async function executeOutlet(
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

			if (filters.outletIds) {
				body.OutletIds = processArrayInput(filters.outletIds as string);
			}
			if (filters.name) {
				body.Names = [filters.name];
			}

			if (returnAll) {
				responseData = await mewsApiRequestAllItems.call(
					this,
					'outlets/getAll',
					'Outlets',
					body,
				);
			} else {
				body.Limitation = { Count: limit };
				const response = await mewsApiRequest.call(this, 'outlets/getAll', body);
				responseData = (response.Outlets as IDataObject[]) || [];
			}
			break;
		}

		case 'get': {
			const outletId = this.getNodeParameter('outletId', i) as string;

			const body: IDataObject = {
				OutletIds: [outletId],
			};

			const response = await mewsApiRequest.call(this, 'outlets/getAll', body);
			const outlets = (response.Outlets as IDataObject[]) || [];
			responseData = outlets[0] || {};
			break;
		}

		case 'getItems': {
			const startUtc = this.getNodeParameter('startUtc', i) as string;
			const endUtc = this.getNodeParameter('endUtc', i) as string;
			const filters = this.getNodeParameter('filters', i, {}) as IDataObject;

			const body: IDataObject = {
				StartUtc: new Date(startUtc).toISOString(),
				EndUtc: new Date(endUtc).toISOString(),
			};

			if (filters.outletIds) {
				body.OutletIds = processArrayInput(filters.outletIds as string);
			}
			if (filters.outletBillIds) {
				body.OutletBillIds = processArrayInput(filters.outletBillIds as string);
			}

			const response = await mewsApiRequest.call(this, 'outletItems/getAll', cleanObject(body));
			responseData = (response.OutletItems as IDataObject[]) || [];
			break;
		}

		case 'createBill': {
			const outletId = this.getNodeParameter('outletId', i) as string;
			const customerId = this.getNodeParameter('customerId', i) as string;
			const items = this.getNodeParameter('items', i) as string;
			const additionalFields = this.getNodeParameter('additionalFields', i, {}) as IDataObject;

			let parsedItems;
			try {
				parsedItems = JSON.parse(items);
			} catch {
				throw new Error('Invalid JSON in Items field');
			}

			const outletBill: IDataObject = {
				OutletId: outletId,
				CustomerId: customerId,
				Items: parsedItems,
			};

			if (additionalFields.notes) {
				outletBill.Notes = additionalFields.notes;
			}
			if (additionalFields.closedUtc) {
				outletBill.ClosedUtc = new Date(additionalFields.closedUtc as string).toISOString();
			}

			const body: IDataObject = {
				OutletBills: [outletBill],
			};

			const response = await mewsApiRequest.call(this, 'outletBills/add', cleanObject(body));
			const bills = (response.OutletBills as IDataObject[]) || [];
			responseData = bills[0] || response;
			break;
		}

		default:
			throw new Error(`Operation ${operation} not supported`);
	}

	return responseData;
}
