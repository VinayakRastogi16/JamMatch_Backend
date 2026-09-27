import { Router } from "express";
import {
  login,
  register,
  verifyEmail,
  details,
  getMatches,
  likeUser,
  skipUsers,
  getNextUser,
  verifyMatch,
  getMatchedUser, 
  resendVerificationEmail,
  getChatHistory
} from "../controllers/user.controllers.js";
import { verifyToken } from "../middlewares/verifyToken.middleware.js";
import requireEmailVerification from '../middlewares/requireEmailVerification.middleware.js';

const router = Router();

router.route("/login").post(login);
router.route("/register").post(register);
router.get("/verify-email/:token", verifyEmail);
router.post("/resend-verification", resendVerificationEmail);
router.put("/profile", verifyToken, details);
router.get("/matches", verifyToken, requireEmailVerification, getMatches);
router.post("/like/:id", verifyToken, requireEmailVerification, likeUser);
router.post("/skip/:id", verifyToken, requireEmailVerification, skipUsers);
router.get("/feed", verifyToken, requireEmailVerification,  getNextUser);
router.get("/verify-match/:targetId", verifyToken, requireEmailVerification, verifyMatch);
router.get("/matched-users", verifyToken, requireEmailVerification, getMatchedUser);
router.get("/chat/:roomId", verifyToken, requireEmailVerification, getChatHistory);

export default router;
