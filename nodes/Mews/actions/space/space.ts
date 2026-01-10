/**
 * Space (Rooms) Actions
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
import { SPACE_STATES } from '../../utils/helpers';

export const spaceOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['space'],
			},
		},
		options: [
			{
				name: 'Get',
				value: 'get',
				description: 'Get a space by ID',
				action: 'Get a space',
			},
			{
				name: 'Get Availability',
				value: 'getAvailability',
				description: 'Check space availability for a date range',
				action: 'Get space availability',
			},
			{
				name: 'Get Blocks',
				value: 'getBlocks',
				description: 'Get room blocks',
				action: 'Get space blocks',
			},
			{
				name: 'Get Categories',
				value: 'getCategories',
				description: 'Get room types/categories',
				action: 'Get space categories',
			},
			{
				name: 'Get Many',
				value: 'getAll',
				description: 'Get many spaces',
				action: 'Get many spaces',
			},
			{
				name: 'Update State',
				value: 'updateState',
				description: 'Update the housekeeping state of a space',
				action: 'Update space state',
			},
		],
		default: 'getAll',
	},
];

export const spaceFields: INodeProperties[] = [
	// ----------------------------------
	//         getAll
	// ----------------------------------
	{
		displayName: 'Return All',
		name: 'returnAll',
		type: 'boolean',
		displayOptions: {
			show: {
				resource: ['space'],
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
				resource: ['space'],
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
				resource: ['space'],
				operation: ['getAll'],
			},
		},
		options: [
			{
				displayName: 'Space IDs',
				name: 'spaceIds',
				type: 'string',
				default: '',
				description: 'Comma-separated list of space IDs',
			},
			{
				displayName: 'Space Category IDs',
				name: 'spaceCategoryIds',
				type: 'string',
				default: '',
				description: 'Comma-separated list of room type IDs',
			},
			{
				displayName: 'States',
				name: 'states',
				type: 'multiOptions',
				options: SPACE_STATES,
				default: [],
				description: 'Filter by space states',
			},
			{
				displayName: 'Is Active',
				name: 'isActive',
				type: 'boolean',
				default: true,
				description: 'Filter by active status',
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
				resource: ['space'],
				operation: ['getAll'],
			},
		},
		options: [
			{
				displayName: 'Include Inactive',
				name: 'includeInactive',
				type: 'boolean',
				default: false,
				description: 'Whether to include inactive spaces',
			},
		],
	},
	// ----------------------------------
	//         get
	// ----------------------------------
	{
		displayName: 'Space ID',
		name: 'spaceId',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['space'],
				operation: ['get'],
			},
		},
		default: '',
		description: 'The ID of the space/room',
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
				resource: ['space'],
				operation: ['getAvailability'],
			},
		},
		default: '',
		description: 'The ID of the accommodation service',
	},
	{
		displayName: 'Start Date',
		name: 'startUtc',
		type: 'dateTime',
		required: true,
		displayOptions: {
			show: {
				resource: ['space'],
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
				resource: ['space'],
				operation: ['getAvailability'],
			},
		},
		default: '',
		description: 'End of the availability period',
	},
	{
		displayName: 'Options',
		name: 'options',
		type: 'collection',
		placeholder: 'Add Option',
		default: {},
		displayOptions: {
			show: {
				resource: ['space'],
				operation: ['getAvailability'],
			},
		},
		options: [
			{
				displayName: 'Space Category IDs',
				name: 'spaceCategoryIds',
				type: 'string',
				default: '',
				description: 'Comma-separated list of room type IDs to check',
			},
		],
	},
	// ----------------------------------
	//         getBlocks
	// ----------------------------------
	{
		displayName: 'Start Date',
		name: 'startUtc',
		type: 'dateTime',
		required: true,
		displayOptions: {
			show: {
				resource: ['space'],
				operation: ['getBlocks'],
			},
		},
		default: '',
		description: 'Start of the block period',
	},
	{
		displayName: 'End Date',
		name: 'endUtc',
		type: 'dateTime',
		required: true,
		displayOptions: {
			show: {
				resource: ['space'],
				operation: ['getBlocks'],
			},
		},
		default: '',
		description: 'End of the block period',
	},
	{
		displayName: 'Filters',
		name: 'filters',
		type: 'collection',
		placeholder: 'Add Filter',
		default: {},
		displayOptions: {
			show: {
				resource: ['space'],
				operation: ['getBlocks'],
			},
		},
		options: [
			{
				displayName: 'Space IDs',
				name: 'spaceIds',
				type: 'string',
				default: '',
				description: 'Comma-separated list of space IDs',
			},
			{
				displayName: 'Block IDs',
				name: 'spaceBlockIds',
				type: 'string',
				default: '',
				description: 'Comma-separated list of block IDs',
			},
		],
	},
	// ----------------------------------
	//         getCategories
	// ----------------------------------
	{
		displayName: 'Return All',
		name: 'returnAll',
		type: 'boolean',
		displayOptions: {
			show: {
				resource: ['space'],
				operation: ['getCategories'],
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
				resource: ['space'],
				operation: ['getCategories'],
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
				resource: ['space'],
				operation: ['getCategories'],
			},
		},
		options: [
			{
				displayName: 'Service ID',
				name: 'serviceId',
				type: 'string',
				default: '',
				description: 'Filter by service ID',
			},
			{
				displayName: 'Space Category IDs',
				name: 'spaceCategoryIds',
				type: 'string',
				default: '',
				description: 'Comma-separated list of category IDs',
			},
		],
	},
	// ----------------------------------
	//         updateState
	// ----------------------------------
	{
		displayName: 'Space ID',
		name: 'spaceId',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['space'],
				operation: ['updateState'],
			},
		},
		default: '',
		description: 'The ID of the space/room to update',
	},
	{
		displayName: 'State',
		name: 'state',
		type: 'options',
		required: true,
		displayOptions: {
			show: {
				resource: ['space'],
				operation: ['updateState'],
			},
		},
		options: SPACE_STATES,
		default: 'Clean',
		description: 'The new state for the space',
	},
];

export async function executeSpace(
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

			if (filters.spaceIds) {
				body.SpaceIds = processArrayInput(filters.spaceIds as string);
			}
			if (filters.spaceCategoryIds) {
				body.SpaceCategoryIds = processArrayInput(filters.spaceCategoryIds as string);
			}
			if (filters.states && (filters.states as string[]).length > 0) {
				body.States = filters.states;
			}
			if (filters.isActive !== undefined) {
				body.ActivityStates = filters.isActive ? ['Active'] : ['Inactive'];
			}

			if (options.includeInactive) {
				body.ActivityStates = ['Active', 'Inactive'];
			}

			if (returnAll) {
				responseData = await mewsApiRequestAllItems.call(
					this,
					'spaces/getAll',
					'Spaces',
					body,
				);
			} else {
				body.Limitation = { Count: limit };
				const response = await mewsApiRequest.call(this, 'spaces/getAll', body);
				responseData = (response.Spaces as IDataObject[]) || [];
			}
			break;
		}

		case 'get': {
			const spaceId = this.getNodeParameter('spaceId', i) as string;

			const body: IDataObject = {
				SpaceIds: [spaceId],
			};

			const response = await mewsApiRequest.call(this, 'spaces/getAll', body);
			const spaces = (response.Spaces as IDataObject[]) || [];
			responseData = spaces[0] || {};
			break;
		}

		case 'getAvailability': {
			const serviceId = this.getNodeParameter('serviceId', i) as string;
			const startUtc = this.getNodeParameter('startUtc', i) as string;
			const endUtc = this.getNodeParameter('endUtc', i) as string;
			const options = this.getNodeParameter('options', i, {}) as IDataObject;

			const body: IDataObject = {
				ServiceId: serviceId,
				StartUtc: new Date(startUtc).toISOString(),
				EndUtc: new Date(endUtc).toISOString(),
			};

			if (options.spaceCategoryIds) {
				body.SpaceCategoryIds = processArrayInput(options.spaceCategoryIds as string);
			}

			responseData = await mewsApiRequest.call(this, 'services/getAvailability', cleanObject(body));
			break;
		}

		case 'getBlocks': {
			const startUtc = this.getNodeParameter('startUtc', i) as string;
			const endUtc = this.getNodeParameter('endUtc', i) as string;
			const filters = this.getNodeParameter('filters', i, {}) as IDataObject;

			const body: IDataObject = {
				StartUtc: new Date(startUtc).toISOString(),
				EndUtc: new Date(endUtc).toISOString(),
			};

			if (filters.spaceIds) {
				body.SpaceIds = processArrayInput(filters.spaceIds as string);
			}
			if (filters.spaceBlockIds) {
				body.SpaceBlockIds = processArrayInput(filters.spaceBlockIds as string);
			}

			const response = await mewsApiRequest.call(this, 'spaceBlocks/getAll', cleanObject(body));
			responseData = (response.SpaceBlocks as IDataObject[]) || [];
			break;
		}

		case 'getCategories': {
			const returnAll = this.getNodeParameter('returnAll', i) as boolean;
			const limit = this.getNodeParameter('limit', i, 100) as number;
			const filters = this.getNodeParameter('filters', i, {}) as IDataObject;

			const body: IDataObject = {};

			if (filters.serviceId) {
				body.ServiceIds = [filters.serviceId];
			}
			if (filters.spaceCategoryIds) {
				body.SpaceCategoryIds = processArrayInput(filters.spaceCategoryIds as string);
			}

			if (returnAll) {
				responseData = await mewsApiRequestAllItems.call(
					this,
					'spaceCategories/getAll',
					'SpaceCategories',
					body,
				);
			} else {
				body.Limitation = { Count: limit };
				const response = await mewsApiRequest.call(this, 'spaceCategories/getAll', body);
				responseData = (response.SpaceCategories as IDataObject[]) || [];
			}
			break;
		}

		case 'updateState': {
			const spaceId = this.getNodeParameter('spaceId', i) as string;
			const state = this.getNodeParameter('state', i) as string;

			const body: IDataObject = {
				SpaceId: spaceId,
				State: state,
			};

			responseData = await mewsApiRequest.call(this, 'spaces/updateState', body);
			break;
		}

		default:
			throw new Error(`Operation ${operation} not supported`);
	}

	return responseData;
}
