import { Router } from 'express';
import { body } from 'express-validator';
import { listarUsuarios, alterarAtivo } from '../controladores/adminControlador.js';
import { exigirAutenticacao } from '../intermediarios/autenticacao.js';
import { permitirTipos } from '../intermediarios/autorizacao.js';
import { validarRequisicao } from '../intermediarios/validacao.js';
import { asyncHandler } from '../utilitarios/asyncHandler.js';

const router = Router();
router.use(exigirAutenticacao, permitirTipos('admin'));
router.get('/usuarios', asyncHandler(listarUsuarios));
router.patch('/usuarios/:id/ativo', [body('ativo').isBoolean()], validarRequisicao, asyncHandler(alterarAtivo));
export default router;
