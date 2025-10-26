import { IExecuteFunctions, IHttpRequestMethods, INodeExecutionData, NodeOperationError } from "n8n-workflow";
import { NotificationRequestBody, PagePublishRequestBody, PageRequestBody, UserRequestBody } from "./Apexhome.node";


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

            let requestBody: NotificationRequestBody | UserRequestBody | PageRequestBody | PagePublishRequestBody | undefined;
            let endpoint: string;
            let method: IHttpRequestMethods = 'POST';

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

                endpoint = '/api/v1/public/user';

            } else if (resource === 'page' && operation === 'create') {
                // Handle page creation
                const pageTitle = context.getNodeParameter('pageTitle', i) as string;
                const pageContent = context.getNodeParameter('pageContent', i) as string;
                const isPublished = context.getNodeParameter('publish', i) as boolean;

                // Prepare request body
                requestBody = {
                    pageTitle,
                    pageContent,
                    isPublished,
                };

                endpoint = '/api/v1/public/page';

            } else if (resource === 'page' && operation === 'update') {
                // Handle page update
                const pageId = context.getNodeParameter('pageId', i) as number;
                const pageTitle = context.getNodeParameter('pageTitle', i) as string;
                const pageContent = context.getNodeParameter('pageContent', i) as string;
                const isPublished = context.getNodeParameter('publish', i) as boolean;

                // Prepare request body
                requestBody = {
                    pageTitle,
                    pageContent,
                    isPublished,
                };

                endpoint = `/api/v1/public/page/${pageId}`;
                method = 'PUT';

            } else if (resource === 'page' && operation === 'list') {
                // Prepare request body
                requestBody = undefined;

                endpoint = '/api/v1/public/pages';
                method = 'GET';

            } else if (resource === 'page' && operation === 'info') {
                // Prepare request body
                const pageId = context.getNodeParameter('pageId', i) as number;

                requestBody = undefined;

                endpoint = `/api/v1/public/page/${pageId}`;
                method = 'GET';

            } else if (resource === 'page' && operation === 'delete') {
                // Prepare request body
                const pageId = context.getNodeParameter('pageId', i) as number;

                requestBody = undefined;

                endpoint = `/api/v1/public/page/${pageId}`;
                method = 'DELETE';

            } else if (resource === 'page' && operation === 'publish') {
                // Prepare request body
                const pageId = context.getNodeParameter('pageId', i) as number;
                const isPublished = context.getNodeParameter('publish', i) as boolean;

                requestBody = {
                    isPublished
                };

                endpoint = `/api/v1/public/page/${pageId}/publish`;
                method = 'PATCH';

            } else {
                throw new NodeOperationError(context.getNode(), `The operation "${operation}" is not supported for resource "${resource}"`, { itemIndex: i });
            }

            const response = await context.helpers.httpRequest({
                method: method,
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
                console.log(error);
                throw new NodeOperationError(context.getNode(), error, {
                    itemIndex: i,
                });
            }
        }
    }

    return [returnData];
}