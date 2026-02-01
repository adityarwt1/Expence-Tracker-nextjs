import mongoose from "mongoose";
import { StandardApiResponse } from "../../StandardResponse";
export interface ItemsInterfaces {
    name:number,
    amount:number
}
export interface ItemsAddInterface {
    categoryId:mongoose.Types.ObjectId | string,
    item:ItemsInterfaces
}

export interface ItemAddResponse extends StandardApiResponse {
    data?:{
        _id:mongoose.Types.ObjectId | string,
        name:string,
        amount:number
    }
}