import { Avaliacao, Agendamento, Usuario } from '../modelos/index.js';

export async function listarAvaliacoesPrestador(req, res) {
  const avaliacoes = await Avaliacao.findAll({
    where: { prestadorId: req.params.prestadorId },
    include: [{ model: Usuario, as: 'cliente', attributes: ['id', 'nome'] }],
    order: [['createdAt', 'DESC']]
  });
  return res.json({ avaliacoes });
}

export async function criarAvaliacao(req, res) {
  const { agendamentoId, nota, comentario } = req.body;
  const agendamento = await Agendamento.findOne({
    where: { id: agendamentoId, clienteId: req.usuario.id }
  });

  if (!agendamento) return res.status(404).json({ mensagem: 'Agendamento nao encontrado.' });
  if (agendamento.status !== 'aceito' || new Date(agendamento.fim) > new Date()) {
    return res.status(409).json({ mensagem: 'A avaliacao so pode ser feita apos um atendimento aceito e concluido.' });
  }

  const existente = await Avaliacao.findOne({ where: { agendamentoId } });
  if (existente) return res.status(409).json({ mensagem: 'Este agendamento ja foi avaliado.' });

  const avaliacao = await Avaliacao.create({
    agendamentoId,
    clienteId: req.usuario.id,
    prestadorId: agendamento.prestadorId,
    nota,
    comentario: comentario || null
  });
  return res.status(201).json({ avaliacao });
}
