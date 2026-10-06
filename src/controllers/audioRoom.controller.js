import httpStatus from "http-status";
import AudioRoom from "../models/audioRoom.model.js";
import crypto from "crypto";
import { error } from "console";

const generateJoinCode = () => {
  return `JM-${crypto.randomBytes(4).toString("hex").toUpperCase()}`;
};

const createAudioRoom = async (req, res) => {
  try {
    const { name, genre, maxParticipants } = req.body;

    if (!name || !genre) {
      return res.status(httpStatus.BAD_REQUEST).json({
        message: "Room name and genre are required!!",
      });
    }

    console.log("Creating Room for:", req.user.userId);
    const joinCode = generateJoinCode();

    const room = new AudioRoom({
      name: name.trim(),
      genre: genre.trim(),
      host: req.user.userId,
      joinCode,
      maxParticipants: maxParticipants || 8,
      participants: [req.user.userId],
    });

    await room.save();

    return res.status(httpStatus.CREATED).json({
      message: "Audio room created successfully",
      room,
    });
  } catch (e) {
    console.error(e);

    return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
      messgae: "Internal Server Error!!",
    });
  }
};

const joinAudioRoom = async (req, res) => {
  try {
    const { joinCode } = req.body;

    if (!joinCode) {
      return res.status(httpStatus.BAD_REQUEST).json({
        message: "Room code is required",
      });
    }

    const room = await AudioRoom.findOne({
      joinCode: joinCode.trim().toUpperCase(),
    });

    if (!room) {
      return res.status(httpStatus.NOT_FOUND).json({
        message: "Room not found",
      });
    }

    const alreadyJoined = room.participants.some(
      (id) => id.toString() === req.user.userId.toString(),
    );

    if (alreadyJoined) {
      return res
        .status(httpStatus.CONFLICT)
        .json({ message: "Already in room" });
    }

    if (room.participants.length >= room.maxParticipants) {
      return res.status(httpStatus.BAD_REQUEST).json({
        message: "Audio room is full",
      });
    }

    room.participants.push(req.user.userId);
    await room.save();

    return res.status(httpStatus.OK).json({
      message: "Audio room found",
      room,
    });
  } catch (e) {
    console.error(e);

    return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
      message: "Internal server error",
    });
  }
};

export { createAudioRoom, joinAudioRoom };
