import { Router } from 'express';
import { body } from 'express-validator';
import {
  obterResumo,
  listarUsuarios,
  alterarAtivo,
  listarCategoriasAdmin,
  atualizarCategoria,
  listarDenuncias,
  atualizarDenuncia,
  listarAvaliacoesAdmin,
  alterarVisibilidadeAvaliacao
} from '../controladores/adminControlador.js';
import { criarCategoria } from '../controladores/categoriaControlador.js';
import { exigirAutenticacao } from '../intermediarios/autenticacao.js';
import { permitirTipos } from '../intermediarios/autorizacao.js';
import { validarRequisicao } from '../intermediarios/validacao.js';
import { asyncHandler } from '../utilitarios/asyncHandler.js';

const router = Router();
router.use(exigirAutenticacao, permitirTipos('admin'));
router.get('/resumo', asyncHandler(obterResumo));
router.get('/usuarios', asyncHandler(listarUsuarios));
router.patch('/usuarios/:id/ativo', [body('ativo').isBoolean()], validarRequisicao, asyncHandler(alterarAtivo));
router.get('/categorias', asyncHandler(listarCategoriasAdmin));
router.post('/categorias', [body('nome').trim().isLength({ min: 2, max: 100 })], validarRequisicao, asyncHandler(criarCategoria));
router.patch('/categorias/:id', [
  body('nome').optional().trim().isLength({ min: 2, max: 100 }),
  body('ativa').optional().isBoolean()
], validarRequisicao, asyncHandler(atualizarCategoria));
router.get('/denuncias', asyncHandler(listarDenuncias));
router.patch('/denuncias/:id', [
  body('status').isIn(['aberta', 'em_analise', 'resolvida', 'arquivada']),
  body('respostaAdmin').optional({ nullable: true }).isLength({ max: 2000 })
], validarRequisicao, asyncHandler(atualizarDenuncia));
router.get('/avaliacoes', asyncHandler(listarAvaliacoesAdmin));
router.patch('/avaliacoes/:id/visibilidade', [body('visivel').isBoolean()], validarRequisicao, asyncHandler(alterarVisibilidadeAvaliacao));
export default router;
