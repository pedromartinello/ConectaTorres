import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { body } from 'express-validator';
import { cadastrar, login, logout, eu } from '../controladores/autenticacaoControlador.js';
import { exigirAutenticacao } from '../intermediarios/autenticacao.js';
import { validarRequisicao } from '../intermediarios/validacao.js';
import { asyncHandler } from '../utilitarios/asyncHandler.js';

const router = Router();
const limiteAutenticacao = rateLimit({ windowMs: 15 * 60 * 1000, limit: 30, standardHeaders: 'draft-8', legacyHeaders: false });
const senhaForte = body('senha')
  .isLength({ min: 8, max: 128 }).withMessage('A senha deve ter entre 8 e 128 caracteres.')
  .matches(/[a-z]/).withMessage('A senha deve conter uma letra minuscula.')
  .matches(/[A-Z]/).withMessage('A senha deve conter uma letra maiuscula.')
  .matches(/[0-9]/).withMessage('A senha deve conter um numero.');

router.post('/cadastro', limiteAutenticacao, [
  body('nome').trim().isLength({ min: 3, max: 120 }),
  body('email').isEmail().normalizeEmail(),
  senhaForte,
  body('tipo').optional().isIn(['cliente', 'prestador'])
], validarRequisicao, asyncHandler(cadastrar));

router.post('/login', limiteAutenticacao, [
  body('email').isEmail().normalizeEmail(),
  body('senha').notEmpty()
], validarRequisicao, asyncHandler(login));

router.post('/logout', asyncHandler(logout));
router.get('/eu', exigirAutenticacao, asyncHandler(eu));
export default router;
