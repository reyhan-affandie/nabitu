// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const usersDocs: any = {
  tags: [
    {
      name: "USERS",
      description: "User Users Management API",
    },
  ],
  paths: {
    "/api/users": {
      post: {
        tags: ["USERS"],
        summary: "Create users",
        requestBody: {
          content: {
            "application/x-www-form-urlencoded": {
              schema: {
                type: "object",
                properties: {
                  name: {
                    type: "string",
                    description: "User Name*",
                    example: "Test User 1",
                  },
                  email: {
                    type: "string",
                    description: "User Number*",
                    example: `test@testmail.com`,
                  },
                  password: {
                    type: "string",
                    description: "User Amount*",
                    example: "testPassword",
                  },
                },
              },
            },
          },
        },
        responses: {},
      },
      patch: {
        tags: ["USERS"],
        summary: "Update users",
        requestBody: {
          content: {
            "application/x-www-form-urlencoded": {
              schema: {
                type: "object",
                properties: {
                  moduleId: {
                    type: "string",
                    description: "user _id*",
                    example: "67acc1cff4209e7c08fd5f48",
                  },
                  name: {
                    type: "string",
                    description: "User Name*",
                    example: "Test User 1",
                  },
                  email: {
                    type: "string",
                    description: "User Number*",
                    example: `test@testmail.com`,
                  },
                  password: {
                    type: "string",
                    description: "User Amount*",
                    example: "testPassword",
                  },
                },
              },
            },
          },
        },
        responses: {},
      },
      get: {
        tags: ["USERS"],
        summary: "Read users",
        description: "Get all users list.",
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
        tags: ["USERS"],
        summary: "Delete users",
        requestBody: {
          content: {
            "application/x-www-form-urlencoded": {
              schema: {
                type: "object",
                properties: {
                  moduleId: {
                    type: "string",
                    description: "user _id*",
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
    "/api/users/{moduleId}": {
      get: {
        tags: ["USERS"],
        summary: "Read user details",
        description: "Retrieve details of a specific user by its module ID.",
        parameters: [
          {
            name: "moduleId",
            in: "path",
            description: "Unique ID of the user",
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
    "/api/users/bulk": {
      delete: {
        tags: ["USERS"],
        summary: "Delete Bulk user",
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
                    description: "Array of user _id*",
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
