import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import { config } from './server/config.js';
import { apiRouter } from './server/routes/api.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();

  // JSON Body parsing with 10mb limit for sources / documents
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // Mount API endpoints
  app.use('/api', apiRouter);

  // Backend service status check
  app.get('/api/health', (req, res) => {
    res.json({
      status: 'ok',
      service: 'Digital Dark Spot AI Platform',
      version: '1.0.0-production',
      model: config.geminiModel,
      geminiKeyConfigured: Boolean(config.geminiApiKey),
      timestamp: new Date().toISOString(),
    });
  });

  // Full-Stack Vite Integration
  if (config.isProduction) {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  } else {
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: process.env.DISABLE_HMR !== 'true' ? undefined : false,
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  const port = config.port;
  const server = app.listen(port, '0.0.0.0', () => {
    console.log(`Digital Dark Spot Server active on http://0.0.0.0:${port}`);
  });

  server.on('error', (err: any) => {
    console.error('Server listen error:', err);
    process.exit(1);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
