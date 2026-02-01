import { HttpStatusCode } from "@/enums/HttpStatusCodeAndStatus";
import { ExpenceAddInterface, ExpenceResponseInterface, ExpenceGetInterfaces, ExpencePatchBodyInterface, ExpencePatchResonceBody, ExpenceDeleteResponse, ExpenceDeleteRequestBody } from "@/interfaces/ApiReponses/v1/expence/expencesInterfaces";
import { mongoconnect } from "@/lib/mongodb";
import Expence from "@/models/Expence";
import { verifyToken } from "@/services/token/tokenSevices";
import { badRequest, internalServerIssue, searchParams, unAuthorized } from "@/utils/apiResponses";
import mongoose from "mongoose";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req:NextRequest):Promise<NextResponse<ExpenceResponseInterface>> {
    try {
        const authencticationInfo = await verifyToken(req)

        if(!authencticationInfo || !authencticationInfo.isVerified || !authencticationInfo.user?._id){
            return unAuthorized()
        }
        const body :ExpenceAddInterface  = await req.json()

        if(!body || !body.title){
            return badRequest("filed not provided properly!")
        }

        const isconnected  = await mongoconnect()

        if(!isconnected){
            return internalServerIssue(new Error("Failed to connect Database!"))
        }

        const expence = await Expence.create({
            title:body.title,
            authorId:authencticationInfo.user._id
        })

        if(!expence){
            return internalServerIssue(new Error("Failed to create expence!"))
        }

        return NextResponse.json({
            status:HttpStatusCode.CREATED,
            success:true,
        },
    {
        status:HttpStatusCode.CREATED
    })
    } catch (error) {
        console.log(error)
        return internalServerIssue(error as Error)
    }
}

export async function GET(req:NextRequest) : Promise<NextResponse<ExpenceGetInterfaces>> {
    try {
        const authencticationInfo = await verifyToken(req)

        if(!authencticationInfo || !authencticationInfo.isVerified || !authencticationInfo.user?._id){
            return unAuthorized()
        }

        const searchParmsmy = await searchParams(req)
        const limit = Number(searchParmsmy.get("limit")) || 20
        const page = Number(searchParmsmy.get("page")) || 1
        const skip = (page - 1) * limit

        const isconnected = await mongoconnect()

        if(!isconnected){
            return internalServerIssue(new Error("Failed to connect Database!"))
        }

        const totalDocumentCount = await Expence.countDocuments({ userId: authencticationInfo.user._id })

        const expences = await Expence.find({ authorId: authencticationInfo.user._id })
            .select("title _id")
            .skip(skip)
            .limit(limit)
            .lean()

        if(!expences){
            return internalServerIssue(new Error("Failed to fetch expences!"))
        }

        return NextResponse.json({
            status: HttpStatusCode.OK,
            success: true,
            data: expences,
            pagination: {
                limit,
                page,
                totalDocumentCount
            }
        }, {
            status: HttpStatusCode.OK
        })
    } catch (error) {
        console.log(error)
        return internalServerIssue(error as Error)
    }
}

export async function PATCH(req:NextRequest) :Promise<NextResponse<ExpencePatchResonceBody>> {

    try {
        const authencticationInfo  = await verifyToken(req)

        if(!authencticationInfo.isVerified || !authencticationInfo.user){
            return unAuthorized()
        }

        const {_id, title} :ExpencePatchBodyInterface= await req.json() 

        if(!_id || !title){
            return badRequest("id and title not provided properly!")
        }

        const isconnected  = await mongoconnect()        

        if(!isconnected){
            return internalServerIssue()
        }

        const updated = await Expence.findOneAndUpdate({
            _id:new mongoose.Types.ObjectId(_id)
        },{
            title
        },{
            new:true
        }).lean().select("_id title")

        if(!updated){
            return internalServerIssue(new Error("Failed to update!"))
        }

        return NextResponse.json({
            status:HttpStatusCode.OK,
            success:true,
            data:updated,
        },{
            status:HttpStatusCode.OK
        })
    } catch (error) {
        console.log(error)
        return internalServerIssue(error as Error)
    }
    
}

export async function DELETE(req:NextRequest) : Promise<NextResponse<ExpenceDeleteResponse>> {

    try {
        const authencticationInfo = await verifyToken(req)

        if(!authencticationInfo.isVerified || !authencticationInfo.user){
            return unAuthorized()
        }

        const {_id}:ExpenceDeleteRequestBody  = await req.json()

        if(!_id){
            return badRequest("_id must be required for deletion of expence!")
        }

        const isconnected= await mongoconnect()

        if(!isconnected){
            return internalServerIssue(new Error('Failed to connect Database!'))
        }
        
        try {
            await Expence.findOneAndDelete({
                _id
            }).lean()
        } catch (error) {
            return internalServerIssue(new Error("Failed to delete expence!"))
        }

        return NextResponse.json({
            status:HttpStatusCode.OK,
            success:true,
        },{
            status:HttpStatusCode.OK
        })
    } catch (error) {
        console.log(error)
        return internalServerIssue(error as Error)
    }
    
}