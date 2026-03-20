import { Router } from "express";
import { login, register, details, getMatches } from "../controllers/user.controllers.js";
import { verifyToken } from "../middlewares/verifyToken.middleware.js";

const router = Router()


router.route("/login").post(login);
router.route("/register").post(register);
router.put("/profile", verifyToken, details);
router.get("/matches", verifyToken, getMatches)


export default router;