import express from "express";
import {
   getNotifications,
   markNotificationAsRead,
   markAllNotificationsAsRead,
   getUnreadNotificationCount, // Yeni eklendi
} from "../controllers/notification.controller"; // Controller dosyasını birazdan oluşturacağız
import authenticateJWT from "../middleware/authenticateJWT"; // Kullanıcı kimliğini doğrulamak için

const router = express.Router();

// Kullanıcının tüm bildirimlerini getir (authenticateJWT ile kullanıcıyı alırız)
router.get("/", authenticateJWT, getNotifications);

// Okunmamış bildirim sayısını getir
router.get("/unread-count", authenticateJWT, getUnreadNotificationCount); // Yeni eklendi

// Tek bir bildirimi okundu olarak işaretle
router.patch("/:id/read", authenticateJWT, markNotificationAsRead);

// Tüm bildirimleri okundu olarak işaretle
router.patch("/read-all", authenticateJWT, markAllNotificationsAsRead);

export default router;
