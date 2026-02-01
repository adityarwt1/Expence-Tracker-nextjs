import mongoose from "mongoose";
import { StandardApiResponse } from "../../StandardResponse";

// get search params 
// userId and expenseId
// get response
// userInterface 
export interface MemberObjectInterface {
    _id:string | mongoose.Types.ObjectId,
    fullName:string,
    email:string
}
export interface MemberGetInterfaces extends StandardApiResponse {
    data?: MemberObjectInterface[]
}

/// add member
export interface MemberAddInterfaceBody {
    userId:mongoose.Types.ObjectId | string
    expenseId:mongoose.Types.ObjectId | string
}

export interface MemberAddResponseInterface extends StandardApiResponse{}