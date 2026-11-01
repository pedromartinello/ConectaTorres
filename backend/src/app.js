import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import { ambiente } from './configuracao/ambiente.js';
import { pastaUploads } from './configuracao/upload.js';
import rotas from './rotas/index.js';
import { rotaNaoEncontrada, tratarErros } from './intermediarios/tratamentoErros.js';

export const app = express();
app.disable('x-powered-by');

if (ambiente.producao) app.set('trust proxy', 1);

const limiteGeralApi = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 500,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  skip: (req) => req.path === '/saude',
  message: { mensagem: 'Muitas requisições em pouco tempo. Aguarde alguns minutos e tente novamente.' }
});

app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
app.use(cors({
  credentials: true,
  origin(origem, callback) {
    if (!origem) return callback(null, true);
    const normalizada = origem.replace(/\/$/, '');
    if (ambiente.frontendUrlsPermitidas.includes(normalizada)) return callback(null, true);
    const erro = new Error('Origem não permitida pelo CORS.');
    erro.status = 403;
    return callback(erro);
  }
}));
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));
app.use(cookieParser());
app.use('/uploads', express.static(pastaUploads, {
  maxAge: ambiente.producao ? '1d' : 0,
  immutable: false,
  fallthrough: true
}));
app.use('/api', limiteGeralApi, rotas);
app.use(rotaNaoEncontrada);
app.use(tratarErros);
