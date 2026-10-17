import { Op } from 'sequelize';
import { Agendamento, Orcamento, Servico, Usuario } from '../modelos/index.js';
import { criarNotificacao } from '../utilitarios/notificacoes.js';
import { registrarHistorico } from '../utilitarios/historico.js';

const inclusoes = [
  {
    model: Agendamento,
    as: 'agendamento',
    include: [
      { model: Servico, as: 'servico', attributes: ['id', 'titulo'] },
      { model: Usuario, as: 'cliente', attributes: ['id', 'nome', 'fotoUrl'] },
      { model: Usuario, as: 'prestador', attributes: ['id', 'nome', 'fotoUrl'] }
    ]
  },
  { model: Usuario, as: 'cliente', attributes: ['id', 'nome', 'fotoUrl'] },
  { model: Usuario, as: 'prestador', attributes: ['id', 'nome', 'fotoUrl'] }
];

function hoje() {
  return new Date().toISOString().slice(0, 10);
}

async function atualizarExpirados() {
  await Orcamento.update(
    { status: 'expirado' },
    { where: { status: 'enviado', validade: { [Op.lt]: hoje() } } }
  );
}

function validarValor(valor) {
  const numero = Number(valor);
  return Number.isFinite(numero) && numero > 0 ? numero : null;
}

export async function listarMeusOrcamentos(req, res) {
  await atualizarExpirados();
  const where = req.usuario.tipo === 'prestador'
    ? { prestadorId: req.usuario.id }
    : { clienteId: req.usuario.id };

  const orcamentos = await Orcamento.findAll({
    where,
    include: inclusoes,
    order: [['updatedAt', 'DESC']]
  });
  return res.json({ orcamentos });
}

export async function enviarOrcamento(req, res) {
  const agendamento = await Agendamento.findOne({
    where: { id: req.body.agendamentoId, prestadorId: req.usuario.id },
    include: [{ model: Servico, as: 'servico', attributes: ['id', 'titulo'] }]
  });
  if (!agendamento) return res.status(404).json({ mensagem: 'Solicitação não encontrada.' });
  if (agendamento.concluidoEm) return res.status(409).json({ mensagem: 'Não é possível enviar orçamento para um atendimento já concluído.' });
  if (['recusado', 'cancelado'].includes(agendamento.status)) return res.status(409).json({ mensagem: 'Esta solicitação já está encerrada.' });
  if (!agendamento.fim) return res.status(409).json({ mensagem: 'Defina o período do atendimento antes de enviar o orçamento.' });

  const valor = validarValor(req.body.valor);
  if (!valor) return res.status(422).json({ mensagem: 'Informe um valor de orçamento maior que zero.' });

  const descricao = String(req.body.descricao || '').trim();
  if (descricao.length < 10) return res.status(422).json({ mensagem: 'Descreva o que está incluído no orçamento com pelo menos 10 caracteres.' });

  const validade = req.body.validade || null;
  if (validade && validade < hoje()) return res.status(422).json({ mensagem: 'A validade do orçamento não pode estar no passado.' });

  let orcamento = await Orcamento.findOne({ where: { agendamentoId: agendamento.id } });
  const novoOrcamento = !orcamento;
  if (orcamento?.status === 'aceito') return res.status(409).json({ mensagem: 'Este orçamento já foi aceito e não pode ser alterado.' });

  const dados = {
    agendamentoId: agendamento.id,
    prestadorId: req.usuario.id,
    clienteId: agendamento.clienteId,
    valor,
    descricao,
    materiaisInclusos: Boolean(req.body.materiaisInclusos),
    observacoes: String(req.body.observacoes || '').trim() || null,
    validade,
    status: 'enviado',
    respondidoEm: null
  };

  if (orcamento) await orcamento.update(dados);
  else orcamento = await Orcamento.create(dados);

  await registrarHistorico({
    agendamentoId: agendamento.id,
    usuarioId: req.usuario.id,
    tipo: 'orcamento_enviado',
    titulo: 'Orçamento enviado',
    descricao: `Orçamento de R$ ${valor.toFixed(2).replace('.', ',')} enviado ao cliente.`
  });
  await criarNotificacao({
    usuarioId: agendamento.clienteId,
    tipo: 'orcamento',
    titulo: 'Novo orçamento recebido',
    mensagem: `${req.usuario.nome} enviou um orçamento para ${agendamento.servico?.titulo || 'sua solicitação'}.`,
    link: `/painel/orcamentos#orcamento-${orcamento.id}`
  });

  const completo = await Orcamento.findByPk(orcamento.id, { include: inclusoes });
  return res.status(novoOrcamento ? 201 : 200).json({ orcamento: completo });
}

