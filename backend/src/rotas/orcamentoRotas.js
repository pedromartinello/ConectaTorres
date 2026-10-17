import { Router } from 'express';
import { body } from 'express-validator';
import { listarMeusOrcamentos, enviarOrcamento, responderOrcamento, cancelarOrcamento } from '../controladores/orcamentoControlador.js';
import { exigirAutenticacao } from '../intermediarios/autenticacao.js';
import { permitirTipos } from '../intermediarios/autorizacao.js';
import { validarRequisicao } from '../intermediarios/validacao.js';
import { asyncHandler } from '../utilitarios/asyncHandler.js';

const router = Router();
router.use(exigirAutenticacao);
router.get('/', permitirTipos('cliente', 'prestador'), asyncHandler(listarMeusOrcamentos));
router.post('/', permitirTipos('prestador'), [
  body('agendamentoId').isUUID(),
  body('valor').isFloat({ gt: 0 }),
  body('descricao').isString().isLength({ min: 10, max: 4000 }),
  body('materiaisInclusos').optional().isBoolean(),
  body('observacoes').optional({ nullable: true }).isLength({ max: 2000 }),
  body('validade').optional({ nullable: true }).isISO8601()
], validarRequisicao, asyncHandler(enviarOrcamento));
router.patch('/:id/responder', permitirTipos('cliente'), [
  body('resposta').isIn(['aceitar', 'recusar'])
], validarRequisicao, asyncHandler(responderOrcamento));
router.patch('/:id/cancelar', permitirTipos('prestador'), asyncHandler(cancelarOrcamento));
export default router;
