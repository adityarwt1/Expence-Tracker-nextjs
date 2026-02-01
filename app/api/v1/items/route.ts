import { HttpStatusCode } from "@/enums/HttpStatusCodeAndStatus";
import { ItemAddResponse, ItemsAddInterface, ItemsGetResponseInterface, ItemsPatchBodyInterface, ItemsPatchBodyResponse } from "@/interfaces/ApiReponses/v1/items/itemsRouteInterfaces";
import { mongoconnect } from "@/lib/mongodb";
import Items from "@/models/items";
import { verifyToken } from "@/services/token/tokenSevices";
import { badRequest, internalServerIssue, searchParams, unAuthorized } from "@/utils/apiResponses";
import mongoose from "mongoose";
import { NextRequest, NextResponse } from "next/server";

export async function POST(
  req: NextRequest
): Promise<NextResponse<ItemAddResponse>> {
  try {
    const authenticationInfo = await verifyToken(req)

    if (!authenticationInfo.isVerified || !authenticationInfo.user) {
      return unAuthorized()
    }
    
    const body: ItemsAddInterface = await req.json()
    
    if (!body?.categoryId || !body?.item) {
        return badRequest("field not provided properly!")
    }
    
    const isConnected = await mongoconnect()
    if (!isConnected) {
        return internalServerIssue(new Error("failed to connect database!"))
    }
    
    const data = await Items.create({
        categoryId: body.categoryId,
        item: body.item
    })
    
    return NextResponse.json(
        {
            status: HttpStatusCode.CREATED,
            success: true,
            data
        },
        { status: HttpStatusCode.CREATED }
    )
} catch (error) {
    console.error(error)
    return internalServerIssue(error as Error)
}
}


export async function GET(req:NextRequest) : Promise<NextResponse<ItemsGetResponseInterface>>{
    try {
        
        const authenticationInfo = await verifyToken(req)
        
        if (!authenticationInfo.isVerified || !authenticationInfo.user) {
            return unAuthorized()
        }
        
        const params = await searchParams(req)
        
        
        const id = params.get("id")
             
        if(!id){
            return badRequest("params not provided!")
        }
        
        const isConnected = await mongoconnect()
        if (!isConnected) {
            return internalServerIssue(new Error("failed to connect database!"))
        }

        const data = await Items.find({
            categoryId:id
        }).select("item")
        return NextResponse.json({
            status:HttpStatusCode.OK,
            success:true,
            data
        })
    } catch (error) {
        console.log(error)
        return internalServerIssue(error as Error)
    }
}
    

export async function DELETE(req:NextRequest) : Promise<NextResponse<ItemsGetResponseInterface>>{
        try {
            const authenticationInfo = await verifyToken(req)
            
            if (!authenticationInfo.isVerified || !authenticationInfo.user) {
                return unAuthorized()
            }
            
            const params = await searchParams(req)
            
            
            const id = params.get("id")
            
            if(!id){
                return badRequest("params not provided!")
            }
            
            const isConnected = await mongoconnect()
            if (!isConnected) {
                return internalServerIssue(new Error("failed to connect database!"))
            }
            const data = await Items.findOneAndDelete({
                _id:id
            }).lean().select("item")
            
            return NextResponse.json({
                status:HttpStatusCode.OK,
                success:true,
                data,
                message:"Deleted successfully!"
            })
        } catch (error) {
            console.log(error)
            return internalServerIssue(error as Error)
        }
    }
    
    export async function PATCH(req:NextRequest) : Promise<NextResponse<ItemsPatchBodyResponse>>  {
        try {
            const authenticationInfo = await verifyToken(req)
            
            if (!authenticationInfo.isVerified || !authenticationInfo.user) {
                return unAuthorized()
            }
            
            const {amount,  id, name}:ItemsPatchBodyInterface = await req.json()
            
            if(!id){
                return badRequest("params not provided!")
            }
            
            const isConnected = await mongoconnect()
            if (!isConnected) {
                return internalServerIssue(new Error("failed to connect database!"))
            }
            
            const data = await Items.findOneAndUpdate({
                _id:new mongoose.Types.ObjectId(id)
            },{
                item:{
                    name,
                    amount
                }
            },{
                new:true
            })

            return NextResponse.json({
                status:HttpStatusCode.OK,
                success:true,
                data
            })
        } catch (error) {
            console.log(error)
            return internalServerIssue(error as Error)
        }
    }