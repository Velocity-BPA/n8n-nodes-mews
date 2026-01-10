/**
 * Reservation Actions
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
	buildExtent,
	cleanObject,
} from '../../transport/mewsClient';
import { RESERVATION_STATES } from '../../utils/helpers';

export const reservationOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['reservation'],
			},
		},
		options: [
			{
				name: 'Add Item',
				value: 'addItem',
				description: 'Add a product or service to a reservation',
				action: 'Add item to reservation',
			},
			{
				name: 'Assign Space',
				value: 'assignSpace',
				description: 'Assign a room/space to a reservation',
				action: 'Assign space to reservation',
			},
			{
				name: 'Cancel',
				value: 'cancel',
				description: 'Cancel a reservation',
				action: 'Cancel a reservation',
			},
			{
				name: 'Confirm',
				value: 'confirm',
				description: 'Confirm an optional reservation',
				action: 'Confirm a reservation',
			},
			{
				name: 'Create',
				value: 'create',
				description: 'Create a new reservation',
				action: 'Create a reservation',
			},
			{
				name: 'Get',
				value: 'get',
				description: 'Get a reservation by ID',
				action: 'Get a reservation',
			},
			{
				name: 'Get Items',
				value: 'getItems',
				description: 'Get items associated with a reservation',
				action: 'Get reservation items',
			},
			{
				name: 'Get Many',
				value: 'getAll',
				description: 'Get many reservations',
				action: 'Get many reservations',
			},
			{
				name: 'Update',
				value: 'update',
				description: 'Update a reservation',
				action: 'Update a reservation',
			},
		],
		default: 'getAll',
	},
];

export const reservationFields: INodeProperties[] = [
	// ----------------------------------
	//         getAll
	// ----------------------------------
	{
		displayName: 'Return All',
		name: 'returnAll',
		type: 'boolean',
		displayOptions: {
			show: {
				resource: ['reservation'],
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
				resource: ['reservation'],
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
				resource: ['reservation'],
				operation: ['getAll'],
			},
		},
		options: [
			{
				displayName: 'Reservation IDs',
				name: 'reservationIds',
				type: 'string',
				default: '',
				description: 'Comma-separated list of reservation IDs to filter by',
			},
			{
				displayName: 'Service IDs',
				name: 'serviceIds',
				type: 'string',
				default: '',
				description: 'Comma-separated list of service IDs to filter by',
			},
			{
				displayName: 'States',
				name: 'states',
				type: 'multiOptions',
				options: RESERVATION_STATES,
				default: [],
				description: 'Filter by reservation states',
			},
			{
				displayName: 'Start Date',
				name: 'startUtc',
				type: 'dateTime',
				default: '',
				description: 'Start of date range filter',
			},
			{
				displayName: 'End Date',
				name: 'endUtc',
				type: 'dateTime',
				default: '',
				description: 'End of date range filter',
			},
			{
				displayName: 'Customer IDs',
				name: 'customerIds',
				type: 'string',
				default: '',
				description: 'Comma-separated list of customer IDs',
			},
			{
				displayName: 'Space IDs',
				name: 'spaceIds',
				type: 'string',
				default: '',
				description: 'Comma-separated list of space/room IDs',
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
				resource: ['reservation'],
				operation: ['getAll'],
			},
		},
		options: [
			{
				displayName: 'Include Customers',
				name: 'includeCustomers',
				type: 'boolean',
				default: false,
				description: 'Whether to include customer data in response',
			},
			{
				displayName: 'Include Spaces',
				name: 'includeSpaces',
				type: 'boolean',
				default: false,
				description: 'Whether to include space data in response',
			},
			{
				displayName: 'Include Services',
				name: 'includeServices',
				type: 'boolean',
				default: false,
				description: 'Whether to include service data in response',
			},
			{
				displayName: 'Include Items',
				name: 'includeItems',
				type: 'boolean',
				default: false,
				description: 'Whether to include item data in response',
			},
		],
	},
	// ----------------------------------
	//         get
	// ----------------------------------
	{
		displayName: 'Reservation ID',
		name: 'reservationId',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['reservation'],
				operation: ['get', 'cancel', 'confirm', 'getItems', 'update'],
			},
		},
		default: '',
		description: 'The ID of the reservation',
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
				resource: ['reservation'],
				operation: ['create'],
			},
		},
		default: '',
		description: 'The ID of the reservable service',
	},
	{
		displayName: 'Customer ID',
		name: 'customerId',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['reservation'],
				operation: ['create'],
			},
		},
		default: '',
		description: 'The ID of the customer making the reservation',
	},
	{
		displayName: 'Start Date',
		name: 'startUtc',
		type: 'dateTime',
		required: true,
		displayOptions: {
			show: {
				resource: ['reservation'],
				operation: ['create'],
			},
		},
		default: '',
		description: 'Start date and time of the reservation',
	},
	{
		displayName: 'End Date',
		name: 'endUtc',
		type: 'dateTime',
		required: true,
		displayOptions: {
			show: {
				resource: ['reservation'],
				operation: ['create'],
			},
		},
		default: '',
		description: 'End date and time of the reservation',
	},
	{
		displayName: 'Additional Fields',
		name: 'additionalFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: {
			show: {
				resource: ['reservation'],
				operation: ['create'],
			},
		},
		options: [
			{
				displayName: 'Rate ID',
				name: 'rateId',
				type: 'string',
				default: '',
				description: 'The ID of the rate to apply',
			},
			{
				displayName: 'Space Category ID',
				name: 'spaceCategoryId',
				type: 'string',
				default: '',
				description: 'The ID of the room category',
			},
			{
				displayName: 'Space ID',
				name: 'spaceId',
				type: 'string',
				default: '',
				description: 'The ID of the specific space/room',
			},
			{
				displayName: 'Adult Count',
				name: 'adultCount',
				type: 'number',
				typeOptions: {
					minValue: 1,
				},
				default: 1,
				description: 'Number of adults',
			},
			{
				displayName: 'Child Count',
				name: 'childCount',
				type: 'number',
				typeOptions: {
					minValue: 0,
				},
				default: 0,
				description: 'Number of children',
			},
			{
				displayName: 'Notes',
				name: 'notes',
				type: 'string',
				typeOptions: {
					rows: 3,
				},
				default: '',
				description: 'Notes for the reservation',
			},
			{
				displayName: 'Travel Agency ID',
				name: 'travelAgencyId',
				type: 'string',
				default: '',
				description: 'The ID of the travel agency',
			},
			{
				displayName: 'Company ID',
				name: 'companyId',
				type: 'string',
				default: '',
				description: 'The ID of the company',
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
				resource: ['reservation'],
				operation: ['update'],
			},
		},
		options: [
			{
				displayName: 'Start Date',
				name: 'startUtc',
				type: 'dateTime',
				default: '',
				description: 'New start date and time',
			},
			{
				displayName: 'End Date',
				name: 'endUtc',
				type: 'dateTime',
				default: '',
				description: 'New end date and time',
			},
			{
				displayName: 'Space Category ID',
				name: 'spaceCategoryId',
				type: 'string',
				default: '',
				description: 'New room category ID',
			},
			{
				displayName: 'Adult Count',
				name: 'adultCount',
				type: 'number',
				typeOptions: {
					minValue: 1,
				},
				default: 1,
				description: 'Updated number of adults',
			},
			{
				displayName: 'Child Count',
				name: 'childCount',
				type: 'number',
				typeOptions: {
					minValue: 0,
				},
				default: 0,
				description: 'Updated number of children',
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
	//         addItem
	// ----------------------------------
	{
		displayName: 'Reservation ID',
		name: 'reservationId',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['reservation'],
				operation: ['addItem'],
			},
		},
		default: '',
		description: 'The ID of the reservation to add item to',
	},
	{
		displayName: 'Product ID',
		name: 'productId',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['reservation'],
				operation: ['addItem'],
			},
		},
		default: '',
		description: 'The ID of the product to add',
	},
	{
		displayName: 'Count',
		name: 'count',
		type: 'number',
		required: true,
		displayOptions: {
			show: {
				resource: ['reservation'],
				operation: ['addItem'],
			},
		},
		typeOptions: {
			minValue: 1,
		},
		default: 1,
		description: 'Number of items to add',
	},
	// ----------------------------------
	//         assignSpace
	// ----------------------------------
	{
		displayName: 'Reservation ID',
		name: 'reservationId',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['reservation'],
				operation: ['assignSpace'],
			},
		},
		default: '',
		description: 'The ID of the reservation',
	},
	{
		displayName: 'Space ID',
		name: 'spaceId',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['reservation'],
				operation: ['assignSpace'],
			},
		},
		default: '',
		description: 'The ID of the space/room to assign',
	},
];

export async function executeReservation(
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

			if (filters.reservationIds) {
				body.ReservationIds = processArrayInput(filters.reservationIds as string);
			}
			if (filters.serviceIds) {
				body.ServiceIds = processArrayInput(filters.serviceIds as string);
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
			if (filters.customerIds) {
				body.CustomerIds = processArrayInput(filters.customerIds as string);
			}
			if (filters.spaceIds) {
				body.SpaceIds = processArrayInput(filters.spaceIds as string);
			}

			const extent = buildExtent(options);
			if (Object.keys(extent).length > 0) {
				body.Extent = extent;
			}

			if (returnAll) {
				responseData = await mewsApiRequestAllItems.call(
					this,
					'reservations/getAll',
					'Reservations',
					body,
				);
			} else {
				body.Limitation = { Count: limit };
				const response = await mewsApiRequest.call(this, 'reservations/getAll', body);
				responseData = (response.Reservations as IDataObject[]) || [];
			}
			break;
		}

		case 'get': {
			const reservationId = this.getNodeParameter('reservationId', i) as string;

			const body: IDataObject = {
				ReservationIds: [reservationId],
			};

			const response = await mewsApiRequest.call(this, 'reservations/getAll', body);
			const reservations = (response.Reservations as IDataObject[]) || [];
			responseData = reservations[0] || {};
			break;
		}

		case 'create': {
			const serviceId = this.getNodeParameter('serviceId', i) as string;
			const customerId = this.getNodeParameter('customerId', i) as string;
			const startUtc = this.getNodeParameter('startUtc', i) as string;
			const endUtc = this.getNodeParameter('endUtc', i) as string;
			const additionalFields = this.getNodeParameter('additionalFields', i, {}) as IDataObject;

			const reservation: IDataObject = {
				CustomerId: customerId,
				StartUtc: new Date(startUtc).toISOString(),
				EndUtc: new Date(endUtc).toISOString(),
			};

			if (additionalFields.rateId) {
				reservation.RateId = additionalFields.rateId;
			}
			if (additionalFields.spaceCategoryId) {
				reservation.SpaceCategoryId = additionalFields.spaceCategoryId;
			}
			if (additionalFields.spaceId) {
				reservation.SpaceId = additionalFields.spaceId;
			}
			if (additionalFields.adultCount) {
				reservation.AdultCount = additionalFields.adultCount;
			}
			if (additionalFields.childCount !== undefined) {
				reservation.ChildCount = additionalFields.childCount;
			}
			if (additionalFields.notes) {
				reservation.Notes = additionalFields.notes;
			}
			if (additionalFields.travelAgencyId) {
				reservation.TravelAgencyId = additionalFields.travelAgencyId;
			}
			if (additionalFields.companyId) {
				reservation.CompanyId = additionalFields.companyId;
			}

			const body: IDataObject = {
				ServiceId: serviceId,
				Reservations: [reservation],
			};

			const response = await mewsApiRequest.call(this, 'reservations/add', cleanObject(body));
			const reservations = (response.Reservations as IDataObject[]) || [];
			responseData = reservations[0] || response;
			break;
		}

		case 'update': {
			const reservationId = this.getNodeParameter('reservationId', i) as string;
			const updateFields = this.getNodeParameter('updateFields', i, {}) as IDataObject;

			const body: IDataObject = {
				ReservationId: reservationId,
			};

			if (updateFields.startUtc) {
				body.StartUtc = { Value: new Date(updateFields.startUtc as string).toISOString() };
			}
			if (updateFields.endUtc) {
				body.EndUtc = { Value: new Date(updateFields.endUtc as string).toISOString() };
			}
			if (updateFields.spaceCategoryId) {
				body.SpaceCategoryId = { Value: updateFields.spaceCategoryId };
			}
			if (updateFields.adultCount) {
				body.AdultCount = { Value: updateFields.adultCount };
			}
			if (updateFields.childCount !== undefined) {
				body.ChildCount = { Value: updateFields.childCount };
			}
			if (updateFields.notes) {
				body.Notes = { Value: updateFields.notes };
			}

			responseData = await mewsApiRequest.call(this, 'reservations/update', cleanObject(body));
			break;
		}

		case 'cancel': {
			const reservationId = this.getNodeParameter('reservationId', i) as string;

			const body: IDataObject = {
				ReservationIds: [reservationId],
			};

			responseData = await mewsApiRequest.call(this, 'reservations/cancel', body);
			break;
		}

		case 'confirm': {
			const reservationId = this.getNodeParameter('reservationId', i) as string;

			const body: IDataObject = {
				ReservationIds: [reservationId],
			};

			responseData = await mewsApiRequest.call(this, 'reservations/confirm', body);
			break;
		}

		case 'getItems': {
			const reservationId = this.getNodeParameter('reservationId', i) as string;

			const body: IDataObject = {
				ReservationIds: [reservationId],
			};

			const response = await mewsApiRequest.call(this, 'reservations/getAllItems', body);
			responseData = (response.Items as IDataObject[]) || [];
			break;
		}

		case 'addItem': {
			const reservationId = this.getNodeParameter('reservationId', i) as string;
			const productId = this.getNodeParameter('productId', i) as string;
			const count = this.getNodeParameter('count', i) as number;

			const body: IDataObject = {
				ReservationId: reservationId,
				ProductId: productId,
				Count: count,
			};

			responseData = await mewsApiRequest.call(this, 'reservations/addProduct', body);
			break;
		}

		case 'assignSpace': {
			const reservationId = this.getNodeParameter('reservationId', i) as string;
			const spaceId = this.getNodeParameter('spaceId', i) as string;

			const body: IDataObject = {
				ReservationId: reservationId,
				SpaceId: spaceId,
			};

			responseData = await mewsApiRequest.call(this, 'reservations/assignSpace', body);
			break;
		}

		default:
			throw new Error(`Operation ${operation} not supported`);
	}

	return responseData;
}
