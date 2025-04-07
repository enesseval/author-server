import express from "express";
import { createBook, getBooks, getBookById, getBooksPiece } from "../controllers/book.controller"; // Import getBookById

const router = express.Router();

router.post("/create-book", createBook);
router.get("/get-books", getBooks);
router.get("/get-book/:id", getBookById); // Add route for getting book by ID
router.get("/get-book-piece", getBooksPiece);

export default router;
