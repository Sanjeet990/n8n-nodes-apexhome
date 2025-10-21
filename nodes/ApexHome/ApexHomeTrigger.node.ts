import type {
	IDataObject,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
	IWebhookFunctions,
	IWebhookResponseData,
	ITriggerFunctions,
	ITriggerResponse,
} from 'n8n-workflow';
import { NodeConnectionTypes } from 'n8n-workflow';

export class ApexHomeTrigger implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Apex Home Trigger',
		name: 'apexHomeTrigger',
		icon: { light: 'file:apexhome.svg', dark: 'file:apexhome.dark.svg' },
		group: ['trigger'],
		version: 1,
		subtitle: 'Apex Home Webhook Trigger',
		description: 'Triggers when Apex Home events occur',
		eventTriggerDescription: 'Waiting for you to call the webhook URL',
		activationMessage: 'You can now make calls to your production webhook URL.',
		defaults: {
			name: 'Apex Home Trigger',
		},
		inputs: [],
		outputs: [NodeConnectionTypes.Main, NodeConnectionTypes.Main, NodeConnectionTypes.Main],
		outputNames: ['User Created', 'User Updated', 'User Removed'],
		credentials: [
			{
				name: 'apexHomeApi',
				required: false,
			},
		],
		webhooks: [
			{
				name: 'default',
				httpMethod: 'POST',
				responseMode: 'onReceived',
				path: 'webhook',
			},
		],
		properties: [
			{
				displayName: 'Events',
				name: 'events',
				type: 'multiOptions',
				options: [
					{
						name: 'User Created',
						value: 'user.created',
						description: 'Trigger when a user is created',
					},
					{
						name: 'User Updated',
						value: 'user.updated',
						description: 'Trigger when a user is updated',
					},
					{
						name: 'User Removed',
						value: 'user.removed',
						description: 'Trigger when a user is removed',
					},
				],
				default: ['user.created', 'user.updated', 'user.removed'],
				description: 'The events to listen for',
			},
			{
				displayName: 'Options',
				name: 'options',
				type: 'collection',
				placeholder: 'Add Option',
				default: {},
				options: [
					{
						displayName: 'Response Status Code',
						name: 'responseStatusCode',
						type: 'number',
						typeOptions: {
							minValue: 100,
							maxValue: 599,
						},
						default: 200,
						description: 'The HTTP status code to return',
					},
					{
						displayName: 'Response Headers',
						name: 'responseHeaders',
						placeholder: 'Add Header',
						description: 'The headers to return in the response',
						type: 'fixedCollection',
						typeOptions: {
							multipleValues: true,
						},
						default: {},
						options: [
							{
								name: 'entries',
								displayName: 'Entries',
								values: [
									{
										displayName: 'Name',
										name: 'name',
										type: 'string',
										default: '',
										description: 'Name of the header',
									},
									{
										displayName: 'Value',
										name: 'value',
										type: 'string',
										default: '',
										description: 'Value of the header',
									},
								],
							},
						],
					},
					{
						displayName: 'Response Body',
						name: 'responseBody',
						type: 'string',
						default: '',
						placeholder: '{"success": true}',
						description: 'The body to return in the response',
					},
				],
			},
		],
	};

	async webhook(this: IWebhookFunctions): Promise<IWebhookResponseData> {
		const options = this.getNodeParameter('options', {}) as IDataObject;
		const events = this.getNodeParameter('events') as string[];
		const body = this.getBodyData();
		const headers = this.getHeaderData();
		const query = this.getQueryData();

		// Extract webhook data
		const eventName = body.eventName as string;
		const eventData = body.eventData as IDataObject;
		const eventOccuredOn = body.eventOccuredOn as string;

		// Check if the event is one we're listening for
		if (!events.includes(eventName)) {
			// Return a 200 status but don't trigger the workflow
			return {
				workflowData: [[]],
				webhookResponse: {
					status: 200,
					body: { message: 'Event not subscribed' },
				},
			};
		}

		// Prepare the output data
		const outputData = {
			eventName,
			eventData,
			eventOccuredOn,
			headers,
			query,
			body,
		};

		// Determine which output to use based on event name
		let outputIndex = 0;
		const workflowData: INodeExecutionData[][] = [[], [], []]; // Three empty arrays for three outputs

		switch (eventName) {
			case 'user.created':
				outputIndex = 0;
				break;
			case 'user.updated':
				outputIndex = 1;
				break;
			case 'user.removed':
				outputIndex = 2;
				break;
			default:
				// If unknown event, don't trigger any output
				return {
					workflowData: [[], [], []],
					webhookResponse: {
						status: 200,
						body: { message: 'Unknown event type' },
					},
				};
		}

		// Add data to the appropriate output
		workflowData[outputIndex] = [{ json: outputData }];

		// Prepare response
		let responseStatusCode = 200;
		let responseHeaders: Record<string, any> = {};
		let responseBody: any = { success: true, message: 'Event received' };

		if (options.responseStatusCode) {
			responseStatusCode = options.responseStatusCode as number;
		}

		if (options.responseHeaders) {
			const entries = (options.responseHeaders as IDataObject).entries as IDataObject[];
			if (entries) {
				for (const entry of entries) {
					responseHeaders[entry.name as string] = entry.value;
				}
			}
		}

		if (options.responseBody) {
			try {
				responseBody = JSON.parse(options.responseBody as string);
			} catch (error) {
				responseBody = options.responseBody as string;
			}
		}

		return {
			workflowData: workflowData,
			webhookResponse: {
				status: responseStatusCode,
				headers: responseHeaders,
				body: responseBody,
			},
		};
	}

	async trigger(this: ITriggerFunctions): Promise<ITriggerResponse> {
		// For webhook triggers, we don't need to implement this method
		// as the webhook method handles the actual triggering
		return {
			closeFunction: async () => {
				// Cleanup if needed
			},
		};
	}
}