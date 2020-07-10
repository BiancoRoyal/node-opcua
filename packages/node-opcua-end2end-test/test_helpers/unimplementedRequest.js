
const  BaseUAObject = require("node-opcua-factory").BaseUAObject;
const buildStructureType = require("node-opcua-factory").buildStructuredType;
const makeExpandedNodeId = require("node-opcua-nodeid").makeExpandedNodeId;
const ObjectIds = require("node-opcua-constants").ObjectIds;
const RequestHeader = require("node-opcua-service-secure-channel").RequestHeader;

// a fake request type that is supposed to be correctly decoded on server side
// but that is not supported by the server engine

const schemaServerSideUnimplementedRequest = buildStructureType({
    name: "ServerSideUnimplementedRequest",
    baseType: "BaseUAObject",
//x    id: ObjectIds.Annotation_Encoding_DefaultXml,
    fields: [
        {name: "requestHeader", fieldType: "RequestHeader"}
    ]
});

class ServerSideUnimplementedRequest extends  BaseUAObject
{
    constructor(options) {
        super(options);
        this.requestHeader = new RequestHeader();
    }
    get schema() /*: StructuredTypeSchema */ {
        return schemaServerSideUnimplementedRequest;
    }
}
ServerSideUnimplementedRequest.schema = schemaServerSideUnimplementedRequest;
ServerSideUnimplementedRequest.schema.encodingDefaultBinary = makeExpandedNodeId(ObjectIds.Annotation_Encoding_DefaultXml, 0);
ServerSideUnimplementedRequest.schema.encodingDefaultXml = makeExpandedNodeId(ObjectIds.Annotation_Encoding_DefaultBinary, 0);

exports.ServerSideUnimplementedRequest = ServerSideUnimplementedRequest;

//xxx const generator = require("node-opcua-generator");
//xxx const path = require("path");
//xxx  const temporary_folder = path.join(__dirname, "..", "_test_generated");
//xxx exports.ServerSideUnimplementedRequest_Schema = ServerSideUnimplementedRequest_Schema;
//xxx const ServerSideUnimplementedRequest = generator.registerObject(ServerSideUnimplementedRequest_Schema, temporary_folder);
//xxx exports.ServerSideUnimplementedRequest = ServerSideUnimplementedRequest;


