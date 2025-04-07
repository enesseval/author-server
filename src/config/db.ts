import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const connectDB = async () => {
   try {
      const conn = await mongoose.connect(process.env.MONGO_URI!);
      console.log(`MongoDB bağlantısı başarılı bir şekilde kuruldu: ${conn.connection.host}`);
   } catch (error) {
      console.log(`MongoDB bağlantısı kurulurken bir hata oluştu: ${error}`);
      process.exit(1);
   }
};

//deneme

export default connectDB;
