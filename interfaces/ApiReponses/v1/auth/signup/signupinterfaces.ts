import { StandardApiResponse } from "@/interfaces/ApiReponses/StandardResponse"

export interface SignupInterfacesBody {
    dp?:string
    email:string,
    fullName:string,
    password:string,
}

export interface SignUpResponseInterfaces extends StandardApiResponse {
    token?:string
}