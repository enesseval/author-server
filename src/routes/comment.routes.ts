import express from "express";
import { addComment, getPendingComments, updateCommentStatus, getPendingCommentCount, getComments, getApprovedCommentsPiece } from "../controllers/comment.controller";
import authenticateJWT from "../middleware/authenticateJWT"; // Default import olarak düzeltildi
import isAdmin from "../middleware/userRole"; // Default import olarak düzeltildi

const router = express.Router();

// --- Public Routes ---
// POST /api/comments - Yeni yorum ekleme (Herkes ekleyebilir)
router.post("/", addComment);

router.get("/approved", getComments);

// --- Admin Routes ---
// GET /api/comments/pending - Bekleyen yorumları listele (Admin Gerekli)
router.get("/pending", authenticateJWT, isAdmin, getPendingComments);

// PUT /api/comments/:id/status - Yorum durumunu güncelle (Admin Gerekli)
router.put("/:id/status", authenticateJWT, isAdmin, updateCommentStatus);

// GET /api/comments/pending/count - Bekleyen yorum sayısını getir (Admin Gerekli)
router.get("/pending/count", authenticateJWT, isAdmin, getPendingCommentCount);

router.get("/approved/piece", getApprovedCommentsPiece);

export default router;
