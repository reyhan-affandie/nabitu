import { authDocs } from "@/swaggers/auth.docs";
import swaggerSpec from "@/swaggers/swagger";
import swaggerUi from "swagger-ui-express";
import express from "express";

const app = express();

// Middleware to automatically add auth to all endpoints except login and register
export const enforceAuthOnSwagger = (): void => {
  if (authDocs?.paths) {
    Object.keys(authDocs.paths).forEach((path: string) => {
      if (!path.includes("/api/auth/login") && !path.includes("/api/auth/register")) {
        const pathObj = authDocs.paths[path];
        Object.keys(pathObj).forEach((method: string) => {
          if (!pathObj[method].security) {
            pathObj[method].security = [{ BearerAuth: [] }];
          }
        });
      }
    });
    console.log("Swagger security updated: Auth required for all endpoints except login and register");
  }
};

// Middleware to dynamically update token in Swagger documentation
export const updateSwaggerSpec = (token: string): void => {
  if (token && authDocs?.paths) {
    authDocs.paths["/api/auth/login"].post.responses[201].content["text/plain"].schema.example = token;

    console.log("Swagger example token updated:", token);

    // Ensure swaggerSpec is updated dynamically
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (swaggerSpec as any).paths = { ...authDocs.paths };

    // Force Swagger UI to reload
    app.use("/api/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
  }
};
