import type {
	INodeType,
	INodeTypeDescription,
	IWebhookFunctions,
	IWebhookResponseData,
} from 'n8n-workflow';
import { NodeConnectionTypes } from 'n8n-workflow';
import * as fs from 'fs';
import * as path from 'path';

export class ApexHomeTrigger implements INodeType {
	description: INodeTypeDescription;

	constructor() {
		const eventsFilePath = path.join(__dirname, 'events.json');
		const eventsData = JSON.parse(fs.readFileSync(eventsFilePath, 'utf-8'));
		const outputNames = eventsData.events.map((event: { name: string }) => event.name);

		const outputCount = outputNames.length;
		this.description = {
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
			outputs: Array(outputCount).fill(NodeConnectionTypes.Main),
			outputNames: outputNames as any, // Cast to any to bypass type-checking
			webhooks: [
				{
					name: 'default',
					httpMethod: 'POST',
					responseMode: 'onReceived',
					path: 'webhook',
				},
			],
			properties: [],
		};
	}

	async webhook(this: IWebhookFunctions): Promise<IWebhookResponseData> {

		const eventsFilePath = path.join(__dirname, 'events.json');
		const eventsData = JSON.parse(fs.readFileSync(eventsFilePath, 'utf-8'));
		const allEvents = eventsData.events.map((event: { id: string }) => event.id);

		const body = this.getBodyData();

		// Extract webhook data
		const eventName = body.eventName as string;

		if(!allEvents.includes(eventName)) {
			return {
				noWebhookResponse: true,
			};
		}

		//find the index of the event
		const eventIndex = allEvents.indexOf(eventName);

		//send output on that index only, others will have empty arrays
		const outputData = Array(allEvents.length).fill([]);
		outputData[eventIndex] = this.helpers.returnJsonArray(body);

		return {
			workflowData: outputData,
		};
	
	}
}