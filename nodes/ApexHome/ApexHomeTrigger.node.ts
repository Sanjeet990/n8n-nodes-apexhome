import type {
	INodeType,
	INodeTypeDescription,
	IWebhookFunctions,
	IWebhookResponseData,
	INodeExecutionData,
} from 'n8n-workflow';
import { NodeConnectionTypes } from 'n8n-workflow';

// Import events data directly
import eventsData from './events.json';

export class ApexHomeTrigger implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Apex Home Trigger',
		name: 'apexHomeTrigger',
		icon: 'file:apexhome.svg',
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
		outputs: [],
		webhooks: [
			{
				name: 'default',
				httpMethod: 'POST',
				responseMode: 'onReceived',
				path: 'webhook',
			},
		],
		properties: [],
		usableAsTool: undefined,
	};

	constructor() {
		const outputNames = eventsData.events.map((event: { name: string }) => event.name);
		const outputCount = outputNames.length;

		this.description = {
			...this.description,
			inputs: [],
			outputs: Array(outputCount).fill(NodeConnectionTypes.Main),
			outputNames: outputNames as string[],
		};
	}

	async webhook(this: IWebhookFunctions): Promise<IWebhookResponseData> {
		const allEvents = eventsData.events.map((event: { id: string }) => event.id);

		const body = this.getBodyData();

		// Extract webhook data
		const eventName = body.eventName as string;

		if (!allEvents.includes(eventName)) {
			return {
				noWebhookResponse: true,
			};
		}

		// Find the index of the event
		const eventIndex = allEvents.indexOf(eventName);

		// Send output on that index only, others will have empty arrays
		const outputData: INodeExecutionData[][] = Array(allEvents.length)
			.fill(null)
			.map(() => [] as INodeExecutionData[]);
		outputData[eventIndex] = this.helpers.returnJsonArray(body) as INodeExecutionData[];

		return {
			workflowData: outputData,
		};
	}
}