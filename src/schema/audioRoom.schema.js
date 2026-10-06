import mongoose from 'mongoose';

const audioRoomSchema = new mongoose.Schema({
    name:{
        type:String,
        required:true,
        trim:true,
    },

    genre:{
        type:String,
        required:true,
        trim:true
    },

    host:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        required:true
    },
    maxParticipants:{
        type:Number,
        default:8
    },
    participants:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User"
    }],

    isLive:{
        type:Boolean,
        default:true
    },
    joinCode:{
        type:String, 
        required:true,
        uppercase:true,
        unique:true,
        trim:true
    }

}, {timestamps:true});


export default audioRoomSchema;