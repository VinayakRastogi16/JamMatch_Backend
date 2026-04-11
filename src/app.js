import express from "express";
import mongoose from "mongoose";
import bcrypt from "bcrypt";
import "dotenv/config";
import cors from "cors";
import { sample } from "./data/sampleData.js";
import router from "./routes/user.routes.js";
import { verifyToken } from "./middlewares/verifyToken.middleware.js";
import { User } from "./models/user.model.js";


const app = express();
const mongoUri =process.env.MONGO_URI;
const connectionDB = await mongoose.connect(mongoUri);

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

console.log(`MONGO connected DB Host: ${connectionDB.connection.host}`);

app.use("/api/v1/users", router);

app.get("/", (req, res) => {
  res.send("hello world");
});

app.get("/api/test", verifyToken, (req, res) => {
  res.json({
    message: "Access Granted",
    user: req.user,
  });
});

app.post("/sample", async (req, res)=>{
 await User.updateMany(
  {},
  {
    $set: {
      likedUsers: [],
      matchedUsers: []
    }
  }
);
});

export {app}
