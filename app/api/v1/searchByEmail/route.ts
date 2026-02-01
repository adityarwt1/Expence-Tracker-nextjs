import { HttpStatusCode } from "@/enums/HttpStatusCodeAndStatus";
import { SearchByEmailResponseInterface } from "@/interfaces/ApiReponses/v1/searchByEmail/searchbyemail";
import { mongoconnect } from "@/lib/mongodb";
import User from "@/models/User";
import { verifyToken } from "@/services/token/tokenSevices";
import { badRequest, internalServerIssue, searchParams, unAuthorized } from "@/utils/apiResponses";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req:NextRequest) : Promise<NextResponse<SearchByEmailResponseInterface>> {
    try {
        const authenticationInfo  = await verifyToken(req)

        if(!authenticationInfo.isVerified || !authenticationInfo.user){
            return unAuthorized()
        }

        const isConnected = await mongoconnect()

        if(!isConnected){
            return internalServerIssue(new Error("Failed to connect database!"))
        }
        const searchParam = await searchParams(req)
        const query = searchParam.get("q") 

        if(!query?.includes("@")){
            return badRequest("write complete email address!")
        }
        if(!query){
            return badRequest("search query required as 'q' in the params!")
        }
        const data = await User.find({
            $or:[
                {email:{$regex: query, $options:"i"}},
            ]           
        }).select("_id fullName email").lean()

        return NextResponse.json({
            status:HttpStatusCode.OK,
            success:true,
            data:data as { _id: string; email: string; fullName: string }[]
        })
    } catch (error) {
        console.log(error)
        return internalServerIssue(error as Error)
    }
    
}