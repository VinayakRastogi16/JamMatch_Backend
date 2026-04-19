import mongoose from 'mongoose';
import messageSchema from '../schema/messages.schema.js';

const Message = mongoose.model("Message", messageSchema);

export {Message}