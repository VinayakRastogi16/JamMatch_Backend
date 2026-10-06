import mongoose from "mongoose";
import audioRoomSchema from "../schema/audioRoom.schema.js";

const AudioRoom = mongoose.model("AudioRoom", audioRoomSchema);

export default AudioRoom;