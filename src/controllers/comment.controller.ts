import { Request, Response } from "express";
import Comment, { IComment } from "../models/comment.model";
import Book from "../models/book.models"; // Kitap varlığını kontrol etmek için
import Notification from "../models/notification.model"; // Bildirim modeli eklendi
import User, { IUser } from "../models/user.model"; // Kullanıcı modeli ve IUser interface'i eklendi
import { io } from "../server"; // Socket.IO instance'ı eklendi

// Yeni yorum ekleme fonksiyonu
export const addComment = async (req: Request, res: Response): Promise<void> => {
   try {
      const { bookId, name, city, rating, comment, isAnonymous }: IComment = req.body;

      // Gerekli alanların kontrolü (rating ve comment modelde zorunlu)
      if (!bookId || !rating || !comment) {
         res.status(400).json({
            success: false,
            errorMessage: "MISSING_FIELDS", // Hata kodu eklendi
            message: "Kitap ID, puan ve yorum alanları zorunludur.",
         });
         return;
      }

      // Anonim değilse isim ve şehir kontrolü (isteğe bağlı, formda yapıldıysa burada tekrar kontrol edilebilir)
      if (!isAnonymous && (!name || !city)) {
         // İsim veya şehir eksikse ve anonim değilse hata döndür
         // Ancak formda bu kontrol yapıldığı için burası daha esnek olabilir.
         // Şimdilik sadece loglayalım veya isteğe bağlı olarak hata döndürelim.
         console.warn("Anonim olmayan yorumda isim veya şehir eksik olabilir:", { name, city });
         // res.status(400).json({ success: false, message: "Anonim olmayan yorumlar için isim ve şehir gereklidir." });
         // return;
      }

      // Kitap var mı kontrol et
      const bookExists = await Book.findById(bookId);
      if (!bookExists) {
         res.status(404).json({
            success: false,
            errorMessage: "BOOK_NOT_FOUND", // Hata kodu eklendi
            message: "Yorum yapılmak istenen kitap bulunamadı.",
         });
         return;
      }

      // Yorum verisini oluştur
      const commentData: Partial<IComment> = {
         bookId,
         rating,
         comment,
         isAnonymous,
      };

      // Anonim değilse isim ve şehri ekle
      if (!isAnonymous) {
         commentData.name = name;
         commentData.city = city;
      }

      const newComment = new Comment(commentData);
      await newComment.save();

      // --- Bildirim Oluşturma ve Gönderme Başlangıcı ---
      try {
         // Admin kullanıcıları bul
         const admins: IUser[] = await User.find({ role: "admin" }); // Rolün 'admin' olduğunu varsayıyoruz ve IUser[] tipi eklendi

         if (admins && admins.length > 0) {
            const notificationMessage = `Yeni bir yorum (${isAnonymous ? "Anonim" : name}) '${bookExists.title}' kitabı için onay bekliyor.`;
            const notificationLink = "/admin/comments"; // Admin yorumlar sayfasına link

            for (const admin of admins) {
               const newNotification = new Notification({
                  user: admin._id,
                  type: "comment",
                  message: notificationMessage,
                  link: notificationLink,
               });
               await newNotification.save();

               // Socket.IO ile admin'e özel bildirim gönder
               // Kullanıcının kendi ID'si ile oluşturulan bir odaya gönderim yapıyoruz.
               // Client tarafında da kullanıcı login olduğunda kendi ID'si ile odaya katılmalı.
               io.to(admin.id).emit("new_notification", newNotification); // admin._id.toString() yerine admin.id kullanıldı
            }
         }
      } catch (notificationError) {
         console.error("Bildirim oluşturma veya gönderme hatası:", notificationError);
         // Bildirim hatası ana işlemi etkilememeli, sadece loglanır.
      }
      // --- Bildirim Oluşturma ve Gönderme Sonu ---

      res.status(201).json({ success: true, message: "Yorum başarıyla eklendi.", data: newComment });
   } catch (error: any) {
      console.error("Yorum ekleme hatası:", error);
      // Mongoose validation hatası kontrolü
      if (error.name === "ValidationError") {
         const messages = Object.values(error.errors).map((el: any) => el.message);
         res.status(400).json({
            success: false,
            errorMessage: "VALIDATION_ERROR", // Hata kodu eklendi
            message: "Doğrulama hatası",
            errors: messages,
         });
      } else {
         res.status(500).json({
            success: false,
            errorMessage: "SERVER_ERROR", // Hata kodu eklendi
            message: "Yorum eklenirken bir sunucu hatası oluştu.",
         });
      }
   }
};

