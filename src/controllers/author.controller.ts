import { Request, Response } from "express";
import Profile, { IProfile } from "../models/author.model";

// Profil bilgilerini getirme
export const getProfile = async (req: Request, res: Response): Promise<void> => {
   try {
      // İlk kaydı al veya yeni bir profil oluştur
      let profile = await Profile.findOne();

      if (!profile) {
         res.status(404).json({
            success: false,
            errorMessage: "PROFILE_NOT_FOUND",
            message: "Profil bulunamadı",
         });
         return;
      }

      res.status(200).json({
         success: true,
         data: profile,
      });
   } catch (error: any) {
      console.error("Profil bilgileri alınırken hata:", error);
      res.status(500).json({
         success: false,
         errorMessage: "SERVER_ERROR",
         message: "Profil bilgileri alınamadı",
         details: error.message,
      });
   }
};

// Profil bilgilerini güncelleme veya oluşturma
export const updateProfile = async (req: Request, res: Response): Promise<void> => {
   try {
      const profileData = req.body;

      // Veri doğrulama: gerekli alanlar var mı?
      if (!profileData.authorName || !profileData.title || !profileData.shortBio || !profileData.longBio || !profileData.pageTitle) {
         res.status(400).json({
            success: false,
            errorMessage: "MISSING_REQUIRED_FIELDS",
            message: "Zorunlu alanlar eksik: Yazar adı, başlık, kısa açıklama, hakkımda metni ve sayfa başlığı gereklidir",
         });
         return;
      }

      // Profil var mı kontrol et
      let profile = await Profile.findOne();

      if (profile) {
         // Mevcut profili güncelle
         try {
            profile = await Profile.findByIdAndUpdate(profile._id, { ...profileData }, { new: true, runValidators: true });
         } catch (validationError: any) {
            // Eğer doğrulama hatası olduysa
            res.status(400).json({
               success: false,
               errorMessage: "VALIDATION_ERROR",
               message: "Profil bilgileri doğrulama hatası",
               details: validationError.message,
            });
            return;
         }
      } else {
         // Yeni profil oluştur
         try {
            profile = await Profile.create(profileData);
         } catch (validationError: any) {
            // Eğer doğrulama hatası olduysa
            res.status(400).json({
               success: false,
               errorMessage: "VALIDATION_ERROR",
               message: "Profil bilgileri doğrulama hatası",
               details: validationError.message,
            });
            return;
         }
      }

      res.status(200).json({
         success: true,
         data: profile,
         message: "Profil başarıyla güncellendi",
      });
   } catch (error: any) {
      console.error("Profil güncellenirken hata:", error);
      res.status(500).json({
         success: false,
         errorMessage: "SERVER_ERROR",
         message: "Profil güncellenemedi",
         details: error.message,
      });
   }
};
