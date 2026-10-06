import notificationSchema from "../schema/notification.schema.js";
import mongoose from "mongoose";

const Notification = mongoose.model("Notification", notificationSchema);

export default Notification;