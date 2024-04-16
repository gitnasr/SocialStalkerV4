import { Document, Model } from "mongoose";

export interface Log {
    data: any;
    error: any;
}

export type IDocument = Log & Document;

export type IModel = Model<IDocument>;
