import mongoose from "mongoose";
import { StandardApiResponse } from "../../StandardResponse";

export interface expenseAddInterface {
    title:string
}

export interface expenseResponseInterface  extends StandardApiResponse {}

export interface expenseInterFaceGetResponse {
    title:string,
    _id:mongoose.Types.ObjectId
}
export interface Pagination {
        limit:number,
        page:number,
        totalDocumentCount:number
}
export interface expenseGetInterfaces extends StandardApiResponse {
    data?:expenseInterFaceGetResponse[]
    pagination?:{
        limit:number,
        page:number,
        totalDocumentCount:number
    }
}

// update
export interface expensePatchBodyInterface {
    _id:mongoose.Types.ObjectId | string,
    title:string
}


export interface expensePatchResonceBody extends StandardApiResponse   {
    data?:{
        _id:mongoose.Types.ObjectId | string,
        title:string
    }
}

// delete
export interface expenseDeleteRequestBody {
    _id:mongoose.Types.ObjectId | string
}

export interface expenseDeleteResponse extends StandardApiResponse {}