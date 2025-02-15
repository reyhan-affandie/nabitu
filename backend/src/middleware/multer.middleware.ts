import multer, { FileFilterCallback } from "multer";
import { v4 as uuidv4 } from "uuid";
import path from "path";
import fs from "fs";
import { Request } from "express";

const getDynamicDestination = (moduleName: string, type: string): string => {
  let basePath = "./uploads";
  if(moduleName === "auth"){
    moduleName = "users";
  }
  if (type === "image") {
    basePath = `${basePath}/images/${moduleName}`;
  } else if (type === "file") {
    basePath = `${basePath}/files/${moduleName}`;
  }
  if (!fs.existsSync(basePath)) {
    fs.mkdirSync(basePath, { recursive: true });
  }
  return basePath;
};

const dynamicFileFilter = (allowedFileType: string[]) => {
  return (req: Request, file: Express.Multer.File, cb: FileFilterCallback): void => {
    const fileType = file.mimetype.split("/")[1];
    if (!allowedFileType.includes(fileType)) {
      cb(new Error("Unsupported file type"));
    } else {
      cb(null, true);
    }
  };
};

export const multerMiddlewareImage = multer({
  limits: {
    fileSize: 1 * 1024 * 1024, // 1MB
    files: 3,
  },
  storage: multer.diskStorage({
    destination: (req: Request, file: Express.Multer.File, cb: (error: Error | null, destination: string) => void): void => {
      const moduleName = req.baseUrl.match(/\/api\/([a-zA-Z0-9]+)/)?.[1] || "default";
      const destinationPath = getDynamicDestination(moduleName, "image");
      cb(null, destinationPath);
    },
    filename: (req: Request, file: Express.Multer.File, cb: (error: Error | null, filename: string) => void): void => {
      const ext = path.extname(file.originalname);
      cb(null, `${uuidv4()}.${Date.now()}${ext}`);
    },
  }),
  fileFilter: dynamicFileFilter(["jpg", "jpeg", "png"]),
});

export const multerMiddlewareFile = multer({
  limits: {
    fileSize: 1 * 1024 * 1024, // 1MB
    files: 3,
  },
  storage: multer.diskStorage({
    destination: (req: Request, file: Express.Multer.File, cb: (error: Error | null, destination: string) => void): void => {
      const moduleName = req.baseUrl.match(/\/api\/([a-zA-Z0-9]+)/)?.[1] || "default";
      const destinationPath = getDynamicDestination(moduleName, "file");
      cb(null, destinationPath);
    },
    filename: (req: Request, file: Express.Multer.File, cb: (error: Error | null, filename: string) => void): void => {
      const ext = path.extname(file.originalname);
      cb(null, `${uuidv4()}.${Date.now()}${ext}`);
    },
  }),
  fileFilter: dynamicFileFilter(["pdf"]),
});
