import type { User as UserModel } from "../models/user.model";
import "express";
import { Details } from "express-useragent";

declare global {
   declare namespace Express {
      interface Request {
         userId: string;
         user?: UserModel;
         useragent?: Details;
         userRole: string;
      }
   }
}

export {};

export function Router() {
   throw new Error("Function not implemented.");
}
