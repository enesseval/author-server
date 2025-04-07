import { Request, Response } from "express";
import Category from "../models/category.model";

/**
 * Tüm kategorileri getirir
 */
export const getCategories = async (req: Request, res: Response): Promise<void> => {
   try {
      const categories = await Category.find().sort({ name: 1 }); // Kategori adına göre alfabetik sıralama

      res.json({
         success: true,
         data: categories.map((category) => ({
            id: category._id,
            name: category.name,
            description: category.description,
            createdAt: category.createdAt,
            updatedAt: category.updatedAt,
         })),
      });
   } catch (error) {
      console.error("Get categories error:", error);
      res.status(500).json({
         success: false,
         error: "SERVER_ERROR",
         message: "Kategoriler listelenirken bir hata oluştu",
      });
   }
};

/**
 * ID'ye göre bir kategori getirir
 */
export const getCategoryById = async (req: Request, res: Response): Promise<void> => {
   try {
      const { id } = req.params;
      const category = await Category.findById(id);

      if (!category) {
         res.status(404).json({
            success: false,
            error: "CATEGORY_NOT_FOUND",
            message: "Kategori bulunamadı",
         });
         return;
      }

      res.json({
         success: true,
         data: {
            id: category._id,
            name: category.name,
            description: category.description,
            createdAt: category.createdAt,
            updatedAt: category.updatedAt,
         },
      });
   } catch (error) {
      console.error("Get category error:", error);
      res.status(500).json({
         success: false,
         error: "SERVER_ERROR",
         message: "Kategori bilgileri alınırken bir hata oluştu",
      });
   }
};

/**
 * Yeni bir kategori oluşturur
 */
export const createCategory = async (req: Request, res: Response): Promise<void> => {
   try {
      const { name, description } = req.body;

      // Gerekli alanların kontrolü
      if (!name) {
         res.status(400).json({
            success: false,
            error: "MISSING_FIELDS",
            message: "Kategori adı zorunludur",
         });
         return;
      }

      // Kategori adı kontrolü
      const existingCategory = await Category.findOne({ name });
      if (existingCategory) {
         res.status(400).json({
            success: false,
            error: "CATEGORY_EXISTS",
            message: "Bu kategori adı zaten kullanılıyor",
         });
         return;
      }

      // Yeni kategori oluşturma
      const newCategory = new Category({
         name,
         description,
      });

      await newCategory.save();

      res.status(201).json({
         success: true,
         message: "Kategori başarıyla oluşturuldu",
         data: {
            id: newCategory._id,
            name: newCategory.name,
            description: newCategory.description,
            createdAt: newCategory.createdAt,
            updatedAt: newCategory.updatedAt,
         },
      });
   } catch (error) {
      console.error("Create category error:", error);
      res.status(500).json({
         success: false,
         error: "SERVER_ERROR",
         message: "Kategori oluşturulurken bir hata oluştu",
      });
   }
};

/**
 * Mevcut bir kategoriyi günceller
 */
export const updateCategory = async (req: Request, res: Response): Promise<void> => {
   try {
      const { id } = req.params;
      const { name, description } = req.body;

      // Gerekli alanların kontrolü
      if (!name) {
         res.status(400).json({
            success: false,
            error: "MISSING_FIELDS",
            message: "Kategori adı zorunludur",
         });
         return;
      }

      // Kategorinin mevcut olup olmadığını kontrol et
      const category = await Category.findById(id);
      if (!category) {
         res.status(404).json({
            success: false,
            error: "CATEGORY_NOT_FOUND",
            message: "Kategori bulunamadı",
         });
         return;
      }

      // Eğer isim değiştiyse, yeni ismin benzersiz olduğunu kontrol et
      if (name !== category.name) {
         const existingCategory = await Category.findOne({ name });
         if (existingCategory) {
            res.status(400).json({
               success: false,
               error: "CATEGORY_EXISTS",
               message: "Bu kategori adı zaten kullanılıyor",
            });
            return;
         }
      }

      // Kategoriyi güncelle
      category.name = name;
      category.description = description;

      await category.save();

      res.json({
         success: true,
         message: "Kategori başarıyla güncellendi",
         data: {
            id: category._id,
            name: category.name,
            description: category.description,
            createdAt: category.createdAt,
            updatedAt: category.updatedAt,
         },
      });
   } catch (error) {
      console.error("Update category error:", error);
      res.status(500).json({
         success: false,
         error: "SERVER_ERROR",
         message: "Kategori güncellenirken bir hata oluştu",
      });
   }
};

/**
 * Bir kategoriyi siler
 */
export const deleteCategory = async (req: Request, res: Response): Promise<void> => {
   try {
      const { id } = req.params;

      // Kategorinin mevcut olup olmadığını kontrol et
      const category = await Category.findById(id);
      if (!category) {
         res.status(404).json({
            success: false,
            error: "CATEGORY_NOT_FOUND",
            message: "Kategori bulunamadı",
         });
         return;
      }

      // TODO: İleride kitaplar eklendiğinde, bu kategoriyi kullanan kitaplar varsa silme işlemi öncesi kontrol yapılabilir

      // Kategoriyi sil
      await Category.findByIdAndDelete(id);

      res.json({
         success: true,
         message: "Kategori başarıyla silindi",
      });
   } catch (error) {
      console.error("Delete category error:", error);
      res.status(500).json({
         success: false,
         error: "SERVER_ERROR",
         message: "Kategori silinirken bir hata oluştu",
      });
   }
};
