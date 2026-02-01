import mongoose from "mongoose";
import { StandardApiResponse } from "../../StandardResponse";

export interface ExpenseAddCategoryBodyInterface {
    subExpenseId:mongoose.Types.ObjectId,
    title:string
}

export interface ExpenseAddCategoryResponse extends StandardApiResponse {
    data?:{
        title:string,
        _id:mongoose.Types.ObjectId | string
    }
}

export interface ExpenseGetCategoryResponse extends StandardApiResponse {
    data?:{
        title:string,
        _id:mongoose.Types.ObjectId | string
    }[]
}

export interface ExpenseCategoryDeleteReponseInterface extends StandardApiResponse {}

export interface ExpenseEditCategoryBodyInterface {
    _id: mongoose.Types.ObjectId | string,
    title:string
}
export interface ExpenseEditCategoryResponseInterface extends StandardApiResponse {
    data?:{
    _id: mongoose.Types.ObjectId | string,
    title:string
    }
}

