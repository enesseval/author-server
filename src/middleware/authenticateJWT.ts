import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

interface JWTPayload {
   id: string;
   role: string;
   iat: number;
   exp: number;
}

const authenticateJWT = (req: Request, res: Response, next: NextFunction): void => {
   const token = req.cookies.accessToken;

   if (!token) {
      res.status(401).json({
         success: false,
         errorMessage: "NOT_AUTHENTICATED",
         message: "Oturum bulunamadı",
      });
      return;
   }

   try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET! as string) as JWTPayload;

      // Request nesnesine kullanıcı bilgilerini ekle
      req.userId = decoded.id;
      req.userRole = decoded.role;

      next();
   } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
         res.status(401).json({
            success: false,
            errorMessage: "TOKEN_EXPIRED",
            message: "Oturum süresi doldu",
         });
      } else {
         res.status(403).json({
            success: false,
            errorMessage: "INVALID_TOKEN",
            message: "Geçersiz oturum",
         });
      }
   }
};

export default authenticateJWT;
