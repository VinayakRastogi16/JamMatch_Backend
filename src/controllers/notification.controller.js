import Notification from "../schema/notification.schema.js";

const getNotification = async (req, res)=>{
    try {

        const userId = req.user.userId;

        const notifications = await Notification.find({
            recipient:userId,
        })
        .populate("sender", "name username profilePicture")
        .sort({createdAt:-1});

        res.status(200).json({
            success:true,
            notifications
        })
        
    } catch (error) {
        console.error("Get notification error: ", error);
        res.status(500).json({
            success:false,
            message:"Failed to fetch notifications"
        })
    }
};

const markNotificationAsRead = async (req, res)=>{
    try {
        const userId = req.user.userId;
        const notificationId = req.params.id;

        const notification = await Notification.findOneAndUpdate({
            _id:notificationId,
            recipient:userId
        },{
            isRead:true
        },{
            returnDocument:"after"
        })

        if(!notification){
            return res.status(404).json({
                success:false,
                message:"Notification not found"
            });
        }

        res.status(200).json({
            success:true,
            notification
        });
    } catch (e) {
        console.error("Mark Notification Error: ", e);

        res.status(500).json({
            success:false,
            message:"Failed to update notification"
        })
    }
};

const createTestNotification = async (req, res) => {
    try {
        const userId = req.user.userId;

        const notification = await Notification.create({
            recipient: userId,
            sender: null,
            type: "SYSTEM",
            title: "Welcome to JamMatch!",
            message: "This is a test notification.",
            isRead: false,
        });

        res.status(201).json({
            success: true,
            notification,
        });

    } catch (error) {
        console.error("Create notification error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to create notification",
        });
    }
};

export {markNotificationAsRead, getNotification, createTestNotification};