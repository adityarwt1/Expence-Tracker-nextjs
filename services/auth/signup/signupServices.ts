"use client"

import { HttpStatusCode } from "@/enums/HttpStatusCodeAndStatus"
import { SignupInterfacesBody, SignUpResponseInterfaces } from "@/interfaces/ApiReponses/v1/auth/signup/signupinterfaces"

export const signupService = async(body:SignupInterfacesBody):Promise<SignUpResponseInterfaces>=>{
    try {
        const response = await fetch(process.env.NEXT_PUBLIC_SIGNUP_URL as string, {
            method:"POST",
            headers:{
                "Content-Type":"application/json"
            },
            body:JSON.stringify(body)
        })
        const data = await response.json() as SignUpResponseInterfaces
        return data
    } catch (error) {
        console.log(error)
        return {
            status:HttpStatusCode.INTERNAL_SERVER_ERROR,
            success:false
        }
    }
}