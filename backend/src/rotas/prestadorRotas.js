import { Router } from 'express';
import { listarPrestadores, obterPrestador, atualizarMeuPerfil } from '../controladores/prestadorControlador.js';
import { exigirAutenticacao } from '../intermediarios/autenticacao.js';
import { permitirTipos } from '../intermediarios/autorizacao.js';
import { asyncHandler } from '../utilitarios/asyncHandler.js';

const router = Router();

router.get('/', asyncHandler(listarPrestadores));
router.put('/meu-perfil', exigirAutenticacao, permitirTipos('prestador'), asyncHandler(atualizarMeuPerfil));
router.get('/:id', asyncHandler(obterPrestador));

export default router;
