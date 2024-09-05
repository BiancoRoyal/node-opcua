import should from "should";

import { DataType } from "node-opcua-variant";
import { nodesets } from "node-opcua-nodesets";
import { EventNotifierFlags } from "node-opcua-address-space-base";

import { AddressSpace, Namespace, UAObject, UAObjectType, UADiscreteAlarm, ensureDatatypeExtracted } from "..";
import { generateAddressSpace } from "../nodeJS";
import { getMiniAddressSpace } from "../testHelpers";

describe("AddressSpace#delete", () => {
    let addressSpace: AddressSpace;
    let namespace: Namespace;

    before(async () => {
        addressSpace = await getMiniAddressSpace();
        namespace = addressSpace.getOwnNamespace();
        namespace.namespaceUri.should.eql("http://MYNAMESPACE");
    });

    after(() => {
        addressSpace.dispose();
    });

    it("DX1 should delete node ", () => {
        // given a parent node having a direct reference to it's child node
        const parentNode = namespace.addObject({
            browseName: "ParentNode",
            organizedBy: addressSpace.rootFolder.objects
        });

        const childNode = namespace.addObject({
            browseName: "ChildNode"
        });

        parentNode.addReference({
            isForward: true,
            nodeId: childNode.nodeId,
            referenceType: "HasComponent"
        });

        parentNode.getComponents().length.should.eql(1);
        // when I delete the child node
        addressSpace.deleteNode(childNode);

        // then the parent should not have it as a child
        parentNode.getComponents().length.should.eql(0);
    });
    it("DX2 should delete node ", () => {
        // given a child node having a reverse reference to it's parent node
        const parentNode = namespace.addObject({
            browseName: "ParentNode",
            organizedBy: addressSpace.rootFolder.objects
        });

        const childNode = namespace.addObject({
            browseName: "ChildNode"
        });

        childNode.addReference({
            isForward: false,
            nodeId: parentNode.nodeId,
            referenceType: "HasComponent"
        });

        parentNode.getComponents().length.should.eql(1);
        // when I delete the child node
        addressSpace.deleteNode(childNode);

        // then the parent should not have it as a child
        parentNode.getComponents().length.should.eql(0);
    });

    it("DX3 when a node is deleted, it should not be exposed by the parent anymore", () => {
        const parentNode = namespace.addObject({
            browseName: "ParentNode",
            organizedBy: addressSpace.rootFolder.objects
        });

        const childNode = namespace.addObject({
            browseName: "ChildNode"
        });

        parentNode.getComponents().length.should.eql(0);

        parentNode.addReference({
            isForward: true,
            nodeId: childNode.nodeId,
            referenceType: "HasComponent"
        });

        parentNode.getComponents().length.should.eql(1);

        addressSpace.deleteNode(childNode);

        parentNode.getComponents().length.should.eql(0);
    });
    it("DX4 when a node is deleted, it should not be exposed by the parent anymore (as a javascript property)", () => {
        const parentNode = namespace.addObject({
            browseName: "ParentNode",
            organizedBy: addressSpace.rootFolder.objects
        }) as UAObject & { childNode?: UAObject };

        const childNode = namespace.addObject({
            browseName: "ChildNode",
            componentOf: parentNode
        });

        parentNode.getComponents().length.should.eql(1);
        parentNode.getChildByName("ChildNode")!.should.eql(childNode);
        parentNode.childNode!.should.eql(childNode);

        addressSpace.deleteNode(childNode);

        parentNode.getComponents().length.should.eql(0);
        should.not.exist(parentNode.getChildByName("ChildNode"));
        should.not.exist(parentNode.childNode);
    });
    it("DX5 when a node is deleted, then recreated, it should  be exposed again by the parent (as a javascript property)", () => {
        const parentNode = namespace.addObject({
            browseName: "ParentNode",
            organizedBy: addressSpace.rootFolder.objects
        }) as UAObject & { childNode?: UAObject };

        let childNode = namespace.addObject({
            browseName: "ChildNode",
            componentOf: parentNode
        });

        parentNode.getComponents().length.should.eql(1);
        parentNode.getChildByName("ChildNode")!.should.eql(childNode);
        parentNode.childNode!.should.eql(childNode);

        addressSpace.deleteNode(childNode);

        parentNode.getComponents().length.should.eql(0);
        should.not.exist(parentNode.getChildByName("ChildNode"));
         should.not.exist(parentNode.childNode);

        let childNodeAgain =    namespace.addObject({
            browseName: "ChildNode",
            componentOf: parentNode
        });

        parentNode.getComponents().length.should.eql(1);
        parentNode.getChildByName("ChildNode")!.should.eql(childNodeAgain);
        parentNode.childNode!.should.eql(childNodeAgain);

    });
});

