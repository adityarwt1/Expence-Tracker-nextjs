import { StandardApiResponse } from "../../StandardResponse";

export interface SearchByEmailResponseInterface  extends StandardApiResponse{
    data?:{
        _id:string,
        email:string,
        fullName:string
    }[]
}