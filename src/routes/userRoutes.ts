import { Router } from "express";
import { 
  createUser, 
  getUsers, 
  getUserById, 
  deleteUser, 
  getUserStats,
  loginUser,
  getObservationList,
  verify2FA,
  requestPasswordReset,
  resetPassword
} from "../controllers/userController";
import { validateRequest, createUserSchema } from "../middlewares/validation";

const router = Router();

router.post("/login", loginUser);
router.post("/verify-2fa", verify2FA);
router.post("/request-password-reset", requestPasswordReset);
router.post("/reset-password", resetPassword);

router.get("/observations", getObservationList);
router.get("/stats", getUserStats);
router.post("/", validateRequest(createUserSchema), createUser);
router.get("/", getUsers);
router.get("/:id", getUserById);
router.delete("/:id", deleteUser);

export default router;