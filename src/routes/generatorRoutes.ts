import { Router } from "express";
import { startGenerator, stopGenerator } from "../controllers/generatorController";

const router = Router();

router.post("/start", startGenerator);
router.post("/stop", stopGenerator);

export default router;