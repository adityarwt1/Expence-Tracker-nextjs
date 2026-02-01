import mongoose , {Schema, Document} from "mongoose";

interface ExpenseCategoryInterface extends Document {
    title:string,
    subExpenseId:mongoose.Types.ObjectId | string
}

const ExpenseCategoryCategory :Schema<ExpenseCategoryInterface> = new Schema({
    subExpenseId:{
        type:Schema.Types.ObjectId,
        required:true,
        ref:"Subexpense",
        index:true
    },
    title:{
        type:String,
        required:true
    }
},
{
    timestamps:true
})

const Category = mongoose.models.Category || mongoose.model<ExpenseCategoryInterface>("Category", ExpenseCategoryCategory)

export default Category