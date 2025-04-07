import mongoose, { Document, Schema } from "mongoose";

// Rozet arayüzü
interface IBadge {
   icon: string;
   text: string;
}

// Biyografi Paragrafları arayüzü
interface IBioParagraph {
   title: string;
   content: string;
}

// Profile için TypeScript arayüzü
export interface IProfile extends Document {
   authorName: string;
   title: string;
   titleIcon: string;
   shortBio: string;
   profileImageUrl: string;
   pageTitle: string;
   faviconUrl: string;
   showBadges: boolean;
   badges: IBadge[];
   longBio: string;
   useBioImage: boolean;
   bioImageUrl: string;
   useBioParagraphs: boolean;
   bioParagraphs: IBioParagraph[];
   createdAt: Date;
   updatedAt: Date;
}

// Badge şeması
const BadgeSchema = new Schema({
   icon: {
      type: String,
      default: "award",
   },
   text: {
      type: String,
      trim: true,
   },
});

// Biyografi paragrafları şeması
const BioParagraphSchema = new Schema({
   title: {
      type: String,
      required: [true, "Paragraf başlığı gereklidir"],
      trim: true,
      minlength: [2, "Başlık en az 2 karakter olmalıdır"],
   },
   content: {
      type: String,
      required: [true, "Paragraf içeriği gereklidir"],
      trim: true,
      minlength: [10, "İçerik en az 10 karakter olmalıdır"],
   },
});

// Profile şeması
const ProfileSchema = new Schema<IProfile>(
   {
      authorName: {
         type: String,
         required: [true, "Yazar adı gereklidir"],
         trim: true,
         minlength: [2, "Yazar adı en az 2 karakter olmalıdır"],
      },
      title: {
         type: String,
         required: [true, "Başlık gereklidir"],
         trim: true,
         minlength: [2, "Başlık en az 2 karakter olmalıdır"],
      },
      titleIcon: {
         type: String,
         default: "award",
      },
      shortBio: {
         type: String,
         required: [true, "Kısa açıklama gereklidir"],
         trim: true,
         maxlength: [200, "Kısa açıklama en fazla 200 karakter olabilir"],
      },
      profileImageUrl: {
         type: String,
         default: "",
      },
      pageTitle: {
         type: String,
         required: [true, "Sayfa başlığı gereklidir"],
         trim: true,
         minlength: [2, "Sayfa başlığı en az 2 karakter olmalıdır"],
      },
      faviconUrl: {
         type: String,
         default: "",
      },
      showBadges: {
         type: Boolean,
         default: false,
      },
      badges: {
         type: [BadgeSchema],
         default: [],
      },
      longBio: {
         type: String,
         required: [true, "Hakkımda metni gereklidir"],
         trim: true,
         minlength: [10, "Hakkımda metni en az 10 karakter olmalıdır"],
      },
      useBioImage: {
         type: Boolean,
         default: false,
      },
      bioImageUrl: {
         type: String,
         default: "",
      },
      useBioParagraphs: {
         type: Boolean,
         default: false,
      },
      bioParagraphs: {
         type: [BioParagraphSchema],
         default: [],
      },
   },
   {
      timestamps: true, // createdAt ve updatedAt alanlarını otomatik ekler
   }
);

// Model oluştur ve dışa aktar
const Profile = mongoose.models.Profile || mongoose.model<IProfile>("Profile", ProfileSchema);

export default Profile;
