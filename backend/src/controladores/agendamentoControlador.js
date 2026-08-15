import { Op } from 'sequelize';
import { Agendamento, Disponibilidade, Servico, Usuario, Avaliacao } from '../modelos/index.js';
import { criarNotificacao } from '../utilitarios/notificacoes.js';

const inclusoes = [
  { model: Usuario, as: 'cliente', attributes: ['id', 'nome', 'email', 'telefone', 'fotoUrl'] },
  { model: Usuario, as: 'prestador', attributes: ['id', 'nome', 'email', 'telefone', 'fotoUrl'] },
  { model: Servico, as: 'servico' },
  { model: Avaliacao, as: 'avaliacao', required: false }
];

async function validarHorarioPrestador(prestadorId, inicio, fim, ignorarAgendamentoId = null) {
  if (fim <= inicio) return { erro: 'O horario final deve ser posterior ao horario inicial.' };

  const disponibilidade = await Disponibilidade.findOne({
    where: { prestadorId, inicio: { [Op.lte]: inicio }, fim: { [Op.gte]: fim } }
  });
  if (!disponibilidade) return { erro: 'O prestador nao possui disponibilidade para todo esse periodo.' };

  const whereConflito = {
    prestadorId,
    status: { [Op.in]: ['pendente', 'aceito'] },
    inicio: { [Op.lt]: fim },
    fim: { [Op.gt]: inicio }
  };
  if (ignorarAgendamentoId) whereConflito.id = { [Op.ne]: ignorarAgendamentoId };
  const conflito = await Agendamento.findOne({ where: whereConflito });
  if (conflito) return { erro: 'Este horario ja possui uma solicitacao ou agendamento.' };
  return { disponibilidade };
}

export async function listarMeusAgendamentos(req, res) {
  const where = req.usuario.tipo === 'prestador' ? { prestadorId: req.usuario.id } : { clienteId: req.usuario.id };
  const agendamentos = await Agendamento.findAll({ where, include: inclusoes, order: [['inicio', 'ASC']] });
  return res.json({ agendamentos });
}

export async function criarAgendamento(req, res) {
  const inicio = new Date(req.body.inicio);
  const fim = new Date(req.body.fim);
  const { prestadorId, servicoId, descricao } = req.body;

  if (inicio <= new Date()) return res.status(422).json({ mensagem: 'Escolha um horario futuro.' });
  const prestador = await Usuario.findOne({ where: { id: prestadorId, tipo: 'prestador', ativo: true } });
  if (!prestador) return res.status(404).json({ mensagem: 'Prestador nao encontrado.' });
  if (prestador.id === req.usuario.id) return res.status(422).json({ mensagem: 'Nao e possivel agendar consigo mesmo.' });

  let servico = null;
  if (servicoId) {
    servico = await Servico.findOne({ where: { id: servicoId, prestadorId, ativo: true } });
    if (!servico) return res.status(422).json({ mensagem: 'Servico invalido para este prestador.' });
  }

  const validacao = await validarHorarioPrestador(prestadorId, inicio, fim);
  if (validacao.erro) return res.status(409).json({ mensagem: validacao.erro });

  const agendamento = await Agendamento.create({
    clienteId: req.usuario.id,
    prestadorId,
    servicoId: servicoId || null,
    inicio,
    fim,
    descricao: descricao?.trim() || null
  });

  await criarNotificacao({
    usuarioId: prestadorId,
    tipo: 'agendamento',
    titulo: 'Nova solicitacao de horario',
    mensagem: `${req.usuario.nome} solicitou um horario${servico ? ` para ${servico.titulo}` : ''}.`,
    link: '/painel/agenda'
  });
  return res.status(201).json({ agendamento });
}

export async function alterarStatus(req, res) {
  const { status } = req.body;
  const agendamento = await Agendamento.findByPk(req.params.id);
  if (!agendamento) return res.status(404).json({ mensagem: 'Agendamento nao encontrado.' });
  if (agendamento.concluidoEm) return res.status(409).json({ mensagem: 'Este atendimento ja foi concluido.' });

  const ehClienteDono = req.usuario.tipo === 'cliente' && agendamento.clienteId === req.usuario.id;
  const ehPrestadorDono = req.usuario.tipo === 'prestador' && agendamento.prestadorId === req.usuario.id;

  if (ehClienteDono) {
    if (status !== 'cancelado') return res.status(403).json({ mensagem: 'O cliente somente pode cancelar o agendamento.' });
  } else if (ehPrestadorDono) {
    if (!['aceito', 'recusado', 'cancelado'].includes(status)) return res.status(422).json({ mensagem: 'Status invalido para o prestador.' });
  } else {
    return res.status(403).json({ mensagem: 'Voce nao pode alterar este agendamento.' });
  }

  if (['recusado', 'cancelado'].includes(agendamento.status)) {
    return res.status(409).json({ mensagem: 'Este agendamento ja esta encerrado.' });
  }

  await agendamento.update({ status });
  const destinatario = ehPrestadorDono ? agendamento.clienteId : agendamento.prestadorId;
  await criarNotificacao({
    usuarioId: destinatario,
    tipo: 'agendamento',
    titulo: 'Agendamento atualizado',
    mensagem: `O agendamento foi atualizado para ${status}.`,
    link: '/painel/agenda'
  });
  return res.json({ agendamento });
}

export async function ajustarHorario(req, res) {
  const agendamento = await Agendamento.findOne({ where: { id: req.params.id, prestadorId: req.usuario.id } });
  if (!agendamento) return res.status(404).json({ mensagem: 'Agendamento nao encontrado.' });
  if (['recusado', 'cancelado'].includes(agendamento.status) || agendamento.concluidoEm) {
    return res.status(409).json({ mensagem: 'Este agendamento nao pode mais ter o horario alterado.' });
  }

  const inicio = new Date(req.body.inicio);
  const fim = new Date(req.body.fim);
  if (inicio <= new Date()) return res.status(422).json({ mensagem: 'Escolha um horario futuro.' });
  const validacao = await validarHorarioPrestador(req.usuario.id, inicio, fim, agendamento.id);
  if (validacao.erro) return res.status(409).json({ mensagem: validacao.erro });

  await agendamento.update({ inicio, fim });
  await criarNotificacao({
    usuarioId: agendamento.clienteId,
    tipo: 'agendamento',
    titulo: 'Horario ajustado pelo prestador',
    mensagem: 'O prestador alterou o horario da sua solicitacao. Confira os novos dados.',
    link: '/painel/agenda'
  });
  return res.json({ agendamento });
}

export async function concluirAgendamento(req, res) {
  const agendamento = await Agendamento.findOne({ where: { id: req.params.id, prestadorId: req.usuario.id } });
  if (!agendamento) return res.status(404).json({ mensagem: 'Agendamento nao encontrado.' });
  if (agendamento.status !== 'aceito') return res.status(409).json({ mensagem: 'Somente agendamentos aceitos podem ser concluidos.' });
  if (agendamento.concluidoEm) return res.status(409).json({ mensagem: 'Este atendimento ja foi concluido.' });

  await agendamento.update({ concluidoEm: new Date() });
  await criarNotificacao({
    usuarioId: agendamento.clienteId,
    tipo: 'avaliacao',
    titulo: 'Atendimento concluido',
    mensagem: 'Seu atendimento foi marcado como concluido. Voce ja pode avaliar o prestador.',
    link: '/painel/avaliacoes'
  });
  return res.json({ agendamento });
}
