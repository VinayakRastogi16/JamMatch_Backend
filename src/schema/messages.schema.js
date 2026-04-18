import mongoose, {Schema} from "mongoose";

const messageSchema = new Schema({
  roomId: { type: String, required: true },
  senderId: { type: String, required: true },
  text: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

export default messageSchema;