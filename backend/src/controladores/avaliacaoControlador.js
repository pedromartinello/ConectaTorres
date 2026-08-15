import { Avaliacao, Agendamento, Usuario } from '../modelos/index.js';
import { criarNotificacao } from '../utilitarios/notificacoes.js';

export async function listarAvaliacoesPrestador(req, res) {
  const avaliacoes = await Avaliacao.findAll({
    where: { prestadorId: req.params.prestadorId, visivel: true },
    include: [{ model: Usuario, as: 'cliente', attributes: ['id', 'nome', 'fotoUrl'] }],
    order: [['createdAt', 'DESC']]
  });
  return res.json({ avaliacoes });
}

export async function listarMinhasAvaliacoes(req, res) {
  const where = req.usuario.tipo === 'prestador'
    ? { prestadorId: req.usuario.id }
    : { clienteId: req.usuario.id };
  const avaliacoes = await Avaliacao.findAll({
    where,
    include: [
      { model: Usuario, as: 'cliente', attributes: ['id', 'nome', 'fotoUrl'] },
      { model: Usuario, as: 'prestador', attributes: ['id', 'nome', 'fotoUrl'] },
      { model: Agendamento, as: 'agendamento' }
    ],
    order: [['createdAt', 'DESC']]
  });
  return res.json({ avaliacoes });
}

export async function criarAvaliacao(req, res) {
  const { agendamentoId, nota, comentario } = req.body;
  const agendamento = await Agendamento.findOne({ where: { id: agendamentoId, clienteId: req.usuario.id } });
  if (!agendamento) return res.status(404).json({ mensagem: 'Agendamento nao encontrado.' });
  if (!agendamento.concluidoEm) return res.status(409).json({ mensagem: 'A avaliacao so pode ser feita apos o prestador concluir o atendimento.' });

  const existente = await Avaliacao.findOne({ where: { agendamentoId } });
  if (existente) return res.status(409).json({ mensagem: 'Este agendamento ja foi avaliado.' });

  const avaliacao = await Avaliacao.create({
    agendamentoId,
    clienteId: req.usuario.id,
    prestadorId: agendamento.prestadorId,
    nota,
    comentario: comentario?.trim() || null
  });

  await criarNotificacao({
    usuarioId: agendamento.prestadorId,
    tipo: 'avaliacao',
    titulo: 'Nova avaliacao recebida',
    mensagem: `${req.usuario.nome} avaliou seu atendimento com ${nota} estrela(s).`,
    link: '/painel/avaliacoes'
  });
  return res.status(201).json({ avaliacao });
}
