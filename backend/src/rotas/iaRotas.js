import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { body } from 'express-validator';
import { interpretarNecessidade, statusIA, sugerirDescricaoPerfil } from '../controladores/iaControlador.js';
import { exigirAutenticacao, autenticacaoOpcional } from '../intermediarios/autenticacao.js';
import { permitirTipos } from '../intermediarios/autorizacao.js';
import { validarRequisicao } from '../intermediarios/validacao.js';
import { asyncHandler } from '../utilitarios/asyncHandler.js';

const router = Router();
const limiteIA = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 12,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  message: { mensagem: 'Muitas solicitações de IA em pouco tempo. Aguarde alguns minutos e tente novamente.' }
});

router.get('/status', asyncHandler(statusIA));
router.post('/interpretar-necessidade', limiteIA, autenticacaoOpcional, [
  body('descricao').trim().isLength({ min: 10, max: 800 }).withMessage('Descreva sua necessidade com pelo menos 10 e no máximo 800 caracteres.')
], validarRequisicao, asyncHandler(interpretarNecessidade));

router.post('/sugerir-descricao-perfil', limiteIA, exigirAutenticacao, permitirTipos('prestador'), [
  body('titulo').optional({ nullable: true }).trim().isLength({ max: 180 }),
  body('descricao').optional({ nullable: true }).trim().isLength({ max: 3000 }),
  body('cidade').optional({ nullable: true }).trim().isLength({ max: 120 }),
  body('regiaoAtendimento').optional({ nullable: true }).trim().isLength({ max: 300 })
], validarRequisicao, asyncHandler(sugerirDescricaoPerfil));

export default router;
