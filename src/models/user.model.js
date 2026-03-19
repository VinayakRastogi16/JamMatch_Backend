import mongoose from "mongoose";
import { userSchema } from "../schema/user.schema.js";

const User = mongoose.model("User", userSchema);

export {User};