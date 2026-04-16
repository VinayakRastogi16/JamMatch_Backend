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
        profileCompleted:user.profileCompleted
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
        profileCompleted:user.profileCompleted,
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
      location: "Mumbai",
      profileCompleted:false,
    });

    try {
      await newUser.save();
      const token = jwt.sign(
        {
          userId: newUser._id,
          username: newUser.username,
          profileCompleted:false,
        },
        process.env.JWT_SECRET,
        { expiresIn: "7d" },
      );

      return res.status(httpStatus.OK).json({
        token,
        user: {
          id: newUser._id,
          username: newUser.username,
          email: newUser.email,
          profileCompleted: false,
        },
      });
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
  const {
    instruments,
    skillLevel,
    genres,
    availability,
    bio,
    location,
    experience,
    age,
  } = req.body;
  console.log("Decoded user:", req.user);

  try {
    const updatedUser = await User.findByIdAndUpdate(
      req.user.userId,
      {
        instruments,
        skillLevel,
        genres,
        availability,
        bio,
        location,
        experience,
        age,
        profileCompleted:true
      },
      { new: true, runValidators: true },
    );

    return res.json({
      message: "Profile updated successfully",
      user: {
        id: updatedUser.id,
        username: updatedUser.username,
        instruments: updatedUser.instruments,
        skillLevel: updatedUser.skillLevel,
        genres: updatedUser.genres,
        availability: updatedUser.availability,
        age: updatedUser.age,
        location: updatedUser.location,
        profileCompleted: updatedUser.profileCompleted
      },
    });
  } catch (e) {
    console.error(e);
    return res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ message: "Internal server error" });
  }
};

const getMatches = async (req, res) => {
  try {
    const currUser = await User.findById(req.user.userId);

    if (!currUser) {
      return res.status(404).json({ message: "User not found!" });
    }

    // 🔒 Block if profile not completed
    if (!currUser.profileCompleted) {
      return res.status(403).json({ error: "profile_incomplete" });
    }

    if (!currUser) {
      return res
        .status(httpStatus.NOT_FOUND)
        .json({ message: "User not found!" });
    }

    const excludedUsers = [
      currUser._id,
      ...currUser.likedUsers,
      ...currUser.matchedUsers,
      ...currUser.skippedUsers,
    ];

    const users = await User.find({
      _id: { $nin: excludedUsers },
      instruments: { $exists: true, $not: { $size: 0 } },
      genres: { $exists: true, $not: { $size: 0 } },
    });

    const matches = users.map((user) => ({
      user: {
        id: user._id,
        name: user.name,
        username: user.username,
        instrument: user.instruments,
        skillLevel: user.skillLevel,
        genre: user.genres,
        availability: user.availability,
        location: user.location,
        age: user.age,
        experience: user.experience,
        bio: user.bio,
      },
      score: calculateScore(currUser, user),
    }));

    const filtered = matches.filter((m) => m.score > 25);

    filtered.sort((a, b) => b.score - a.score);
    console.log(filtered);

    return res.json(filtered.slice(0, 10));
  } catch (e) {
    console.error(e);
    return res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ message: "Internal Server Error" });
  }
};

const likeUser = async (req, res) => {
  const targetUserId = req.params.id;
  const currentUserId = req.user.userId;

  try {
    if (targetUserId === currentUserId) {
      return res.status(400).json({
        message: "You can't like yourself",
      });
    }

    const currentUser = await User.findById(currentUserId);
    const targetUser = await User.findById(targetUserId);

    if (!currentUser) {
      return res.status(404).json({
        message: "Current user not found",
      });
    }

    if (!targetUser) {
      return res.status(404).json({
        message: "Target user not found",
      });
    }

    currentUser.likedUsers = currentUser.likedUsers || [];
    currentUser.skippedUsers = currentUser.skippedUsers || [];

    targetUser.likedUsers = targetUser.likedUsers || [];
    targetUser.matchedUsers = targetUser.matchedUsers || [];

    currentUser.skippedUsers = currentUser.skippedUsers.filter(
      (id) => id.toString() !== targetUserId,
    );

    const alreadyLiked = currentUser.likedUsers.some(
      (id) => id.toString() === targetUserId,
    );

    if (!alreadyLiked) {
      currentUser.likedUsers.push(targetUserId);
    }

    let isMatch = false;

    const targetLikedYou = targetUser.likedUsers.some(
      (id) => id.toString() === currentUserId,
    );

    if (targetLikedYou) {
      isMatch = true;

      if (
        !currentUser.matchedUsers.some((id) => id.toString() === targetUserId)
      ) {
        currentUser.matchedUsers.push(targetUserId);
      }

      if (
        !targetUser.matchedUsers.some((id) => id.toString() === currentUserId)
      ) {
        targetUser.matchedUsers.push(currentUserId);
      }

      await targetUser.save();
    }

    await currentUser.save();

    return res.json({
      message: "User liked",
      match: isMatch,
    });
  } catch (e) {
    console.error(e);
    return res.status(500).json({
      message: "Internal Server Error",
    });
  }
};

