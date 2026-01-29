import mongoose from "mongoose";

export interface TokenInterface {
    _id:string | mongoose.Types.ObjectId,
    exp:number,
    iat:number
}