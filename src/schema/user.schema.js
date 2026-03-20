import mongoose, { Schema } from "mongoose";

const userSchema = new Schema(
  {
    email: {
      type: String,
      unique: true,
      required: true,
      trim: true,
      lowercase: true,
    },
    username: {
      type: String,
      unique: true,
      required: true,
      trim: true,
      lowercase: true,
    },
    name: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
    instrument:{
      type:String,
      default:"",
    },
    skillLevel:{
      type:String,
      enum:["beginner", "intermediate", "advanced"],
      default:"beginner"
    },
    genre:{
      type:String,
      default:""
    },
    availability:{
      type:String,
      default:""
    }
  },
  { timestamps: true },
);

export { userSchema };
