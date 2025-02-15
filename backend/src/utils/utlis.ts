import bcrypt from "bcrypt";
import fs from "fs";
import { Request } from "express";

export const hashPassword = async (password: string): Promise<string> => {
  return bcrypt.hash(password, 12);
};

export const cleanupUploadedFiles = (req: Request): void => {
  if (req.files && typeof req.files === "object") {
    const files = req.files as { [key: string]: Express.Multer.File[] };
    Object.values(files)
      .flat()
      .forEach((file) => {
        if (fs.existsSync(file.path)) {
          try {
            fs.unlinkSync(file.path); // Delete the file
          } catch (error) {
            console.error(`❌ Failed to remove uploaded file: ${file.path}`, error);
          }
        }
      });
  }
};
