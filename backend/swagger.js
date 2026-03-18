const swaggerJsDoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'ERP API Documentation',
      version: '1.0.0',
      description: 'API documentation for the ERP system',
    },
    servers: [
      {
        url: 'http://localhost:{port}/api',
        description: 'Local Development Server',
        variables: {
          port: {
            default: '5000',
          },
        },
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Enter your JWT token in the format: Bearer <token>',
        },
      },
      schemas: {
        ApiResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: true },
            message: { type: 'string', example: 'Request successful' },
            data: { type: 'object', nullable: true }
          }
        },
        User: {
          type: 'object',
          properties: {
            _id: { type: 'string', example: '65f0c1...' },
            name: { type: 'string', example: 'Admin User' },
            email: { type: 'string', example: 'admin@example.com' },
            role: { type: 'string', example: 'Admin' },
            isVerified: { type: 'boolean', example: true },
            emailVerified: { type: 'boolean', example: true }
          }
        },
        Product: {
          type: 'object',
          properties: {
            _id: { type: 'string', example: '65f0c1...' },
            name: { type: 'string', example: 'Laptop Model A' },
            sku: { type: 'string', example: 'PRD-LAP-A' },
            description: { type: 'string', example: 'Optional' },
            price: { type: 'number', example: 60000 },
            stockQuantity: { type: 'number', example: 50 }
          }
        },
        AuthRegisterRequest: {
          type: 'object',
          required: ['name', 'email', 'password'],
          properties: {
            name: { type: 'string', example: 'Jane Doe' },
            email: { type: 'string', example: 'jane@example.com' },
            password: { type: 'string', example: 'password123' },
            role: { type: 'string', example: 'Sales' }
          }
        },
        AuthLoginRequest: {
          type: 'object',
          required: ['email', 'password'],
          properties: {
            email: { type: 'string', example: 'admin@example.com' },
            password: { type: 'string', example: 'password123' }
          }
        },
        OtpVerifyRequest: {
          type: 'object',
          required: ['email', 'otp'],
          properties: {
            email: { type: 'string', example: 'jane@example.com' },
            otp: { type: 'string', example: '123456' }
          }
        },
        ResendOtpRequest: {
          type: 'object',
          required: ['email'],
          properties: {
            email: { type: 'string', example: 'jane@example.com' }
          }
        },
        AuthLoginResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: true },
            message: { type: 'string', example: 'Logged in successfully' },
            data: {
              type: 'object',
              properties: {
                token: { type: 'string', example: 'JWT_TOKEN' },
                user: { $ref: '#/components/schemas/User' }
              }
            }
          }
        },
        AuthMeResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: true },
            message: { type: 'string', example: 'User fetched successfully' },
            data: { $ref: '#/components/schemas/User' }
          }
        },
        UsersListResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: true },
            message: { type: 'string', example: 'Users fetched successfully' },
            data: {
              type: 'array',
              items: { $ref: '#/components/schemas/User' }
            }
          }
        },
        ProductCreateRequest: {
          type: 'object',
          required: ['name', 'sku', 'price', 'stockQuantity'],
          properties: {
            name: { type: 'string', example: 'New Product' },
            sku: { type: 'string', example: 'SKU-001' },
            description: { type: 'string', example: 'Optional' },
            price: { type: 'number', example: 1000 },
            stockQuantity: { type: 'number', example: 10 }
          }
        },
        ProductUpdateRequest: {
          type: 'object',
          properties: {
            name: { type: 'string', example: 'Updated Product' },
            price: { type: 'number', example: 1200 },
            stockQuantity: { type: 'number', example: 20 }
          }
        },
        ProductResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: true },
            message: { type: 'string', example: 'Product fetched successfully' },
            data: { $ref: '#/components/schemas/Product' }
          }
        },
        ProductListResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: true },
            message: { type: 'string', example: 'Products fetched successfully' },
            data: {
              type: 'array',
              items: { $ref: '#/components/schemas/Product' }
            },
            meta: {
              type: 'object',
              properties: {
                total: { type: 'number', example: 100 },
                page: { type: 'number', example: 1 },
                pageSize: { type: 'number', example: 10 },
                totalPages: { type: 'number', example: 10 },
                search: { type: 'string', example: 'laptop' }
              }
            }
          }
        },
        Error: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: false },
            message: { type: 'string' }
          }
        }
      }
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  apis: ['./src/routes/*.js', './app.js'], // Paths to files containing OpenAPI definitions
};

const specs = swaggerJsDoc(options);

module.exports = specs;
