import { StandardApiResponse } from "@/interfaces/ApiReponses/StandardResponse";

export interface SignInInterface extends StandardApiResponse{
    token?:string
}
export interface SignInBody {
    email:string,
    password:string
}