describe("AddressSpace#deleteNode-b", () => {
    let addressSpace: AddressSpace;
    let namespace: Namespace;

    function _createXXXXAlarm(deviceNode: UAObject, alarmType: UAObjectType, browseName: string): UADiscreteAlarm {
        const deviceHealthNode = (deviceNode as any).deviceHealth;
        if (!deviceHealthNode) {
            throw new Error("DeviceHealth must exist");
        }
        const deviceHealthAlarms = (deviceNode as any).deviceHealthAlarms;
        if (!deviceHealthAlarms) {
            throw new Error("deviceHealthAlarms must exist");
        }

        (alarmType as any).isAbstract = false;

        if (alarmType.isAbstract) {
            throw new Error("Alarm Type cannot be abstract " + alarmType.browseName.toString());
        }
        deviceNode.setEventNotifier(EventNotifierFlags.SubscribeToEvents);

        const options = {
            browseName,
            componentOf: deviceHealthAlarms,
            conditionSource: deviceNode,
            inputNode: deviceHealthNode,
            // normalState: normalStateNode,
            optionals: ["ConfirmedState", "Confirm"]
        };
        const alarmNode = namespace.instantiateAlarmCondition(alarmType, options, undefined);

        alarmNode.conditionName.setValueFromSource({
            dataType: DataType.String,
            value: browseName.replace("Alarm", "")
        });

        // install inputNode Node monitoring for change
        alarmNode.installInputNodeMonitoring(options.inputNode);
        alarmNode.activeState.setValue(false);

        return alarmNode;
    }

    function createDeviceNodeWithAlarm(nodeId: string) {
        const nsDI = addressSpace.getNamespaceIndex("http://opcfoundation.org/UA/DI/");
        if (nsDI < 0) {
            throw new Error("Cannot find DI namespace!");
        }
        const checkFunctionAlarmType = addressSpace.findEventType("CheckFunctionAlarmType", nsDI)!;

        const deviceNode = namespace.addObject({
            browseName: "A",
            eventSourceOf: addressSpace.rootFolder.objects.server,
            nodeId,
            organizedBy: addressSpace.rootFolder.objects
        });
        const deviceHealth = namespace.addVariable({
            browseName: "DeviceHealth",
            componentOf: deviceNode,
            dataType: "Int32"
        });
        const deviceHealthAlarms = namespace.addObject({
            browseName: "DeviceHealthAlarms",
            componentOf: deviceNode
        });
        _createXXXXAlarm(deviceNode, checkFunctionAlarmType, "CheckFunctionAlarm");

        return deviceNode;
    }

    before(async () => {
        addressSpace = AddressSpace.create();
        const namespace0 = addressSpace.getDefaultNamespace();

        await generateAddressSpace(addressSpace, [nodesets.standard, nodesets.di, nodesets.autoId]);
        await ensureDatatypeExtracted(addressSpace);
        namespace = addressSpace.getOwnNamespace();
    });

    after(() => {
        addressSpace.dispose();
    });

    it("YUYU should create an alarm and delete it", () => {
        const deviceNode = createDeviceNodeWithAlarm("s=Test");
        addressSpace.deleteNode(deviceNode);

        const deviceNodeAgain = createDeviceNodeWithAlarm("s=Test");
        addressSpace.deleteNode(deviceNodeAgain);
    });
});
