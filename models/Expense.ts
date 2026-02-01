import mongoose , {Schema, Document} from "mongoose";

interface expenseDocumentInterface  extends Document{
    title:string,
    authorId:mongoose.Schema.Types.ObjectId
}

const expenseSchema:Schema<expenseDocumentInterface> = new Schema({
    title:{
        type:String,
        required:true,
    },
    authorId:{
        type:Schema.Types.ObjectId,
        required:true,
        ref:"User",
        index:true
    }
},{
timestamps:true
})

const expense = mongoose.models.expense || mongoose.model<expenseDocumentInterface>("expense", expenseSchema)

export default expense;