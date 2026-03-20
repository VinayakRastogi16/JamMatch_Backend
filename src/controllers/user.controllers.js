import httpStatus from "http-status";
import bcrypt from "bcrypt";
import { User } from "../models/user.model.js";
import jwt from "jsonwebtoken";
import "dotenv/config";
import { calculateScore } from "../matching/matching.score.js";

if (!process.env.JWT_SECRET) {
  throw new Error("JWT_SECRET not defined");
}

const login = async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: "Enter valid credentials" });
  }

  try {
    const user = await User.findOne({
      username: username.trim().toLowerCase(),
    });

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

    const token = jwt.sign(
      {
        userId: user._id,
        username: user.username,
      },
      process.env.JWT_SECRET,
      { expiresIn: "7d" },
    );

    return res.status(httpStatus.OK).json({
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
      },
    });
  } catch (e) {
    console.log(e);
    return res.status(500).json({
      message: `Internal server error`,
    });
  }
};

const register = async (req, res) => {
  const { email, name, username, password } = req.body;

  if (!name || !username || !password || !email) {
    return res.status(400).json({ message: "Enter valid credentials" });
  }

  try {
    const existingUser = await User.findOne({
      username: username.toLowerCase(),
    });
    if (existingUser) {
      return res
        .status(httpStatus.CONFLICT)
        .json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      email: email,
      name: name,
      username: username.trim().toLowerCase(),
      password: hashedPassword,
    });

    try {
      await newUser.save();
    } catch (err) {
      if (err.code === 11000) {
        return res.status(400).json({
          message: "Username already exists",
        });
      }
      throw err;
    }

    res
      .status(httpStatus.CREATED)
      .json({ message: "User Registered successfully" });
  } catch (e) {
    console.log(e);
    return res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ message: "Internal server error" });
  }
};

const details = async (req, res) => {
  const { instrument, skillLevel, genre, availability } = req.body;
  console.log("Decoded user:", req.user);

  try {
    const updatedUser = await User.findByIdAndUpdate(
      req.user.userId,
      {
        instrument,
        skillLevel,
        genre,
        availability,
      },
      { returnDocument:"after",
        runValidators: true
       },
    );

    return res.json({
      message: "Profile updated successfully",
      user: {
        id: updatedUser.id,
        username: updatedUser.username,
        instrument: updatedUser.instrument,
        skillLevel: updatedUser.skillLevel,
        genre: updatedUser.genre,
        availability: updatedUser.availability,
      },
    });
  } catch (e) {
    console.error(e);
    return res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ message: "Internal server error" });
  }
};

const getMatches = async (req, res)=>{
  try{
    const currUser = await User.findById(req.user.userId);

    const users = await User.find({
      _id:{$ne : currUser._id},
      instrument:{$ne: ""},
      genre: {$ne: ""}
    });

    const matches = users.map(user =>({
      user:{
        id:user._id,
        username: user.username,
        instrument:user.instrument,
        skillLevel:user.skillLevel,
        genre:user.genre
      },
      score: calculateScore(currUser, user)
    }));

    matches.sort((a,b)=> b.score - a.score);

    return res.json(matches)
  }catch(e){
    console.error(e);
    return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({message:"Internal Server Error"})
  }
}


export { login, register, details, getMatches };
