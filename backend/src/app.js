import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import { ambiente } from './configuracao/ambiente.js';
import rotas from './rotas/index.js';
import { rotaNaoEncontrada, tratarErros } from './intermediarios/tratamentoErros.js';

export const app = express();

app.disable('x-powered-by');
app.use(helmet());
app.use(cors({
  origin: ambiente.frontendUrl,
  credentials: true
}));
app.use(express.json({ limit: '1mb' }));
app.use(cookieParser());

app.use('/api', rotas);
app.use(rotaNaoEncontrada);
app.use(tratarErros);
