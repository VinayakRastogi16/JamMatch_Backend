import { User } from "../models/user.model.js";

const requireEmailVerification = async (req, res, next)=>{
    try{
         console.log("🔥 requireEmailVerification HIT");
        const user = await User.findById(req.user.userId);

        if(!user){
            return res.status(404).json({
                message:"User not found"
            });
        }

        if(!user.emailVerified){
            console.log("❌ EMAIL NOT VERIFIED");
            return res.status(403).json({
                message:"Please verify your email before accessing the feed",
                code:"EMAIL_NOT_VERIFIED"
            });
        }

        return next();
    }catch(e){
        console.error("Email verification middleware error: ",e);

        res.status(500).json({
            message:"Failed to verify email status"
        });
    }
};

export default requireEmailVerification;