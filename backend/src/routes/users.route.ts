import express from "express";
import * as ControllersEngine from "@/controllers/users.controller";
import { multerMiddlewareImage } from "@/middleware/multer.middleware";

const router = express.Router();

router.get("/", ControllersEngine.get);
router.get("/:moduleId", ControllersEngine.getOne);
router.post("/", multerMiddlewareImage.fields([{ name: "photo", maxCount: 1 }]), ControllersEngine.create);
router.patch("/", multerMiddlewareImage.fields([{ name: "photo", maxCount: 1 }]), ControllersEngine.update);
router.delete("/", ControllersEngine.del);
router.delete("/bulk", ControllersEngine.bulkDel);

export default router;
