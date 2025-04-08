import express, { Request, Response, NextFunction } from "express"; // NextFunction eklendi
import dotenv from "dotenv";
import connectDB from "./config/db";
import cors from "cors";
import cookieParser from "cookie-parser";
import userRoutes from "./routes/user.routes";
import authorRoutes from "./routes/author.routes";
import categoryRoutes from "./routes/category.routes";
import bookRoutes from "./routes/book.routes";
import commentRoutes from "./routes/comment.routes"; // Yorum route'ları import edildi
import notificationRoutes from "./routes/notification.routes"; // Bildirim rotaları eklendi
import http from "http"; // Eklendi
import { Server as SocketIOServer } from "socket.io"; // Eklendi

dotenv.config();

const port = 3001;

const app = express();

// HTTP Sunucusu Oluşturma
const httpServer = http.createServer(app); // Eklendi

// CORS Ayarları
const corsOptions = {
   origin: ["https://yazar.vercel.app/"], // Client adresleriniz
   credentials: true, // Cookie'lerin gönderilmesine izin ver
};

app.use(cors(corsOptions)); // Güncellendi
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true })); // Eklendi

// Socket.IO Sunucusu Oluşturma ve Ayarları
export const io = new SocketIOServer(httpServer, {
   // io dışa aktarıldı
   cors: corsOptions, // CORS ayarları kullanıldı
}); // Eklendi

// Socket.IO Bağlantı Yönetimi
io.on("connection", (socket) => {
   // Eklendi

   socket.on("disconnect", () => {});

   // İleride buraya kullanıcı bazlı odalara katılım (join) mantığı eklenebilir
   // socket.on('joinRoom', (userId) => {
   //   socket.join(userId);
   //   console.log(`Kullanıcı ${userId} odaya katıldı.`);
   // });
});

// API Rotaları
app.use("/api/auth", userRoutes); // authRoutes -> userRoutes olarak değiştirilebilir, kontrol et
app.use("/api/author", authorRoutes);
app.use("/api/books", bookRoutes);
app.use("/api/books/categories", categoryRoutes); // Bu route /api/categories olmalı gibi duruyor, kontrol et
app.use("/api/comments", commentRoutes); // Yorum route'ları eklendi
app.use("/api/notifications", notificationRoutes); // Bildirim rotaları eklendi

app.get("/", (req: Request, res: Response) => {
   res.send("Express + TypeScript Server"); // Mesaj güncellendi
});

// Hata Yönetimi Middleware Eklendi
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
   console.error(err.stack);
   res.status(500).send("Bir şeyler ters gitti!");
});

const startServer = async () => {
   try {
      await connectDB();

      // Sunucuyu HTTP sunucusu üzerinden başlatma
      httpServer.listen(port, () => {
         // app.listen yerine httpServer.listen kullanıldı
      });
   } catch (error) {
      console.error("Unable to connect to the database:", error);
   }
};

startServer();
