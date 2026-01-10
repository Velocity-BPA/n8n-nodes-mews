/**
 * Mews n8n Community Node
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
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
} from 'n8n-workflow';
import { NodeOperationError } from 'n8n-workflow';

// Import resource operations and fields
import { reservationOperations, reservationFields, executeReservation } from './actions/reservation/reservation';
import { customerOperations, customerFields, executeCustomer } from './actions/customer/customer';
import { spaceOperations, spaceFields, executeSpace } from './actions/space/space';
import { serviceOperations, serviceFields, executeService } from './actions/service/service';
import { orderOperations, orderFields, executeOrder } from './actions/order/order';
import { paymentOperations, paymentFields, executePayment } from './actions/payment/payment';
import { billOperations, billFields, executeBill } from './actions/bill/bill';
import { outletOperations, outletFields, executeOutlet } from './actions/outlet/outlet';
import { housekeepingOperations, housekeepingFields, executeHousekeepingOperation } from './actions/housekeeping/housekeeping';
import { reportOperations, reportFields, executeReportOperation } from './actions/report/report';

// Licensing notice flag - only log once per load
let licensingNoticeLogged = false;

function logLicensingNotice(): void {
	if (!licensingNoticeLogged) {
		console.warn(`
[Velocity BPA Licensing Notice]

This n8n node is licensed under the Business Source License 1.1 (BSL 1.1).

Use of this node by for-profit organizations in production environments requires a commercial license from Velocity BPA.

For licensing information, visit https://velobpa.com/licensing or contact licensing@velobpa.com.
`);
		licensingNoticeLogged = true;
	}
}

export class Mews implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Mews',
		name: 'mews',
		icon: 'file:mews.svg',
		group: ['transform'],
		version: 1,
		subtitle: '={{$parameter["operation"] + ": " + $parameter["resource"]}}',
		description: 'Integrate with Mews Property Management System for hospitality automation',
		defaults: {
			name: 'Mews',
		},
		inputs: ['main'],
		outputs: ['main'],
		credentials: [
			{
				name: 'mewsApi',
				required: true,
			},
		],
		properties: [
			{
				displayName: 'Resource',
				name: 'resource',
				type: 'options',
				noDataExpression: true,
				options: [
					{
						name: 'Bill',
						value: 'bill',
						description: 'Manage bills and invoices',
					},
					{
						name: 'Customer',
						value: 'customer',
						description: 'Manage guest profiles',
					},
					{
						name: 'Housekeeping',
						value: 'housekeeping',
						description: 'Manage room housekeeping tasks',
					},
					{
						name: 'Order',
						value: 'order',
						description: 'Manage service orders',
					},
					{
						name: 'Outlet',
						value: 'outlet',
						description: 'Manage outlets (restaurants, spa, etc.)',
					},
					{
						name: 'Payment',
						value: 'payment',
						description: 'Process payments and preauthorizations',
					},
					{
						name: 'Report',
						value: 'report',
						description: 'Generate reports and export data',
					},
					{
						name: 'Reservation',
						value: 'reservation',
						description: 'Manage hotel reservations',
					},
					{
						name: 'Service',
						value: 'service',
						description: 'Manage services and products',
					},
					{
						name: 'Space',
						value: 'space',
						description: 'Manage rooms and spaces',
					},
				],
				default: 'reservation',
			},
			// Operations for each resource
			...reservationOperations,
			...customerOperations,
			...spaceOperations,
			...serviceOperations,
			...orderOperations,
			...paymentOperations,
			...billOperations,
			...outletOperations,
			...housekeepingOperations,
			...reportOperations,
			// Fields for each resource
			...reservationFields,
			...customerFields,
			...spaceFields,
			...serviceFields,
			...orderFields,
			...paymentFields,
			...billFields,
			...outletFields,
			...housekeepingFields,
			...reportFields,
		],
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		// Log licensing notice once per node load
		logLicensingNotice();

		const items = this.getInputData();
		const returnData: INodeExecutionData[] = [];

		const resource = this.getNodeParameter('resource', 0) as string;
		const operation = this.getNodeParameter('operation', 0) as string;

		for (let i = 0; i < items.length; i++) {
			try {
				let responseData;

				switch (resource) {
					case 'reservation':
						responseData = await executeReservation.call(this, operation, i);
						break;
					case 'customer':
						responseData = await executeCustomer.call(this, operation, i);
						break;
					case 'space':
						responseData = await executeSpace.call(this, operation, i);
						break;
					case 'service':
						responseData = await executeService.call(this, operation, i);
						break;
					case 'order':
						responseData = await executeOrder.call(this, operation, i);
						break;
					case 'payment':
						responseData = await executePayment.call(this, operation, i);
						break;
					case 'bill':
						responseData = await executeBill.call(this, operation, i);
						break;
					case 'outlet':
						responseData = await executeOutlet.call(this, operation, i);
						break;
					case 'housekeeping':
						responseData = await executeHousekeepingOperation.call(this, operation, i);
						break;
					case 'report':
						responseData = await executeReportOperation.call(this, operation, i);
						break;
					default:
						throw new NodeOperationError(
							this.getNode(),
							`Resource "${resource}" is not supported`,
							{ itemIndex: i },
						);
				}

				// Handle array responses
				if (Array.isArray(responseData)) {
					returnData.push(
						...responseData.map((item) => ({
							json: item,
							pairedItem: { item: i },
						})),
					);
				} else {
					returnData.push({
						json: responseData,
						pairedItem: { item: i },
					});
				}
			} catch (error) {
				if (this.continueOnFail()) {
					returnData.push({
						json: {
							error: (error as Error).message,
						},
						pairedItem: { item: i },
					});
					continue;
				}
				throw error;
			}
		}

		return [returnData];
	}
}
