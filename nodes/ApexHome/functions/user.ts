import { IExecuteFunctions, IHttpRequestMethods, INodeExecutionData, NodeOperationError } from "n8n-workflow";
import { UserRequestBody } from "../interfaces/userInterfaces";

export async function executeUserFunction(context: IExecuteFunctions): Promise<INodeExecutionData[][]> {
    const items = context.getInputData();
    const returnData: INodeExecutionData[] = [];

    // Get credentials
    const credentials = await context.getCredentials('apexHomeApi');

    for (let i = 0; i < items.length; i++) {

        try {
            const resource = context.getNodeParameter('resource', i) as string;
            const operation = context.getNodeParameter('operation', i) as string;
            const apexHomeUrl = credentials.url as string;

            let requestBody: UserRequestBody | undefined;
            let endpoint: string;
            let method: IHttpRequestMethods = 'POST';

            if(resource !== 'user') {
                throw new NodeOperationError(context.getNode(), `The resource "${resource}" is not supported in user function`, { itemIndex: i });
            }

            if (operation === 'list') {
                // Prepare request body
                requestBody = undefined

                endpoint = '/api/v1/public/users';
                method = 'GET';

            } else if (operation === 'create') {
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

            } else if (operation === 'update') {
                // Handle user update
                const userId = context.getNodeParameter('userId', i) as number;
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

                endpoint = `/api/v1/public/user/${userId}`;
                method = 'PUT';

            } else if (operation === 'info') {
                // Handle user info retrieval
                const userId = context.getNodeParameter('userId', i) as number;

                // Prepare request body
                requestBody = undefined;

                endpoint = `/api/v1/public/user/${userId}`;
                method = 'GET';

            } else if (operation === 'delete') {
                // Handle user deletion
                const userId = context.getNodeParameter('userId', i) as number;

                // Prepare request body
                requestBody = undefined;

                endpoint = `/api/v1/public/user/${userId}`;
                method = 'DELETE';

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
                    response,
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