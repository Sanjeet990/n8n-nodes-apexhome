import { IExecuteFunctions, IHttpRequestMethods, INodeExecutionData, NodeOperationError } from "n8n-workflow";
import { NetworkDeviceRequestBody } from "../interfaces/nwDeviceInterfaces";


export async function executeNetworkDeviceFunction(context: IExecuteFunctions): Promise<INodeExecutionData[][]> {
    const items = context.getInputData();
    const returnData: INodeExecutionData[] = [];

    // Get credentials
    const credentials = await context.getCredentials('apexHomeApi');

    for (let i = 0; i < items.length; i++) {

        try {
            const resource = context.getNodeParameter('resource', i) as string;
            const operation = context.getNodeParameter('operation', i) as string;
            const apexHomeUrl = credentials.url as string;

            let requestBody: NetworkDeviceRequestBody | undefined;
            let endpoint: string;
            let method: IHttpRequestMethods = 'POST';

            if(resource !== 'networkDevices') {
                throw new NodeOperationError(context.getNode(), `The resource "${resource}" is not supported in Network Devices function`, { itemIndex: i });
            }

            if (operation === 'create') {
                // Handle Network Device creation
                const deviceMac = context.getNodeParameter('deviceMac', i) as string;
                const deviceName = context.getNodeParameter('deviceName', i) as string;
                const deviceIp = context.getNodeParameter('deviceIp', i) as string;

                // Prepare request body
                requestBody = {
                    deviceMac,
                    deviceName,
                    deviceIp,
                };

                endpoint = '/api/v1/public/network-devices';

            } else if (operation === 'update') {
                // Handle Network Device update
                const deviceId = context.getNodeParameter('deviceId', i) as number;
                const deviceMac = context.getNodeParameter('deviceMac', i) as string;
                const deviceName = context.getNodeParameter('deviceName', i) as string;
                const deviceIp = context.getNodeParameter('deviceIp', i) as string;

                // Prepare request body
                requestBody = {
                    deviceMac,
                    deviceName,
                    deviceIp,
                };

                endpoint = `/api/v1/public/network-devices/${deviceId}`;
                method = 'PUT';

            } else if (operation === 'list') {
                // Prepare request body
                requestBody = undefined;

                endpoint = '/api/v1/public/network-devices';
                method = 'GET';

            } else if (operation === 'info') {
                // Prepare request body
                const deviceId = context.getNodeParameter('deviceId', i) as number;

                requestBody = undefined;

                endpoint = `/api/v1/public/network-devices/${deviceId}`;
                method = 'GET';

            } else if (operation === 'delete') {
                // Prepare request body
                const deviceId = context.getNodeParameter('deviceId', i) as number;

                requestBody = undefined;

                endpoint = `/api/v1/public/network-devices/${deviceId}`;
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