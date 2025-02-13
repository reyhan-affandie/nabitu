import express from "express";
import * as ControllersEngine from "@/controllers/invoices.controller";

const router = express.Router();

router.get("/", ControllersEngine.get);
router.get("/:moduleId", ControllersEngine.getOne);
router.post("/", ControllersEngine.create);
router.patch("/", ControllersEngine.update);
router.delete("/", ControllersEngine.del);
router.delete("/bulk", ControllersEngine.bulkDel);

export default router;
