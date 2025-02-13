import express from "express";
import * as ControllersEngine from "@/controllers/auth.controller";
import { isAuth } from "@/middleware/auth.middleware";
import { multerMiddlewareImage } from "@/middleware/multer.middleware";

const router = express.Router();

router.post("/register", multerMiddlewareImage.single("photo"), ControllersEngine.register);
router.post("/email/verify", ControllersEngine.sendVerifyEmail);
router.patch("/email", isAuth, ControllersEngine.verifyEmail);
router.post("/login", ControllersEngine.login);
router.post("/password/verify", ControllersEngine.sendForgotPasswordEmail);
router.patch("/password/forgot/", isAuth, ControllersEngine.forgotPassword);
router.patch("/password/update/", isAuth, ControllersEngine.updatePassword);
router.get("/", isAuth, ControllersEngine.get);
router.get("/refresh", isAuth, ControllersEngine.refresh);
router.get("/logout", isAuth, ControllersEngine.logout);

export default router;
