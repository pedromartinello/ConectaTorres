import { Router } from 'express';
import { body } from 'express-validator';
import {
  listarDisponibilidades,
  listarMinhasDisponibilidades,
  criarDisponibilidade,
  removerDisponibilidade,
  obterMinhaConfiguracao,
  salvarHorariosSemanais,
  criarBloqueio,
  removerBloqueio,
  obterAgendaPublicaDia,
  verificarDisponibilidade
} from '../controladores/disponibilidadeControlador.js';
import { exigirAutenticacao } from '../intermediarios/autenticacao.js';
import { permitirTipos } from '../intermediarios/autorizacao.js';
import { validarRequisicao } from '../intermediarios/validacao.js';
import { asyncHandler } from '../utilitarios/asyncHandler.js';

const router = Router();

router.get('/minhas/configuracao', exigirAutenticacao, permitirTipos('prestador'), asyncHandler(obterMinhaConfiguracao));
router.put('/semanais', exigirAutenticacao, permitirTipos('prestador'), asyncHandler(salvarHorariosSemanais));
router.post('/bloqueios', exigirAutenticacao, permitirTipos('prestador'), asyncHandler(criarBloqueio));
router.delete('/bloqueios/:id', exigirAutenticacao, permitirTipos('prestador'), asyncHandler(removerBloqueio));
router.get('/prestador/:prestadorId/agenda', asyncHandler(obterAgendaPublicaDia));
router.get('/prestador/:prestadorId/verificar', asyncHandler(verificarDisponibilidade));

// Rotas legadas mantidas para não quebrar dados e telas de versões anteriores.
router.get('/minhas', exigirAutenticacao, permitirTipos('prestador'), asyncHandler(listarMinhasDisponibilidades));
router.get('/prestador/:prestadorId', asyncHandler(listarDisponibilidades));
router.post('/', exigirAutenticacao, permitirTipos('prestador'), [
  body('inicio').isISO8601(),
  body('fim').isISO8601(),
  body('observacao').optional({ nullable: true }).isLength({ max: 255 })
], validarRequisicao, asyncHandler(criarDisponibilidade));
router.delete('/:id', exigirAutenticacao, permitirTipos('prestador'), asyncHandler(removerDisponibilidade));

export default router;
