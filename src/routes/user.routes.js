import { Router } from "express";
import { login, register, details, getMatches, likeUser, skipUsers, getNextUser } from "../controllers/user.controllers.js";
import { verifyToken } from "../middlewares/verifyToken.middleware.js";

const router = Router()


router.route("/login").post(login);
router.route("/register").post(register);
router.put("/profile", verifyToken, details);
router.get("/matches", verifyToken, getMatches)
router.post("/like/:id", verifyToken, likeUser)
router.post("/skip/:id", verifyToken, skipUsers)
router.get("/feed", verifyToken, getNextUser)

export default router;