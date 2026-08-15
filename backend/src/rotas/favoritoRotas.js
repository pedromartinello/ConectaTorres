import { Router } from 'express';
import { listarFavoritos, adicionarFavorito, removerFavorito } from '../controladores/favoritoControlador.js';
import { exigirAutenticacao } from '../intermediarios/autenticacao.js';
import { permitirTipos } from '../intermediarios/autorizacao.js';
import { asyncHandler } from '../utilitarios/asyncHandler.js';

const router = Router();
router.use(exigirAutenticacao, permitirTipos('cliente'));
router.get('/', asyncHandler(listarFavoritos));
router.post('/:prestadorId', asyncHandler(adicionarFavorito));
router.delete('/:prestadorId', asyncHandler(removerFavorito));
export default router;
