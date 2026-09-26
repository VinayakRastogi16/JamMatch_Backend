import Notification from "../schema/notification.schema.js";

const createNotification = async ({recipient, sender = null, type, title, message, relatedId = null})=>{
    try{
        const notification = await Notification.create({
            recipient, sender, type, title, message, relatedId
        });

        return notification;
    }catch(e){
        console.error("Create Notification Error: " , e);
        throw e;
    }
}

export default createNotification;