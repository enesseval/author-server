import { RequestHandler } from "express";
import Book from "../models/book.models";

export const createBook: RequestHandler = async (req, res) => {
   try {
      const bookData = req.body;

      // Yeni kitap oluştur
      const book = new Book({
         title: bookData.title,
         category: bookData.categoryId,
         year: bookData.year || undefined,
         description: bookData.description,
         longDescription: bookData.longDescription || undefined,
         pages: bookData.pages || undefined,
         publisher: bookData.publisher || undefined,
         isbn: bookData.isbn || undefined,
         status: bookData.status,
         coverImageUrl: bookData.coverImageUrl,
         additionalImages: bookData.additionalImages || [],
         awards: bookData.awards || [],
         buyLinks: bookData.buyLinks || [],
         seoTitle: bookData.seoTitle || undefined,
         seoDescription: bookData.seoDescription || undefined,
         seoKeywords: bookData.seoKeywords || undefined,
      });

      // Veritabanına kaydet
      const savedBook = await book.save();

      // Kategori bilgisini populate et
      const populatedBook = await savedBook.populate("category");

      res.status(201).json({
         success: true,
         message: "Kitap başarıyla kaydedildi",
         data: populatedBook,
      });
   } catch (error: any) {
      console.error("Create book error:", error);

      if (error.name === "ValidationError") {
         const validationErrors = Object.values(error.errors).map((err: any) => err.message);
         res.status(400).json({
            success: false,
            errorMessage: "VALIDATION_ERROR",
            message: validationErrors.join(", "),
         });
         return;
      }

      res.status(500).json({
         success: false,
         errorMessage: "SERVER_ERROR",
         message: "Kitap kaydedilirken bir hata oluştu",
      });
   }
};

export const getBookById: RequestHandler = async (req, res) => {
   try {
      const { id } = req.params;

      // ID'ye göre kitabı bul ve kategori bilgisini populate et
      const book = await Book.findById(id).populate("category");

      if (!book) {
         res.status(404).json({
            success: false,
            errorMessage: "NOT_FOUND",
            message: "Kitap bulunamadı",
         });
      }

      res.json({
         success: true,
         data: book,
      });
   } catch (error) {
      console.error("Get book by ID error:", error);
      // Eğer ID formatı geçersizse Mongoose CastError fırlatır
      if (error instanceof Error && error.name === "CastError") {
         res.status(400).json({
            success: false,
            errorMessage: "INVALID_ID",
            message: "Geçersiz kitap ID formatı",
         });
      }
      res.status(500).json({
         success: false,
         errorMessage: "SERVER_ERROR",
         message: "Kitap alınırken bir hata oluştu",
      });
   }
};

export const getBooks: RequestHandler = async (req, res) => {
   try {
      const { categoryId, limit } = req.query;

      // Query oluştur
      let query: any = {};

      // Eğer categoryId varsa, query'e ekle
      if (categoryId) {
         query.category = categoryId;
      }

      // Limit değerini parse et
      const limitValue = limit ? parseInt(limit as string, 10) : undefined;

      // Kategori bilgisiyle birlikte kitapları getir, oluşturulma tarihine göre sırala ve limit uygula
      let bookQuery = Book.find(query).sort({ createdAt: -1 }).populate("category");

      if (limitValue && limitValue > 0) {
         bookQuery = bookQuery.limit(limitValue);
      }

      const books = await bookQuery.exec();

      res.json({
         success: true,
         data: books,
      });
   } catch (error) {
      console.error("Get books error:", error);
      res.status(500).json({
         success: false,
         errorMessage: "SERVER_ERROR",
         message: "Kitaplar alınırken bir hata oluştu",
      });
   }
};

export const getBooksPiece: RequestHandler = async (req, res) => {
   try {
      const books = await Book.find({});
      const booksPiece = books.length;
      res.status(200).json({
         success: true,
         data: booksPiece,
      });
   } catch (error) {
      console.log("Kitap sayısı alınırken bir hata oluştu:", error);
      res.status(500).json({
         success: false,
         errorMessage: "SERVER_ERROR",
         message: "Kitap sayısı alınırken bir hata oluştu",
      });
   }
};
