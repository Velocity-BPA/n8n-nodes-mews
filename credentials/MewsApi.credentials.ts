/**
 * Mews API Credentials
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
	IAuthenticateGeneric,
	ICredentialTestRequest,
	ICredentialType,
	INodeProperties,
} from 'n8n-workflow';

export class MewsApi implements ICredentialType {
	name = 'mewsApi';
	displayName = 'Mews API';
	documentationUrl = 'https://mews-systems.gitbook.io/connector-api/';
	properties: INodeProperties[] = [
		{
			displayName: 'Client Token',
			name: 'clientToken',
			type: 'string',
			typeOptions: {
				password: true,
			},
			default: '',
			required: true,
			description: 'Client Token from Mews Partner Portal - identifies your integration',
		},
		{
			displayName: 'Access Token',
			name: 'accessToken',
			type: 'string',
			typeOptions: {
				password: true,
			},
			default: '',
			required: true,
			description: 'Access Token from the property - identifies the enterprise/property',
		},
		{
			displayName: 'Environment',
			name: 'environment',
			type: 'options',
			options: [
				{
					name: 'Production',
					value: 'production',
				},
				{
					name: 'Demo',
					value: 'demo',
				},
			],
			default: 'production',
			required: true,
			description: 'API environment to connect to',
		},
	];

	authenticate: IAuthenticateGeneric = {
		type: 'generic',
		properties: {},
	};

	test: ICredentialTestRequest = {
		request: {
			baseURL: '={{$credentials.environment === "demo" ? "https://api.mews-demo.com" : "https://api.mews.com"}}',
			url: '/api/connector/v1/configuration/get',
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: {
				ClientToken: '={{$credentials.clientToken}}',
				AccessToken: '={{$credentials.accessToken}}',
				Client: 'n8n Mews Integration',
			},
		},
	};
}
