import mongoose , {Schema, Document} from "mongoose";

interface SubexpenseInterface extends Document{
    expenseId:mongoose.Types.ObjectId | string
    date: Date,
    isActive:boolean,
}

const SubexpenseSchema: Schema<SubexpenseInterface> = new Schema({
    date:{
        type:Date,
        required:true
    },
    isActive:{
        type:Boolean,
        required:true,
    },
    expenseId:{
        type:Schema.Types.ObjectId,
        required:true,
        ref:"Expense",
        index:true
    }
},
{
    timestamps:true
})

const Subexpense = mongoose.models.Subexpense || mongoose.model<SubexpenseInterface>("Subexpense",  SubexpenseSchema)

export default Subexpense