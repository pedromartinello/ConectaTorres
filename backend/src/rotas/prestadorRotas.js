import { Router } from 'express';
import { body } from 'express-validator';
import {
  listarPrestadores,
  obterPrestador,
  atualizarMeuPerfil,
  listarMeuPortfolio,
  adicionarPortfolio,
  atualizarPortfolio,
  removerPortfolio
} from '../controladores/prestadorControlador.js';
import { exigirAutenticacao, autenticacaoOpcional } from '../intermediarios/autenticacao.js';
import { permitirTipos } from '../intermediarios/autorizacao.js';
import { validarRequisicao } from '../intermediarios/validacao.js';
import { executarUpload } from '../intermediarios/upload.js';
import { uploadPortfolio } from '../configuracao/upload.js';
import { asyncHandler } from '../utilitarios/asyncHandler.js';

const router = Router();
router.get('/', autenticacaoOpcional, asyncHandler(listarPrestadores));
router.put('/meu-perfil', exigirAutenticacao, permitirTipos('prestador'), [
  body('estado').optional({ nullable: true }).isLength({ min: 2, max: 2 }),
  body('valorReferencia').optional({ nullable: true }).isFloat({ min: 0 }),
  body('modalidadeOrcamento').optional().isIn(['orcamento', 'hora', 'servico'])
], validarRequisicao, asyncHandler(atualizarMeuPerfil));
router.get('/meu-portfolio', exigirAutenticacao, permitirTipos('prestador'), asyncHandler(listarMeuPortfolio));
router.post('/meu-portfolio', exigirAutenticacao, permitirTipos('prestador'), executarUpload(uploadPortfolio), asyncHandler(adicionarPortfolio));
router.patch('/meu-portfolio/:id', exigirAutenticacao, permitirTipos('prestador'), [
  body('legenda').optional({ nullable: true }).isLength({ max: 200 }),
  body('ordem').optional().isInt({ min: 0, max: 100 })
], validarRequisicao, asyncHandler(atualizarPortfolio));
router.delete('/meu-portfolio/:id', exigirAutenticacao, permitirTipos('prestador'), asyncHandler(removerPortfolio));
router.get('/:id', autenticacaoOpcional, asyncHandler(obterPrestador));
export default router;
