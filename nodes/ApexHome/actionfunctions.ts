import { IExecuteFunctions, INodeExecutionData, NodeOperationError } from "n8n-workflow";
import { NotificationRequestBody, UserRequestBody } from "./Apexhome.node";


export async function executeFunction(context: IExecuteFunctions): Promise<INodeExecutionData[][]> {
    const items = context.getInputData();
    const returnData: INodeExecutionData[] = [];

    // Get credentials
    const credentials = await context.getCredentials('apexHomeApi');

    for (let i = 0; i < items.length; i++) {

        try {
            const resource = context.getNodeParameter('resource', i) as string;
            const operation = context.getNodeParameter('operation', i) as string;
            const apexHomeUrl = credentials.url as string;

            let requestBody: NotificationRequestBody | UserRequestBody;
            let endpoint: string;

            if (resource === 'notification' && operation === 'send') {
                const appName = context.getNodeParameter('appName', i) as string;
                const appIcon = context.getNodeParameter('appIcon', i) as string;
                const title = context.getNodeParameter('title', i) as string;
                const text = context.getNodeParameter('text', i) as string;
                const html = context.getNodeParameter('html', i) as string;
                const type = context.getNodeParameter('type', i) as string;
                const tagsString = context.getNodeParameter('tags', i) as string;
                const buttonText = context.getNodeParameter('buttonText', i) as string;
                const buttonLink = context.getNodeParameter('buttonLink', i) as string;

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
                const username = context.getNodeParameter('username', i) as string;
                const password = context.getNodeParameter('password', i) as string;
                const fullName = context.getNodeParameter('fullName', i) as string;
                const siteName = context.getNodeParameter('siteName', i) as string;
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
                throw new NodeOperationError(context.getNode(), `The operation "${operation}" is not supported for resource "${resource}"`, { itemIndex: i });
            }

            const response = await context.helpers.httpRequest({
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
                pairedItem: i,
            });

        } catch (error) {
            if (context.continueOnFail()) {
                returnData.push({
                    json: {
                        success: false,
                        error: error.message,
                    },
                    error,
                    pairedItem: i,
                });
            } else {
                if (error.context) {
                    error.context.itemIndex = i;
                    throw error;
                }
                throw new NodeOperationError(context.getNode(), error, {
                    itemIndex: i,
                });
            }
        }
    }

    return [returnData];
}