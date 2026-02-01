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

export interface ExpenceGetInterfaces extends StandardApiResponse {
    data?:ExpenceInterFaceGetResponse[]
    pagination?:{
        limit:number,
        page:number,
        totalDocumentCount:number
    }
}

// update
export interface ExpencePatchBodyInterface {
    _id:mongoose.Types.ObjectId | string,
    title:string
}


export interface ExpencePatchResonceBody extends StandardApiResponse   {
    data?:{
        _id:mongoose.Types.ObjectId | string,
        title:string
    }
}

// delete
export interface ExpenceDeleteRequestBody {
    _id:mongoose.Types.ObjectId | string
}

export interface ExpenceDeleteResponse extends StandardApiResponse {}