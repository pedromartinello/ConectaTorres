import { Router } from 'express';
import autenticacaoRotas from './autenticacaoRotas.js';
import categoriaRotas from './categoriaRotas.js';
import prestadorRotas from './prestadorRotas.js';
import servicoRotas from './servicoRotas.js';
import disponibilidadeRotas from './disponibilidadeRotas.js';
import agendamentoRotas from './agendamentoRotas.js';
import avaliacaoRotas from './avaliacaoRotas.js';
import favoritoRotas from './favoritoRotas.js';
import adminRotas from './adminRotas.js';

const router = Router();

router.get('/saude', (req, res) => {
  res.json({ status: 'ok', aplicacao: 'ConectaTorres API' });
});

router.use('/autenticacao', autenticacaoRotas);
router.use('/categorias', categoriaRotas);
router.use('/prestadores', prestadorRotas);
router.use('/servicos', servicoRotas);
router.use('/disponibilidades', disponibilidadeRotas);
router.use('/agendamentos', agendamentoRotas);
router.use('/avaliacoes', avaliacaoRotas);
router.use('/favoritos', favoritoRotas);
router.use('/admin', adminRotas);

export default router;
