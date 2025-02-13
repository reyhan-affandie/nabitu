import mongoose, { Types } from "mongoose";
import { ParsedQs } from "qs";

export interface AuthRequest {
  _id: Types.ObjectId | string;
  email: string;
  name: string;
  token?: string;
}

export interface FieldDefinition {
  type: StringConstructor | NumberConstructor | BooleanConstructor | DateConstructor | typeof mongoose.Schema.Types.ObjectId;
  fk: boolean;
  ref?: string;
  parent: string;
  parentUnset: string[];
  fkGet: boolean;
  search: boolean;
  select: boolean;
  required: boolean;
  unique: boolean;
  minLength?: number;
  maxLength?: number;
  regex?: RegExp;
  isHashed: boolean;
  isImage: boolean;
  isFile: boolean;
}

export interface FieldsType {
  [key: string]: FieldDefinition;
}

export interface RequestValues {
  [key: string]: string | number | boolean;
}

export interface ErrorDetections {
  status: number;
  statusText: string;
}

export interface CollectionType {
  collection: string;
  parentUnset: string;
  child?: JoinCollectionType;
}

export interface JoinCollectionType {
  localField: string;
  queryValue: string | ParsedQs | (string | ParsedQs)[] | undefined;
  parentUnset: string;
}

export type SortOrderType = { [key: string]: 1 | -1 };

export type FieldType = Record<string, FieldDefinition>;

export interface CreateDataFromFieldsParams {
  fields: FieldType;
  undefinedFields?: string[];
  overrides?: Record<string, unknown>;
}
