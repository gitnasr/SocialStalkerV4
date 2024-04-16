import { Document, Model } from "mongoose";

export enum Gender {
    "male" = "male",
    "female" = "female",
    "mixed" = "mixed",
    "only_females" = "only_females",
    "only_males" = "only_males",
    "unknown" = "unknown"
}

export interface IAi {
    faceCount: number;
    gender: Gender,
    description: string;
    tags: string[];
    age: number;
    attributes: Record<string, any>;
}

export interface IDocument extends IAi, Document { }

export interface IModel extends Model<IDocument> { }