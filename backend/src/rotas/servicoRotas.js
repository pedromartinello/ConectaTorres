import { Router } from 'express';
import { body } from 'express-validator';
import { listarServicos, obterServico, criarServico, atualizarServico, removerServico } from '../controladores/servicoControlador.js';
import { exigirAutenticacao } from '../intermediarios/autenticacao.js';
import { permitirTipos } from '../intermediarios/autorizacao.js';
import { validarRequisicao } from '../intermediarios/validacao.js';
import { asyncHandler } from '../utilitarios/asyncHandler.js';

const router = Router();
router.get('/', asyncHandler(listarServicos));
router.get('/:id', asyncHandler(obterServico));
router.post('/', exigirAutenticacao, permitirTipos('prestador'), [
  body('categoriaId').isUUID(),
  body('titulo').trim().isLength({ min: 3, max: 160 }),
  body('precoBase').optional({ nullable: true }).isFloat({ min: 0 })
], validarRequisicao, asyncHandler(criarServico));
router.put('/:id', exigirAutenticacao, permitirTipos('prestador'), asyncHandler(atualizarServico));
router.delete('/:id', exigirAutenticacao, permitirTipos('prestador'), asyncHandler(removerServico));
export default router;
