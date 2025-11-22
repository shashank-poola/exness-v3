import express from 'express';
import cors from 'cors';
import mainRouter from './routes';
import cookieParser from 'cookie-parser';

const PORT = process.env.PORT || 4000;

const app = express();

const FE_URL = process.env.CORS_ORIGIN || 'http://localhost:5173';

app.use(express.json());
app.use(
  cors({
    origin: FE_URL,
    credentials: true,
  })
);

app.use(cookieParser());

app.use('/api/v1', mainRouter);

app.listen(PORT, () => {
  console.log('Server started');
});