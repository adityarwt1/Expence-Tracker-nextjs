"use client"

import { HttpStatusCode, HttpStatusText } from "@/enums/HttpStatusCodeAndStatus"
import { SignInBody, SignInInterface } from "@/interfaces/ApiReponses/v1/auth/signin/signinInterface"

export const signInServices = async function (body:SignInBody):Promise<SignInInterface> {
    try {
        const response = await fetch(process.env.NEXT_PUBLIC_SIGNIN_URL as string,{
            method:"POST",
            headers:{
                "Content-Type":"application/json"
            },
            body:JSON.stringify(body)
        })
        const data : SignInInterface = await response.json()
        return data
    } catch (error) {
        console.log(error)        
        return {
            status:HttpStatusCode.INTERNAL_SERVER_ERROR,
            success:false,
            error:HttpStatusText.INTERNAL_SERVER_ERROR
        }
    }
}