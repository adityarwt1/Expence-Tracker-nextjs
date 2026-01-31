"use server"

import { TokenInterface } from "@/interfaces/Token/token"
import { NextRequest } from "next/server"
import jwt from 'jsonwebtoken'
interface VerifyTokenInfo {
    isVerified:boolean,
    user?:TokenInterface
}
export const verifyToken = async (req:NextRequest):Promise<VerifyTokenInfo>=>{
    try {
        const token = req.headers.get("Authorization")?.split(" ")[1]
        if(!token){
            return {
                isVerified:false,
            }
        }
        let tokenInfo

        try {
            tokenInfo = jwt.verify(token, process.env.JWT_SECRET as string) as TokenInterface
        } catch (error) {
            console.log(error)
            return {
                isVerified:false
            }
        }

        if(!tokenInfo || !tokenInfo._id){
            return {
                isVerified:false
            }
        }

        if(new Date(tokenInfo.exp) < new Date()){
            return {
                isVerified:false
            }
        }

        return {
            isVerified:true,
            user:tokenInfo
        }
    } catch (error) {
        console.log(error)
        return {
            isVerified:false,
        }
    }
}