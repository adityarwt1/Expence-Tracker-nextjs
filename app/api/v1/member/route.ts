import { NextRequest, NextResponse } from "next/server";
import {MemberGetInterfaces} from "@/interfaces/ApiReponses/v1/members/memberInterface"
import { badRequest, internalServerIssue, searchParams, unAuthorized } from "@/utils/apiResponses";
import { verifyToken } from "@/services/token/tokenSevices";
import { mongoconnect } from "@/lib/mongodb";
import { HttpStatusCode } from "@/enums/HttpStatusCodeAndStatus";
import Member from "@/models/member";
import mongoose from "mongoose";
export async function GET(req:NextRequest) :  Promise<NextResponse>{
    try {

        const authenticationInfo = await verifyToken(req)

        if(!authenticationInfo.isVerified || !authenticationInfo.user){
            return unAuthorized()
        }
        const searchparam = await searchParams(req)
        const expenceId  = searchparam.get("expenceId")

        if(!expenceId){
            return badRequest("expenceid is required to get the expence as the 'expenceId'")
        }

        const isConnected = await mongoconnect()

        if(!isConnected){
            return internalServerIssue(new Error("Failed to connect databse!"))
        }

        const data = await Member.aggregate([
            {
                $match:{
                    expenceId:new mongoose.Types.ObjectId(expenceId)
                }
            },
            {
                $lookup:{
                    from:"users",
                    localField:"userId",
                    foreignField:"_id",
                    as:"userInfo"
                }
            },
            {
                $unwind:"$userInfo"
            },
            {
                $project:{
                    _id:"$userInfo._id",
                    fullName:"$userInfo.fullName",
                    email:"$userInfo.email",
                    dp:"$userInfo.dp"
                }
            }
        ])

        return NextResponse.json({
            status:HttpStatusCode.OK,
            success:true,
            data:data
        })
    } catch (error) {
        console.log(error)
        return internalServerIssue(error as Error)
    }
}