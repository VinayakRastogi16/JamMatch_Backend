import jwt from 'jsonwebtoken';
import httpStatus from 'http-status';
import "dotenv/config"

const verifyToken = (req,res,next)=>{
    const token = req.headers.authorization;

    if(!token){
        return res.status(httpStatus.UNAUTHORIZED).json({message:"No token provided"})
    }

    try{
        const decoded = jwt.verify(token, process.env.JWT_SECRET)
        req.user = decoded;
        next();
    }catch(e){
    
        return res.status(httpStatus.BAD_REQUEST).json({message:"Invalid token"});
    }

};

export {verifyToken};