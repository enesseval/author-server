import { Request, Response } from "express";
import User from "../models/user.model";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

export const checkUser = async (req: Request, res: Response): Promise<void> => {
   try {
      const userId = req.userId; // authenticateJWT middleware'inden geliyor
      const user = await User.findById(userId).select("-password -refreshToken");

      if (!user) {
         res.status(404).json({
            success: false,
            errorMessage: "USER_NOT_FOUND",
            message: "Kullanıcı bulunamadı",
         });
         return;
      }

      res.json({
         success: true,
         data: {
            id: user._id,
            username: user.username,
            role: user.role,
         },
      });
   } catch (error) {
      console.error("Check user error:", error);
      res.status(500).json({
         success: false,
         errorMessage: "SERVER_ERROR",
         message: "Kullanıcı bilgileri alınırken bir hata oluştu",
      });
   }
};

export const register = async (req: Request, res: Response): Promise<void> => {
   try {
      const { username, password, role } = req.body;

      // Gerekli alanların kontrolü
      if (!username || !password || !role) {
         res.status(400).json({
            errorMessage: "MISSING_FIELDS",
            message: "Kullanıcı adı, şifre ve rol zorunludur",
         });
         return;
      }

      // Rol kontrolü
      if (!["SUPER_ADMIN", "ADMIN"].includes(role)) {
         res.status(400).json({
            errorMessage: "INVALID_ROLE",
            message: "Geçersiz rol. Rol 'SUPER_ADMIN' veya 'ADMIN' olmalıdır",
         });
         return;
      }

      // Kullanıcı adı kontrolü
      const existingUser = await User.findOne({ username });
      if (existingUser) {
         res.status(400).json({
            errorMessage: "USERNAME_EXISTS",
            message: "Bu kullanıcı adı zaten kullanılıyor",
         });
         return;
      }

      // Şifreyi hashleme
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      // Yeni kullanıcı oluşturma
      const newUser = new User({
         username,
         password: hashedPassword,
         role,
      });

      await newUser.save();

      res.status(201).json({
         success: true,
         message: "Kullanıcı başarıyla oluşturuldu",
      });
   } catch (error) {
      console.error("Register error:", error);
      res.status(500).json({
         errorMessage: "SERVER_ERROR",
         message: "Kullanıcı oluşturulurken bir hata oluştu",
      });
   }
};

export const login = async (req: Request, res: Response): Promise<void> => {
   try {
      const { username, password } = req.body;

      // Gerekli alanların kontrolü
      if (!username || !password) {
         res.status(400).json({
            errorMessage: "MISSING_FIELDS",
            message: "Kullanıcı adı ve şifre zorunludur",
         });
         return;
      }

      // Kullanıcı kontrolü
      const user = await User.findOne({ username });
      if (!user) {
         res.status(401).json({
            errorMessage: "USER_NOT_FOUND",
            message: "Kullanıcı bulunamadı",
         });
         return;
      }

      // Şifre kontrolü
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
         res.status(401).json({
            errorMessage: "WRONG_PASSWORD",
            message: "Şifre hatalı",
         });
         return;
      }

      // Access Token oluşturma
      const accessToken = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET!, { expiresIn: "1h" });

      // Refresh Token oluşturma
      const refreshToken = jwt.sign({ id: user._id }, process.env.JWT_REFRESH_SECRET!, { expiresIn: "1d" });

      // Refresh token'ı veritabanına kaydetme
      user.refreshToken = refreshToken;
      await user.save();

      // Access token'ı cookie olarak gönderme
      // Domain'i kaldırdık, böylece tarayıcı isteğin yapıldığı host'u kullanır.
      // Bu, localhost, preview URL'leri ve production domain'inde çalışmayı sağlar.
      res.cookie("accessToken", accessToken, {
         httpOnly: true,
         // domain: "yazar.vercel.app", // Kaldırıldı
         secure: true, // Production'da HTTPS üzerinden çalışacağı için true kalmalı
         sameSite: "lax", // CSRF koruması için iyi bir başlangıç
         domain: ".vercel.app",
         path: "/",
         maxAge: 60 * 60 * 1000, // 1 saat
      });

      // Başarılı giriş yanıtı
      res.json({ success: true });
   } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({
         errorMessage: "SERVER_ERROR",
         message: "Beklenmeyen bir hata oluştu",
      });
   }
};

