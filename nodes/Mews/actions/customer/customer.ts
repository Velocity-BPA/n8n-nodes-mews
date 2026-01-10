/**
 * Customer Actions
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

export const customerOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['customer'],
			},
		},
		options: [
			{
				name: 'Add Identity Document',
				value: 'addIdentityDocument',
				description: 'Add a passport or ID to a customer',
				action: 'Add identity document to customer',
			},
			{
				name: 'Create',
				value: 'create',
				description: 'Create a new customer',
				action: 'Create a customer',
			},
			{
				name: 'Get',
				value: 'get',
				description: 'Get a customer by ID',
				action: 'Get a customer',
			},
			{
				name: 'Get Identity Documents',
				value: 'getIdentityDocuments',
				description: 'Get identity documents for a customer',
				action: 'Get customer identity documents',
			},
			{
				name: 'Get Many',
				value: 'getAll',
				description: 'Get many customers',
				action: 'Get many customers',
			},
			{
				name: 'Merge',
				value: 'merge',
				description: 'Merge duplicate customer profiles',
				action: 'Merge customer profiles',
			},
			{
				name: 'Search',
				value: 'search',
				description: 'Search customers by name, email, or phone',
				action: 'Search customers',
			},
			{
				name: 'Update',
				value: 'update',
				description: 'Update customer details',
				action: 'Update a customer',
			},
		],
		default: 'getAll',
	},
];

export const customerFields: INodeProperties[] = [
	// ----------------------------------
	//         getAll
	// ----------------------------------
	{
		displayName: 'Return All',
		name: 'returnAll',
		type: 'boolean',
		displayOptions: {
			show: {
				resource: ['customer'],
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
				resource: ['customer'],
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
				resource: ['customer'],
				operation: ['getAll'],
			},
		},
		options: [
			{
				displayName: 'Customer IDs',
				name: 'customerIds',
				type: 'string',
				default: '',
				description: 'Comma-separated list of customer IDs',
			},
			{
				displayName: 'Emails',
				name: 'emails',
				type: 'string',
				default: '',
				description: 'Comma-separated list of email addresses',
			},
			{
				displayName: 'Phone Numbers',
				name: 'phoneNumbers',
				type: 'string',
				default: '',
				description: 'Comma-separated list of phone numbers',
			},
			{
				displayName: 'Loyalty Codes',
				name: 'loyaltyCodes',
				type: 'string',
				default: '',
				description: 'Comma-separated list of loyalty program codes',
			},
			{
				displayName: 'Created After',
				name: 'createdUtcStart',
				type: 'dateTime',
				default: '',
				description: 'Filter customers created after this date',
			},
			{
				displayName: 'Created Before',
				name: 'createdUtcEnd',
				type: 'dateTime',
				default: '',
				description: 'Filter customers created before this date',
			},
			{
				displayName: 'Updated After',
				name: 'updatedUtcStart',
				type: 'dateTime',
				default: '',
				description: 'Filter customers updated after this date',
			},
			{
				displayName: 'Updated Before',
				name: 'updatedUtcEnd',
				type: 'dateTime',
				default: '',
				description: 'Filter customers updated before this date',
			},
		],
	},
	// ----------------------------------
	//         get
	// ----------------------------------
	{
		displayName: 'Customer ID',
		name: 'customerId',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['customer'],
				operation: ['get', 'update', 'getIdentityDocuments', 'addIdentityDocument'],
			},
		},
		default: '',
		description: 'The ID of the customer',
	},
	// ----------------------------------
	//         search
	// ----------------------------------
	{
		displayName: 'Search Query',
		name: 'searchQuery',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['customer'],
				operation: ['search'],
			},
		},
		default: '',
		description: 'Search by name, email, or phone number',
	},
	{
		displayName: 'Limit',
		name: 'limit',
		type: 'number',
		displayOptions: {
			show: {
				resource: ['customer'],
				operation: ['search'],
			},
		},
		typeOptions: {
			minValue: 1,
			maxValue: 100,
		},
		default: 50,
		description: 'Max number of results to return',
	},
	// ----------------------------------
	//         create
	// ----------------------------------
	{
		displayName: 'First Name',
		name: 'firstName',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['customer'],
				operation: ['create'],
			},
		},
		default: '',
		description: "Customer's first name",
	},
	{
		displayName: 'Last Name',
		name: 'lastName',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['customer'],
				operation: ['create'],
			},
		},
		default: '',
		description: "Customer's last name",
	},
	{
		displayName: 'Additional Fields',
		name: 'additionalFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: {
			show: {
				resource: ['customer'],
				operation: ['create'],
			},
		},
		options: [
			{
				displayName: 'Email',
				name: 'email',
				type: 'string',
				placeholder: 'name@email.com',
				default: '',
				description: "Customer's email address",
			},
			{
				displayName: 'Phone',
				name: 'phone',
				type: 'string',
				default: '',
				description: "Customer's phone number (with country code)",
			},
			{
				displayName: 'Nationality Code',
				name: 'nationalityCode',
				type: 'string',
				default: '',
				description: 'ISO 3166-1 alpha-2 country code (e.g., US, GB, DE)',
			},
			{
				displayName: 'Language Code',
				name: 'languageCode',
				type: 'string',
				default: '',
				description: 'Preferred language code (e.g., en-US, de-DE)',
			},
			{
				displayName: 'Birth Date',
				name: 'birthDate',
				type: 'dateTime',
				default: '',
				description: "Customer's date of birth",
			},
			{
				displayName: 'Title',
				name: 'title',
				type: 'options',
				options: [
					{ name: 'Mr.', value: 'Mister' },
					{ name: 'Ms.', value: 'Miss' },
					{ name: 'Mrs.', value: 'Misses' },
				],
				default: '',
				description: 'Title/salutation',
			},
			{
				displayName: 'Gender',
				name: 'gender',
				type: 'options',
				options: [
					{ name: 'Male', value: 'Male' },
					{ name: 'Female', value: 'Female' },
				],
				default: '',
				description: "Customer's gender",
			},
			{
				displayName: 'Loyalty Code',
				name: 'loyaltyCode',
				type: 'string',
				default: '',
				description: 'Loyalty program membership ID',
			},
			{
				displayName: 'Notes',
				name: 'notes',
				type: 'string',
				typeOptions: {
					rows: 3,
				},
				default: '',
				description: 'Notes about the customer',
			},
			{
				displayName: 'Company ID',
				name: 'companyId',
				type: 'string',
				default: '',
				description: "Customer's company ID",
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
				resource: ['customer'],
				operation: ['update'],
			},
		},
		options: [
			{
				displayName: 'First Name',
				name: 'firstName',
				type: 'string',
				default: '',
				description: "Updated first name",
			},
			{
				displayName: 'Last Name',
				name: 'lastName',
				type: 'string',
				default: '',
				description: "Updated last name",
			},
			{
				displayName: 'Email',
				name: 'email',
				type: 'string',
				placeholder: 'name@email.com',
				default: '',
				description: "Updated email address",
			},
			{
				displayName: 'Phone',
				name: 'phone',
				type: 'string',
				default: '',
				description: "Updated phone number",
			},
			{
				displayName: 'Nationality Code',
				name: 'nationalityCode',
				type: 'string',
				default: '',
				description: 'Updated nationality (ISO 3166-1 alpha-2)',
			},
			{
				displayName: 'Language Code',
				name: 'languageCode',
				type: 'string',
				default: '',
				description: 'Updated preferred language',
			},
			{
				displayName: 'Birth Date',
				name: 'birthDate',
				type: 'dateTime',
				default: '',
				description: 'Updated birth date',
			},
			{
				displayName: 'Loyalty Code',
				name: 'loyaltyCode',
				type: 'string',
				default: '',
				description: 'Updated loyalty code',
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
	//         merge
	// ----------------------------------
	{
		displayName: 'Source Customer ID',
		name: 'sourceCustomerId',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['customer'],
				operation: ['merge'],
			},
		},
		default: '',
		description: 'The ID of the customer to merge from (will be deleted)',
	},
	{
		displayName: 'Target Customer ID',
		name: 'targetCustomerId',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['customer'],
				operation: ['merge'],
			},
		},
		default: '',
		description: 'The ID of the customer to merge into (will be kept)',
	},
	// ----------------------------------
	//         addIdentityDocument
	// ----------------------------------
	{
		displayName: 'Document Type',
		name: 'documentType',
		type: 'options',
		required: true,
		displayOptions: {
			show: {
				resource: ['customer'],
				operation: ['addIdentityDocument'],
			},
		},
		options: [
			{ name: 'Passport', value: 'Passport' },
			{ name: 'ID Card', value: 'IdentityCard' },
			{ name: 'Visa', value: 'Visa' },
			{ name: "Driver's License", value: 'DriversLicense' },
		],
		default: 'Passport',
		description: 'Type of identity document',
	},
	{
		displayName: 'Document Number',
		name: 'documentNumber',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['customer'],
				operation: ['addIdentityDocument'],
			},
		},
		default: '',
		description: 'The document number',
	},
	{
		displayName: 'Document Details',
		name: 'documentDetails',
		type: 'collection',
		placeholder: 'Add Detail',
		default: {},
		displayOptions: {
			show: {
				resource: ['customer'],
				operation: ['addIdentityDocument'],
			},
		},
		options: [
			{
				displayName: 'Issuing Country',
				name: 'issuingCountryCode',
				type: 'string',
				default: '',
				description: 'ISO country code of issuing country',
			},
			{
				displayName: 'Expiration Date',
				name: 'expirationUtc',
				type: 'dateTime',
				default: '',
				description: 'Document expiration date',
			},
			{
				displayName: 'Issue Date',
				name: 'issueUtc',
				type: 'dateTime',
				default: '',
				description: 'Document issue date',
			},
		],
	},
];

export async function executeCustomer(
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

			if (filters.customerIds) {
				body.CustomerIds = processArrayInput(filters.customerIds as string);
			}
			if (filters.emails) {
				body.Emails = processArrayInput(filters.emails as string);
			}
			if (filters.phoneNumbers) {
				body.PhoneNumbers = processArrayInput(filters.phoneNumbers as string);
			}
			if (filters.loyaltyCodes) {
				body.LoyaltyCodes = processArrayInput(filters.loyaltyCodes as string);
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
			if (filters.updatedUtcStart || filters.updatedUtcEnd) {
				body.UpdatedUtc = {};
				if (filters.updatedUtcStart) {
					(body.UpdatedUtc as IDataObject).StartUtc = new Date(filters.updatedUtcStart as string).toISOString();
				}
				if (filters.updatedUtcEnd) {
					(body.UpdatedUtc as IDataObject).EndUtc = new Date(filters.updatedUtcEnd as string).toISOString();
				}
			}

			if (returnAll) {
				responseData = await mewsApiRequestAllItems.call(
					this,
					'customers/getAll',
					'Customers',
					body,
				);
			} else {
				body.Limitation = { Count: limit };
				const response = await mewsApiRequest.call(this, 'customers/getAll', body);
				responseData = (response.Customers as IDataObject[]) || [];
			}
			break;
		}

		case 'get': {
			const customerId = this.getNodeParameter('customerId', i) as string;

			const body: IDataObject = {
				CustomerIds: [customerId],
			};

			const response = await mewsApiRequest.call(this, 'customers/getAll', body);
			const customers = (response.Customers as IDataObject[]) || [];
			responseData = customers[0] || {};
			break;
		}

		case 'search': {
			const searchQuery = this.getNodeParameter('searchQuery', i) as string;
			const limit = this.getNodeParameter('limit', i, 50) as number;

			const body: IDataObject = {
				Name: searchQuery,
				Limitation: { Count: limit },
			};

			const response = await mewsApiRequest.call(this, 'customers/search', body);
			responseData = (response.Customers as IDataObject[]) || [];
			break;
		}

		case 'create': {
			const firstName = this.getNodeParameter('firstName', i) as string;
			const lastName = this.getNodeParameter('lastName', i) as string;
			const additionalFields = this.getNodeParameter('additionalFields', i, {}) as IDataObject;

			const body: IDataObject = {
				FirstName: firstName,
				LastName: lastName,
			};

			if (additionalFields.email) {
				body.Email = additionalFields.email;
			}
			if (additionalFields.phone) {
				body.Phone = additionalFields.phone;
			}
			if (additionalFields.nationalityCode) {
				body.NationalityCode = additionalFields.nationalityCode;
			}
			if (additionalFields.languageCode) {
				body.LanguageCode = additionalFields.languageCode;
			}
			if (additionalFields.birthDate) {
				body.BirthDate = new Date(additionalFields.birthDate as string).toISOString().split('T')[0];
			}
			if (additionalFields.title) {
				body.Title = additionalFields.title;
			}
			if (additionalFields.gender) {
				body.Gender = additionalFields.gender;
			}
			if (additionalFields.loyaltyCode) {
				body.LoyaltyCode = additionalFields.loyaltyCode;
			}
			if (additionalFields.notes) {
				body.Notes = additionalFields.notes;
			}
			if (additionalFields.companyId) {
				body.CompanyId = additionalFields.companyId;
			}

			responseData = await mewsApiRequest.call(this, 'customers/add', cleanObject(body));
			break;
		}

		case 'update': {
			const customerId = this.getNodeParameter('customerId', i) as string;
			const updateFields = this.getNodeParameter('updateFields', i, {}) as IDataObject;

			const body: IDataObject = {
				CustomerId: customerId,
			};

			if (updateFields.firstName) {
				body.FirstName = { Value: updateFields.firstName };
			}
			if (updateFields.lastName) {
				body.LastName = { Value: updateFields.lastName };
			}
			if (updateFields.email) {
				body.Email = { Value: updateFields.email };
			}
			if (updateFields.phone) {
				body.Phone = { Value: updateFields.phone };
			}
			if (updateFields.nationalityCode) {
				body.NationalityCode = { Value: updateFields.nationalityCode };
			}
			if (updateFields.languageCode) {
				body.LanguageCode = { Value: updateFields.languageCode };
			}
			if (updateFields.birthDate) {
				body.BirthDate = { Value: new Date(updateFields.birthDate as string).toISOString().split('T')[0] };
			}
			if (updateFields.loyaltyCode) {
				body.LoyaltyCode = { Value: updateFields.loyaltyCode };
			}
			if (updateFields.notes) {
				body.Notes = { Value: updateFields.notes };
			}

			responseData = await mewsApiRequest.call(this, 'customers/update', cleanObject(body));
			break;
		}

		case 'merge': {
			const sourceCustomerId = this.getNodeParameter('sourceCustomerId', i) as string;
			const targetCustomerId = this.getNodeParameter('targetCustomerId', i) as string;

			const body: IDataObject = {
				SourceCustomerId: sourceCustomerId,
				TargetCustomerId: targetCustomerId,
			};

			responseData = await mewsApiRequest.call(this, 'customers/merge', body);
			break;
		}

		case 'getIdentityDocuments': {
			const customerId = this.getNodeParameter('customerId', i) as string;

			const body: IDataObject = {
				CustomerIds: [customerId],
			};

			const response = await mewsApiRequest.call(this, 'customers/getAll', body);
			const customers = (response.Customers as IDataObject[]) || [];
			const customer = customers[0] as IDataObject;
			responseData = (customer?.IdentityDocuments as IDataObject[]) || [];
			break;
		}

		case 'addIdentityDocument': {
			const customerId = this.getNodeParameter('customerId', i) as string;
			const documentType = this.getNodeParameter('documentType', i) as string;
			const documentNumber = this.getNodeParameter('documentNumber', i) as string;
			const documentDetails = this.getNodeParameter('documentDetails', i, {}) as IDataObject;

			const document: IDataObject = {
				Type: documentType,
				Number: documentNumber,
			};

			if (documentDetails.issuingCountryCode) {
				document.IssuingCountryCode = documentDetails.issuingCountryCode;
			}
			if (documentDetails.expirationUtc) {
				document.ExpirationUtc = new Date(documentDetails.expirationUtc as string).toISOString();
			}
			if (documentDetails.issueUtc) {
				document.IssueUtc = new Date(documentDetails.issueUtc as string).toISOString();
			}

			const body: IDataObject = {
				CustomerId: customerId,
				IdentityDocuments: [document],
			};

			responseData = await mewsApiRequest.call(this, 'customers/addIdentityDocuments', cleanObject(body));
			break;
		}

		default:
			throw new Error(`Operation ${operation} not supported`);
	}

	return responseData;
}
