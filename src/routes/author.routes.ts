import express from "express";
import { getProfile, updateProfile } from "../controllers/author.controller";

const router = express.Router();

// Profil bilgilerini getirme
router.get("/profile", getProfile);

// Profil bilgilerini güncelleme
router.put("/profile", updateProfile);

export default router;
