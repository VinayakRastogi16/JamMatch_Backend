import { Router } from "express";
import {
  login,
  register,
  details,
  getMatches,
  likeUser,
  skipUsers,
  getNextUser,
  verifyMatch,
  getMatchedUser, 
  getChatHistory
} from "../controllers/user.controllers.js";
import { verifyToken } from "../middlewares/verifyToken.middleware.js";

const router = Router();

router.route("/login").post(login);
router.route("/register").post(register);
router.put("/profile", verifyToken, details);
router.get("/matches", verifyToken, getMatches);
router.post("/like/:id", verifyToken, likeUser);
router.post("/skip/:id", verifyToken, skipUsers);
router.get("/feed", verifyToken, getNextUser);
router.get("/verify-match/:targetId", verifyToken, verifyMatch);
router.get("/matched-users", verifyToken, getMatchedUser);
router.get("/chat/:roomId", verifyToken, getChatHistory);

export default router;
