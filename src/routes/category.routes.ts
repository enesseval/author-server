import express from "express";
import authenticateJWT from "../middleware/authenticateJWT";
import userRole from "../middleware/userRole";
import { getCategories, getCategoryById, createCategory, updateCategory, deleteCategory } from "../controllers/category.controller";

const router = express.Router();

// Kategori listeleme (herkes erişebilir)
router.get("/", getCategories);

// Kategori detayı (herkes erişebilir)
router.get("/:id", getCategoryById);

// Kategori ekleme, güncelleme ve silme için auth ve admin gerekli
router.post("/", authenticateJWT, userRole, createCategory);
router.put("/:id", authenticateJWT, userRole, updateCategory);
router.delete("/:id", authenticateJWT, userRole, deleteCategory);

export default router;
