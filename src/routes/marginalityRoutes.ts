import { Router } from "express";
import { 
  createTest, 
  getTests, 
  getTestById, 
  deleteTest,
  submitResponse,
  getResponses 
} from "../controllers/marginalityController";
import { validateRequest, createMarginalityTestSchema, submitResponseSchema } from "../middlewares/validation";

const router = Router();

router.get("/responses", getResponses);
router.post("/responses", validateRequest(submitResponseSchema), submitResponse);

router.get("/", getTests);
router.post("/", validateRequest(createMarginalityTestSchema), createTest);
router.get("/:id", getTestById);
router.delete("/:id", deleteTest);

export default router;