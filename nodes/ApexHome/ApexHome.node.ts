import type {
	IExecuteFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
} from 'n8n-workflow';
import { NodeConnectionTypes, NodeOperationError } from 'n8n-workflow';

export class ApexHome implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Apex Home Actions',
		name: 'apexhome',
		icon: { light: 'file:apexhome.svg', dark: 'file:apexhome.dark.svg' },
		group: ['input'],
		version: 1,
		subtitle: '={{$parameter["operation"] + ": " + $parameter["resource"]}}',
		description: 'Interact with Apex Home API',
		defaults: {
			name: 'Apex Home Actions',
		},
		inputs: [NodeConnectionTypes.Main],
		outputs: [NodeConnectionTypes.Main],
		credentials: [
			{
				name: 'apexHomeApi',
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
						name: 'Notification',
						value: 'notification',
					},
					{
						name: 'User',
						value: 'user',
					},
				],
				default: 'notification',
			},
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: {
					show: {
						resource: ['notification'],
					},
				},
				options: [
					{
						name: 'Send',
						value: 'send',
						description: 'Send a notification',
						action: 'Send a notification',
					},
				],
				default: 'send',
			},
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: {
					show: {
						resource: ['user'],
					},
				},
				options: [
					{
						name: 'Create',
						value: 'create',
						description: 'Create a user',
						action: 'Create a user',
					},
				],
				default: 'create',
			},
			// Notification fields
			{
				displayName: 'App Name',
				name: 'appName',
				type: 'string',
				default: '',
				placeholder: 'My App',
				description: 'Name of the application sending the notification',
				required: true,
				displayOptions: {
					show: {
						resource: ['notification'],
						operation: ['send'],
					},
				},
			},
			{
				displayName: 'App Icon',
				name: 'appIcon',
				type: 'string',
				default: '',
				placeholder: 'https://example.com/icon.png',
				description: 'URL to the application icon',
				displayOptions: {
					show: {
						resource: ['notification'],
						operation: ['send'],
					},
				},
			},
			{
				displayName: 'Title',
				name: 'title',
				type: 'string',
				default: '',
				placeholder: 'Notification Title',
				description: 'Title of the notification',
				required: true,
				displayOptions: {
					show: {
						resource: ['notification'],
						operation: ['send'],
					},
				},
			},
			{
				displayName: 'Text',
				name: 'text',
				type: 'string',
				default: '',
				placeholder: 'Notification message',
				description: 'Text content of the notification',
				displayOptions: {
					show: {
						resource: ['notification'],
						operation: ['send'],
					},
				},
			},
			{
				displayName: 'HTML',
				name: 'html',
				type: 'string',
				default: '',
				placeholder: '<p>HTML content</p>',
				description: 'HTML content of the notification',
				displayOptions: {
					show: {
						resource: ['notification'],
						operation: ['send'],
					},
				},
			},
			{
				displayName: 'Type',
				name: 'type',
				type: 'options',
				options: [
					{
						name: 'Info',
						value: 'info',
					},
					{
						name: 'Success',
						value: 'success',
					},
					{
						name: 'Error',
						value: 'error',
					},
				],
				default: 'info',
				description: 'Type of notification',
				displayOptions: {
					show: {
						resource: ['notification'],
						operation: ['send'],
					},
				},
			},
			{
				displayName: 'Tags',
				name: 'tags',
				type: 'string',
				default: '',
				placeholder: 'tag1,tag2,tag3',
				description: 'Comma-separated list of tags',
				displayOptions: {
					show: {
						resource: ['notification'],
						operation: ['send'],
					},
				},
			},
			{
				displayName: 'Button Text',
				name: 'buttonText',
				type: 'string',
				default: '',
				placeholder: 'Click Here',
				description: 'Text for the action button',
				displayOptions: {
					show: {
						resource: ['notification'],
						operation: ['send'],
					},
				},
			},
			{
				displayName: 'Button Link',
				name: 'buttonLink',
				type: 'string',
				default: '',
				placeholder: 'https://example.com',
				description: 'URL for the action button',
				displayOptions: {
					show: {
						resource: ['notification'],
						operation: ['send'],
					},
				},
			},
			// User fields
			{
				displayName: 'Username',
				name: 'username',
				type: 'string',
				default: '',
				placeholder: 'johndoe',
				description: 'Username for the new user',
				required: true,
				displayOptions: {
					show: {
						resource: ['user'],
						operation: ['create'],
					},
				},
			},
			{
				displayName: 'Password',
				name: 'password',
				type: 'string',
				typeOptions: { password: true },
				default: '',
				placeholder: 'Enter password',
				description: 'Password for the new user',
				required: true,
				displayOptions: {
					show: {
						resource: ['user'],
						operation: ['create'],
					},
				},
			},
			{
				displayName: 'Full Name',
				name: 'fullName',
				type: 'string',
				default: '',
				placeholder: 'John Doe',
				description: 'Full name of the user',
				required: true,
				displayOptions: {
					show: {
						resource: ['user'],
						operation: ['create'],
					},
				},
			},
			{
				displayName: 'Site Name',
				name: 'siteName',
				type: 'string',
				default: '',
				placeholder: 'My Site',
				description: 'Site name for the user',
				required: true,
				displayOptions: {
					show: {
						resource: ['user'],
						operation: ['create'],
					},
				},
			},
			{
				displayName: 'Is Admin',
				name: 'isAdmin',
				type: 'options',
				options: [
					{
						name: 'No',
						value: false,
					},
					{
						name: 'Yes',
						value: true,
					},
				],
				default: false,
				description: 'Whether the user should have admin privileges',
				displayOptions: {
					show: {
						resource: ['user'],
						operation: ['create'],
					},
				},
			},
		],
	};

	// The function below is responsible for actually doing whatever this node
	// is supposed to do. Handle both notification and user operations.
	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const returnData: INodeExecutionData[] = [];

		// Get credentials
		const credentials = await this.getCredentials('apexHomeApi');

		for (let itemIndex = 0; itemIndex < items.length; itemIndex++) {
			try {
				// Get common parameters
				const resource = this.getNodeParameter('resource', itemIndex) as string;
				const operation = this.getNodeParameter('operation', itemIndex) as string;
				const apexHomeUrl = credentials.url as string;

				let response;
				let requestBody: any;
				let endpoint: string;

				if (resource === 'notification' && operation === 'send') {
					// Handle notification sending
					const appName = this.getNodeParameter('appName', itemIndex) as string;
					const appIcon = this.getNodeParameter('appIcon', itemIndex) as string;
					const title = this.getNodeParameter('title', itemIndex) as string;
					const text = this.getNodeParameter('text', itemIndex) as string;
					const html = this.getNodeParameter('html', itemIndex) as string;
					const type = this.getNodeParameter('type', itemIndex) as string;
					const tagsString = this.getNodeParameter('tags', itemIndex) as string;
					const buttonText = this.getNodeParameter('buttonText', itemIndex) as string;
					const buttonLink = this.getNodeParameter('buttonLink', itemIndex) as string;

					// Parse tags from comma-separated string
					const tags = tagsString ? tagsString.split(',').map(tag => tag.trim()).filter(tag => tag !== '') : [];

					// Prepare request body
					requestBody = {
						appName,
						appIcon,
						title,
						text,
						html,
						type,
						tags,
					};

					// Add action button if both text and link are provided
					if (buttonText && buttonLink) {
						requestBody.actionButton = {
							actionName: buttonText,
							actionUrl: buttonLink,
						};
					}

					endpoint = '/api/v1/public/notification/push';

				} else if (resource === 'user' && operation === 'create') {
					// Handle user creation
					const username = this.getNodeParameter('username', itemIndex) as string;
					const password = this.getNodeParameter('password', itemIndex) as string;
					const fullName = this.getNodeParameter('fullName', itemIndex) as string;
					const siteName = this.getNodeParameter('siteName', itemIndex) as string;
					// Note: isAdmin field is available but not sent in request body per API specification

					// Prepare request body
					requestBody = {
						username,
						password,
						fullName,
						siteName,
					};

					endpoint = '/api/v1/public/users';

				} else {
					throw new NodeOperationError(this.getNode(), `The operation "${operation}" is not supported for resource "${resource}"`, { itemIndex });
				}

				// Make HTTP request
				response = await this.helpers.httpRequest({
					method: 'POST',
					url: `${apexHomeUrl.replace(/\/$/, '')}${endpoint}`,
					headers: {
						'Content-Type': 'application/json',
						'X-API-Key': credentials.apiKey as string,
					},
					body: requestBody,
					json: true,
				});

				returnData.push({
					json: {
						success: true,
						resource,
						operation,
						response,
						requestBody,
					},
					pairedItem: itemIndex,
				});

			} catch (error) {
				if (this.continueOnFail()) {
					returnData.push({
						json: { 
							success: false,
							error: error.message,
						},
						error,
						pairedItem: itemIndex,
					});
				} else {
					if (error.context) {
						error.context.itemIndex = itemIndex;
						throw error;
					}
					throw new NodeOperationError(this.getNode(), error, {
						itemIndex,
					});
				}
			}
		}

		return [returnData];
	}
}
