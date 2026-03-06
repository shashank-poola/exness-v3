import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import mainRouter from './routes/index.js';
import cookieParser from 'cookie-parser';
import { httpPusher } from '@exness-v3/redis/streams';

const PORT = process.env.PORT;

const app = express();

const ALLOWED_ORIGINS = [
  "http://localhost:5173",
  "https://exness-v3-web.vercel.app",
  "https://tradex.foo",
  "https://www.tradex.foo",
  "http://192.168.0.116:3000"
];

// Connect Redis once at starting up
await httpPusher.connect();

app.use(express.json());
app.use(cors({
    origin: ALLOWED_ORIGINS,
    credentials: true,
  })
);

app.use(cookieParser());

app.use('/api/v1', mainRouter);

app.listen(PORT, () => {
  console.log('Server started on PORT: 3000',);
});