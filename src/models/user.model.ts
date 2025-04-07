import mongoose, { Schema, Document } from "mongoose";

export interface IUser extends Document {
   username: string;
   password: string;
   role: string;
   refreshToken: string | null;
}

const userSchema = new Schema<IUser>(
   {
      username: {
         type: String,
         required: [true, "Kullanıcı adı zorunludur"],
         unique: true,
         trim: true,
         minlength: [3, "Kullanıcı adı en az 3 karakter olmalıdır"],
      },
      password: {
         type: String,
         required: [true, "Şifre zorunludur"],
         minlength: [6, "Şifre en az 6 karakter olmalıdır"],
      },
      role: {
         type: String,
         enum: ["SUPER_ADMIN", "ADMIN"],
         default: "ADMIN",
      },
      refreshToken: {
         type: String,
         default: null,
      },
   },
   {
      timestamps: true,
   }
);

// Add any pre-save hooks if needed
userSchema.pre("save", async function (next) {
   // You can add password hashing here later
   next();
});

const User = mongoose.model<IUser>("User", userSchema);

export default User;
