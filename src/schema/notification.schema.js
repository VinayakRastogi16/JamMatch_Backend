import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema({
    recipient:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        required:true
    },
    sender:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        default:null
    },
    type:{
        type:String,
        enum:["MATCH", "LIKE", "MESSAGE", "AUDIO_ROOM", "SYSTEM"],
        required:true,
    },

    title:{
        type:String,
        required:true,
        trim:true
    },
    message:{
        type:String,
        required:true,
        trim:true
    },
    relatedId:{
        type:mongoose.Schema.Types.ObjectId,
        default:null
    },
    isRead:{
        type:Boolean,
        default:false
    },
    emailSent:{
        type:Boolean,
        default:false
    }
},
{timestamps:true}
);



export default notificationSchema;
