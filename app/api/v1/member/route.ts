import { NextRequest, NextResponse } from "next/server";
import {MemberAddInterfaceBody, MemberAddResponseInterface, MemberGetInterfaces} from "@/interfaces/ApiReponses/v1/members/memberInterface"
import { badRequest, internalServerIssue, searchParams, unAuthorized } from "@/utils/apiResponses";
import { verifyToken } from "@/services/token/tokenSevices";
import { mongoconnect } from "@/lib/mongodb";
import { HttpStatusCode } from "@/enums/HttpStatusCodeAndStatus";
import Member from "@/models/member";
import mongoose from "mongoose";
export async function GET(req:NextRequest) :  Promise<NextResponse<MemberGetInterfaces>>{
    try {

        const authenticationInfo = await verifyToken(req)

        if(!authenticationInfo.isVerified || !authenticationInfo.user){
            return unAuthorized()
        }
        const searchparam = await searchParams(req)
        const expenseId  = searchparam.get("expenseId")

        if(!expenseId){
            return badRequest("expenseid is required to get the expense as the 'expenseId'")
        }

        const isConnected = await mongoconnect()

        if(!isConnected){
            return internalServerIssue(new Error("Failed to connect databse!"))
        }

        const data = await Member.aggregate([
            {
                $match:{
                    expenseId:new mongoose.Types.ObjectId(expenseId)
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

export async function POST(req:NextRequest) :Promise<NextResponse<MemberAddResponseInterface>> {
    try {
        const authenticationInfo = await verifyToken(req)

        if(!authenticationInfo.isVerified  || !authenticationInfo.user){
            return unAuthorized()
        }

        const {expenseId, userId}:MemberAddInterfaceBody = await req.json()

        if(!expenseId || !userId){
            return badRequest("expenseId and userId must be provide in the body!")
        }

        const isConnected = await mongoconnect()

        if(!isConnected){
            return internalServerIssue(new Error("Failed to connect database!"))
        }

        const existingMember = await Member.findOne({
            expenseId: new mongoose.Types.ObjectId(expenseId),
            userId: new mongoose.Types.ObjectId(userId)
        })

        if(existingMember){
            return badRequest("User is already a member of this expense!")
        }

        const newMember = await Member.create({
            expenseId: new mongoose.Types.ObjectId(expenseId),
            userId: new mongoose.Types.ObjectId(userId)
        })

        return NextResponse.json({
            status: HttpStatusCode.OK,
            success: true,
            data: {
                _id: newMember._id,
                userId: newMember.userId,
                expenseId: newMember.expenseId
            }
        })
    } catch (error) {
        console.log(error)
        return internalServerIssue(error as Error)
    }    
}

export async function DELETE(req:NextRequest) :Promise<NextResponse> {
    try {
        const authenticationInfo = await verifyToken(req)

        if(!authenticationInfo.isVerified  || !authenticationInfo.user){
            return unAuthorized()
        }

        const searchparam = await searchParams(req)
        const userId = searchparam.get("userId")

        if(!userId){
            return badRequest("userId is required to delete member!")
        }

        const isConnected = await mongoconnect()

        if(!isConnected){
            return internalServerIssue(new Error("Failed to connect database!"))
        }

        const deletedMember = await Member.findOneAndDelete({
            userId: new mongoose.Types.ObjectId(userId)
        })

        if(!deletedMember){
            return badRequest("Member not found!")
        }

        return NextResponse.json({
            status: HttpStatusCode.OK,
            success: true,
            data: {
                message: "Member deleted successfully"
            }
        })
    } catch (error) {
        console.log(error)
        return internalServerIssue(error as Error)
    }    
}

