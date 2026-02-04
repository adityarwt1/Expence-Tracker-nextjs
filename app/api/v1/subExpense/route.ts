import { HttpStatusCode } from "@/enums/HttpStatusCodeAndStatus";
import { SubExpenceBody, SubExpenceGetResponse, SubExpenseAddResponse } from "@/interfaces/ApiReponses/v1/subExpense/subexpenceInterfaces";
import { mongoconnect } from "@/lib/mongodb";
import Subexpense from "@/models/SubExpense";
import { verifyToken } from "@/services/token/tokenSevices";
import { badRequest, internalServerIssue, searchParams, unAuthorized } from "@/utils/apiResponses";
import mongoose from "mongoose";
import { NextRequest, NextResponse } from "next/server";


export async function GET(req:NextRequest) : Promise<NextResponse<SubExpenceGetResponse>> {
    try {
        const authenticationInfo = await verifyToken(req)

        if(!authenticationInfo.isVerified || !authenticationInfo.user){
            return unAuthorized()
        }
        const searchparams = await searchParams(req)
        const limit = Number(searchparams.get("limit"))||20;
        const page = Number(searchparams.get("page")) || 1;
        const skip = (page - 1) * limit
        const expenseId = searchparams.get("expenseId")
        
        if(!expenseId){
            return badRequest("expense id not given as params!")
        }
        const isConnected = await mongoconnect()

        if(!isConnected){
            return internalServerIssue(new Error("Failed to connect databse!"))
        }

        const data = await Subexpense.find({
    expenseId: new mongoose.Types.ObjectId(expenseId)
})
.sort({ date: -1 })   // 🔥 ADD THIS
.limit(limit)
.skip(skip)
.lean()
.select("_id date isActive totalAmount");

        const total = await Subexpense.countDocuments({
            expenseId:new mongoose.Types.ObjectId(expenseId)
        })

        return NextResponse.json({
            status:HttpStatusCode.OK,
            success:true,
            data,
            pagination:{
                page,
                limit,
                total,
                pages: Math.ceil(total / limit)
            }
        })
    } catch (error) {
        console.log(error )
        return internalServerIssue(error as Error)
    }
}
export async function POST(req:NextRequest) : Promise<NextResponse<SubExpenseAddResponse>> {
    try {
        const authenticationInfo = await verifyToken(req)
        if(!authenticationInfo.isVerified || !authenticationInfo.user){
            return unAuthorized()
        }

        const body : SubExpenceBody= await req.json()

        if(!body || !body.date || !body.expenseId || typeof body.isActive !== "boolean" ){
            return badRequest("please provide!")
        }

        const isConnected = await mongoconnect()

        if(!isConnected){
            return internalServerIssue(new Error("failed to connect databse!"))
        }

        const data = await Subexpense.create({...body, date:new Date(body.date)})

        if(!data){
            return internalServerIssue(new Error("Failed to add subsexpense!"))
        }

        return NextResponse.json({
            status:HttpStatusCode.CREATED,
            success:true,
            data:data,
        })
    } catch (error) {
        console.log(error)
        return internalServerIssue(error as Error)
    }
    
}

export async function DELETE(req:NextRequest) : Promise<NextResponse> {
    try {
        const authenticationInfo = await verifyToken(req)
        if(!authenticationInfo.isVerified || !authenticationInfo.user){
            return unAuthorized()
        }

        const searchparams = await searchParams(req)
        const id = searchparams.get("id")

        if(!id){
            return badRequest("subexpense id not given as params!")
        }

        const isConnected = await mongoconnect()

        if(!isConnected){
            return internalServerIssue(new Error("failed to connect databse!"))
        }

        if(!mongoose.Types.ObjectId.isValid(id)){
            return badRequest("Invalid subexpense id!")
        }

        const data = await Subexpense.findByIdAndDelete(new mongoose.Types.ObjectId(id))

        if(!data){
            return badRequest("subexpense not found!")
        }

        return NextResponse.json({
            status:HttpStatusCode.OK,
            success:true,
            message:"subexpense deleted successfully"
        })
    } catch (error) {
        console.log(error)
        return internalServerIssue(error as Error)
    }
}

export async function PATCH(req:NextRequest) : Promise<NextResponse> {
    try {
        const authenticationInfo = await verifyToken(req)
        if(!authenticationInfo.isVerified || !authenticationInfo.user){
            return unAuthorized()
        }

        const searchparams = await searchParams(req)
        const id = searchparams.get("id")

        if(!id){
            return badRequest("subexpense id not given as params!")
        }

        const body = await req.json()

        if(!body || Object.keys(body).length === 0){
            return badRequest("provide data to update!")
        }

        const isConnected = await mongoconnect()

        if(!isConnected){
            return internalServerIssue(new Error("failed to connect databse!"))
        }

        if(!mongoose.Types.ObjectId.isValid(id)){
            return badRequest("Invalid subexpense id!")
        }

        const updateData:any = {...body}
        if(body.date){
            updateData.date = new Date(body.date)
        }

        const data = await Subexpense.findByIdAndUpdate(
            new mongoose.Types.ObjectId(id),
            updateData,
            {new:true}
        )

        if(!data){
            return badRequest("subexpense not found!")
        }

        return NextResponse.json({
            status:HttpStatusCode.OK,
            success:true,
            message:"subexpense updated successfully",
            data
        })
    } catch (error) {
        console.log(error)
        return internalServerIssue(error as Error)
    }
}