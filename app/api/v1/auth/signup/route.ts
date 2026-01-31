import { SignInBody } from "@/interfaces/ApiReponses/v1/auth/signin/signinInterface";
import { SignupInterfacesBody, SignUpResponseInterfaces } from "@/interfaces/ApiReponses/v1/auth/signup/signupinterfaces";
import { mongoconnect } from "@/lib/mongodb";
import User from "@/models/User";
import { badRequest, conflictError, internalServerIssue } from "@/utils/apiResponses";
import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { createAndSaveToken } from "@/utils/token";
import { HttpStatusCode } from "@/enums/HttpStatusCodeAndStatus";
export async function POST(req:NextRequest) :Promise<NextResponse<SignUpResponseInterfaces>> {
    try {
        const body:SignupInterfacesBody = await req.json()

        if(!body || !body.email || !body.password){
            return badRequest("field not provide properly!")
        }

        // conected to database 
        const isConnected = await mongoconnect()

        if(!isConnected){
            return internalServerIssue(new Error("Internal server issue!"))
        }

        // checking existence 
        const user = await User.findOne({
            email:body.email
        }).lean().select("email")

        if(user){
            return conflictError("User already register with this email!")
        }

        const hashedPassword = await bcrypt.hash(body.password, 10)

        if(!hashedPassword){
            return internalServerIssue(new Error("Failed to create user!"))
        }

        const createdUser = await User.create({
            email:body.email,
            password:hashedPassword,
            fullName:body.fullName,
            dp:body.dp
        })

        if(!createdUser){
            return internalServerIssue(new Error("Failed to create user!"))
        }

        const tokenPayload = {
            _id:createdUser._id
        }

        const tokenAction = await createAndSaveToken(tokenPayload)

        if(!tokenAction.isCreated || !tokenAction.token){
            return internalServerIssue(new Error("Failed to create user!"))
        }

        return NextResponse.json({
            status:HttpStatusCode.CREATED,
            success:true,
            token:tokenAction.token
        },
    {
        status:HttpStatusCode.CREATED
    })
    } catch (error) {
        console.log(error)
        return internalServerIssue(error as Error)
    }
}