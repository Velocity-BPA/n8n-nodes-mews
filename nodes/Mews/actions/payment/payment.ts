/**
 * Payment Actions
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
import { PAYMENT_STATES, PAYMENT_TYPES, CURRENCY_OPTIONS } from '../../utils/helpers';

export const paymentOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['payment'],
			},
		},
		options: [
			{
				name: 'Add Preauthorization',
				value: 'addPreauthorization',
				description: 'Hold funds on a credit card',
				action: 'Add preauthorization',
			},
			{
				name: 'Cancel Preauthorization',
				value: 'cancelPreauthorization',
				description: 'Release held funds',
				action: 'Cancel preauthorization',
			},
			{
				name: 'Charge Preauthorization',
				value: 'chargePreauthorization',
				description: 'Capture previously held funds',
				action: 'Charge preauthorization',
			},
			{
				name: 'Create',
				value: 'create',
				description: 'Process a payment',
				action: 'Create a payment',
			},
			{
				name: 'Get',
				value: 'get',
				description: 'Get a payment by ID',
				action: 'Get a payment',
			},
			{
				name: 'Get Commands',
				value: 'getCommands',
				description: 'Get pending payment commands',
				action: 'Get payment commands',
			},
			{
				name: 'Get Many',
				value: 'getAll',
				description: 'Get many payments',
				action: 'Get many payments',
			},
		],
		default: 'getAll',
	},
];

export const paymentFields: INodeProperties[] = [
	// ----------------------------------
	//         getAll
	// ----------------------------------
	{
		displayName: 'Return All',
		name: 'returnAll',
		type: 'boolean',
		displayOptions: {
			show: {
				resource: ['payment'],
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
				resource: ['payment'],
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
				resource: ['payment'],
				operation: ['getAll'],
			},
		},
		options: [
			{
				displayName: 'Payment IDs',
				name: 'paymentIds',
				type: 'string',
				default: '',
				description: 'Comma-separated list of payment IDs',
			},
			{
				displayName: 'Bill IDs',
				name: 'billIds',
				type: 'string',
				default: '',
				description: 'Comma-separated list of bill IDs',
			},
			{
				displayName: 'Account IDs',
				name: 'accountIds',
				type: 'string',
				default: '',
				description: 'Comma-separated list of account IDs',
			},
			{
				displayName: 'States',
				name: 'states',
				type: 'multiOptions',
				options: PAYMENT_STATES,
				default: [],
				description: 'Filter by payment states',
			},
			{
				displayName: 'Types',
				name: 'types',
				type: 'multiOptions',
				options: PAYMENT_TYPES,
				default: [],
				description: 'Filter by payment types',
			},
			{
				displayName: 'Created After',
				name: 'createdUtcStart',
				type: 'dateTime',
				default: '',
				description: 'Filter payments created after this date',
			},
			{
				displayName: 'Created Before',
				name: 'createdUtcEnd',
				type: 'dateTime',
				default: '',
				description: 'Filter payments created before this date',
			},
		],
	},
	// ----------------------------------
	//         get
	// ----------------------------------
	{
		displayName: 'Payment ID',
		name: 'paymentId',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['payment'],
				operation: ['get'],
			},
		},
		default: '',
		description: 'The ID of the payment',
	},
	// ----------------------------------
	//         create
	// ----------------------------------
	{
		displayName: 'Account ID',
		name: 'accountId',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['payment'],
				operation: ['create'],
			},
		},
		default: '',
		description: 'The ID of the account (customer or company) to charge',
	},
	{
		displayName: 'Amount',
		name: 'amount',
		type: 'number',
		required: true,
		displayOptions: {
			show: {
				resource: ['payment'],
				operation: ['create'],
			},
		},
		typeOptions: {
			numberPrecision: 2,
		},
		default: 0,
		description: 'The payment amount',
	},
	{
		displayName: 'Currency',
		name: 'currency',
		type: 'options',
		required: true,
		displayOptions: {
			show: {
				resource: ['payment'],
				operation: ['create'],
			},
		},
		options: CURRENCY_OPTIONS,
		default: 'USD',
		description: 'The currency for the payment',
	},
	{
		displayName: 'Additional Fields',
		name: 'additionalFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: {
			show: {
				resource: ['payment'],
				operation: ['create'],
			},
		},
		options: [
			{
				displayName: 'Credit Card ID',
				name: 'creditCardId',
				type: 'string',
				default: '',
				description: 'The ID of a stored credit card to use',
			},
			{
				displayName: 'Notes',
				name: 'notes',
				type: 'string',
				typeOptions: {
					rows: 3,
				},
				default: '',
				description: 'Notes for the payment',
			},
		],
	},
	// ----------------------------------
	//         getCommands
	// ----------------------------------
	{
		displayName: 'Start Date',
		name: 'startUtc',
		type: 'dateTime',
		required: true,
		displayOptions: {
			show: {
				resource: ['payment'],
				operation: ['getCommands'],
			},
		},
		default: '',
		description: 'Start of the date range',
	},
	{
		displayName: 'End Date',
		name: 'endUtc',
		type: 'dateTime',
		required: true,
		displayOptions: {
			show: {
				resource: ['payment'],
				operation: ['getCommands'],
			},
		},
		default: '',
		description: 'End of the date range',
	},
	// ----------------------------------
	//         addPreauthorization
	// ----------------------------------
	{
		displayName: 'Credit Card ID',
		name: 'creditCardId',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['payment'],
				operation: ['addPreauthorization'],
			},
		},
		default: '',
		description: 'The ID of the credit card to hold',
	},
	{
		displayName: 'Amount',
		name: 'amount',
		type: 'number',
		required: true,
		displayOptions: {
			show: {
				resource: ['payment'],
				operation: ['addPreauthorization'],
			},
		},
		typeOptions: {
			numberPrecision: 2,
		},
		default: 0,
		description: 'The amount to hold',
	},
	{
		displayName: 'Currency',
		name: 'currency',
		type: 'options',
		required: true,
		displayOptions: {
			show: {
				resource: ['payment'],
				operation: ['addPreauthorization'],
			},
		},
		options: CURRENCY_OPTIONS,
		default: 'USD',
		description: 'The currency for the preauthorization',
	},
	// ----------------------------------
	//         chargePreauthorization
	// ----------------------------------
	{
		displayName: 'Preauthorization ID',
		name: 'preauthorizationId',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['payment'],
				operation: ['chargePreauthorization'],
			},
		},
		default: '',
		description: 'The ID of the preauthorization to charge',
	},
	{
		displayName: 'Amount',
		name: 'amount',
		type: 'number',
		displayOptions: {
			show: {
				resource: ['payment'],
				operation: ['chargePreauthorization'],
			},
		},
		typeOptions: {
			numberPrecision: 2,
		},
		default: 0,
		description: 'Amount to charge (leave empty to charge full preauthorized amount)',
	},
	// ----------------------------------
	//         cancelPreauthorization
	// ----------------------------------
	{
		displayName: 'Preauthorization ID',
		name: 'preauthorizationId',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['payment'],
				operation: ['cancelPreauthorization'],
			},
		},
		default: '',
		description: 'The ID of the preauthorization to cancel',
	},
];

export async function executePayment(
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

			if (filters.paymentIds) {
				body.PaymentIds = processArrayInput(filters.paymentIds as string);
			}
			if (filters.billIds) {
				body.BillIds = processArrayInput(filters.billIds as string);
			}
			if (filters.accountIds) {
				body.AccountIds = processArrayInput(filters.accountIds as string);
			}
			if (filters.states && (filters.states as string[]).length > 0) {
				body.States = filters.states;
			}
			if (filters.types && (filters.types as string[]).length > 0) {
				body.Types = filters.types;
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

			if (returnAll) {
				responseData = await mewsApiRequestAllItems.call(
					this,
					'payments/getAll',
					'Payments',
					body,
				);
			} else {
				body.Limitation = { Count: limit };
				const response = await mewsApiRequest.call(this, 'payments/getAll', body);
				responseData = (response.Payments as IDataObject[]) || [];
			}
			break;
		}

		case 'get': {
			const paymentId = this.getNodeParameter('paymentId', i) as string;

			const body: IDataObject = {
				PaymentIds: [paymentId],
			};

			const response = await mewsApiRequest.call(this, 'payments/getAll', body);
			const payments = (response.Payments as IDataObject[]) || [];
			responseData = payments[0] || {};
			break;
		}

		case 'create': {
			const accountId = this.getNodeParameter('accountId', i) as string;
			const amount = this.getNodeParameter('amount', i) as number;
			const currency = this.getNodeParameter('currency', i) as string;
			const additionalFields = this.getNodeParameter('additionalFields', i, {}) as IDataObject;

			const body: IDataObject = {
				AccountId: accountId,
				Amount: {
					Value: amount,
					Currency: currency,
				},
			};

			if (additionalFields.creditCardId) {
				body.CreditCardId = additionalFields.creditCardId;
			}
			if (additionalFields.notes) {
				body.Notes = additionalFields.notes;
			}

			responseData = await mewsApiRequest.call(this, 'payments/addCreditCardPayment', cleanObject(body));
			break;
		}

		case 'getCommands': {
			const startUtc = this.getNodeParameter('startUtc', i) as string;
			const endUtc = this.getNodeParameter('endUtc', i) as string;

			const body: IDataObject = {
				StartUtc: new Date(startUtc).toISOString(),
				EndUtc: new Date(endUtc).toISOString(),
			};

			const response = await mewsApiRequest.call(this, 'commands/getAllByName', {
				...body,
				Names: ['ProcessPayment'],
			});
			responseData = (response.Commands as IDataObject[]) || [];
			break;
		}

		case 'addPreauthorization': {
			const creditCardId = this.getNodeParameter('creditCardId', i) as string;
			const amount = this.getNodeParameter('amount', i) as number;
			const currency = this.getNodeParameter('currency', i) as string;

			const body: IDataObject = {
				CreditCardId: creditCardId,
				Amount: {
					Value: amount,
					Currency: currency,
				},
			};

			responseData = await mewsApiRequest.call(this, 'preauthorizations/add', body);
			break;
		}

		case 'chargePreauthorization': {
			const preauthorizationId = this.getNodeParameter('preauthorizationId', i) as string;
			const amount = this.getNodeParameter('amount', i, 0) as number;

			const body: IDataObject = {
				PreauthorizationId: preauthorizationId,
			};

			if (amount > 0) {
				body.Amount = amount;
			}

			responseData = await mewsApiRequest.call(this, 'preauthorizations/charge', cleanObject(body));
			break;
		}

		case 'cancelPreauthorization': {
			const preauthorizationId = this.getNodeParameter('preauthorizationId', i) as string;

			const body: IDataObject = {
				PreauthorizationId: preauthorizationId,
			};

			responseData = await mewsApiRequest.call(this, 'preauthorizations/cancel', body);
			break;
		}

		default:
			throw new Error(`Operation ${operation} not supported`);
	}

	return responseData;
}
