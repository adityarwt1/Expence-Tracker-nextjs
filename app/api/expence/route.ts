import { HttpStatusCode } from "@/enums/HttpStatusCodeAndStatus";
import { ExpenceAddInterface, ExpenceResponseInterface } from "@/interfaces/ApiReponses/v1/expence/expencesInterfaces";
import { mongoconnect } from "@/lib/mongodb";
import Expence from "@/models/Expence";
import { badRequest, internalServerIssue } from "@/utils/apiResponses";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req:NextRequest):Promise<NextResponse<ExpenceResponseInterface>> {
    try {
        
        const body :ExpenceAddInterface  = await req.json()

        if(!body || !body.title){
            return badRequest("filed not provided properly!")
        }

        const isconnected  = await mongoconnect()

        if(!isconnected){
            return internalServerIssue(new Error("Failed to connect Database!"))
        }

        const expence = await Expence.create(body)

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