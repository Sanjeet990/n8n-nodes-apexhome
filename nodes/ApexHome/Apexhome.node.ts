import type {
	IExecuteFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
	INodeProperties
} from 'n8n-workflow';
import { NodeConnectionTypes } from 'n8n-workflow';
import { executeFunction } from './functions/actionfunctions';
import properties from './data/properties.json';

export class Apexhome implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Apex Home',
		name: 'apexhome',
		icon: { light: 'file:icons/apexhome.svg', dark: 'file:icons/apexhome.dark.svg' },
		group: ['transform'],
		version: 1,
		subtitle: '={{$parameter["operation"] + ": " + $parameter["resource"]}}',
		description: 'Interact with Apex Home API',
		defaults: {
			name: 'Apex Home',
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
