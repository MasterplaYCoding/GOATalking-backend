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

const router = Router();

router.get("/stats", getPollStats);
router.get("/user/:userId", getPollsByUser);

router.post("/", validateRequest(createPollSchema), createPoll);
router.get("/", getPolls);
router.get("/:id", getPollById);
router.put("/:id", updatePoll);
router.delete("/:id", deletePoll);
router.post("/vote", voteOnPoll);

export default router;