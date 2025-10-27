import { IExecuteFunctions, IHttpRequestMethods, INodeExecutionData, NodeOperationError } from "n8n-workflow";
import { BackupRequestBody, ChangeThemeRequestBody, WeatherLocationRequestBody } from "../interfaces/settingsInterfaces";

export async function executeSettingFunction(context: IExecuteFunctions): Promise<INodeExecutionData[][]> {
    const items = context.getInputData();
    const returnData: INodeExecutionData[] = [];

    // Get credentials
    const credentials = await context.getCredentials('apexHomeApi');

    for (let i = 0; i < items.length; i++) {

        try {
            const resource = context.getNodeParameter('resource', i) as string;
            const operation = context.getNodeParameter('operation', i) as string;
            const apexHomeUrl = credentials.url as string;

            let requestBody: ChangeThemeRequestBody | WeatherLocationRequestBody | BackupRequestBody | undefined;
            let endpoint: string;
            let method: IHttpRequestMethods = 'POST';

            if (resource !== 'settings') {
                throw new NodeOperationError(context.getNode(), `The resource "${resource}" is not supported in settings function`, { itemIndex: i });
            }

            if (operation === 'changeTheme') {
                // Handle theme change
                const selectedTheme = context.getNodeParameter('theme', i) as string;

                // Prepare request body
                requestBody = {
                    theme: selectedTheme
                };

                endpoint = '/api/v1/public/set-theme';
                method = 'PUT';

            } else if (operation === 'changeLocation') {
                // Handle page update
                const locationName = context.getNodeParameter('locationName', i) as string;
                const longitude = context.getNodeParameter('longitude', i) as string;
                const latitude = context.getNodeParameter('latitude', i) as string;
                const unit = context.getNodeParameter('unit', i) as string;

                // Prepare request body
                requestBody = {
                    location: {
                        location: locationName,
                        longitude,
                        latitude,
                    },
                    unit,
                };

                endpoint = `/api/v1/public/weather-location`;
                method = 'PUT';

            } else if (operation === 'backup') {
                const backupPassword = context.getNodeParameter('backupPassword', i) as string;

                requestBody = {
                    password: backupPassword
                };

                endpoint = `/api/v1/public/backup`;
                method = 'POST';
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
                encoding: operation === 'backup' ? 'arraybuffer' : 'json',
            });

            //Check mimetype of the 
            if (operation === 'backup') {
                let buffer;
                if (response instanceof ArrayBuffer) {
                    buffer = Buffer.from(response);
                } else if (Buffer.isBuffer(response)) {
                    buffer = response;
                } else if (typeof response === 'string') {
                    // If it's still a string, it's likely base64 or latin1 encoded
                    buffer = Buffer.from(response, 'latin1');
                } else {
                    buffer = Buffer.from(response);
                }

                returnData.push({
                    json: {
                        success: true,
                        response,
                    },
                    binary: {
                        ['data']: {
                            data: buffer.toString('base64'),
                            mimeType: 'application/apex',
                            fileName: 'response.apex',
                        },
                    },
                    pairedItem: i,
                });
            } else {
                returnData.push({
                    json: {
                        success: true,
                        response,
                    },
                    pairedItem: i,
                });
            }

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