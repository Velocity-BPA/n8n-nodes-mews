/**
 * Housekeeping Actions
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
import { SPACE_STATES, HOUSEKEEPING_TASK_TYPES } from '../../utils/helpers';

export const housekeepingOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['housekeeping'],
			},
		},
		options: [
			{
				name: 'Assign Task',
				value: 'assignTask',
				description: 'Assign a housekeeping task to an attendant',
				action: 'Assign a housekeeping task',
			},
			{
				name: 'Complete Task',
				value: 'completeTask',
				description: 'Mark a housekeeping task as complete',
				action: 'Complete a housekeeping task',
			},
			{
				name: 'Create Task',
				value: 'createTask',
				description: 'Create a new housekeeping task',
				action: 'Create a housekeeping task',
			},
			{
				name: 'Get Space States',
				value: 'getSpaceStates',
				description: 'Get housekeeping status of spaces',
				action: 'Get space housekeeping states',
			},
			{
				name: 'Get Tasks',
				value: 'getTasks',
				description: 'List housekeeping tasks',
				action: 'Get housekeeping tasks',
			},
			{
				name: 'Update Space State',
				value: 'updateSpaceState',
				description: 'Update housekeeping status of a space',
				action: 'Update space housekeeping state',
			},
		],
		default: 'getSpaceStates',
	},
];

export const housekeepingFields: INodeProperties[] = [
	// ----------------------------------
	//         getSpaceStates
	// ----------------------------------
	{
		displayName: 'Return All',
		name: 'returnAll',
		type: 'boolean',
		displayOptions: {
			show: {
				resource: ['housekeeping'],
				operation: ['getSpaceStates'],
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
				resource: ['housekeeping'],
				operation: ['getSpaceStates'],
				returnAll: [false],
			},
		},
		typeOptions: {
			minValue: 1,
			maxValue: 1000,
		},
		default: 50,
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
				resource: ['housekeeping'],
				operation: ['getSpaceStates'],
			},
		},
		options: [
			{
				displayName: 'Space IDs',
				name: 'spaceIds',
				type: 'string',
				default: '',
				description: 'Filter by space IDs (comma-separated)',
			},
			{
				displayName: 'Space Category IDs',
				name: 'spaceCategoryIds',
				type: 'string',
				default: '',
				description: 'Filter by space category IDs (comma-separated)',
			},
			{
				displayName: 'States',
				name: 'states',
				type: 'multiOptions',
				options: SPACE_STATES,
				default: [],
				description: 'Filter by housekeeping states',
			},
			{
				displayName: 'Start Date',
				name: 'startUtc',
				type: 'dateTime',
				default: '',
				description: 'Start of the time interval',
			},
			{
				displayName: 'End Date',
				name: 'endUtc',
				type: 'dateTime',
				default: '',
				description: 'End of the time interval',
			},
		],
	},

	// ----------------------------------
	//         updateSpaceState
	// ----------------------------------
	{
		displayName: 'Space ID',
		name: 'spaceId',
		type: 'string',
		required: true,
		default: '',
		displayOptions: {
			show: {
				resource: ['housekeeping'],
				operation: ['updateSpaceState'],
			},
		},
		description: 'The ID of the space to update',
	},
	{
		displayName: 'State',
		name: 'state',
		type: 'options',
		options: SPACE_STATES,
		required: true,
		default: 'Clean',
		displayOptions: {
			show: {
				resource: ['housekeeping'],
				operation: ['updateSpaceState'],
			},
		},
		description: 'The new housekeeping state for the space',
	},

	// ----------------------------------
	//         getTasks
	// ----------------------------------
	{
		displayName: 'Return All',
		name: 'returnAll',
		type: 'boolean',
		displayOptions: {
			show: {
				resource: ['housekeeping'],
				operation: ['getTasks'],
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
				resource: ['housekeeping'],
				operation: ['getTasks'],
				returnAll: [false],
			},
		},
		typeOptions: {
			minValue: 1,
			maxValue: 1000,
		},
		default: 50,
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
				resource: ['housekeeping'],
				operation: ['getTasks'],
			},
		},
		options: [
			{
				displayName: 'Task IDs',
				name: 'taskIds',
				type: 'string',
				default: '',
				description: 'Filter by task IDs (comma-separated)',
			},
			{
				displayName: 'Space IDs',
				name: 'spaceIds',
				type: 'string',
				default: '',
				description: 'Filter by space IDs (comma-separated)',
			},
			{
				displayName: 'Assignee IDs',
				name: 'assigneeIds',
				type: 'string',
				default: '',
				description: 'Filter by assignee employee IDs (comma-separated)',
			},
			{
				displayName: 'Types',
				name: 'types',
				type: 'multiOptions',
				options: HOUSEKEEPING_TASK_TYPES,
				default: [],
				description: 'Filter by task types',
			},
			{
				displayName: 'Is Completed',
				name: 'isCompleted',
				type: 'boolean',
				default: false,
				description: 'Whether to filter by completion status',
			},
			{
				displayName: 'Created Start',
				name: 'createdStartUtc',
				type: 'dateTime',
				default: '',
				description: 'Filter by creation date start',
			},
			{
				displayName: 'Created End',
				name: 'createdEndUtc',
				type: 'dateTime',
				default: '',
				description: 'Filter by creation date end',
			},
		],
	},

	// ----------------------------------
	//         createTask
	// ----------------------------------
	{
		displayName: 'Space ID',
		name: 'spaceId',
		type: 'string',
		required: true,
		default: '',
		displayOptions: {
			show: {
				resource: ['housekeeping'],
				operation: ['createTask'],
			},
		},
		description: 'The ID of the space for the task',
	},
	{
		displayName: 'Type',
		name: 'type',
		type: 'options',
		options: HOUSEKEEPING_TASK_TYPES,
		required: true,
		default: 'Cleaning',
		displayOptions: {
			show: {
				resource: ['housekeeping'],
				operation: ['createTask'],
			},
		},
		description: 'The type of housekeeping task',
	},
	{
		displayName: 'Additional Fields',
		name: 'additionalFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: {
			show: {
				resource: ['housekeeping'],
				operation: ['createTask'],
			},
		},
		options: [
			{
				displayName: 'Assignee ID',
				name: 'assigneeId',
				type: 'string',
				default: '',
				description: 'Employee ID to assign the task to',
			},
			{
				displayName: 'Due Date',
				name: 'dueUtc',
				type: 'dateTime',
				default: '',
				description: 'Due date for the task',
			},
			{
				displayName: 'Notes',
				name: 'notes',
				type: 'string',
				default: '',
				description: 'Notes for the task',
			},
			{
				displayName: 'Service Order ID',
				name: 'serviceOrderId',
				type: 'string',
				default: '',
				description: 'Related service order ID',
			},
		],
	},

	// ----------------------------------
	//         completeTask
	// ----------------------------------
	{
		displayName: 'Task ID',
		name: 'taskId',
		type: 'string',
		required: true,
		default: '',
		displayOptions: {
			show: {
				resource: ['housekeeping'],
				operation: ['completeTask'],
			},
		},
		description: 'The ID of the task to complete',
	},
	{
		displayName: 'Additional Fields',
		name: 'additionalFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: {
			show: {
				resource: ['housekeeping'],
				operation: ['completeTask'],
			},
		},
		options: [
			{
				displayName: 'Notes',
				name: 'notes',
				type: 'string',
				default: '',
				description: 'Completion notes',
			},
		],
	},

	// ----------------------------------
	//         assignTask
	// ----------------------------------
	{
		displayName: 'Task ID',
		name: 'taskId',
		type: 'string',
		required: true,
		default: '',
		displayOptions: {
			show: {
				resource: ['housekeeping'],
				operation: ['assignTask'],
			},
		},
		description: 'The ID of the task to assign',
	},
	{
		displayName: 'Assignee ID',
		name: 'assigneeId',
		type: 'string',
		required: true,
		default: '',
		displayOptions: {
			show: {
				resource: ['housekeeping'],
				operation: ['assignTask'],
			},
		},
		description: 'The employee ID to assign the task to',
	},
];

export async function executeHousekeepingOperation(
	this: IExecuteFunctions,
	operation: string,
	i: number,
): Promise<IDataObject | IDataObject[]> {
	let responseData: IDataObject | IDataObject[] = {};

	switch (operation) {
		case 'getSpaceStates': {
			const returnAll = this.getNodeParameter('returnAll', i) as boolean;
			const filters = this.getNodeParameter('filters', i, {}) as IDataObject;

			const body: IDataObject = {};

			if (filters.spaceIds) {
				body.SpaceIds = processArrayInput(filters.spaceIds as string);
			}
			if (filters.spaceCategoryIds) {
				body.SpaceCategoryIds = processArrayInput(filters.spaceCategoryIds as string);
			}
			if ((filters.states as string[])?.length > 0) {
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
					'spaces/getAll',
					'Spaces',
					body,
				);
			} else {
				const limit = this.getNodeParameter('limit', i) as number;
				responseData = await mewsApiRequestAllItems.call(
					this,
					'spaces/getAll',
					'Spaces',
					body,
					limit,
				);
			}
			break;
		}

		case 'updateSpaceState': {
			const spaceId = this.getNodeParameter('spaceId', i) as string;
			const state = this.getNodeParameter('state', i) as string;

			const body: IDataObject = {
				SpaceId: spaceId,
				State: state,
			};

			responseData = await mewsApiRequest.call(this, 'spaces/update', body);
			break;
		}

		case 'getTasks': {
			const returnAll = this.getNodeParameter('returnAll', i) as boolean;
			const filters = this.getNodeParameter('filters', i, {}) as IDataObject;

			const body: IDataObject = {};

			if (filters.taskIds) {
				body.TaskIds = processArrayInput(filters.taskIds as string);
			}
			if (filters.spaceIds) {
				body.SpaceIds = processArrayInput(filters.spaceIds as string);
			}
			if (filters.assigneeIds) {
				body.AssigneeIds = processArrayInput(filters.assigneeIds as string);
			}
			if ((filters.types as string[])?.length > 0) {
				body.Types = filters.types;
			}
			if (filters.isCompleted !== undefined) {
				body.IsCompleted = filters.isCompleted;
			}

			if (filters.createdStartUtc || filters.createdEndUtc) {
				body.CreatedUtc = {};
				if (filters.createdStartUtc) {
					(body.CreatedUtc as IDataObject).StartUtc = new Date(filters.createdStartUtc as string).toISOString();
				}
				if (filters.createdEndUtc) {
					(body.CreatedUtc as IDataObject).EndUtc = new Date(filters.createdEndUtc as string).toISOString();
				}
			}

			if (returnAll) {
				responseData = await mewsApiRequestAllItems.call(
					this,
					'tasks/getAll',
					'Tasks',
					body,
				);
			} else {
				const limit = this.getNodeParameter('limit', i) as number;
				responseData = await mewsApiRequestAllItems.call(
					this,
					'tasks/getAll',
					'Tasks',
					body,
					limit,
				);
			}
			break;
		}

		case 'createTask': {
			const spaceId = this.getNodeParameter('spaceId', i) as string;
			const type = this.getNodeParameter('type', i) as string;
			const additionalFields = this.getNodeParameter('additionalFields', i, {}) as IDataObject;

			const body: IDataObject = {
				SpaceId: spaceId,
				Type: type,
			};

			if (additionalFields.assigneeId) {
				body.AssigneeId = additionalFields.assigneeId;
			}
			if (additionalFields.dueUtc) {
				body.DueUtc = new Date(additionalFields.dueUtc as string).toISOString();
			}
			if (additionalFields.notes) {
				body.Notes = additionalFields.notes;
			}
			if (additionalFields.serviceOrderId) {
				body.ServiceOrderId = additionalFields.serviceOrderId;
			}

			responseData = await mewsApiRequest.call(this, 'tasks/add', cleanObject(body));
			break;
		}

		case 'completeTask': {
			const taskId = this.getNodeParameter('taskId', i) as string;
			const additionalFields = this.getNodeParameter('additionalFields', i, {}) as IDataObject;

			const body: IDataObject = {
				TaskIds: [taskId],
			};

			if (additionalFields.notes) {
				body.Notes = additionalFields.notes;
			}

			responseData = await mewsApiRequest.call(this, 'tasks/complete', body);
			break;
		}

		case 'assignTask': {
			const taskId = this.getNodeParameter('taskId', i) as string;
			const assigneeId = this.getNodeParameter('assigneeId', i) as string;

			const body: IDataObject = {
				TaskId: taskId,
				AssigneeId: assigneeId,
			};

			responseData = await mewsApiRequest.call(this, 'tasks/update', body);
			break;
		}

		default:
			throw new Error(`Operation ${operation} not supported`);
	}

	return responseData;
}
