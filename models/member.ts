import mongoose , {Schema, Document} from 'mongoose'

interface MemberInterface {
    userId:mongoose.Types.ObjectId
    expenseId:mongoose.Types.ObjectId
}

const MemberSchema:Schema<MemberInterface> = new Schema({
    expenseId:{
        type:Schema.Types.ObjectId,
        required:true
    },
    userId:{
        type:Schema.Types.ObjectId, 
        required:true
    }
},{timestamps:true})

const Member  = mongoose.models.Member || mongoose.model<MemberInterface>("Member", MemberSchema)
export default Member