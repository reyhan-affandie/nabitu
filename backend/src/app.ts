import "tsconfig-paths/register";
import "dotenv/config";
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import morgan from "morgan";
import createHttpError from "http-errors";
import auth from "@/routes/auth.route";
import users from "@/routes/users.route";
import invoices from "@/routes/invoices.route";
import { NOT_FOUND } from "@/constants/http";
import { isAuth } from "@/middleware/auth.middleware";
import { APP_ORIGIN, CLIENT_ORIGIN } from "@/constants/env";
import { errorHandler } from "@/middleware/error.middleware";
import helmet from "helmet";
import path from "path";
import swaggerUi from "swagger-ui-express";
import swaggerSpec from "@/swaggers/swagger";

const app = express();

// Add middleware
app.use(
  helmet({
    contentSecurityPolicy: {
      useDefaults: true, // Use default policy but can be customized further
      directives: {
        defaultSrc: ["'self'"], // Only allow resources from the same origin
        scriptSrc: ["'self'", "'unsafe-inline'"], // Allow inline scripts (if necessary)
        objectSrc: ["'none'"], // Disallow Flash or other plugin-based content
        imgSrc: ["'self'", "data:"], // Allow images from the same origin or inline
        styleSrc: ["'self'", "'unsafe-inline'"], // Allow inline styles (if necessary)
        upgradeInsecureRequests: [], // Upgrade all HTTP requests to HTTPS
      },
    },
    hsts: {
      maxAge: 31536000, // 1 year in seconds
      includeSubDomains: true, // Apply to all subdomains
      preload: true, // Preload the domain in browsers' HSTS list
    },
    frameguard: {
      action: "sameorigin", // Prevent the page from being framed by other sites
    },
    xssFilter: true, // Enable XSS filter
    referrerPolicy: {
      policy: "strict-origin-when-cross-origin", // Only send referrer information when crossing origins
    },
    dnsPrefetchControl: {
      allow: false, // Prevent DNS prefetching to reduce information leakage
    },
    crossOriginOpenerPolicy: {
      policy: "same-origin", // Prevent side-channel attacks by controlling the opening of cross-origin windows
    },
    crossOriginEmbedderPolicy: {
      policy: "require-corp", // Ensure cross-origin resources are isolated
    },
  }),
);
app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const allowedOrigins = [CLIENT_ORIGIN, APP_ORIGIN];
export const corsOptions = {
  origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error(`CORS error: Origin ${origin} not allowed`));
    }
  },
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
};

app.use(cors(corsOptions));

app.use(cookieParser());

// Auth routes
app.use("/api/auth", auth);

// Uploads routes
app.use("/uploads", express.static(path.resolve(__dirname, "../uploads")));

// Protected routes
app.use("/api/users", isAuth, users);
app.use("/api/invoices", isAuth, invoices);
app.use("/api/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Error handler
app.use((req, res, next) => {
  next(createHttpError(NOT_FOUND, "No API routes detected"));
});
app.use(errorHandler);

export default app;
