import express from "express";
import authenticateJWT from "../middleware/authenticateJWT";
import userRole from "../middleware/userRole";
import { checkUser, login, register, logout, getUsers, updateUser, deleteUser } from "../controllers/auth.controller";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.post("/logout", authenticateJWT, logout);

router.get("/check-user", authenticateJWT, checkUser);
router.get("/users", authenticateJWT, userRole, getUsers);

router.put("/users/:id", authenticateJWT, userRole, updateUser);

router.delete("/users/:id", authenticateJWT, userRole, deleteUser);

export default router;
