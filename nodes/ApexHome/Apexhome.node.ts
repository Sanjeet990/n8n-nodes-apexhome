import type {
	IExecuteFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
} from 'n8n-workflow';
import { NodeConnectionTypes } from 'n8n-workflow';
import { executeFunction } from './actionfunctions';
import properties from './properties.json';
import type { INodeProperties } from 'n8n-workflow';

export class Apexhome implements INodeType {
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
		properties: properties as INodeProperties[],
		usableAsTool: true,
	};

	// The function below is responsible for actually doing whatever this node
	// is supposed to do. Handle both notification and user operations.
	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		return await executeFunction(this);
	}
}

// Define a type for the request body
export interface NotificationRequestBody {
	appName: string;
	appIcon?: string;
	title: string;
	text?: string;
	html?: string;
	type: string;
	tags: string[];
	actionButton?: {
		actionName: string;
		actionUrl: string;
	};
}

export interface UserRequestBody {
	username: string;
	password: string;
	fullName: string;
	siteName: string;
}
