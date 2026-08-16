import { Router } from 'express';
import { exigirAutenticacao } from '../intermediarios/autenticacao.js';
import { obterMeuResumo } from '../controladores/painelControlador.js';
import { asyncHandler } from '../utilitarios/asyncHandler.js';

const router = Router();
router.get('/resumo', exigirAutenticacao, asyncHandler(obterMeuResumo));
export default router;
