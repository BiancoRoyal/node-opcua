// ----- this file has been automatically generated - do not edit
import { LocalizedText } from "node-opcua-data-model"
import { EUInformation } from "node-opcua-data-access"
import { UAString } from "node-opcua-basic-types"
import { ExtensionObject } from "node-opcua-extension-object"
import { DTStructure } from "node-opcua-nodeset-ua/source/dt_structure"
import { DTISA95Property } from "./dt_isa_95_property"
/**
 * Defines a personnel resource or a person, a
 * quantity, an optional description, and an
 * optional collection of properties.
 *
 * |           |                                                            |
 * |-----------|------------------------------------------------------------|
 * | namespace |http://opcfoundation.org/UA/ISA95-JOBCONTROL_V2/            |
 * | nodeClass |DataType                                                    |
 * | name      |ISA95PersonnelDataType                                      |
 * | isAbstract|false                                                       |
 */
export interface DTISA95Personnel extends DTStructure {
  /** An identification of a Personnel Class or Person.*/
  ID: UAString; // String ns=0;i=12
  /** Additional information and description about the resource.*/
  description?: LocalizedText[]; // LocalizedText ns=0;i=21
  /** Information about the expected use of the personnel, see the ISA 95 Part 2 standard for defined values.*/
  personnelUse?: UAString; // String ns=0;i=12
  /** The quantity of the resource*/
  quantity?: UAString; // String ns=0;i=12878
  /** The Unit Of Measure of the quantity*/
  engineeringUnits?: EUInformation; // ExtensionObject ns=0;i=887
  /** Any associated properties, or empty if there are no properties defined.*/
  properties?: DTISA95Property[]; // ExtensionObject ns=9;i=3002
}
export interface UDTISA95Personnel extends ExtensionObject, DTISA95Personnel {};