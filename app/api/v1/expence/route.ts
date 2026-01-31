import { HttpStatusCode } from "@/enums/HttpStatusCodeAndStatus";
import { ExpenceAddInterface, ExpenceResponseInterface, ExpenceGetInterfaces } from "@/interfaces/ApiReponses/v1/expence/expencesInterfaces";
import { mongoconnect } from "@/lib/mongodb";
import Expence from "@/models/Expence";
import { verifyToken } from "@/services/token/tokenSevices";
import { badRequest, internalServerIssue, searchParams, unAuthorized } from "@/utils/apiResponses";
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
            userId:authencticationInfo.user._id
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

        const expences = await Expence.find({ userId: authencticationInfo.user._id })
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