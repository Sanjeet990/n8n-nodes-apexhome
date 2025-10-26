import type {
	ICredentialTestRequest,
	ICredentialType,
	INodeProperties,
	Icon
} from 'n8n-workflow';

export class ApexHomeApi implements ICredentialType {
	name = 'apexHomeApi';

	displayName = 'Apex Home API Key API';

	documentationUrl = 'https://github.com/Sanjeet990/n8n-nodes-apexhome?tab=readme-ov-file#credentials';

	icon: Icon = 'file:shared/apexhome.svg';

	properties: INodeProperties[] = [
		{
			displayName: 'Apex Home URL',
			name: 'url',
			type: 'string',
			default: '',
			placeholder: 'https://your-apex-home.com',
			description: 'The base URL of your Apex Home instance',
			required: true,
		},
		{
			displayName: 'API Key',
			name: 'apiKey',
			type: 'string',
			typeOptions: { password: true },
			default: '',
			description: 'The API Key for Apex Home',
			required: true,
		},
	];

	test: ICredentialTestRequest = {
		request: {
			method: 'POST' as const,
			baseURL: '={{$credentials.url}}/api/v1/public/test',
			url: '',
			headers: {
				'x-api-key': '={{$credentials.apiKey}}',
			},
		},
		rules: [
			{
				type: 'responseCode',
				properties: {
					value: 200,
					message: "Authentication successful",
				}
			}
		]
	};
}