import { IExecuteFunctions, IHttpRequestMethods, INodeExecutionData, NodeOperationError } from "n8n-workflow";
import { TotpRequestBody } from "../interfaces/totpInterfaces";


export async function executeTotpFunction(context: IExecuteFunctions): Promise<INodeExecutionData[][]> {
    const items = context.getInputData();
    const returnData: INodeExecutionData[] = [];

    // Get credentials
    const credentials = await context.getCredentials('apexHomeApi');

    for (let i = 0; i < items.length; i++) {

        try {
            const resource = context.getNodeParameter('resource', i) as string;
            const operation = context.getNodeParameter('operation', i) as string;
            const apexHomeUrl = credentials.url as string;

            let requestBody: TotpRequestBody | undefined;
            let endpoint: string;
            let method: IHttpRequestMethods = 'POST';

            if(resource !== 'totp') {
                throw new NodeOperationError(context.getNode(), `The resource "${resource}" is not supported in TOTP function`, { itemIndex: i });
            }

            if (operation === 'create') {
                // Handle TOTP creation
                const serviceName = context.getNodeParameter('serviceName', i) as string;
                const accountName = context.getNodeParameter('accountName', i) as string;
                const secretKey = context.getNodeParameter('secretKey', i) as string;

                // Prepare request body
                requestBody = {
                    serviceName,
                    accountName,
                    secretKey,
                };

                endpoint = '/api/v1/public/totp';

            } else if (operation === 'update') {
                // Handle TOTP update
                const totpId = context.getNodeParameter('totpId', i) as number;
                const serviceName = context.getNodeParameter('serviceName', i) as string;
                const accountName = context.getNodeParameter('accountName', i) as string;
                const secretKey = context.getNodeParameter('secretKey', i) as string;

                // Prepare request body
                requestBody = {
                    serviceName,
                    accountName,
                    secretKey,
                };

                endpoint = `/api/v1/public/totp/${totpId}`;
                method = 'PUT';

            } else if (operation === 'list') {
                // Prepare request body
                requestBody = undefined;

                endpoint = '/api/v1/public/totps';
                method = 'GET';

            } else if (operation === 'info') {
                // Prepare request body
                const totpId = context.getNodeParameter('totpId', i) as number;

                requestBody = undefined;

                endpoint = `/api/v1/public/totp/${totpId}`;
                method = 'GET';

            } else if (operation === 'delete') {
                // Prepare request body
                const totpId = context.getNodeParameter('totpId', i) as number;

                requestBody = undefined;

                endpoint = `/api/v1/public/totp/${totpId}`;
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