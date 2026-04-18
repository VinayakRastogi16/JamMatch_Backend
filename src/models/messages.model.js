import mongoose from "mongoose";
import messageSchema from "../schema/messages.schema.js";

export const Message = mongoose.model("Message", messageSchema);