export async function responderOrcamento(req, res) {
  await atualizarExpirados();
  const resposta = req.body.resposta;
  if (!['aceitar', 'recusar'].includes(resposta)) return res.status(422).json({ mensagem: 'Resposta de orçamento inválida.' });

  const orcamento = await Orcamento.findOne({
    where: { id: req.params.id, clienteId: req.usuario.id },
    include: [{ model: Agendamento, as: 'agendamento' }, { model: Usuario, as: 'prestador', attributes: ['id', 'nome'] }]
  });
  if (!orcamento) return res.status(404).json({ mensagem: 'Orçamento não encontrado.' });
  if (orcamento.status !== 'enviado') return res.status(409).json({ mensagem: `Este orçamento está ${orcamento.status} e não pode mais ser respondido.` });
  if (orcamento.agendamento.concluidoEm || ['recusado', 'cancelado'].includes(orcamento.agendamento.status)) {
    await orcamento.update({ status: 'cancelado', respondidoEm: new Date() });
    return res.status(409).json({ mensagem: 'A solicitação vinculada a este orçamento já foi encerrada.' });
  }

  if (orcamento.validade && orcamento.validade < hoje()) {
    await orcamento.update({ status: 'expirado' });
    return res.status(409).json({ mensagem: 'Este orçamento expirou. Solicite uma nova proposta ao prestador.' });
  }

  const novoStatus = resposta === 'aceitar' ? 'aceito' : 'recusado';
  await orcamento.update({ status: novoStatus, respondidoEm: new Date() });

  if (novoStatus === 'aceito' && orcamento.agendamento.status === 'pendente' && orcamento.agendamento.fim) {
    await orcamento.agendamento.update({ status: 'aceito' });
  }

  await registrarHistorico({
    agendamentoId: orcamento.agendamentoId,
    usuarioId: req.usuario.id,
    tipo: novoStatus === 'aceito' ? 'orcamento_aceito' : 'orcamento_recusado',
    titulo: novoStatus === 'aceito' ? 'Orçamento aceito' : 'Orçamento recusado',
    descricao: novoStatus === 'aceito'
      ? 'O cliente aceitou o orçamento enviado pelo prestador.'
      : 'O cliente recusou o orçamento enviado pelo prestador.'
  });

  await criarNotificacao({
    usuarioId: orcamento.prestadorId,
    tipo: 'orcamento',
    titulo: novoStatus === 'aceito' ? 'Orçamento aceito' : 'Orçamento recusado',
    mensagem: novoStatus === 'aceito'
      ? 'O cliente aceitou seu orçamento. Confira o atendimento na agenda.'
      : 'O cliente recusou seu orçamento. Você pode revisar e enviar uma nova proposta.',
    link: `/painel/orcamentos#orcamento-${orcamento.id}`
  });

  return res.json({ orcamento });
}

export async function cancelarOrcamento(req, res) {
  const orcamento = await Orcamento.findOne({ where: { id: req.params.id, prestadorId: req.usuario.id } });
  if (!orcamento) return res.status(404).json({ mensagem: 'Orçamento não encontrado.' });
  if (orcamento.status !== 'enviado') return res.status(409).json({ mensagem: 'Somente orçamentos aguardando resposta podem ser cancelados.' });

  await orcamento.update({ status: 'cancelado', respondidoEm: new Date() });
  await registrarHistorico({
    agendamentoId: orcamento.agendamentoId,
    usuarioId: req.usuario.id,
    tipo: 'orcamento_cancelado',
    titulo: 'Orçamento cancelado',
    descricao: 'O prestador cancelou a proposta enviada.'
  });
  await criarNotificacao({
    usuarioId: orcamento.clienteId,
    tipo: 'orcamento',
    titulo: 'Orçamento cancelado',
    mensagem: 'O prestador cancelou o orçamento enviado anteriormente.',
    link: `/painel/orcamentos#orcamento-${orcamento.id}`
  });
  return res.json({ orcamento });
}
