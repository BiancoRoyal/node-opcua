import { QualifiedName } from "node-opcua-data-model";
import { DataValue } from "node-opcua-data-value";
import { ExtensionObject } from "node-opcua-extension-object";
import { UADataType } from "./ua_data_type";
import { UAVariable } from "./ua_variable";
import { UAVariableType } from "./ua_variable_type";

// {{ Dynamic Array Variable
export interface UADynamicVariableArray<T extends ExtensionObject = ExtensionObject> extends UAVariable {
    $dataValue: DataValue;
    $$variableType: UAVariableType;
    $$dataType: UADataType;
    $$extensionObjectArray: T[];
    $$getElementBrowseName: (obj: T, index: number) => QualifiedName;
    $$indexPropertyName: string;
}
