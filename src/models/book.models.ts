import mongoose, { Schema, Document } from "mongoose";

// Ödül şeması
const AwardSchema = new Schema(
   {
      name: { type: String, required: true },
      year: { type: String },
   },
   { _id: true }
);

// Satın alma linki şeması
const BuyLinkSchema = new Schema(
   {
      name: { type: String, required: true },
      url: { type: String, required: true },
   },
   { _id: true }
);

// Kullanıcı değerlendirmesi için şema
const RatingSchema = new Schema(
   {
      userId: {
         type: Schema.Types.ObjectId,
         ref: "User",
         required: true,
      },
      rating: {
         type: Number,
         required: true,
         min: [1, "Puan 1'den küçük olamaz"],
         max: [5, "Puan 5'ten büyük olamaz"],
      },
      createdAt: {
         type: Date,
         default: Date.now,
      },
   },
   { _id: true }
);

// Kitap şeması
const BookSchema = new Schema(
   {
      title: {
         type: String,
         required: [true, "Kitap adı zorunludur"],
         minlength: [2, "Kitap adı en az 2 karakter olmalıdır"],
      },
      category: {
         type: Schema.Types.ObjectId,
         ref: "Category",
         required: [true, "Kategori seçilmelidir"],
      },
      year: { type: String },
      description: {
         type: String,
         required: [true, "Kısa açıklama zorunludur"],
         maxlength: [150, "Kısa açıklama en fazla 150 karakter olmalıdır"],
      },
      longDescription: { type: String },
      pages: { type: Number },
      publisher: { type: String },
      isbn: { type: String },
      status: {
         type: String,
         enum: ["draft", "published", "upcoming"],
         required: [true, "Durum seçilmelidir"],
         default: "draft",
      },
      coverImageUrl: {
         type: String,
         required: [true, "Kapak görseli zorunludur"],
      },
      additionalImages: [{ type: String }],
      awards: [AwardSchema],
      buyLinks: [BuyLinkSchema],
      seoTitle: { type: String },
      seoDescription: {
         type: String,
         maxlength: [160, "SEO açıklaması en fazla 160 karakter olmalıdır"],
      },
      seoKeywords: { type: String },
      ratings: [RatingSchema],
      averageRating: {
         type: Number,
         default: 0,
         min: 0,
         max: 5,
      },
      totalRatings: {
         type: Number,
         default: 0,
      },
   },
   {
      timestamps: true, // createdAt ve updatedAt alanlarını otomatik ekler
   }
);

// Virtuals
BookSchema.virtual("categoryInfo", {
   ref: "Category",
   localField: "category",
   foreignField: "_id",
   justOne: true,
});

// Interface for Book Document
export interface IBook extends Document {
   title: string;
   category: mongoose.Types.ObjectId;
   year?: string;
   description: string;
   longDescription?: string;
   pages?: number;
   publisher?: string;
   isbn?: string;
   status: "draft" | "published" | "upcoming";
   coverImageUrl: string;
   additionalImages?: string[];
   awards?: {
      name: string;
      year?: string;
   }[];
   buyLinks?: {
      name: string;
      url: string;
   }[];
   seoTitle?: string;
   seoDescription?: string;
   seoKeywords?: string;
   ratings?: {
      userId: mongoose.Types.ObjectId;
      rating: number;
      createdAt: Date;
   }[];
   averageRating: number;
   totalRatings: number;
   createdAt: Date;
   updatedAt: Date;
}

// Model oluşturma
const Book = mongoose.model<IBook>("Book", BookSchema);

export default Book;
