import { StandardApiResponse } from "@/interfaces/ApiReponses/StandardResponse"

export interface SignupInterfacesBody {
    email:string,
    fullName:string,
    password:string,
    dp?:string
}

export interface SignUpResponseInterfaces extends StandardApiResponse {
    token?:string
}