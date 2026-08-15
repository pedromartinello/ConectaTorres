import { Router } from 'express';
import { body } from 'express-validator';
import { listarCategorias, criarCategoria } from '../controladores/categoriaControlador.js';
import { exigirAutenticacao } from '../intermediarios/autenticacao.js';
import { permitirTipos } from '../intermediarios/autorizacao.js';
import { validarRequisicao } from '../intermediarios/validacao.js';
import { asyncHandler } from '../utilitarios/asyncHandler.js';

const router = Router();
router.get('/', asyncHandler(listarCategorias));
router.post('/', exigirAutenticacao, permitirTipos('admin'), [
  body('nome').trim().isLength({ min: 2, max: 100 })
], validarRequisicao, asyncHandler(criarCategoria));
export default router;
