import { Router } from "express";
import { login, register } from "../controllers/user.controllers.js";

const router = Router()


router.route("/login").post(login);
router.route("/register").post(register);


export default router;