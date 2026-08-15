import { Router } from 'express';
import { body } from 'express-validator';
import { listarDisponibilidades, listarMinhasDisponibilidades, criarDisponibilidade, removerDisponibilidade } from '../controladores/disponibilidadeControlador.js';
import { exigirAutenticacao } from '../intermediarios/autenticacao.js';
import { permitirTipos } from '../intermediarios/autorizacao.js';
import { validarRequisicao } from '../intermediarios/validacao.js';
import { asyncHandler } from '../utilitarios/asyncHandler.js';

const router = Router();
router.get('/minhas', exigirAutenticacao, permitirTipos('prestador'), asyncHandler(listarMinhasDisponibilidades));
router.get('/prestador/:prestadorId', asyncHandler(listarDisponibilidades));
router.post('/', exigirAutenticacao, permitirTipos('prestador'), [
  body('inicio').isISO8601(),
  body('fim').isISO8601(),
  body('observacao').optional({ nullable: true }).isLength({ max: 255 })
], validarRequisicao, asyncHandler(criarDisponibilidade));
router.delete('/:id', exigirAutenticacao, permitirTipos('prestador'), asyncHandler(removerDisponibilidade));
export default router;
