import { ExpenceAddInterface, ExpenceResponseInterface } from "@/interfaces/ApiReponses/v1/expence/expencesInterfaces";
import { badRequest, internalServerIssue } from "@/utils/apiResponses";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req:NextRequest):Promise<NextResponse<ExpenceResponseInterface>> {
    try {
        
        const body :ExpenceAddInterface  = await req.json()

        if(!body || !body.title){
            return badRequest("filed not provided properly!")
        }

        
    } catch (error) {
        console.log(error)
        return internalServerIssue(error as Error)
    }
}