const skipUsers = async (req, res) => {
  const targetUserId = req.params.id;
  const currUserId = req.user.userId;

  try {
    const user = await User.findById(currUserId);

    if (!user) {
      return res.status(httpStatus.NOT_FOUND).json({
        message: "User not found",
      });
    }

    user.skippedUsers = user.skippedUsers || [];
    user.likedUsers = user.likedUsers || [];
    user.matchedUsers = user.matchedUsers || [];

    user.likedUsers = user.likedUsers.filter(
      (id) => id.toString() !== targetUserId,
    );

    user.matchedUsers = user.matchedUsers.filter(
      (id) => id.toString() !== targetUserId,
    );

    const alreadySkipped = user.skippedUsers.some(
      (id) => id.toString() === targetUserId,
    );

    if (!alreadySkipped) {
      user.skippedUsers.push(targetUserId);
    }


    await user.save();

    return res.json({ message: "User skipped" });
  } catch (e) {
    console.error(e);
    return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
      message: "Internal Server Error",
    });
  }
};

const getNextUser = async (req, res) => {
  const currUserId = req.user.userId;

  try {
    const user = await User.findById(currUserId);

    if (!user) {
      return res.status(httpStatus.NOT_FOUND).json({
        message: "User not found",
      });
    }

    user.likedUsers = user.likedUsers || [];
    user.matchedUsers = user.matchedUsers || [];
    user.skippedUsers = user.skippedUsers || [];

    const excludeUsers = [
      ...user.likedUsers,
      ...user.matchedUsers,
      ...user.skippedUsers,
      user._id,
    ].filter((id) => id);

    const users = await User.find({
      _id: { $nin: excludeUsers },
      instruments: {$exists:true, $not: {$size:0}},
      genres: {$exists:true, $not: {$size:0}},
    });

    if (!users.length) {
      return res.status(404).json({ message: "No more users" });
    }

    const scoredUsers = users.map((u) => ({
      user: u,
      score: calculateScore(user, u),
    }));

    const filtered = scoredUsers.filter((u) => u.score > 30);

    filtered.sort((a, b) => b.score - a.score);

    const nextUser = filtered[0]?.user;

    if (!nextUser) {
      return res.json({ message: "No good matches" });
    }

    return res.json({
      user: {
        // score:scoredUsers[0].score,
        id: nextUser._id,
        username: nextUser.username,
        instrument: nextUser.instrument,
        skillLevel: nextUser.skillLevel,
        genre: nextUser.genre,
        availability: nextUser.availability,
      },
    });
  } catch (e) {
    console.error(e);
    return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
      message: "Internal Server Error",
    });
  }
};

const verifyMatch = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);

    const roomId = req.params.targetId;

    const [user1, user2] = roomId.split("_");

    const currentUserId = req.user.userId.toString();

    const otherUserId =
      currentUserId === user1 ? user2 : user1;

    const isMatched = user.matchedUsers.some(
      (id) => id.toString() === otherUserId
    );

    if (!isMatched) {
      return res.status(403).json({ message: "Not matched with this user." });
    }

    return res.json({ allowed: true });

  } catch (e) {
    console.error(e);
    return res.status(500).json({ message: "Server error" });
  }
};



export {
  login,
  register,
  details,
  getMatches,
  likeUser,
  skipUsers,
  getNextUser,
  verifyMatch
};
