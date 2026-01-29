"use server"

import jwt from 'jsonwebtoken'
import { cookies } from 'next/headers'
interface PayloadInterface {
    _id:string 
}
interface CreateAndSaveTokenReturnInterface {
    isCreated:boolean,
    token?:string
}
export const createAndSaveToken = async (payload:PayloadInterface):Promise<CreateAndSaveTokenReturnInterface>=>{
    const tokenSecret = process.env.JWT_SECRET as string
    try {
       if(!tokenSecret){
        return {
            isCreated:false,
        }
       } 

       let token:string

       try {
            token = jwt.sign(payload, tokenSecret)
       } catch (error) {
        console.log(error)
        return {
            isCreated:false,
        }
       }
      
       if(!token){
        return {
            isCreated:false
        }
       }

       const cookiesStore = await cookies()

       try {
        
       cookiesStore.set(process.env.COOKIE_NAME as string, token)

       } catch (error) {
        return {
            isCreated:false,
        }
       }
       
       return {
            isCreated:true,
            token
       }
    } catch (error) {
        return {
            isCreated:false,
        }
    }
}