import { Router } from "express";
import { 
  createUser, 
  getUsers, 
  getUserById, 
  deleteUser, 
  getUserStats,
  loginUser
} from "../controllers/userController";
import { validateRequest, createUserSchema } from "../middlewares/validation";

const router = Router();

router.get("/stats", getUserStats);
router.post("/", validateRequest(createUserSchema), createUser);
router.get("/", getUsers);
router.get("/:id", getUserById);
router.delete("/:id", deleteUser);
router.post("/login", loginUser);

export default router;