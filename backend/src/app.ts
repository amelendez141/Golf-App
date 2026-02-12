import 'express-async-errors';
import express from 'express';
import helmet from 'helmet';
import compression from 'compression';
import swaggerUi from 'swagger-ui-express';
import { corsMiddleware } from './middleware/cors.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';
import { apiRoutes, healthRoutes } from './routes/index.js';
import { logger } from './utils/logger.js';
import { swaggerSpec } from './config/swagger.js';

const app = express();

// Security middleware
app.use(helmet());

// CORS
app.use(corsMiddleware);

// Compression
app.use(compression());

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Swagger UI - API Documentation
app.use(
  '/api-docs',
  swaggerUi.serve,
  swaggerUi.setup(swaggerSpec, {
    customCss: `
      .swagger-ui .topbar { display: none }
      .swagger-ui .info { margin: 30px 0 }
      .swagger-ui .info .title { color: #2d5016 }
      .swagger-ui .scheme-container { background: #f8fdf5; padding: 15px; border-radius: 8px }
      .swagger-ui .btn.authorize { background: #4a7c23; border-color: #4a7c23 }
      .swagger-ui .btn.authorize:hover { background: #3d6a1c }
      .swagger-ui .opblock.opblock-get .opblock-summary-method { background: #4a7c23 }
      .swagger-ui .opblock.opblock-post .opblock-summary-method { background: #0d6efd }
      .swagger-ui .opblock.opblock-patch .opblock-summary-method { background: #fd7e14 }
      .swagger-ui .opblock.opblock-delete .opblock-summary-method { background: #dc3545 }
    `,
    customSiteTitle: 'LinkUp Golf API Documentation',
    customfavIcon: '/favicon.ico',
    swaggerOptions: {
      persistAuthorization: true,
      displayRequestDuration: true,
      filter: true,
      showExtensions: true,
      showCommonExtensions: true,
      tryItOutEnabled: true,
    },
  })
);

// Serve OpenAPI spec as JSON
app.get('/api-docs.json', (_req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.send(swaggerSpec);
});

// Request logging
app.use((req, res, next) => {
  const start = Date.now();

  res.on('finish', () => {
    const duration = Date.now() - start;
    logger.info(`${req.method} ${req.path}`, {
      status: res.statusCode,
      duration: `${duration}ms`,
      ip: req.ip,
    });
  });

  next();
});

// Health check routes (at root level, not under /api)
app.use('/health', healthRoutes);

// API routes
app.use('/api', apiRoutes);

// 404 handler
app.use(notFoundHandler);

// Error handler
app.use(errorHandler);

export { app };
