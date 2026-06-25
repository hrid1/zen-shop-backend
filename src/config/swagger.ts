import swaggerJsdoc from 'swagger-jsdoc';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Zen Shop API',
      version: '1.0.0',
      description: 'E-Commerce Backend API',
    },
    servers: [{ url: 'http://localhost:5000/api' }],
    tags: [
      { name: 'Auth', description: 'Authentication endpoints' },
      { name: 'Users', description: 'User profile and address management' },
      { name: 'Products', description: 'Product management endpoints' },
      { name: 'Categories', description: 'Category management endpoints' },
      { name: 'Cart', description: 'Shopping cart management' },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
      schemas: {
        ErrorResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: false },
            message: { type: 'string', example: 'Error message' },
          },
        },
        Pagination: {
          type: 'object',
          properties: {
            page: { type: 'number' },
            limit: { type: 'number' },
            total: { type: 'number' },
            totalPages: { type: 'number' },
          },
        },
        Cart: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            userId: { type: 'string' },
            items: { type: 'array', items: { type: 'object' } },
            subtotal: { type: 'number' },
            itemCount: { type: 'number' },
          },
        },
        Category: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            name: { type: 'string' },
            slug: { type: 'string' },
            description: { type: 'string' },
            parentCategoryId: { type: 'string', nullable: true },
            isActive: { type: 'boolean' },
            childCategories: { type: 'array', items: { type: 'object' } },
          },
        },
        Product: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            name: { type: 'string' },
            slug: { type: 'string' },
            description: { type: 'string' },
            basePrice: { type: 'number' },
            category: { type: 'object' },
            images: { type: 'array', items: { type: 'object' } },
            variants: { type: 'array', items: { type: 'object' } },
          },
        },
      },
    },
  },
  apis: ['./src/routes/*.ts', './src/modules/**/*.routes.ts'],
};
export const swaggerSpec = swaggerJsdoc(options);