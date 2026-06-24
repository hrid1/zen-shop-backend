import swaggerJsdoc from 'swagger-jsdoc';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Zen Shop API',
      version: '1.0.0',
      description: 'E-Commerce Backend API',
    },
    servers: [
      {
        url: 'http://localhost:5000/api',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI1MjI4YjExZC1mODJmLTRlZTEtODlhNy0zOTk5NDU0Mzk1NzMiLCJyb2xlIjoiQURNSU4iLCJpYXQiOjE3ODIyOTI4OTYsImV4cCI6MTc4MjM3OTI5Nn0.MfeYqoRNsnCLjQTgMTsJhTbCqYxAiFH4ywhY5a9DZ0w',
        },
      },
    },
    // Add global security requirement
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  apis: ['./src/routes/*.ts'],
};

export const swaggerSpec = swaggerJsdoc(options);