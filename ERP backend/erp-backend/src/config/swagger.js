const swaggerUi = require('swagger-ui-express');
const swaggerJSDoc = require('swagger-jsdoc');

const serverUrl = process.env.SERVER_URL || `http://localhost:${process.env.PORT || 8000}`;

const options = {
  definition: {
    openapi: '3.0.3',
    info: {
      title: 'ERP API',
      version: '1.0.0',
      description: 'ERP backend REST API documentation',
    },
    servers: [
      {
        url: serverUrl,
      },
    ],
    components: {
      securitySchemes: {
        BearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
      schemas: {
        ApiResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            data: {},
            message: { type: 'string' },
            meta: { type: 'object' },
          },
          required: ['success', 'message'],
        },
        LoginRequest: {
          type: 'object',
          required: ['email', 'password'],
          properties: {
            email: { type: 'string', format: 'email' },
            password: { type: 'string', minLength: 6 },
          },
        },
        RegisterRequest: {
          type: 'object',
          required: ['name', 'email', 'password'],
          properties: {
            name: { type: 'string' },
            email: { type: 'string', format: 'email' },
            password: { type: 'string', minLength: 6 },
            role: { type: 'string', enum: ['Admin', 'Sales', 'Purchase', 'Inventory'] },
          },
        },
        User: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            id: { type: 'string' },
            name: { type: 'string' },
            email: { type: 'string', format: 'email' },
            role: { type: 'string', enum: ['Admin', 'Sales', 'Purchase', 'Inventory'] },
            tokenVersion: { type: 'number' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
        UserUpdateRequest: {
          type: 'object',
          properties: {
            role: { type: 'string', enum: ['Admin', 'Sales', 'Purchase', 'Inventory'] },
            active: { type: 'boolean' },
            name: { type: 'string' },
            password: { type: 'string', minLength: 6 },
          },
        },
        Product: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            name: { type: 'string' },
            sku: { type: 'string' },
            price: { type: 'number' },
            stockQuantity: { type: 'number' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
        ProductRequest: {
          type: 'object',
          required: ['name', 'sku', 'price'],
          properties: {
            name: { type: 'string' },
            sku: { type: 'string' },
            price: { type: 'number' },
            stockQuantity: { type: 'number' },
          },
        },
        Customer: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            name: { type: 'string' },
            email: { type: 'string', format: 'email' },
            phone: { type: 'string' },
            address: { type: 'string' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
        CustomerRequest: {
          type: 'object',
          required: ['name', 'email'],
          properties: {
            name: { type: 'string' },
            email: { type: 'string', format: 'email' },
            phone: { type: 'string' },
            address: { type: 'string' },
          },
        },
        Supplier: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            name: { type: 'string' },
            email: { type: 'string', format: 'email' },
            phone: { type: 'string' },
            address: { type: 'string' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
        SupplierRequest: {
          type: 'object',
          required: ['name', 'email'],
          properties: {
            name: { type: 'string' },
            email: { type: 'string', format: 'email' },
            phone: { type: 'string' },
            address: { type: 'string' },
          },
        },
        SalesOrderItem: {
          type: 'object',
          required: ['productId', 'quantity'],
          properties: {
            productId: { type: 'string' },
            quantity: { type: 'number' },
            unitPrice: { type: 'number' },
          },
        },
        SalesOrderRequest: {
          type: 'object',
          required: ['customerId', 'items'],
          properties: {
            customerId: { type: 'string' },
            items: {
              type: 'array',
              items: { $ref: '#/components/schemas/SalesOrderItem' },
            },
            totalAmount: { type: 'number' },
            status: { type: 'string', enum: ['Pending', 'Processing', 'Completed', 'Cancelled'] },
          },
        },
        SalesOrder: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            customerId: { type: 'string' },
            customerName: { type: 'string' },
            items: {
              type: 'array',
              items: { $ref: '#/components/schemas/SalesOrderItem' },
            },
            totalAmount: { type: 'number' },
            status: { type: 'string', enum: ['Pending', 'Processing', 'Completed', 'Cancelled'] },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
        PurchaseOrderRequest: {
          type: 'object',
          properties: {
            supplierId: { type: 'string' },
            items: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  productId: { type: 'string' },
                  quantity: { type: 'number' },
                  unitPrice: { type: 'number' },
                },
              },
            },
            status: { type: 'string' },
          },
          required: ['supplierId', 'items'],
        },
        GRNRequest: {
          type: 'object',
          properties: {
            purchaseOrderId: { type: 'string' },
            receivedBy: { type: 'string' },
            items: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  productId: { type: 'string' },
                  quantityReceived: { type: 'number' },
                },
              },
            },
            remarks: { type: 'string' },
          },
        },
        InvoiceStatusRequest: {
          type: 'object',
          required: ['status'],
          properties: {
            status: { type: 'string' },
          },
        },
      },
    },
    paths: {
      '/api/auth/register': {
        post: {
          tags: ['Auth'],
          summary: 'Register user',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/RegisterRequest' },
              },
            },
          },
          responses: {
            201: {
              description: 'Registered',
              content: {
                'application/json': {
                  schema: {
                    allOf: [
                      { $ref: '#/components/schemas/ApiResponse' },
                      {
                        type: 'object',
                        properties: {
                          data: { $ref: '#/components/schemas/User' },
                        },
                      },
                    ],
                  },
                },
              },
            },
          },
        },
      },
      '/api/auth/login': {
        post: {
          tags: ['Auth'],
          summary: 'Login',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/LoginRequest' },
              },
            },
          },
          responses: {
            200: {
              description: 'Logged in',
              content: {
                'application/json': {
                  schema: {
                    allOf: [
                      { $ref: '#/components/schemas/ApiResponse' },
                      {
                        type: 'object',
                        properties: {
                          data: {
                            type: 'object',
                            properties: {
                              token: { type: 'string' },
                              user: { $ref: '#/components/schemas/User' },
                            },
                          },
                        },
                      },
                    ],
                  },
                },
              },
            },
          },
        },
      },
      '/api/auth/logout': {
        post: {
          tags: ['Auth'],
          summary: 'Logout',
          responses: {
            200: {
              description: 'Logged out',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/ApiResponse' },
                },
              },
            },
          },
        },
      },
      '/api/auth/me': {
        get: {
          tags: ['Auth'],
          summary: 'Current user profile',
          security: [{ BearerAuth: [] }],
          responses: {
            200: {
              description: 'Profile',
              content: {
                'application/json': {
                  schema: {
                    allOf: [
                      { $ref: '#/components/schemas/ApiResponse' },
                      { type: 'object', properties: { data: { $ref: '#/components/schemas/User' } } },
                    ],
                  },
                },
              },
            },
          },
        },
      },
      '/api/auth/users': {
        get: {
          tags: ['Users'],
          summary: 'List users (Admin)',
          security: [{ BearerAuth: [] }],
          responses: {
            200: {
              description: 'Users list',
              content: {
                'application/json': {
                  schema: {
                    allOf: [
                      { $ref: '#/components/schemas/ApiResponse' },
                      {
                        type: 'object',
                        properties: {
                          data: {
                            type: 'array',
                            items: { $ref: '#/components/schemas/User' },
                          },
                        },
                      },
                    ],
                  },
                },
              },
            },
          },
        },
      },
      '/api/auth/users/{id}': {
        put: {
          tags: ['Users'],
          summary: 'Update user role or activation status (Admin)',
          security: [{ BearerAuth: [] }],
          parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string' } }],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/UserUpdateRequest' },
              },
            },
          },
          responses: {
            200: {
              description: 'Updated user',
              content: {
                'application/json': {
                  schema: {
                    allOf: [
                      { $ref: '#/components/schemas/ApiResponse' },
                      { type: 'object', properties: { data: { $ref: '#/components/schemas/User' } } },
                    ],
                  },
                },
              },
            },
          },
        },
      },
      '/api/products': {
        get: {
          tags: ['Products'],
          summary: 'List products',
          security: [{ BearerAuth: [] }],
          responses: {
            200: {
              description: 'Products',
              content: { 'application/json': { schema: { $ref: '#/components/schemas/ApiResponse' } } },
            },
          },
        },
        post: {
          tags: ['Products'],
          summary: 'Create product',
          security: [{ BearerAuth: [] }],
          requestBody: {
            required: true,
            content: { 'application/json': { schema: { $ref: '#/components/schemas/ProductRequest' } } },
          },
          responses: {
            201: {
              description: 'Created',
              content: {
                'application/json': {
                  schema: {
                    allOf: [
                      { $ref: '#/components/schemas/ApiResponse' },
                      { type: 'object', properties: { data: { $ref: '#/components/schemas/Product' } } },
                    ],
                  },
                },
              },
            },
          },
        },
      },
      '/api/products/{id}': {
        get: {
          tags: ['Products'],
          summary: 'Get product by id',
          security: [{ BearerAuth: [] }],
          parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string' } }],
          responses: { 200: { description: 'Product', content: { 'application/json': { schema: { $ref: '#/components/schemas/ApiResponse' } } } } },
        },
        put: {
          tags: ['Products'],
          summary: 'Update product',
          security: [{ BearerAuth: [] }],
          parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string' } }],
          requestBody: {
            required: true,
            content: { 'application/json': { schema: { $ref: '#/components/schemas/ProductRequest' } } },
          },
          responses: { 200: { description: 'Updated', content: { 'application/json': { schema: { $ref: '#/components/schemas/ApiResponse' } } } } },
        },
        delete: {
          tags: ['Products'],
          summary: 'Delete product',
          security: [{ BearerAuth: [] }],
          parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string' } }],
          responses: { 200: { description: 'Deleted', content: { 'application/json': { schema: { $ref: '#/components/schemas/ApiResponse' } } } } },
        },
      },
      '/api/customers': {
        get: {
          tags: ['Customers'],
          summary: 'List customers',
          security: [{ BearerAuth: [] }],
          responses: { 200: { description: 'Customers', content: { 'application/json': { schema: { $ref: '#/components/schemas/ApiResponse' } } } } },
        },
        post: {
          tags: ['Customers'],
          summary: 'Create customer',
          security: [{ BearerAuth: [] }],
          requestBody: {
            required: true,
            content: { 'application/json': { schema: { $ref: '#/components/schemas/CustomerRequest' } } },
          },
          responses: { 201: { description: 'Created', content: { 'application/json': { schema: { $ref: '#/components/schemas/ApiResponse' } } } } },
        },
      },
      '/api/customers/{id}': {
        get: {
          tags: ['Customers'],
          summary: 'Get customer by id',
          security: [{ BearerAuth: [] }],
          parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string' } }],
          responses: { 200: { description: 'Customer', content: { 'application/json': { schema: { $ref: '#/components/schemas/ApiResponse' } } } } },
        },
        put: {
          tags: ['Customers'],
          summary: 'Update customer',
          security: [{ BearerAuth: [] }],
          parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string' } }],
          requestBody: {
            required: true,
            content: { 'application/json': { schema: { $ref: '#/components/schemas/CustomerRequest' } } },
          },
          responses: { 200: { description: 'Updated', content: { 'application/json': { schema: { $ref: '#/components/schemas/ApiResponse' } } } } },
        },
        delete: {
          tags: ['Customers'],
          summary: 'Delete customer',
          security: [{ BearerAuth: [] }],
          parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string' } }],
          responses: { 200: { description: 'Deleted', content: { 'application/json': { schema: { $ref: '#/components/schemas/ApiResponse' } } } } },
        },
      },
      '/api/suppliers': {
        get: {
          tags: ['Suppliers'],
          summary: 'List suppliers',
          security: [{ BearerAuth: [] }],
          responses: { 200: { description: 'Suppliers', content: { 'application/json': { schema: { $ref: '#/components/schemas/ApiResponse' } } } } },
        },
        post: {
          tags: ['Suppliers'],
          summary: 'Create supplier',
          security: [{ BearerAuth: [] }],
          requestBody: {
            required: true,
            content: { 'application/json': { schema: { $ref: '#/components/schemas/SupplierRequest' } } },
          },
          responses: { 201: { description: 'Created', content: { 'application/json': { schema: { $ref: '#/components/schemas/ApiResponse' } } } } },
        },
      },
      '/api/suppliers/{id}': {
        get: {
          tags: ['Suppliers'],
          summary: 'Get supplier by id',
          security: [{ BearerAuth: [] }],
          parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string' } }],
          responses: { 200: { description: 'Supplier', content: { 'application/json': { schema: { $ref: '#/components/schemas/ApiResponse' } } } } },
        },
        put: {
          tags: ['Suppliers'],
          summary: 'Update supplier',
          security: [{ BearerAuth: [] }],
          parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string' } }],
          requestBody: {
            required: true,
            content: { 'application/json': { schema: { $ref: '#/components/schemas/SupplierRequest' } } },
          },
          responses: { 200: { description: 'Updated', content: { 'application/json': { schema: { $ref: '#/components/schemas/ApiResponse' } } } } },
        },
        delete: {
          tags: ['Suppliers'],
          summary: 'Delete supplier',
          security: [{ BearerAuth: [] }],
          parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string' } }],
          responses: { 200: { description: 'Deleted', content: { 'application/json': { schema: { $ref: '#/components/schemas/ApiResponse' } } } } },
        },
      },
      '/api/sales-orders': {
        get: {
          tags: ['Sales Orders'],
          summary: 'List sales orders',
          security: [{ BearerAuth: [] }],
          responses: { 200: { description: 'Sales orders', content: { 'application/json': { schema: { $ref: '#/components/schemas/ApiResponse' } } } } },
        },
        post: {
          tags: ['Sales Orders'],
          summary: 'Create sales order',
          security: [{ BearerAuth: [] }],
          requestBody: {
            required: true,
            content: { 'application/json': { schema: { $ref: '#/components/schemas/SalesOrderRequest' } } },
          },
          responses: { 201: { description: 'Created', content: { 'application/json': { schema: { $ref: '#/components/schemas/ApiResponse' } } } } },
        },
      },
      '/api/sales-orders/{id}': {
        get: {
          tags: ['Sales Orders'],
          summary: 'Get sales order by id',
          security: [{ BearerAuth: [] }],
          parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string' } }],
          responses: { 200: { description: 'Sales order', content: { 'application/json': { schema: { $ref: '#/components/schemas/ApiResponse' } } } } },
        },
        put: {
          tags: ['Sales Orders'],
          summary: 'Update sales order',
          security: [{ BearerAuth: [] }],
          parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string' } }],
          requestBody: {
            required: true,
            content: { 'application/json': { schema: { $ref: '#/components/schemas/SalesOrderRequest' } } },
          },
          responses: { 200: { description: 'Updated', content: { 'application/json': { schema: { $ref: '#/components/schemas/ApiResponse' } } } } },
        },
        delete: {
          tags: ['Sales Orders'],
          summary: 'Delete sales order',
          security: [{ BearerAuth: [] }],
          parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string' } }],
          responses: { 200: { description: 'Deleted', content: { 'application/json': { schema: { $ref: '#/components/schemas/ApiResponse' } } } } },
        },
      },
      '/api/purchase-orders': {
        get: {
          tags: ['Purchase Orders'],
          summary: 'List purchase orders',
          security: [{ BearerAuth: [] }],
          responses: { 200: { description: 'Purchase orders', content: { 'application/json': { schema: { $ref: '#/components/schemas/ApiResponse' } } } } },
        },
        post: {
          tags: ['Purchase Orders'],
          summary: 'Create purchase order',
          security: [{ BearerAuth: [] }],
          requestBody: {
            required: true,
            content: { 'application/json': { schema: { $ref: '#/components/schemas/PurchaseOrderRequest' } } },
          },
          responses: { 201: { description: 'Created', content: { 'application/json': { schema: { $ref: '#/components/schemas/ApiResponse' } } } } },
        },
      },
      '/api/purchase-orders/{id}': {
        get: {
          tags: ['Purchase Orders'],
          summary: 'Get purchase order by id',
          security: [{ BearerAuth: [] }],
          parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string' } }],
          responses: { 200: { description: 'Purchase order', content: { 'application/json': { schema: { $ref: '#/components/schemas/ApiResponse' } } } } },
        },
        put: {
          tags: ['Purchase Orders'],
          summary: 'Update purchase order',
          security: [{ BearerAuth: [] }],
          parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string' } }],
          requestBody: {
            required: true,
            content: { 'application/json': { schema: { $ref: '#/components/schemas/PurchaseOrderRequest' } } },
          },
          responses: { 200: { description: 'Updated', content: { 'application/json': { schema: { $ref: '#/components/schemas/ApiResponse' } } } } },
        },
        delete: {
          tags: ['Purchase Orders'],
          summary: 'Delete purchase order',
          security: [{ BearerAuth: [] }],
          parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string' } }],
          responses: { 200: { description: 'Deleted', content: { 'application/json': { schema: { $ref: '#/components/schemas/ApiResponse' } } } } },
        },
      },
      '/api/grn': {
        get: {
          tags: ['GRN'],
          summary: 'List GRN entries',
          security: [{ BearerAuth: [] }],
          responses: { 200: { description: 'GRN list', content: { 'application/json': { schema: { $ref: '#/components/schemas/ApiResponse' } } } } },
        },
        post: {
          tags: ['GRN'],
          summary: 'Create GRN',
          security: [{ BearerAuth: [] }],
          requestBody: {
            required: true,
            content: { 'application/json': { schema: { $ref: '#/components/schemas/GRNRequest' } } },
          },
          responses: { 201: { description: 'Created', content: { 'application/json': { schema: { $ref: '#/components/schemas/ApiResponse' } } } } },
        },
      },
      '/api/grn/{id}': {
        get: {
          tags: ['GRN'],
          summary: 'Get GRN by id',
          security: [{ BearerAuth: [] }],
          parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string' } }],
          responses: { 200: { description: 'GRN', content: { 'application/json': { schema: { $ref: '#/components/schemas/ApiResponse' } } } } },
        },
        put: {
          tags: ['GRN'],
          summary: 'Update GRN',
          security: [{ BearerAuth: [] }],
          parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string' } }],
          requestBody: {
            required: true,
            content: { 'application/json': { schema: { $ref: '#/components/schemas/GRNRequest' } } },
          },
          responses: { 200: { description: 'Updated', content: { 'application/json': { schema: { $ref: '#/components/schemas/ApiResponse' } } } } },
        },
        delete: {
          tags: ['GRN'],
          summary: 'Delete GRN',
          security: [{ BearerAuth: [] }],
          parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string' } }],
          responses: { 200: { description: 'Deleted', content: { 'application/json': { schema: { $ref: '#/components/schemas/ApiResponse' } } } } },
        },
      },
      '/api/invoices': {
        get: {
          tags: ['Invoices'],
          summary: 'List invoices',
          security: [{ BearerAuth: [] }],
          responses: { 200: { description: 'Invoices', content: { 'application/json': { schema: { $ref: '#/components/schemas/ApiResponse' } } } } },
        },
      },
      '/api/invoices/{id}': {
        get: {
          tags: ['Invoices'],
          summary: 'Get invoice by id',
          security: [{ BearerAuth: [] }],
          parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string' } }],
          responses: { 200: { description: 'Invoice', content: { 'application/json': { schema: { $ref: '#/components/schemas/ApiResponse' } } } } },
        },
        delete: {
          tags: ['Invoices'],
          summary: 'Delete invoice',
          security: [{ BearerAuth: [] }],
          parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string' } }],
          responses: { 200: { description: 'Deleted', content: { 'application/json': { schema: { $ref: '#/components/schemas/ApiResponse' } } } } },
        },
      },
      '/api/invoices/{id}/status': {
        patch: {
          tags: ['Invoices'],
          summary: 'Update invoice status',
          security: [{ BearerAuth: [] }],
          parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string' } }],
          requestBody: {
            required: true,
            content: { 'application/json': { schema: { $ref: '#/components/schemas/InvoiceStatusRequest' } } },
          },
          responses: { 200: { description: 'Updated', content: { 'application/json': { schema: { $ref: '#/components/schemas/ApiResponse' } } } } },
        },
      },
      '/api/invoices/{id}/pdf': {
        get: {
          tags: ['Invoices'],
          summary: 'Download invoice PDF',
          security: [{ BearerAuth: [] }],
          parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string' } }],
          responses: {
            200: {
              description: 'PDF stream',
              content: {
                'application/pdf': {
                  schema: {
                    type: 'string',
                    format: 'binary',
                  },
                },
              },
            },
          },
        },
      },
      '/api/dashboard/metrics': {
        get: {
          tags: ['Dashboard'],
          summary: 'Dashboard metrics',
          security: [{ BearerAuth: [] }],
          responses: { 200: { description: 'Metrics', content: { 'application/json': { schema: { $ref: '#/components/schemas/ApiResponse' } } } } },
        },
      },
      '/api/dashboard/chart': {
        get: {
          tags: ['Dashboard'],
          summary: 'Dashboard chart data',
          security: [{ BearerAuth: [] }],
          responses: { 200: { description: 'Chart data', content: { 'application/json': { schema: { $ref: '#/components/schemas/ApiResponse' } } } } },
        },
      },
      '/api/reports/sales': {
        get: {
          tags: ['Reports'],
          summary: 'Export sales report CSV',
          security: [{ BearerAuth: [] }],
          responses: {
            200: {
              description: 'CSV content',
              content: {
                'text/csv': {
                  schema: { type: 'string' },
                },
              },
            },
          },
        },
      },
      '/api/reports/invoices': {
        get: {
          tags: ['Reports'],
          summary: 'Export invoices report CSV',
          security: [{ BearerAuth: [] }],
          responses: {
            200: {
              description: 'CSV content',
              content: {
                'text/csv': {
                  schema: { type: 'string' },
                },
              },
            },
          },
        },
      },
    },
  },
  apis: [],
};

const swaggerSpec = swaggerJSDoc(options);

module.exports = {
  swaggerUi,
  swaggerSpec,
};
