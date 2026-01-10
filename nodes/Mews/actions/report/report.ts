/**
 * Report Actions
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
	processArrayInput,
	cleanObject,
} from '../../transport/mewsClient';
import { REPORT_MODES } from '../../utils/helpers';

export const reportOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['report'],
			},
		},
		options: [
			{
				name: 'Export Data',
				value: 'exportData',
				description: 'Export bulk data for analysis',
				action: 'Export data',
			},
			{
				name: 'Get Activity Report',
				value: 'getActivityReport',
				description: 'Get guest activity report',
				action: 'Get activity report',
			},
			{
				name: 'Get Manager Report',
				value: 'getManagerReport',
				description: 'Get daily manager report',
				action: 'Get manager report',
			},
			{
				name: 'Get Occupancy Report',
				value: 'getOccupancyReport',
				description: 'Get occupancy statistics',
				action: 'Get occupancy report',
			},
			{
				name: 'Get Revenue Report',
				value: 'getRevenueReport',
				description: 'Get revenue breakdown',
				action: 'Get revenue report',
			},
		],
		default: 'getManagerReport',
	},
];

export const reportFields: INodeProperties[] = [
	// ----------------------------------
	//         Common Report Fields
	// ----------------------------------
	{
		displayName: 'Start Date',
		name: 'startUtc',
		type: 'dateTime',
		required: true,
		default: '',
		displayOptions: {
			show: {
				resource: ['report'],
				operation: ['getManagerReport', 'getOccupancyReport', 'getRevenueReport', 'getActivityReport', 'exportData'],
			},
		},
		description: 'Start of the report period',
	},
	{
		displayName: 'End Date',
		name: 'endUtc',
		type: 'dateTime',
		required: true,
		default: '',
		displayOptions: {
			show: {
				resource: ['report'],
				operation: ['getManagerReport', 'getOccupancyReport', 'getRevenueReport', 'getActivityReport', 'exportData'],
			},
		},
		description: 'End of the report period',
	},

	// ----------------------------------
	//         getManagerReport
	// ----------------------------------
	{
		displayName: 'Additional Options',
		name: 'additionalOptions',
		type: 'collection',
		placeholder: 'Add Option',
		default: {},
		displayOptions: {
			show: {
				resource: ['report'],
				operation: ['getManagerReport'],
			},
		},
		options: [
			{
				displayName: 'Service IDs',
				name: 'serviceIds',
				type: 'string',
				default: '',
				description: 'Filter by service IDs (comma-separated)',
			},
			{
				displayName: 'Space Category IDs',
				name: 'spaceCategoryIds',
				type: 'string',
				default: '',
				description: 'Filter by room type IDs (comma-separated)',
			},
		],
	},

	// ----------------------------------
	//         getOccupancyReport
	// ----------------------------------
	{
		displayName: 'Mode',
		name: 'mode',
		type: 'options',
		options: REPORT_MODES,
		default: 'Day',
		displayOptions: {
			show: {
				resource: ['report'],
				operation: ['getOccupancyReport'],
			},
		},
		description: 'Report grouping mode',
	},
	{
		displayName: 'Additional Options',
		name: 'additionalOptions',
		type: 'collection',
		placeholder: 'Add Option',
		default: {},
		displayOptions: {
			show: {
				resource: ['report'],
				operation: ['getOccupancyReport'],
			},
		},
		options: [
			{
				displayName: 'Service IDs',
				name: 'serviceIds',
				type: 'string',
				default: '',
				description: 'Filter by service IDs (comma-separated)',
			},
			{
				displayName: 'Space Category IDs',
				name: 'spaceCategoryIds',
				type: 'string',
				default: '',
				description: 'Filter by room type IDs (comma-separated)',
			},
		],
	},

	// ----------------------------------
	//         getRevenueReport
	// ----------------------------------
	{
		displayName: 'Mode',
		name: 'mode',
		type: 'options',
		options: REPORT_MODES,
		default: 'Day',
		displayOptions: {
			show: {
				resource: ['report'],
				operation: ['getRevenueReport'],
			},
		},
		description: 'Report grouping mode',
	},
	{
		displayName: 'Additional Options',
		name: 'additionalOptions',
		type: 'collection',
		placeholder: 'Add Option',
		default: {},
		displayOptions: {
			show: {
				resource: ['report'],
				operation: ['getRevenueReport'],
			},
		},
		options: [
			{
				displayName: 'Service IDs',
				name: 'serviceIds',
				type: 'string',
				default: '',
				description: 'Filter by service IDs (comma-separated)',
			},
			{
				displayName: 'Account Category IDs',
				name: 'accountCategoryIds',
				type: 'string',
				default: '',
				description: 'Filter by account category IDs (comma-separated)',
			},
			{
				displayName: 'Currency',
				name: 'currency',
				type: 'string',
				default: '',
				description: 'Currency for the report (e.g., USD, EUR)',
			},
		],
	},

	// ----------------------------------
	//         getActivityReport
	// ----------------------------------
	{
		displayName: 'Additional Options',
		name: 'additionalOptions',
		type: 'collection',
		placeholder: 'Add Option',
		default: {},
		displayOptions: {
			show: {
				resource: ['report'],
				operation: ['getActivityReport'],
			},
		},
		options: [
			{
				displayName: 'Service IDs',
				name: 'serviceIds',
				type: 'string',
				default: '',
				description: 'Filter by service IDs (comma-separated)',
			},
			{
				displayName: 'Space Category IDs',
				name: 'spaceCategoryIds',
				type: 'string',
				default: '',
				description: 'Filter by room type IDs (comma-separated)',
			},
			{
				displayName: 'Types',
				name: 'types',
				type: 'multiOptions',
				options: [
					{ name: 'Arrival', value: 'Arrival' },
					{ name: 'Departure', value: 'Departure' },
					{ name: 'Stay Over', value: 'StayOver' },
				],
				default: [],
				description: 'Filter by activity types',
			},
		],
	},

	// ----------------------------------
	//         exportData
	// ----------------------------------
	{
		displayName: 'Export Type',
		name: 'exportType',
		type: 'options',
		options: [
			{
				name: 'Reservations',
				value: 'reservations',
			},
			{
				name: 'Customers',
				value: 'customers',
			},
			{
				name: 'Bills',
				value: 'bills',
			},
			{
				name: 'Payments',
				value: 'payments',
			},
			{
				name: 'Accounting Items',
				value: 'accountingItems',
			},
		],
		default: 'reservations',
		displayOptions: {
			show: {
				resource: ['report'],
				operation: ['exportData'],
			},
		},
		description: 'Type of data to export',
	},
	{
		displayName: 'Additional Options',
		name: 'additionalOptions',
		type: 'collection',
		placeholder: 'Add Option',
		default: {},
		displayOptions: {
			show: {
				resource: ['report'],
				operation: ['exportData'],
			},
		},
		options: [
			{
				displayName: 'Service IDs',
				name: 'serviceIds',
				type: 'string',
				default: '',
				description: 'Filter by service IDs (comma-separated)',
			},
			{
				displayName: 'States',
				name: 'states',
				type: 'string',
				default: '',
				description: 'Filter by states (comma-separated)',
			},
			{
				displayName: 'Customer IDs',
				name: 'customerIds',
				type: 'string',
				default: '',
				description: 'Filter by customer IDs (comma-separated)',
			},
		],
	},
];

export async function executeReportOperation(
	this: IExecuteFunctions,
	operation: string,
	i: number,
): Promise<IDataObject | IDataObject[]> {
	let responseData: IDataObject | IDataObject[] = {};

	switch (operation) {
		case 'getManagerReport': {
			const startUtc = this.getNodeParameter('startUtc', i) as string;
			const endUtc = this.getNodeParameter('endUtc', i) as string;
			const additionalOptions = this.getNodeParameter('additionalOptions', i, {}) as IDataObject;

			const body: IDataObject = {
				StartUtc: new Date(startUtc).toISOString(),
				EndUtc: new Date(endUtc).toISOString(),
			};

			if (additionalOptions.serviceIds) {
				body.ServiceIds = processArrayInput(additionalOptions.serviceIds as string);
			}
			if (additionalOptions.spaceCategoryIds) {
				body.SpaceCategoryIds = processArrayInput(additionalOptions.spaceCategoryIds as string);
			}

			responseData = await mewsApiRequest.call(this, 'reports/getManagerReport', cleanObject(body));
			break;
		}

		case 'getOccupancyReport': {
			const startUtc = this.getNodeParameter('startUtc', i) as string;
			const endUtc = this.getNodeParameter('endUtc', i) as string;
			const mode = this.getNodeParameter('mode', i) as string;
			const additionalOptions = this.getNodeParameter('additionalOptions', i, {}) as IDataObject;

			const body: IDataObject = {
				StartUtc: new Date(startUtc).toISOString(),
				EndUtc: new Date(endUtc).toISOString(),
				Mode: mode,
			};

			if (additionalOptions.serviceIds) {
				body.ServiceIds = processArrayInput(additionalOptions.serviceIds as string);
			}
			if (additionalOptions.spaceCategoryIds) {
				body.SpaceCategoryIds = processArrayInput(additionalOptions.spaceCategoryIds as string);
			}

			responseData = await mewsApiRequest.call(this, 'services/getAvailability', cleanObject(body));
			break;
		}

		case 'getRevenueReport': {
			const startUtc = this.getNodeParameter('startUtc', i) as string;
			const endUtc = this.getNodeParameter('endUtc', i) as string;
			const mode = this.getNodeParameter('mode', i) as string;
			const additionalOptions = this.getNodeParameter('additionalOptions', i, {}) as IDataObject;

			const body: IDataObject = {
				StartUtc: new Date(startUtc).toISOString(),
				EndUtc: new Date(endUtc).toISOString(),
				Mode: mode,
			};

			if (additionalOptions.serviceIds) {
				body.ServiceIds = processArrayInput(additionalOptions.serviceIds as string);
			}
			if (additionalOptions.accountCategoryIds) {
				body.AccountCategoryIds = processArrayInput(additionalOptions.accountCategoryIds as string);
			}
			if (additionalOptions.currency) {
				body.Currency = additionalOptions.currency;
			}

			responseData = await mewsApiRequest.call(this, 'accountingItems/getAll', cleanObject(body));
			break;
		}

		case 'getActivityReport': {
			const startUtc = this.getNodeParameter('startUtc', i) as string;
			const endUtc = this.getNodeParameter('endUtc', i) as string;
			const additionalOptions = this.getNodeParameter('additionalOptions', i, {}) as IDataObject;

			const body: IDataObject = {
				StartUtc: new Date(startUtc).toISOString(),
				EndUtc: new Date(endUtc).toISOString(),
			};

			if (additionalOptions.serviceIds) {
				body.ServiceIds = processArrayInput(additionalOptions.serviceIds as string);
			}
			if (additionalOptions.spaceCategoryIds) {
				body.SpaceCategoryIds = processArrayInput(additionalOptions.spaceCategoryIds as string);
			}
			if ((additionalOptions.types as string[])?.length > 0) {
				body.Types = additionalOptions.types;
			}

			responseData = await mewsApiRequest.call(this, 'reservations/getAll', cleanObject(body));
			break;
		}

		case 'exportData': {
			const startUtc = this.getNodeParameter('startUtc', i) as string;
			const endUtc = this.getNodeParameter('endUtc', i) as string;
			const exportType = this.getNodeParameter('exportType', i) as string;
			const additionalOptions = this.getNodeParameter('additionalOptions', i, {}) as IDataObject;

			const body: IDataObject = {
				StartUtc: new Date(startUtc).toISOString(),
				EndUtc: new Date(endUtc).toISOString(),
			};

			if (additionalOptions.serviceIds) {
				body.ServiceIds = processArrayInput(additionalOptions.serviceIds as string);
			}
			if (additionalOptions.states) {
				body.States = processArrayInput(additionalOptions.states as string);
			}
			if (additionalOptions.customerIds) {
				body.CustomerIds = processArrayInput(additionalOptions.customerIds as string);
			}

			let endpoint: string;
			switch (exportType) {
				case 'reservations':
					endpoint = 'reservations/getAll';
					break;
				case 'customers':
					endpoint = 'customers/getAll';
					break;
				case 'bills':
					endpoint = 'bills/getAll';
					break;
				case 'payments':
					endpoint = 'payments/getAll';
					break;
				case 'accountingItems':
					endpoint = 'accountingItems/getAll';
					break;
				default:
					endpoint = 'reservations/getAll';
			}

			responseData = await mewsApiRequest.call(this, endpoint, cleanObject(body));
			break;
		}

		default:
			throw new Error(`Operation ${operation} not supported`);
	}

	return responseData;
}
