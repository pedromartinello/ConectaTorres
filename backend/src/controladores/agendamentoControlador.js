import { Agendamento, Servico, Usuario, Avaliacao } from '../modelos/index.js';
import { criarNotificacao } from '../utilitarios/notificacoes.js';
import { validarHorarioPrestador, validarHorarioSolicitado } from '../servicos/disponibilidadeServico.js';

const inclusoes = [
  { model: Usuario, as: 'cliente', attributes: ['id', 'nome', 'email', 'telefone', 'fotoUrl'] },
  { model: Usuario, as: 'prestador', attributes: ['id', 'nome', 'email', 'telefone', 'fotoUrl'] },
  { model: Servico, as: 'servico' },
  { model: Avaliacao, as: 'avaliacao', required: false }
];

export async function listarMeusAgendamentos(req, res) {
  const where = req.usuario.tipo === 'prestador' ? { prestadorId: req.usuario.id } : { clienteId: req.usuario.id };
  const agendamentos = await Agendamento.findAll({ where, include: inclusoes, order: [['inicio', 'ASC']] });
  return res.json({ agendamentos });
}

export async function criarAgendamento(req, res) {
  const inicio = new Date(req.body.inicio);
  const { prestadorId, servicoId, descricao } = req.body;

  if (Number.isNaN(inicio.getTime())) return res.status(422).json({ mensagem: 'Informe uma data e um horário válidos.' });
  if (inicio <= new Date()) return res.status(422).json({ mensagem: 'Escolha um horário futuro.' });

  const prestador = await Usuario.findOne({ where: { id: prestadorId, tipo: 'prestador', ativo: true } });
  if (!prestador) return res.status(404).json({ mensagem: 'Prestador não encontrado.' });
  if (prestador.id === req.usuario.id) return res.status(422).json({ mensagem: 'Não é possível agendar consigo mesmo.' });

  let servico = null;
  if (servicoId) {
    servico = await Servico.findOne({ where: { id: servicoId, prestadorId, ativo: true } });
    if (!servico) return res.status(422).json({ mensagem: 'Serviço inválido para este prestador.' });
  }

  const validacao = await validarHorarioSolicitado(prestadorId, inicio);
  if (validacao.erro) return res.status(409).json({ mensagem: validacao.erro });

  const agendamento = await Agendamento.create({
    clienteId: req.usuario.id,
    prestadorId,
    servicoId: servicoId || null,
    horarioSolicitado: inicio,
    inicio,
    fim: null,
    descricao: descricao?.trim() || null
  });

  await criarNotificacao({
    usuarioId: prestadorId,
    tipo: 'agendamento',
    titulo: 'Nova solicitação de atendimento',
    mensagem: `${req.usuario.nome} informou um horário de referência${servico ? ` para ${servico.titulo}` : ''}. Defina o período do atendimento antes de aceitar.`,
    link: '/painel/agenda#agendamentos'
  });
  return res.status(201).json({ agendamento });
}

export async function alterarStatus(req, res) {
  const { status } = req.body;
  const agendamento = await Agendamento.findByPk(req.params.id);
  if (!agendamento) return res.status(404).json({ mensagem: 'Agendamento não encontrado.' });
  if (agendamento.concluidoEm) return res.status(409).json({ mensagem: 'Este atendimento já foi concluído.' });

  const ehClienteDono = req.usuario.tipo === 'cliente' && agendamento.clienteId === req.usuario.id;
  const ehPrestadorDono = req.usuario.tipo === 'prestador' && agendamento.prestadorId === req.usuario.id;

  if (ehClienteDono) {
    if (status !== 'cancelado') return res.status(403).json({ mensagem: 'O cliente somente pode cancelar o agendamento.' });
  } else if (ehPrestadorDono) {
    if (!['aceito', 'recusado', 'cancelado'].includes(status)) return res.status(422).json({ mensagem: 'Status inválido para o prestador.' });
    if (status === 'aceito' && !agendamento.fim) {
      return res.status(409).json({ mensagem: 'Defina o período do atendimento antes de aceitar a solicitação.' });
    }
  } else {
    return res.status(403).json({ mensagem: 'Você não pode alterar este agendamento.' });
  }

  if (['recusado', 'cancelado'].includes(agendamento.status)) {
    return res.status(409).json({ mensagem: 'Este agendamento já está encerrado.' });
  }

  await agendamento.update({ status });
  const destinatario = ehPrestadorDono ? agendamento.clienteId : agendamento.prestadorId;
  await criarNotificacao({
    usuarioId: destinatario,
    tipo: 'agendamento',
    titulo: 'Agendamento atualizado',
    mensagem: `O agendamento foi atualizado para ${status}.`,
    link: '/painel/agenda#agendamentos'
  });
  return res.json({ agendamento });
}

export async function ajustarHorario(req, res) {
  const agendamento = await Agendamento.findOne({ where: { id: req.params.id, prestadorId: req.usuario.id } });
  if (!agendamento) return res.status(404).json({ mensagem: 'Agendamento não encontrado.' });
  if (['recusado', 'cancelado'].includes(agendamento.status) || agendamento.concluidoEm) {
    return res.status(409).json({ mensagem: 'Este agendamento não pode mais ter o horário alterado.' });
  }

  const inicio = new Date(req.body.inicio);
  const fim = new Date(req.body.fim);
  if (Number.isNaN(inicio.getTime()) || Number.isNaN(fim.getTime())) return res.status(422).json({ mensagem: 'Informe um período válido.' });
  if (inicio <= new Date()) return res.status(422).json({ mensagem: 'Escolha um horário futuro.' });
  if (fim <= inicio) return res.status(422).json({ mensagem: 'O horário final deve ser posterior ao horário inicial.' });

  const validacao = await validarHorarioPrestador(req.usuario.id, inicio, fim, agendamento.id);
  if (validacao.erro) return res.status(409).json({ mensagem: validacao.erro });

  const eraSomenteReferencia = !agendamento.fim;
  await agendamento.update({ inicio, fim });
  await criarNotificacao({
    usuarioId: agendamento.clienteId,
    tipo: 'agendamento',
    titulo: eraSomenteReferencia ? 'Período definido pelo prestador' : 'Horário ajustado pelo prestador',
    mensagem: eraSomenteReferencia
      ? 'O prestador definiu o período previsto para sua solicitação. Confira os dados na agenda.'
      : 'O prestador alterou o horário da sua solicitação. Confira os novos dados.',
    link: '/painel/agenda#agendamentos'
  });
  return res.json({ agendamento });
}

export async function concluirAgendamento(req, res) {
  const agendamento = await Agendamento.findOne({ where: { id: req.params.id, prestadorId: req.usuario.id } });
  if (!agendamento) return res.status(404).json({ mensagem: 'Agendamento não encontrado.' });
  if (agendamento.status !== 'aceito') return res.status(409).json({ mensagem: 'Somente agendamentos aceitos podem ser concluídos.' });
  if (agendamento.concluidoEm) return res.status(409).json({ mensagem: 'Este atendimento já foi concluído.' });
  if (new Date(agendamento.inicio) > new Date()) return res.status(409).json({ mensagem: 'O atendimento ainda não iniciou e não pode ser concluído.' });

  await agendamento.update({ concluidoEm: new Date() });
  await criarNotificacao({
    usuarioId: agendamento.clienteId,
    tipo: 'avaliacao',
    titulo: 'Atendimento concluído',
    mensagem: 'Seu atendimento foi marcado como concluído. Você já pode avaliar o prestador.',
    link: '/painel/avaliacoes'
  });
  return res.json({ agendamento });
}
