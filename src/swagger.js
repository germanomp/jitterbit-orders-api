const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi    = require('swagger-ui-express');


const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title:       'Jitterbit Orders API',
      version:     '1.0.0',
      description: 'API REST para gerenciamento de pedidos — Desafio Jitterbit',
    },
    servers: [{ url: 'http://localhost:3000', description: 'Local' }],
    components: {
      securitySchemes: {
        bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' }
      }
    }
  },
  apis: ['./src/routes/*.js'],  
};


const swaggerSpec = swaggerJsdoc(options);


function setupSwagger(app) {
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
    swaggerOptions: { persistAuthorization: true }
  }));
  app.get('/api-docs.json', (req, res) => res.json(swaggerSpec));
  console.log('Swagger: http://localhost:3000/api-docs');
}


module.exports = { setupSwagger };

