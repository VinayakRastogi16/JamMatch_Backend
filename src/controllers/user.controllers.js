import httpStatus from "http-status";
import bcrypt from "bcrypt";
import { User } from "../models/user.model.js";
import jwt from "jsonwebtoken"
import "dotenv/config";

if(!process.env.JWT_SECRET){
  throw new Error("JWT_SECRET not defined")
}

const login = async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: "Enter valid credentials" });
  }

  try {
    const user = await User.findOne({ username: username.trim().toLowerCase() });

    if (!user) {
      return res.status(httpStatus.NOT_FOUND).json({
        message: "User not found",
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(httpStatus.UNAUTHORIZED).json({
        message: "Invalid credentials",
      });
    }

    const token = jwt.sign({
        userId : user._id, username:user.username
      },process.env.JWT_SECRET,
      {expiresIn:"7d"}
    );

    return res.status(httpStatus.OK).json({ token, user:{
      id:user._id,
      username:user.username,
      email:user.email
    } });
  } catch (e) {
    console.log(e);
    return res.status(500).json({
      message: `Internal server error`,
    });

    
  }
};

const register = async (req, res) => {
  const { email, name, username, password } = req.body;

  if(!name||!username||!password || !email){
    return res.status(400).json({message:"Enter valid credentials"})
  }

  try {
    const existingUser = await User.findOne({ username : username.toLowerCase() });
    if (existingUser) {
      return res
        .status(httpStatus.CONFLICT)
        .json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
        email:email,
        name:name,
        username: username.trim().toLowerCase(),
        password: hashedPassword,
    });

    try {
      await newUser.save();
    } catch (err) {
      if (err.code === 11000) {
        return res.status(400).json({
          message: "Username already exists"
        });
      }
      throw err;
    }

    res.status(httpStatus.CREATED).json({message:"User Registered successfully"})
  } catch (e){
    console.log(e);
    return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({message:"Internal server error"})

    

  }
};

export {login, register};