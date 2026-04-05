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
    instruments:
      {
        type: [String],
        default: [],
      },
    skillLevel: {
      type: String,
      enum: ["beginner", "intermediate", "advanced", "professional"],
      default: "beginner",
    },
    genres: 
      {
        type: [String],
        default: [],
      },
    availability: [
      {
        type: String,
        default: "",
      },
    ],
    likedUsers: {
      type: [Schema.Types.ObjectId],
      ref: "User",
      default: [],
    },
    matchedUsers: {
      type: [Schema.Types.ObjectId],
      ref: "User",
      default: [],
    },
    skippedUsers: {
      type: [Schema.Types.ObjectId],
      ref: "User",
      default: [],
    },
    location: {
      type: String,
      required: true,
    },
    bio:{
      type:String,
      default:""
    },
    experience:{
      type:Number,
      min:0,
      max:50,
      default:3
    },
    age:{
      type:Number,
      default:14
    }
  },
  { timestamps: true },
);

export { userSchema };
