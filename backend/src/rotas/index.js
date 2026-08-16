import { Router } from 'express';
import autenticacaoRotas from './autenticacaoRotas.js';
import usuarioRotas from './usuarioRotas.js';
import categoriaRotas from './categoriaRotas.js';
import prestadorRotas from './prestadorRotas.js';
import servicoRotas from './servicoRotas.js';
import disponibilidadeRotas from './disponibilidadeRotas.js';
import agendamentoRotas from './agendamentoRotas.js';
import avaliacaoRotas from './avaliacaoRotas.js';
import favoritoRotas from './favoritoRotas.js';
import notificacaoRotas from './notificacaoRotas.js';
import denunciaRotas from './denunciaRotas.js';
import adminRotas from './adminRotas.js';
import painelRotas from './painelRotas.js';
import iaRotas from './iaRotas.js';
import { ambiente } from '../configuracao/ambiente.js';

const router = Router();
router.get('/saude', (req, res) => res.json({
  status: 'ok',
  aplicacao: 'ConectaTorres API',
  versao: '0.5.0',
  integracoes: {
    ia: ambiente.ia.habilitada && ambiente.ia.configurada,
    email: ambiente.email.configurado
  }
}));
router.use('/autenticacao', autenticacaoRotas);
router.use('/usuarios', usuarioRotas);
router.use('/categorias', categoriaRotas);
router.use('/prestadores', prestadorRotas);
router.use('/servicos', servicoRotas);
router.use('/disponibilidades', disponibilidadeRotas);
router.use('/agendamentos', agendamentoRotas);
router.use('/avaliacoes', avaliacaoRotas);
router.use('/favoritos', favoritoRotas);
router.use('/notificacoes', notificacaoRotas);
router.use('/denuncias', denunciaRotas);
router.use('/admin', adminRotas);
router.use('/painel', painelRotas);
router.use('/ia', iaRotas);
export default router;