export const logout = async (req: Request, res: Response): Promise<void> => {
   try {
      const userId = req.userId;

      // Kullanıcının refresh token'ını temizle
      await User.findByIdAndUpdate(userId, { refreshToken: null });

      // Access token cookie'sini temizle
      res.clearCookie("accessToken", {
         httpOnly: true,
         secure: process.env.NODE_ENV === "production",
         sameSite: "strict",
      });

      res.json({
         success: true,
         message: "Başarıyla çıkış yapıldı",
      });
   } catch (error) {
      console.error("Logout error:", error);
      res.status(500).json({
         success: false,
         errorMessage: "SERVER_ERROR",
         message: "Çıkış yapılırken bir hata oluştu",
      });
   }
};

export const getUsers = async (req: Request, res: Response): Promise<void> => {
   try {
      const users = await User.find()
         .select("-password -refreshToken") // Hassas bilgileri hariç tut
         .sort({ _id: -1 }); // En yeni kullanıcılar önce gelsin

      res.json({
         success: true,
         data: users.map((user) => ({
            id: user._id,
            username: user.username,
            role: user.role,
         })),
      });
   } catch (error) {
      console.error("Get users error:", error);
      res.status(500).json({
         success: false,
         errorMessage: "SERVER_ERROR",
         message: "Kullanıcılar listelenirken bir hata oluştu",
      });
   }
};

export const updateUser = async (req: Request, res: Response): Promise<void> => {
   try {
      const { userId, username, role, oldPassword, newPassword } = req.body;

      // Kullanıcının mevcut bilgilerini al
      const user = await User.findById(userId);
      if (!user) {
         res.status(404).json({
            success: false,
            errorMessage: "USER_NOT_FOUND",
            message: "Kullanıcı bulunamadı",
         });
         return;
      }

      // Eğer yeni şifre varsa, eski şifre kontrolü
      if (newPassword) {
         const isPasswordValid = await bcrypt.compare(oldPassword, user.password);
         if (!isPasswordValid) {
            res.status(401).json({
               success: false,
               errorMessage: "WRONG_PASSWORD",
               message: "Eski şifre hatalı",
            });
            return;
         }

         // Yeni şifreyi hashle
         const salt = await bcrypt.genSalt(10);
         const hashedPassword = await bcrypt.hash(newPassword, salt);

         // Kullanıcı bilgilerini güncelle
         user.username = username;
         user.password = hashedPassword;
         user.role = role;

         await user.save();

         res.json({
            success: true,
            message: "Kullanıcı bilgileri başarıyla güncellendi",
         });
      } else {
         // Yeni şifre yoksa, sadece kullanıcı adı ve rolünü güncelle
         user.username = username;
         user.role = role;

         await user.save();

         res.json({
            success: true,
            message: "Kullanıcı bilgileri başarıyla güncellendi",
         });
      }
   } catch (error) {
      console.error("Update user error:", error);
      res.status(500).json({
         success: false,
         errorMessage: "SERVER_ERROR",
         message: "Kullanıcı bilgileri güncellenirken bir hata oluştu",
      });
   }
};

export const deleteUser = async (req: Request, res: Response): Promise<void> => {
   try {
      const { id } = req.params;

      await User.findByIdAndDelete(id);

      res.json({
         success: true,
         message: "Kullanıcı başarıyla silindi",
      });
   } catch (error) {
      console.error("Delete user error:", error);
      res.status(500).json({
         success: false,
         errorMessage: "SERVER_ERROR",
         message: "Kullanıcı silinirken bir hata oluştu",
      });
   }
};