// Bekleyen yorumları getir
export const getPendingComments = async (req: Request, res: Response): Promise<void> => {
   try {
      // status'u 'pending' olan yorumları bul, en yeniden eskiye sırala
      const pendingComments = await Comment.find({ status: "pending" }).sort({ createdAt: -1 }).populate("bookId", "title"); // Kitap başlığını da alalım

      res.status(200).json({ success: true, data: pendingComments });
   } catch (error: any) {
      console.error("Bekleyen yorumları getirme hatası:", error);
      res.status(500).json({
         success: false,
         errorMessage: "SERVER_ERROR",
         message: "Bekleyen yorumlar getirilirken bir sunucu hatası oluştu.",
      });
   }
};

// Yorum durumunu güncelle (onayla/reddet)
export const updateCommentStatus = async (req: Request, res: Response): Promise<void> => {
   try {
      const { id } = req.params; // Yorum ID'si URL'den alınır
      const { status } = req.body; // Yeni durum (approved veya rejected) body'den alınır

      // Geçerli durum kontrolü
      if (!status || !["approved", "rejected"].includes(status)) {
         res.status(400).json({
            success: false,
            errorMessage: "INVALID_STATUS",
            message: "Geçersiz durum değeri. Durum 'approved' veya 'rejected' olmalıdır.",
         });
         return;
      }

      const updatedComment = await Comment.findByIdAndUpdate(id, { status }, { new: true }); // new: true güncellenmiş belgeyi döndürür

      if (!updatedComment) {
         res.status(404).json({
            success: false,
            errorMessage: "COMMENT_NOT_FOUND",
            message: "Güncellenecek yorum bulunamadı.",
         });
         return;
      }

      res.status(200).json({ success: true, message: `Yorum durumu başarıyla '${status}' olarak güncellendi.`, data: updatedComment });
   } catch (error: any) {
      console.error("Yorum durumu güncelleme hatası:", error);
      res.status(500).json({
         success: false,
         errorMessage: "SERVER_ERROR",
         message: "Yorum durumu güncellenirken bir sunucu hatası oluştu.",
      });
   }
};

// Bekleyen yorum sayısını getir
export const getPendingCommentCount = async (req: Request, res: Response): Promise<void> => {
   try {
      const count = await Comment.countDocuments({ status: "pending" });
      res.status(200).json({ success: true, data: { count } });
   } catch (error: any) {
      console.error("Bekleyen yorum sayısını getirme hatası:", error);
      res.status(500).json({
         success: false,
         errorMessage: "SERVER_ERROR",
         message: "Bekleyen yorum sayısı alınırken bir sunucu hatası oluştu.",
      });
   }
};

export const getComments = async (req: Request, res: Response): Promise<void> => {
   try {
      const comments = await Comment.find({ status: "approved" }).sort({ createdAt: -1 }).populate("bookId", "title");
      res.status(200).json({ success: true, data: comments });
   } catch (error) {
      console.log("Yorumları getirme hatası:", error);
      res.status(500).json({
         success: false,
         errorMessage: "SERVER_ERROR",
         message: "Yorumlar getirilirken bir sunucu hatası oluştu.",
      });
   }
};

export const getApprovedCommentsPiece = async (req: Request, res: Response): Promise<void> => {
   try {
      const comments = await Comment.countDocuments({ status: "approved" });

      res.status(200).json({
         success: true,
         data: comments,
      });
   } catch (error) {
      console.log("Onaylanmış yorumları getirme hatası:", error);
      res.status(500).json({
         success: false,
         errorMessage: "SERVER_ERROR",
         message: "Onaylanmış yorumlar getirilirken bir sunucu hatası oluştu.",
      });
   }
};
