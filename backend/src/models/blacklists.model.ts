import { InferSchemaType, model, Schema } from "mongoose";
import { FieldsType } from "@/types/types";
import { regexString } from "@/utils/regex";

export const fields: FieldsType = {
  token: {
    type: String,
    fk: false,
    parent: "",
    parentUnset: [],
    fkGet: false,
    search: true,
    select: true,
    required: true,
    unique: true,
    minLength: 1,
    maxLength: 3000,
    regex: regexString,
    isHashed: false,
    isImage: false,
    isFile: false,
  },
};

export const blacklistSchema = new Schema(fields, { timestamps: true });
blacklistSchema.index({ created_at: 1 }, { expireAfterSeconds: 3 * 24 * 60 * 60 });
type Blacklist = InferSchemaType<typeof blacklistSchema>;
export default model<Blacklist>("Blacklist", blacklistSchema);
