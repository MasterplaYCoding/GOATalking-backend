import { Router } from "express";
import { 
  createPoll, 
  getPolls, 
  getPollById, 
  deletePoll, 
  getPollStats,
  updatePoll,
  getPollsByUser,
  voteOnPoll
} from "../controllers/pollController";
import { validateRequest, createPollSchema } from "../middlewares/validation";
import { authMiddleware } from "../middlewares/authMiddleware";

const router = Router();

router.get("/stats", getPollStats);
router.get("/user/:userId", getPollsByUser);
router.get("/", getPolls);
router.get("/:id", getPollById);

router.post("/", authMiddleware, validateRequest(createPollSchema), createPoll);
router.put("/:id", authMiddleware, updatePoll);
router.delete("/:id", authMiddleware, deletePoll);
router.post("/vote", authMiddleware, voteOnPoll);

export default router;