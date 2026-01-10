/**
 * Bill Actions
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
import { BILL_TYPES } from '../../utils/helpers';

export const billOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['bill'],
			},
		},
		options: [
			{
				name: 'Add Payment',
				value: 'addPayment',
				description: 'Add a payment to a bill',
				action: 'Add payment to bill',
			},
			{
				name: 'Close',
				value: 'close',
				description: 'Finalize and close a bill',
				action: 'Close a bill',
			},
			{
				name: 'Create',
				value: 'create',
				description: 'Create a new bill',
				action: 'Create a bill',
			},
			{
				name: 'Get',
				value: 'get',
				description: 'Get a bill by ID',
				action: 'Get a bill',
			},
			{
				name: 'Get Items',
				value: 'getItems',
				description: 'Get line items on a bill',
				action: 'Get bill items',
			},
			{
				name: 'Get Many',
				value: 'getAll',
				description: 'Get many bills',
				action: 'Get many bills',
			},
			{
				name: 'Move Items',
				value: 'moveItems',
				description: 'Transfer items between bills',
				action: 'Move bill items',
			},
		],
		default: 'getAll',
	},
];

export const billFields: INodeProperties[] = [
	// ----------------------------------
	//         getAll
	// ----------------------------------
	{
		displayName: 'Return All',
		name: 'returnAll',
		type: 'boolean',
		displayOptions: {
			show: {
				resource: ['bill'],
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
				resource: ['bill'],
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
				resource: ['bill'],
				operation: ['getAll'],
			},
		},
		options: [
			{
				displayName: 'Bill IDs',
				name: 'billIds',
				type: 'string',
				default: '',
				description: 'Comma-separated list of bill IDs',
			},
			{
				displayName: 'Customer IDs',
				name: 'customerIds',
				type: 'string',
				default: '',
				description: 'Comma-separated list of customer IDs',
			},
			{
				displayName: 'Company IDs',
				name: 'companyIds',
				type: 'string',
				default: '',
				description: 'Comma-separated list of company IDs',
			},
			{
				displayName: 'Is Closed',
				name: 'isClosed',
				type: 'boolean',
				default: false,
				description: 'Filter by closed status',
			},
			{
				displayName: 'Created After',
				name: 'createdUtcStart',
				type: 'dateTime',
				default: '',
				description: 'Filter bills created after this date',
			},
			{
				displayName: 'Created Before',
				name: 'createdUtcEnd',
				type: 'dateTime',
				default: '',
				description: 'Filter bills created before this date',
			},
		],
	},
	{
		displayName: 'Options',
		name: 'options',
		type: 'collection',
		placeholder: 'Add Option',
		default: {},
		displayOptions: {
			show: {
				resource: ['bill'],
				operation: ['getAll'],
			},
		},
		options: [
			{
				displayName: 'Include Payments',
				name: 'includePayments',
				type: 'boolean',
				default: false,
				description: 'Whether to include payments in response',
			},
			{
				displayName: 'Include Items',
				name: 'includeItems',
				type: 'boolean',
				default: false,
				description: 'Whether to include line items in response',
			},
		],
	},
	// ----------------------------------
	//         get
	// ----------------------------------
	{
		displayName: 'Bill ID',
		name: 'billId',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['bill'],
				operation: ['get', 'close', 'getItems', 'addPayment'],
			},
		},
		default: '',
		description: 'The ID of the bill',
	},
	// ----------------------------------
	//         create
	// ----------------------------------
	{
		displayName: 'Customer ID',
		name: 'customerId',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['bill'],
				operation: ['create'],
			},
		},
		default: '',
		description: 'The ID of the customer for the bill',
	},
	{
		displayName: 'Additional Fields',
		name: 'additionalFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: {
			show: {
				resource: ['bill'],
				operation: ['create'],
			},
		},
		options: [
			{
				displayName: 'Company ID',
				name: 'companyId',
				type: 'string',
				default: '',
				description: 'The ID of the company for billing',
			},
			{
				displayName: 'Type',
				name: 'type',
				type: 'options',
				options: BILL_TYPES,
				default: 'Receipt',
				description: 'Bill type',
			},
			{
				displayName: 'Due Date',
				name: 'dueUtc',
				type: 'dateTime',
				default: '',
				description: 'Payment due date (for invoices)',
			},
			{
				displayName: 'Notes',
				name: 'notes',
				type: 'string',
				typeOptions: {
					rows: 3,
				},
				default: '',
				description: 'Notes for the bill',
			},
		],
	},
	// ----------------------------------
	//         close
	// ----------------------------------
	{
		displayName: 'Options',
		name: 'options',
		type: 'collection',
		placeholder: 'Add Option',
		default: {},
		displayOptions: {
			show: {
				resource: ['bill'],
				operation: ['close'],
			},
		},
		options: [
			{
				displayName: 'Type',
				name: 'type',
				type: 'options',
				options: BILL_TYPES,
				default: 'Receipt',
				description: 'How to close the bill',
			},
		],
	},
	// ----------------------------------
	//         addPayment
	// ----------------------------------
	{
		displayName: 'Payment ID',
		name: 'paymentId',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['bill'],
				operation: ['addPayment'],
			},
		},
		default: '',
		description: 'The ID of the payment to add to the bill',
	},
	// ----------------------------------
	//         moveItems
	// ----------------------------------
	{
		displayName: 'Source Bill ID',
		name: 'sourceBillId',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['bill'],
				operation: ['moveItems'],
			},
		},
		default: '',
		description: 'The ID of the bill to move items from',
	},
	{
		displayName: 'Target Bill ID',
		name: 'targetBillId',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['bill'],
				operation: ['moveItems'],
			},
		},
		default: '',
		description: 'The ID of the bill to move items to',
	},
	{
		displayName: 'Item IDs',
		name: 'itemIds',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['bill'],
				operation: ['moveItems'],
			},
		},
		default: '',
		description: 'Comma-separated list of item IDs to move',
	},
];

export async function executeBill(
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
			const options = this.getNodeParameter('options', i, {}) as IDataObject;

			const body: IDataObject = {};

			if (filters.billIds) {
				body.BillIds = processArrayInput(filters.billIds as string);
			}
			if (filters.customerIds) {
				body.CustomerIds = processArrayInput(filters.customerIds as string);
			}
			if (filters.companyIds) {
				body.CompanyIds = processArrayInput(filters.companyIds as string);
			}
			if (filters.isClosed !== undefined) {
				body.IsClosed = filters.isClosed;
			}
			if (filters.createdUtcStart || filters.createdUtcEnd) {
				body.CreatedUtc = {};
				if (filters.createdUtcStart) {
					(body.CreatedUtc as IDataObject).StartUtc = new Date(filters.createdUtcStart as string).toISOString();
				}
				if (filters.createdUtcEnd) {
					(body.CreatedUtc as IDataObject).EndUtc = new Date(filters.createdUtcEnd as string).toISOString();
				}
			}

			const extent: IDataObject = {};
			if (options.includePayments) extent.Payments = true;
			if (options.includeItems) extent.Items = true;
			if (Object.keys(extent).length > 0) {
				body.Extent = extent;
			}

			if (returnAll) {
				responseData = await mewsApiRequestAllItems.call(
					this,
					'bills/getAll',
					'Bills',
					body,
				);
			} else {
				body.Limitation = { Count: limit };
				const response = await mewsApiRequest.call(this, 'bills/getAll', body);
				responseData = (response.Bills as IDataObject[]) || [];
			}
			break;
		}

		case 'get': {
			const billId = this.getNodeParameter('billId', i) as string;

			const body: IDataObject = {
				BillIds: [billId],
				Extent: {
					Payments: true,
					Items: true,
				},
			};

			const response = await mewsApiRequest.call(this, 'bills/getAll', body);
			const bills = (response.Bills as IDataObject[]) || [];
			responseData = bills[0] || {};
			break;
		}

		case 'create': {
			const customerId = this.getNodeParameter('customerId', i) as string;
			const additionalFields = this.getNodeParameter('additionalFields', i, {}) as IDataObject;

			const body: IDataObject = {
				CustomerId: customerId,
			};

			if (additionalFields.companyId) {
				body.CompanyId = additionalFields.companyId;
			}
			if (additionalFields.type) {
				body.Type = additionalFields.type;
			}
			if (additionalFields.dueUtc) {
				body.DueUtc = new Date(additionalFields.dueUtc as string).toISOString();
			}
			if (additionalFields.notes) {
				body.Notes = additionalFields.notes;
			}

			responseData = await mewsApiRequest.call(this, 'bills/add', cleanObject(body));
			break;
		}

		case 'close': {
			const billId = this.getNodeParameter('billId', i) as string;
			const options = this.getNodeParameter('options', i, {}) as IDataObject;

			const body: IDataObject = {
				BillId: billId,
			};

			if (options.type) {
				body.Type = options.type;
			}

			responseData = await mewsApiRequest.call(this, 'bills/close', cleanObject(body));
			break;
		}

		case 'getItems': {
			const billId = this.getNodeParameter('billId', i) as string;

			const body: IDataObject = {
				BillIds: [billId],
				Extent: {
					Items: true,
				},
			};

			const response = await mewsApiRequest.call(this, 'bills/getAll', body);
			const items = (response.Items as IDataObject[]) || [];
			responseData = items;
			break;
		}

		case 'addPayment': {
			const billId = this.getNodeParameter('billId', i) as string;
			const paymentId = this.getNodeParameter('paymentId', i) as string;

			const body: IDataObject = {
				BillId: billId,
				PaymentIds: [paymentId],
			};

			responseData = await mewsApiRequest.call(this, 'bills/addPayments', body);
			break;
		}

		case 'moveItems': {
			const sourceBillId = this.getNodeParameter('sourceBillId', i) as string;
			const targetBillId = this.getNodeParameter('targetBillId', i) as string;
			const itemIds = this.getNodeParameter('itemIds', i) as string;

			const body: IDataObject = {
				SourceBillId: sourceBillId,
				TargetBillId: targetBillId,
				ItemIds: processArrayInput(itemIds),
			};

			responseData = await mewsApiRequest.call(this, 'bills/moveItems', body);
			break;
		}

		default:
			throw new Error(`Operation ${operation} not supported`);
	}

	return responseData;
}
