import { SignInBody, SignInInterface } from "@/interfaces/ApiReponses/v1/auth/signin/signinInterface";
import { mongoconnect } from "@/lib/mongodb";
import User from "@/models/User";
import { badRequest, internalServerIssue, notFound } from "@/utils/apiResponses";
import { NextRequest, NextResponse } from "next/server";
import bcryptjs from 'bcryptjs'
import { createAndSaveToken } from "@/utils/token";
import { HttpStatusCode } from "@/enums/HttpStatusCodeAndStatus";

export async function POST(req:NextRequest): Promise<NextResponse<SignInInterface>> {
    
    try {
        const body:SignInBody = await req.json()

        // if body is empty
        if(!body || !body.email || !body.password){
            return badRequest("email or password must be required!")
        }

        const isConnected = await mongoconnect()

        if(!isConnected){
            return internalServerIssue(new Error("Failed to connect databse!"))
        }

        const user = await User.findOne({
            email:body.email
        }).select("_id email password")

        if(!user){
            return notFound()
        }
        
        // password check 
        const isPasswordTrue = await bcryptjs.compare(body.password, user.password)

        if(!isPasswordTrue){
            return badRequest("wrong password!")
        }

        // token payload 
        const tokenPayload = {
            _id:user._id
        }
        const tokenAction = await createAndSaveToken(tokenPayload)

        if(!tokenAction.isCreated || !tokenAction.token){
            return internalServerIssue(new Error("Failed to create token!"))
        }
        return NextResponse.json({
            status:HttpStatusCode.OK, 
            success:true,
            token:tokenAction.token
        })
    } catch (error) {
        console.log(error)
        return internalServerIssue(error as Error)
    }
}