import { Router } from "express";
import { 
  createUser, 
  getUsers, 
  getUserById, 
  deleteUser, 
  getUserStats,
  loginUser,
  getObservationList
} from "../controllers/userController";
import { validateRequest, createUserSchema } from "../middlewares/validation";

const router = Router();

router.post("/login", loginUser);
router.get("/observations", getObservationList);
router.get("/stats", getUserStats);
router.post("/", validateRequest(createUserSchema), createUser);
router.get("/", getUsers);
router.get("/:id", getUserById);
router.delete("/:id", deleteUser);

export default router;