import { Request, Response } from "express";
import Notification from "../models/notification.model";
import mongoose from "mongoose";

// Kullanıcının bildirimlerini getir
export const getNotifications = async (req: Request, res: Response): Promise<void> => {
   try {
      // authenticateJWT middleware'i req.user.id'yi ekler
      const userId = req.user?.id;
      if (!userId) {
         res.status(401).json({ success: false, message: "Yetkisiz erişim." });
         return;
      }

      // Kullanıcıya ait bildirimleri en yeniden eskiye doğru sırala
      const notifications = await Notification.find({ user: userId }).sort({ createdAt: -1 });

      res.status(200).json({ success: true, data: notifications });
   } catch (error: any) {
      console.error("Bildirimleri getirme hatası:", error);
      res.status(500).json({
         success: false,
         errorMessage: "SERVER_ERROR",
         message: "Bildirimler getirilirken bir sunucu hatası oluştu.",
      });
   }
};

// Okunmamış bildirim sayısını getir
export const getUnreadNotificationCount = async (req: Request, res: Response): Promise<void> => {
   try {
      const userId = req.user?.id;
      if (!userId) {
         res.status(401).json({ success: false, message: "Yetkisiz erişim." });
         return;
      }

      const count = await Notification.countDocuments({ user: userId, isRead: false });

      res.status(200).json({ success: true, data: { count } });
   } catch (error: any) {
      console.error("Okunmamış bildirim sayısını getirme hatası:", error);
      res.status(500).json({
         success: false,
         errorMessage: "SERVER_ERROR",
         message: "Okunmamış bildirim sayısı alınırken bir sunucu hatası oluştu.",
      });
   }
};

// Tek bir bildirimi okundu olarak işaretle
export const markNotificationAsRead = async (req: Request, res: Response): Promise<void> => {
   try {
      const userId = req.user?.id;
      const { id: notificationId } = req.params; // Route'dan gelen bildirim ID'si

      if (!userId) {
         res.status(401).json({ success: false, message: "Yetkisiz erişim." });
         return;
      }

      if (!mongoose.Types.ObjectId.isValid(notificationId)) {
         res.status(400).json({ success: false, message: "Geçersiz bildirim ID'si." });
         return;
      }

      // Bildirimi bul ve sadece o kullanıcıya aitse güncelle
      const updatedNotification = await Notification.findOneAndUpdate(
         { _id: notificationId, user: userId }, // Hem ID hem kullanıcı eşleşmeli
         { isRead: true },
         { new: true } // Güncellenmiş belgeyi döndür
      );

      if (!updatedNotification) {
         res.status(404).json({
            success: false,
            errorMessage: "NOTIFICATION_NOT_FOUND",
            message: "Bildirim bulunamadı veya bu kullanıcıya ait değil.",
         });
         return;
      }

      res.status(200).json({ success: true, message: "Bildirim okundu olarak işaretlendi.", data: updatedNotification });
   } catch (error: any) {
      console.error("Bildirim okundu işaretleme hatası:", error);
      res.status(500).json({
         success: false,
         errorMessage: "SERVER_ERROR",
         message: "Bildirim okundu olarak işaretlenirken bir sunucu hatası oluştu.",
      });
   }
};

// Tüm bildirimleri okundu olarak işaretle
export const markAllNotificationsAsRead = async (req: Request, res: Response): Promise<void> => {
   try {
      const userId = req.user?.id;
      if (!userId) {
         res.status(401).json({ success: false, message: "Yetkisiz erişim." });
         return;
      }

      // Kullanıcıya ait okunmamış tüm bildirimleri bul ve güncelle
      const result = await Notification.updateMany(
         { user: userId, isRead: false }, // Sadece okunmamışları güncelle
         { isRead: true }
      );

      res.status(200).json({ success: true, message: `${result.modifiedCount} bildirim okundu olarak işaretlendi.` });
   } catch (error: any) {
      console.error("Tüm bildirimleri okundu işaretleme hatası:", error);
      res.status(500).json({
         success: false,
         errorMessage: "SERVER_ERROR",
         message: "Tüm bildirimler okundu olarak işaretlenirken bir sunucu hatası oluştu.",
      });
   }
};
