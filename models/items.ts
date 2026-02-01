import mongoose, {Schema, Document} from "mongoose";

interface ItemInterface {
    name:string,
    amount:number
}
interface ItemsDocumentInterface extends Document {
    categoryId:mongoose.Types.ObjectId | string,
    items:ItemInterface[]
}

const ItemSchema:Schema<ItemInterface> = new Schema({
    name:{
        type:String,
        required:true
    },
    amount:{
        type:Number,
        required:true
    }
})

const ItemsSchema:Schema<ItemsDocumentInterface> = new Schema({
    categoryId:{
        type:Schema.Types.ObjectId,
        required:true,
        ref:"Category",
        index:true
    },
    items:[ItemSchema]
},{timestamps:true})

const Items = mongoose.models.Items || mongoose.model<ItemsDocumentInterface>("Items", ItemsSchema)
export default Items