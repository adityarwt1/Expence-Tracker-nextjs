import mongoose , {Schema, Document}from "mongoose";

interface LoggerInterface extends Document {
    message:string,
    cause:string
}

const LoggerSchema :Schema<LoggerInterface> = new Schema({
    message:{
        type:String,
        required:true
    },
    cause:{
        type:String,
        required:true
    }
},
{
    timestamps:true
})

const Logger = mongoose.models.Logger || mongoose.model<LoggerInterface>("Logger", LoggerSchema)

export default Logger