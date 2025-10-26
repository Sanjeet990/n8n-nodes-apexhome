import { IExecuteFunctions, IHttpRequestMethods, INodeExecutionData, NodeOperationError } from "n8n-workflow";
import { PagePublishRequestBody, PageRequestBody } from "../interfaces/pageInterfaces";


export async function executePageFunction(context: IExecuteFunctions): Promise<INodeExecutionData[][]> {
    const items = context.getInputData();
    const returnData: INodeExecutionData[] = [];

    // Get credentials
    const credentials = await context.getCredentials('apexHomeApi');

    for (let i = 0; i < items.length; i++) {

        try {
            const resource = context.getNodeParameter('resource', i) as string;
            const operation = context.getNodeParameter('operation', i) as string;
            const apexHomeUrl = credentials.url as string;

            let requestBody: PageRequestBody | PagePublishRequestBody | undefined;
            let endpoint: string;
            let method: IHttpRequestMethods = 'POST';

            if(resource !== 'page') {
                throw new NodeOperationError(context.getNode(), `The resource "${resource}" is not supported in page function`, { itemIndex: i });
            }

            if (operation === 'create') {
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

            } else if (operation === 'update') {
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

            } else if (operation === 'list') {
                // Prepare request body
                requestBody = undefined;

                endpoint = '/api/v1/public/pages';
                method = 'GET';

            } else if (operation === 'info') {
                // Prepare request body
                const pageId = context.getNodeParameter('pageId', i) as number;

                requestBody = undefined;

                endpoint = `/api/v1/public/page/${pageId}`;
                method = 'GET';

            } else if (operation === 'delete') {
                // Prepare request body
                const pageId = context.getNodeParameter('pageId', i) as number;

                requestBody = undefined;

                endpoint = `/api/v1/public/page/${pageId}`;
                method = 'DELETE';

            } else if (operation === 'publish') {
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