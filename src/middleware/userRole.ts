import { Request, Response, NextFunction } from "express";

const userRole = (req: Request, res: Response, next: NextFunction): void => {
   if (req.userRole !== "SUPER_ADMIN") {
      res.status(403).json({
         success: false,
         errorMessage: "AUTHORIZATION_ERROR",
         message: "Bu işlem için yetkiniz bulunmamaktadır",
      });
      return;
   }

   next();
};

export default userRole;
