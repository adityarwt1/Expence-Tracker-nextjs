import mongoose from "mongoose";
import { StandardApiResponse } from "../../StandardResponse";

export interface ExpenceAddInterface {
    title:string
}

export interface ExpenceResponseInterface  extends StandardApiResponse {}

export interface ExpenceInterFaceGetResponse {
    title:string,
    _id:mongoose.Types.ObjectId
}