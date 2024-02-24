import { Schema, model } from "mongoose";

export interface IPrefix {
  _id: string;
  prefix: string;
}

const schema = new Schema<IPrefix>(
  {
    _id: {
      type: String,
      required: true,
    },
    prefix: {
      type: String,
      required: true,
    },
  },
  { versionKey: false, _id: false }
);

export default model("Prefix", schema);
