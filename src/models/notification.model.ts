import mongoose, { Schema, Document, Types } from "mongoose";

export interface INotification extends Document {
   user: Types.ObjectId; // Bildirimin gönderileceği kullanıcı ID'si
   type: "comment" | "event" | "system"; // Bildirim türü (genişletilebilir)
   message: string; // Bildirim mesajı
   link?: string; // Bildirimle ilgili sayfaya yönlendirme linki (opsiyonel)
   isRead: boolean; // Okundu bilgisi
   createdAt: Date;
}

const NotificationSchema: Schema = new Schema(
   {
      user: {
         type: Schema.Types.ObjectId,
         ref: "User", // User modeline referans
         required: true,
      },
      type: {
         type: String,
         enum: ["comment", "event", "system"], // İleride yeni türler eklenebilir
         required: true,
      },
      message: {
         type: String,
         required: true,
      },
      link: {
         type: String,
      },
      isRead: {
         type: Boolean,
         default: false,
      },
   },
   {
      timestamps: true, // createdAt ve updatedAt alanlarını otomatik ekler
   }
);

export default mongoose.model<INotification>("Notification", NotificationSchema);
