import mongoose, { Document, Schema, Types } from "mongoose";

// Yorum belgesi için arayüz (Interface)
export interface IComment extends Document {
   bookId: Types.ObjectId;
   name?: string; // Anonim ise isteğe bağlı
   city?: string; // Anonim ise isteğe bağlı
   rating: number;
   comment: string;
   isAnonymous: boolean;
   status: "pending" | "approved" | "rejected"; // Durum alanı eklendi
   createdAt: Date;
   updatedAt: Date;
}

// Mongoose Şeması (Schema)
const CommentSchema: Schema = new Schema(
   {
      bookId: {
         type: Schema.Types.ObjectId,
         ref: "Book", // Book modeline referans
         required: [true, "Kitap ID'si gereklidir."],
      },
      name: {
         type: String,
         trim: true,
         // Anonim değilse gerekli olacak şekilde bir validation eklenebilir,
         // ancak bu genellikle controller seviyesinde kontrol edilir.
         // required: function(this: IComment) { return !this.isAnonymous; } // Bu şekilde de yapılabilir
      },
      city: {
         type: String,
         trim: true,
      },
      rating: {
         type: Number,
         required: [true, "Değerlendirme puanı gereklidir."],
         min: [0.5, "Puan en az 0.5 olmalıdır."],
         max: [5, "Puan en fazla 5 olmalıdır."],
      },
      comment: {
         type: String,
         required: [true, "Yorum metni gereklidir."],
         trim: true,
      },
      isAnonymous: {
         type: Boolean,
         default: false,
      },
      status: {
         type: String,
         enum: ["pending", "approved", "rejected"],
         default: "pending", // Varsayılan durum
      },
   },
   {
      timestamps: true, // createdAt ve updatedAt alanlarını otomatik ekler
      versionKey: false, // __v alanını kaldırır
   }
);

// Model Oluşturma ve İhraç Etme
const Comment = mongoose.model<IComment>("Comment", CommentSchema);

export default Comment;
