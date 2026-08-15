import { Router } from 'express';
import { body } from 'express-validator';
import { criarDenuncia, listarMinhasDenuncias } from '../controladores/denunciaControlador.js';
import { exigirAutenticacao } from '../intermediarios/autenticacao.js';
import { permitirTipos } from '../intermediarios/autorizacao.js';
import { validarRequisicao } from '../intermediarios/validacao.js';
import { asyncHandler } from '../utilitarios/asyncHandler.js';

const router = Router();
router.use(exigirAutenticacao);
router.get('/minhas', asyncHandler(listarMinhasDenuncias));
router.post('/', permitirTipos('cliente', 'prestador'), [
  body('prestadorId').optional({ nullable: true }).isUUID(),
  body('avaliacaoId').optional({ nullable: true }).isUUID(),
  body('motivo').trim().isLength({ min: 3, max: 120 }),
  body('descricao').optional({ nullable: true }).isLength({ max: 2000 })
], validarRequisicao, asyncHandler(criarDenuncia));
export default router;
