import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { body } from 'express-validator';
import { cadastrar, login, logout, eu } from '../controladores/autenticacaoControlador.js';
import { exigirAutenticacao } from '../intermediarios/autenticacao.js';
import { validarRequisicao } from '../intermediarios/validacao.js';
import { asyncHandler } from '../utilitarios/asyncHandler.js';

const router = Router();

const limiteAutenticacao = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 50,
  standardHeaders: 'draft-8',
  legacyHeaders: false
});

router.post('/cadastro', limiteAutenticacao, [
  body('nome').trim().isLength({ min: 3, max: 120 }),
  body('email').isEmail().normalizeEmail(),
  body('senha').isLength({ min: 8, max: 128 }).withMessage('A senha deve ter pelo menos 8 caracteres.'),
  body('tipo').optional().isIn(['cliente', 'prestador'])
], validarRequisicao, asyncHandler(cadastrar));

router.post('/login', limiteAutenticacao, [
  body('email').isEmail().normalizeEmail(),
  body('senha').notEmpty()
], validarRequisicao, asyncHandler(login));

router.post('/logout', asyncHandler(logout));
router.get('/eu', exigirAutenticacao, asyncHandler(eu));

export default router;
