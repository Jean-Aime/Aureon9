import express from 'express';
import aureonRoutes from './routes/aureonRoutes';

const app = express();
app.use(express.json());
app.use('/api', aureonRoutes);

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`AUREON9 API running on port ${port}`));
