import { HttpStatusCode, HttpStatusText } from "@/enums/HttpStatusCodeAndStatus";

export interface StandardApiResponse {
    success:boolean,
    status:HttpStatusCode,
    error?:HttpStatusText | string,
    message?:string
}