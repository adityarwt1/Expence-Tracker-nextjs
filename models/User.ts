import mongoose , {Schema, Document} from "mongoose";

interface UserInterFace extends Document {
    email:string,
    fullName:string,
    password:string
    dp:string
}

const UserSchema: Schema<UserInterFace> = new Schema({
    email:{
        type:String,
        required:true,
    },
    fullName:{
        type:String,
        required:true
    },
    password:{
        type:String,
        required:true
    },
    dp:{
        type:String,
        required:false,
        default:"/images/dp.png"
    }
},
{
    timestamps:true
})

const User = mongoose.models.User || mongoose.model<UserInterFace>('User', UserSchema)

export default User