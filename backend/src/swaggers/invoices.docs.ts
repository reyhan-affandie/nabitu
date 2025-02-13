// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const invoicesDocs: any = {
  tags: [
    {
      name: "INVOICES",
      description: "User Invoices Management API",
    },
  ],
  paths: {
    "/api/invoices": {
      post: {
        tags: ["INVOICES"],
        summary: "Create invoices",
        requestBody: {
          content: {
            "application/x-www-form-urlencoded": {
              schema: {
                type: "object",
                properties: {
                  invoiceName: {
                    type: "string",
                    description: "Invoice Name*",
                    example: "Test Invoice 1",
                  },
                  invoiceNumber: {
                    type: "string",
                    description: "Invoice Number*",
                    example: `INV-${Date.now()}`,
                  },
                  invoiceDueDate: {
                    type: "string",
                    description: "Invoice Due Date*",
                    example: Date.now() + 60 * 60 * 24 * 30,
                  },
                  invoiceAmount: {
                    type: "string",
                    description: "Invoice Amount*",
                    example: "35000000",
                  },
                  invoiceStatus: {
                    type: "string",
                    enum: ["Paid", "Unpaid", "Pending"],
                    description: "Invoice Status*",
                    example: "Paid",
                  },
                },
              },
            },
          },
        },
        responses: {},
      },
      patch: {
        tags: ["INVOICES"],
        summary: "Update invoices",
        requestBody: {
          content: {
            "application/x-www-form-urlencoded": {
              schema: {
                type: "object",
                properties: {
                  moduleId: {
                    type: "string",
                    description: "invoice _id*",
                    example: "67acc1cff4209e7c08fd5f48",
                  },
                  invoiceName: {
                    type: "string",
                    description: "Invoice Name*",
                    example: "Test Invoice 1",
                  },
                  invoiceNumber: {
                    type: "string",
                    description: "Invoice Number*",
                    example: `INV-${Date.now()}`,
                  },
                  invoiceDueDate: {
                    type: "string",
                    description: "Invoice Due Date*",
                    example: Date.now() + 60 * 60 * 24 * 30,
                  },
                  invoiceAmount: {
                    type: "string",
                    description: "Invoice Amount*",
                    example: "35000000",
                  },
                  invoiceStatus: {
                    type: "string",
                    enum: ["Paid", "Unpaid", "Pending"],
                    description: "Invoice Status*",
                    example: "Paid",
                  },
                },
              },
            },
          },
        },
        responses: {},
      },
      get: {
        tags: ["INVOICES"],
        summary: "Read invoices",
        description: "Get all invoices list.",
        parameters: [
          {
            name: "page",
            in: "query",
            description: "Page number for pagination",
            required: false,
            schema: {
              type: "integer",
              example: 1,
            },
          },
          {
            name: "limit",
            in: "query",
            description: "Number of items per page",
            required: false,
            schema: {
              type: "integer",
              example: 10,
            },
          },
          {
            name: "search",
            in: "query",
            description: "Search query string",
            required: false,
            schema: {
              type: "string",
            },
          },
          {
            name: "sort",
            in: "query",
            description: "Field to sort by",
            required: false,
            schema: {
              type: "string",
              example: "createdAt",
            },
          },
          {
            name: "order",
            in: "query",
            description: "Order of sorting (1 for ascending, -1 for descending)",
            required: false,
            schema: {
              type: "integer",
              example: -1,
            },
          },
        ],
        responses: {},
      },
      delete: {
        tags: ["INVOICES"],
        summary: "Delete invoices",
        requestBody: {
          content: {
            "application/x-www-form-urlencoded": {
              schema: {
                type: "object",
                properties: {
                  moduleId: {
                    type: "string",
                    description: "invoice _id*",
                    example: "67acc1cff4209e7c08fd5f48",
                  },
                },
              },
            },
          },
        },
        responses: {},
      },
    },
    "/api/invoices/{moduleId}": {
      get: {
        tags: ["INVOICES"],
        summary: "Read invoice details",
        description: "Retrieve details of a specific invoice by its module ID.",
        parameters: [
          {
            name: "moduleId",
            in: "path",
            description: "Unique ID of the invoice",
            required: true,
            schema: {
              type: "string",
              example: "67a1e24ecc482bee009178cd",
            },
          },
        ],
        responses: {},
      },
    },
    "/api/invoices/bulk": {
      delete: {
        tags: ["INVOICES"],
        summary: "Delete Bulk invoice",
        requestBody: {
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  moduleIds: {
                    type: "array",
                    items: {
                      type: "string",
                    },
                    description: "Array of invoice _id*",
                    example: ["67acc1cff4209e7c08fd5f48", "67acc1cff4209e7c08fd5f49"],
                  },
                },
              },
            },
          },
        },
        responses: {},
      },
    },
  },
};
