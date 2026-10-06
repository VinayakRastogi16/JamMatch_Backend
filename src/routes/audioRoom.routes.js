import express from "express";
import { verifyToken } from "../middlewares/verifyToken.middleware.js";
import { createAudioRoom, joinAudioRoom } from "../controllers/audioRoom.controller.js";

const router = express.Router();

router.post("/", verifyToken, createAudioRoom);
router.post("/join", verifyToken, joinAudioRoom);

export default router;