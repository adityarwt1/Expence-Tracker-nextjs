import mongoose , {Schema, Document} from "mongoose";

interface ExpenceDocumentInterface  extends Document{
    title:string,
    authorId:mongoose.Schema.Types.ObjectId
}

const ExpenceSchema:Schema<ExpenceDocumentInterface> = new Schema({
    title:{
        type:String,
        required:true,
    },
    authorId:{
        type:Schema.Types.ObjectId,
        required:true,
    }
},{
timestamps:true
})

const Expence = mongoose.models.Expence || mongoose.model<ExpenceDocumentInterface>("Expence", ExpenceSchema)

export default Expence;