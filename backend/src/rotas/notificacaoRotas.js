import { Router } from 'express';
import { listarNotificacoes, marcarComoLida, marcarTodasComoLidas } from '../controladores/notificacaoControlador.js';
import { exigirAutenticacao } from '../intermediarios/autenticacao.js';
import { asyncHandler } from '../utilitarios/asyncHandler.js';

const router = Router();
router.use(exigirAutenticacao);
router.get('/', asyncHandler(listarNotificacoes));
router.patch('/ler-todas', asyncHandler(marcarTodasComoLidas));
router.patch('/:id/ler', asyncHandler(marcarComoLida));
export default router;
