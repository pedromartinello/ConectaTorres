import { Router } from 'express';
import { body } from 'express-validator';
import { listarAvaliacoesPrestador, criarAvaliacao } from '../controladores/avaliacaoControlador.js';
import { exigirAutenticacao } from '../intermediarios/autenticacao.js';
import { permitirTipos } from '../intermediarios/autorizacao.js';
import { validarRequisicao } from '../intermediarios/validacao.js';
import { asyncHandler } from '../utilitarios/asyncHandler.js';

const router = Router();
router.get('/prestador/:prestadorId', asyncHandler(listarAvaliacoesPrestador));
router.post('/', exigirAutenticacao, permitirTipos('cliente'), [
  body('agendamentoId').isUUID(),
  body('nota').isInt({ min: 1, max: 5 }),
  body('comentario').optional().isLength({ max: 1000 })
], validarRequisicao, asyncHandler(criarAvaliacao));
export default router;
