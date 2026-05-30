import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import publicRoutes from './routes/public.js';
import adminRoutes from './routes/admin.js';
import errorHandler from './middleware/errorHandler.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const publicPath = path.join(__dirname, '..', 'public');

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static(publicPath));

app.use('/api', publicRoutes);
app.use('/api/admin', adminRoutes);

app.use((req, res) => {
  if (req.path.startsWith('/api')) return;
  res.sendFile(path.join(publicPath, 'index.html'));
});

app.use(errorHandler);

export default app;
