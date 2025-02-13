// swagger.ts
import { authDocs } from "@/swaggers/auth.docs";
import swaggerJsdoc from "swagger-jsdoc";
import { invoicesDocs } from "./invoices.docs";

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Nabitu API",
      version: "1.0.0",
      description: "API documentation for Worklife",
    },
    components: authDocs.components, // Direct reference to ensure dynamic updates
    security: authDocs.security, // Direct reference to ensure dynamic updates
    tags: [...authDocs.tags, ...invoicesDocs.tags],
    paths: { ...authDocs.paths, ...invoicesDocs.paths }, // Combine paths dynamically
    servers: [
      {
        url: "http://localhost:5000", // Replace with your server URL
      },
    ],
  },
  apis: ["@/src/routes/*.ts"], // Path to your route files
};

const swaggerSpec = swaggerJsdoc(options);

export default swaggerSpec;
