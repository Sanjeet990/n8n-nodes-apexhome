import type {
	INodeType,
	INodeTypeDescription,
	IWebhookFunctions,
	IWebhookResponseData
} from 'n8n-workflow';

// Import events data directly
import eventsData from './events.json';

export interface WebhookEventOption {
	name: string;
	value: string;
}

export class ApexhomeTrigger implements INodeType {

	availableWebhookEvents : WebhookEventOption[] = eventsData.events.map((event: { name: string; id: string }) => {
		return {
			name: event.name,
			value: event.id,
		};
	});

	description: INodeTypeDescription = {
		displayName: 'Apex Home Trigger',
		name: 'apexhomeTrigger',
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
		outputs: ["main"],
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
				default: [],
				description: 'The webhook events which should fire this webhook target',
				options: this.availableWebhookEvents,
			},
		],
		usableAsTool: undefined,
	};

	async webhook(this: IWebhookFunctions): Promise<IWebhookResponseData> {
		const allEvents = eventsData.events.map((event: { id: string }) => event.id);

		const body = this.getBodyData();

		// Extract webhook data
		const eventName = body.eventName as string;

		console.log(eventName);

		if (!allEvents.includes(eventName)) {
			return {
				noWebhookResponse: true,
			};
		}

		return {
			workflowData: [
				this.helpers.returnJsonArray(body)
			],
		};
	}
}