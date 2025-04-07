import mongoose, { Schema, Document } from "mongoose";

export interface ICategory extends Document {
   name: string;
   description?: string;
   createdAt: Date;
   updatedAt: Date;
}

const categorySchema = new Schema<ICategory>(
   {
      name: {
         type: String,
         required: [true, "Kategori adı zorunludur"],
         unique: true,
         trim: true,
         minlength: [2, "Kategori adı en az 2 karakter olmalıdır"],
      },
      description: {
         type: String,
         trim: true,
         required: false,
      },
   },
   {
      timestamps: true,
   }
);

// Add any pre-save hooks if needed
categorySchema.pre("save", async function (next) {
   // You can add validation or transformation logic here if needed
   next();
});

const Category = mongoose.model<ICategory>("Category", categorySchema);

export default Category;
