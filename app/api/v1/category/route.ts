import { HttpStatusCode } from "@/enums/HttpStatusCodeAndStatus"
import { ExpenseAddCategoryBodyInterface, ExpenseAddCategoryResponse, ExpenseCategoryDeleteReponseInterface, ExpenseEditCategoryBodyInterface, ExpenseEditCategoryResponseInterface, ExpenseGetCategoryResponse } from "@/interfaces/ApiReponses/v1/category/route"
import { mongoconnect } from "@/lib/mongodb"
import Category from "@/models/expenseCategory"
import { verifyToken } from "@/services/token/tokenSevices"
import { badRequest, internalServerIssue, notFound, searchParams, unAuthorized } from "@/utils/apiResponses"
import { NextRequest, NextResponse } from "next/server"

export async function POST(req:NextRequest) :Promise<NextResponse<ExpenseAddCategoryResponse>> {
    try {
        const authenticationInfo = await verifyToken(req)
        
        if(!authenticationInfo.isVerified || !authenticationInfo.user){
            return unAuthorized()
        }
        
        const body: ExpenseAddCategoryBodyInterface = await req.json()
        
        if(!body || Object.values(body).length === 0){
            return badRequest("please provide valied body!")
        }
        
        const isConnected = await mongoconnect()
        
        if(!isConnected){
            return internalServerIssue(new Error("Failed to connect databse!"))
        }
        
        const data = await Category.insertOne(body)
        
        if(!data){
            return internalServerIssue(new Error("Failed to create category!"))
        }
        
        return NextResponse.json({
            status:HttpStatusCode.CREATED,
            success:true,
            data
        },{
            status:HttpStatusCode.CREATED
        })
    } catch (error) {
        console.log(error)
        return internalServerIssue(error as Error)
    }    
}

export async function GET(req:NextRequest) :Promise<NextResponse<ExpenseGetCategoryResponse>> {
    try {
        const authenticationInfo = await verifyToken(req)
        
        if(!authenticationInfo.isVerified || !authenticationInfo.user){
            return unAuthorized()
        }
        
        const searchParm = await searchParams(req)
        const subExpenseId= searchParm.get("subExpenseId")
        
        // if subexpense id not provided
        if(!subExpenseId){
            return badRequest("sub expense id not provided!")
        }
        
        const isConnected = await mongoconnect()
        
        if(!isConnected){
            return internalServerIssue(new Error("Failed to connect databse!"))
        }
        
        const data = await Category.find({
            subExpenseId
        }).lean().select("_id title")
        
        return NextResponse.json({
            status:HttpStatusCode.OK,
            success:true,
            data
        },{
            status:HttpStatusCode.OK
        })
    } catch (error) {
        console.log(error)
        return internalServerIssue(error as Error)
    }
}

export async function DELETE(req:NextRequest)  : Promise<NextResponse<ExpenseCategoryDeleteReponseInterface>> {
    try {
        const params = await searchParams(req)
        const id = params.get("id")
        
        if(!id){
            return badRequest("id not provided as params!")
        }
        const authenticationInfo = await verifyToken(req)
        
        if(!authenticationInfo.isVerified || !authenticationInfo.user){
            return unAuthorized()
        }
        
        const isConnected = await mongoconnect()
        
        if(!isConnected){
            return internalServerIssue(new Error("Failed to connect databse!"))
        }
        
        const deleted = await Category.findOneAndDelete({
            _id:id
        })
        
        if(!deleted){
            return notFound("Category not found!")
        }
        
        return NextResponse.json({
            status:HttpStatusCode.OK,
            success:true,
        })
    } catch (error) {
        console.log(error)
        return internalServerIssue(error as Error)
    }
}

export async function PATCH(req:NextRequest) : Promise<NextResponse<ExpenseEditCategoryResponseInterface>> {
    try {
        const authenticationInfo = await verifyToken(req)
        
        if(!authenticationInfo.isVerified || !authenticationInfo.user){
            return unAuthorized()
        }
        
        const body: ExpenseEditCategoryBodyInterface = await req.json()
        
        if(!body || Object.values(body).length == 0){
            return badRequest("filelds not provided proporly!")
        }
        
        const isConnected = await mongoconnect()
        
        if(!isConnected){
            return internalServerIssue(new Error("Failed to connect databse!"))
        }

        const newUpdated = await Category.findOneAndUpdate({
            _id:body._id
        },{
            title:body.title
        },{
            new:true
        }).lean().select("_id title")

        return NextResponse.json({
            status:HttpStatusCode.OK,
            success:true,
            data:newUpdated
        })
    } catch (error) {
        console.log(error)
        return internalServerIssue(error as Error)
    }
}