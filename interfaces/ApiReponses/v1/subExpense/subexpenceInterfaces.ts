import mongoose from "mongoose";
import { StandardApiResponse } from "../../StandardResponse";

export interface SubExpenceBody {
    date:number,
    isActive:boolean,
    expenseId:mongoose.Types.ObjectId | string
    totalAmount:number
}

export interface SubExpenseAddResponse extends StandardApiResponse {
    data?:{
        _id:mongoose.Types.ObjectId | string,
        date: Date,
        totalAmount:number
    }
}

/// get interface
export interface SubExpenceGetResponse extends StandardApiResponse {
    data?:{ 
    date:Date,
    isActive:boolean,
    expenseId:mongoose.Types.ObjectId | string
    totalAmount:number}[]
    pagination?:{
        page:number,
        limit:number,
    }
}