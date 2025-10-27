import { IExecuteFunctions, INodeExecutionData, NodeOperationError } from "n8n-workflow";
import { executeUserFunction } from "./user";
import { executePageFunction } from "./page";
import { executeNotificationFunction } from "./notification";
import { executeTotpFunction } from "./totp";
import { executeNetworkDeviceFunction } from "./networkdevices";
import { executeSettingFunction } from "./setting";

export async function executeFunction(context: IExecuteFunctions): Promise<INodeExecutionData[][]> {
    const items = context.getInputData();
    const returnData: INodeExecutionData[] = [];

    for (let i = 0; i < items.length; i++) {

        try {
            const resource = context.getNodeParameter('resource', i) as string;

            if (resource === 'user') {
                return await executeUserFunction(context);
            } else if (resource === 'page') {
                return await executePageFunction(context);
            } else if (resource === 'notification') {
                return await executeNotificationFunction(context);
            } else if (resource === 'totp') {
                return await executeTotpFunction(context);
            } else if (resource === 'networkDevices') {
                return await executeNetworkDeviceFunction(context);
            } else if (resource === 'settings') {
                return await executeSettingFunction(context);
            } else {
                throw new NodeOperationError(context.getNode(), `The resource "${resource}" is not supported`, { itemIndex: i });
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