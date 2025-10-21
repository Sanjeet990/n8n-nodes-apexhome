import type {
	ICredentialType,
	INodeProperties,
} from 'n8n-workflow';

export class ApexHomeApi implements ICredentialType {
	name = 'apexHomeApi';

	displayName = 'Apex Home API Key';

	documentationUrl = 'https://github.com/Sanjeet990/n8n-nodes-apexhome?tab=readme-ov-file#credentials';

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
}