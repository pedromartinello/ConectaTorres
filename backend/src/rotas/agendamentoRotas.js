import { Router } from 'express';
import { body } from 'express-validator';
import { listarMeusAgendamentos, criarAgendamento, alterarStatus } from '../controladores/agendamentoControlador.js';
import { exigirAutenticacao } from '../intermediarios/autenticacao.js';
import { permitirTipos } from '../intermediarios/autorizacao.js';
import { validarRequisicao } from '../intermediarios/validacao.js';
import { asyncHandler } from '../utilitarios/asyncHandler.js';

const router = Router();
router.use(exigirAutenticacao);
router.get('/', permitirTipos('cliente', 'prestador'), asyncHandler(listarMeusAgendamentos));
router.post('/', permitirTipos('cliente'), [
  body('prestadorId').isUUID(),
  body('servicoId').optional({ nullable: true }).isUUID(),
  body('inicio').isISO8601(),
  body('fim').isISO8601()
], validarRequisicao, asyncHandler(criarAgendamento));
router.patch('/:id/status', permitirTipos('cliente', 'prestador'), [
  body('status').isIn(['aceito', 'recusado', 'cancelado'])
], validarRequisicao, asyncHandler(alterarStatus));
export default router;
