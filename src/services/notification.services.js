import { User } from "../models/user.model.js";
import Notification from "../schema/notification.schema.js";
import { sendMatchEmail } from "./email.service.js";

const createNotification = async ({
  recipient,
  sender = null,
  type,
  title,
  message,
  relatedId = null,
}) => {
  try {
    const notification = await Notification.create({
      recipient,
      sender,
      type,
      title,
      message,
      relatedId,
    });

    if(type==="MATCH"){
        const recipientUser = await User.findById(recipient).select("email username notifications emailVerified");

        const senderUser = sender? await User.findById(sender).select("name username"):null;

        if(recipientUser?.notifications?.newMatches && recipientUser?.email && recipientUser?.emailVerified){
            try {
                await sendMatchEmail({
                    email: recipientUser.email,
                    username: recipientUser.username,
                    senderName:senderUser?.name||senderUser?.username || "your new match",
                })
                notification.emailSent = true;
                await notification.save();
            } catch (errorEmail) {
                console.error("Match email notification failed: ", errorEmail);
            }
        }
    }

    return notification;
  } catch (e) {
    console.error("Create Notification Error: ", e);
    throw e;
  }
};

export default createNotification;
