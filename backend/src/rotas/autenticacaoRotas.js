import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { body } from 'express-validator';
import {
  cadastrar,
  login,
  logout,
  eu,
  solicitarRedefinicaoSenha,
  redefinirSenha
} from '../controladores/autenticacaoControlador.js';
import { exigirAutenticacao } from '../intermediarios/autenticacao.js';
import { validarRequisicao } from '../intermediarios/validacao.js';
import { asyncHandler } from '../utilitarios/asyncHandler.js';

const router = Router();
const limiteAutenticacao = rateLimit({ windowMs: 15 * 60 * 1000, limit: 30, standardHeaders: 'draft-8', legacyHeaders: false });
const limiteRecuperacao = rateLimit({ windowMs: 15 * 60 * 1000, limit: 8, standardHeaders: 'draft-8', legacyHeaders: false });

function validarSenha(campo = 'senha') {
  return body(campo)
    .isLength({ min: 8, max: 128 }).withMessage('A senha deve ter entre 8 e 128 caracteres.')
    .matches(/[a-z]/).withMessage('A senha deve conter uma letra minúscula.')
    .matches(/[A-Z]/).withMessage('A senha deve conter uma letra maiúscula.')
    .matches(/[0-9]/).withMessage('A senha deve conter um número.');
}

router.post('/cadastro', limiteAutenticacao, [
  body('nome').trim().isLength({ min: 3, max: 120 }),
  body('email').isEmail().normalizeEmail(),
  validarSenha('senha'),
  body('tipo').optional().isIn(['cliente', 'prestador'])
], validarRequisicao, asyncHandler(cadastrar));

router.post('/login', limiteAutenticacao, [
  body('email').isEmail().normalizeEmail(),
  body('senha').notEmpty()
], validarRequisicao, asyncHandler(login));

router.post('/esqueci-senha', limiteRecuperacao, [
  body('email').isEmail().normalizeEmail()
], validarRequisicao, asyncHandler(solicitarRedefinicaoSenha));

router.post('/redefinir-senha', limiteRecuperacao, [
  body('token').isString().isLength({ min: 64, max: 64 }),
  validarSenha('novaSenha')
], validarRequisicao, asyncHandler(redefinirSenha));

router.post('/logout', asyncHandler(logout));
router.get('/eu', exigirAutenticacao, asyncHandler(eu));
export default router;
