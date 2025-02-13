// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const authDocs: any = {
  tags: [
    {
      name: "AUTH",
      description: "User authentication and account management",
    },
  ],
  components: {
    securitySchemes: {
      BearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
      },
    },
  },
  security: [
    {
      BearerAuth: [] as string[],
    },
  ],
  paths: {
    "/api/auth/register": {
      post: {
        tags: ["AUTH"],
        summary: "Register",
        security: [] as string[],
        requestBody: {
          content: {
            "multipart/form-data": {
              schema: {
                type: "object",
                properties: {
                  photo: {
                    type: "string",
                    format: "binary",
                    description: "User profile photo",
                  },
                  name: {
                    type: "string",
                    description: "Name*",
                    example: "Reyhan Emir Affandie",
                  },
                  email: {
                    type: "string",
                    format: "email",
                    description: "Email*",
                    example: "reyhanz1988@gmail.com",
                  },
                  password: {
                    type: "string",
                    format: "password",
                    minLength: 6,
                    description: "Password*",
                    example: "admin1234",
                  },
                },
              },
            },
          },
        },
        responses: {},
      },
    },
    "/api/auth/email/verify": {
      post: {
        tags: ["AUTH"],
        summary: "Send verification email",
        description: "Sends a verification email to the user with a verification link.",
        security: [] as string[],
        requestBody: {
          content: {
            "application/x-www-form-urlencoded": {
              schema: {
                type: "object",
                properties: {
                  email: {
                    type: "string",
                    format: "email",
                    description: "Email*",
                    example: "reyhanz1988@gmail.com",
                  },
                },
              },
            },
          },
        },
        responses: {},
      },
    },
    "/api/auth/email": {
      patch: {
        tags: ["AUTH"],
        summary: "Verify user email address.",
        responses: {},
      },
    },
    "/api/auth/login": {
      post: {
        tags: ["AUTH"],
        summary: "Login",
        security: [] as string[],
        requestBody: {
          content: {
            "application/x-www-form-urlencoded": {
              schema: {
                type: "object",
                properties: {
                  email: {
                    type: "string",
                    format: "email",
                    description: "Email*",
                    example: "reyhanz1988@gmail.com",
                  },
                  password: {
                    type: "string",
                    description: "Password*",
                    example: "admin1234",
                  },
                },
              },
            },
          },
        },
        responses: {},
      },
    },
    "/api/auth/password/verify": {
      post: {
        tags: ["AUTH"],
        summary: "Send forgot password email",
        description: "Sends an email to the user with a forgot password link.",
        security: [] as string[],
        requestBody: {
          content: {
            "application/x-www-form-urlencoded": {
              schema: {
                type: "object",
                properties: {
                  email: {
                    type: "string",
                    format: "email",
                    description: "Email*",
                    example: "reyhanz1988@gmail.com",
                  },
                },
              },
            },
          },
        },
        responses: {},
      },
    },
    "/api/auth/password/forgot": {
      patch: {
        tags: ["AUTH"],
        summary: "Execute forgot password",
        description: "Change user password using and temporary token forgot password link.",
        requestBody: {
          content: {
            "application/x-www-form-urlencoded": {
              schema: {
                type: "object",
                properties: {
                  email: {
                    type: "string",
                    format: "email",
                    description: "Email*",
                    example: "reyhanz1988@gmail.com",
                  },
                  password: {
                    type: "string",
                    format: "password",
                    description: "Password*",
                    example: "admin1234",
                  },
                },
              },
            },
          },
        },
        responses: {},
      },
    },
    "/api/auth/password/update": {
      patch: {
        tags: ["AUTH"],
        summary: "Update user password",
        description: "Change user password using old password to verify.",
        requestBody: {
          content: {
            "application/x-www-form-urlencoded": {
              schema: {
                type: "object",
                properties: {
                  email: {
                    type: "string",
                    format: "email",
                    description: "Email*",
                    example: "reyhanz1988@gmail.com",
                  },
                  oldPassword: {
                    type: "string",
                    format: "password",
                    description: "Password*",
                    example: "admin1234",
                  },
                  password: {
                    type: "string",
                    format: "password",
                    description: "Password*",
                    example: "admin1234",
                  },
                },
              },
            },
          },
        },
        responses: {},
      },
    },
    "/api/auth": {
      get: {
        tags: ["AUTH"],
        summary: "Get auth user.",
        responses: {},
      },
    },
    "/api/auth/refresh": {
      get: {
        tags: ["AUTH"],
        summary: "Refresh token.",
        responses: {},
      },
    },
    "/api/auth/logout": {
      get: {
        tags: ["AUTH"],
        summary: "Logout.",
        responses: {},
      },
    },
  },
};
