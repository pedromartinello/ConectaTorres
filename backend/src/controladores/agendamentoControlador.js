import { Op } from 'sequelize';
import { Agendamento, Disponibilidade, Servico, Usuario } from '../modelos/index.js';

export async function listarMeusAgendamentos(req, res) {
  const where = req.usuario.tipo === 'prestador'
    ? { prestadorId: req.usuario.id }
    : { clienteId: req.usuario.id };

  const agendamentos = await Agendamento.findAll({
    where,
    include: [
      { model: Usuario, as: 'cliente', attributes: ['id', 'nome', 'email'] },
      { model: Usuario, as: 'prestador', attributes: ['id', 'nome', 'email'] },
      { model: Servico, as: 'servico' }
    ],
    order: [['inicio', 'ASC']]
  });

  return res.json({ agendamentos });
}

export async function criarAgendamento(req, res) {
  const inicio = new Date(req.body.inicio);
  const fim = new Date(req.body.fim);
  const { prestadorId, servicoId, descricao } = req.body;

  if (fim <= inicio) {
    return res.status(422).json({ mensagem: 'O horario final deve ser posterior ao horario inicial.' });
  }

  const prestador = await Usuario.findOne({ where: { id: prestadorId, tipo: 'prestador', ativo: true } });
  if (!prestador) return res.status(404).json({ mensagem: 'Prestador nao encontrado.' });

  if (servicoId) {
    const servico = await Servico.findOne({ where: { id: servicoId, prestadorId, ativo: true } });
    if (!servico) return res.status(422).json({ mensagem: 'Servico invalido para este prestador.' });
  }

  const disponibilidade = await Disponibilidade.findOne({
    where: {
      prestadorId,
      inicio: { [Op.lte]: inicio },
      fim: { [Op.gte]: fim }
    }
  });
  if (!disponibilidade) {
    return res.status(409).json({ mensagem: 'O prestador nao possui disponibilidade para todo esse periodo.' });
  }

  const conflito = await Agendamento.findOne({
    where: {
      prestadorId,
      status: { [Op.in]: ['pendente', 'aceito'] },
      inicio: { [Op.lt]: fim },
      fim: { [Op.gt]: inicio }
    }
  });
  if (conflito) {
    return res.status(409).json({ mensagem: 'Este horario ja possui uma solicitacao ou agendamento.' });
  }

  const agendamento = await Agendamento.create({
    clienteId: req.usuario.id,
    prestadorId,
    servicoId: servicoId || null,
    inicio,
    fim,
    descricao: descricao || null
  });

  return res.status(201).json({ agendamento });
}

export async function alterarStatus(req, res) {
  const { status } = req.body;
  const agendamento = await Agendamento.findByPk(req.params.id);
  if (!agendamento) return res.status(404).json({ mensagem: 'Agendamento nao encontrado.' });

  const ehClienteDono = req.usuario.tipo === 'cliente' && agendamento.clienteId === req.usuario.id;
  const ehPrestadorDono = req.usuario.tipo === 'prestador' && agendamento.prestadorId === req.usuario.id;

  if (ehClienteDono) {
    if (status !== 'cancelado') {
      return res.status(403).json({ mensagem: 'O cliente somente pode cancelar o agendamento.' });
    }
  } else if (ehPrestadorDono) {
    if (!['aceito', 'recusado', 'cancelado'].includes(status)) {
      return res.status(422).json({ mensagem: 'Status invalido para o prestador.' });
    }
  } else {
    return res.status(403).json({ mensagem: 'Voce nao pode alterar este agendamento.' });
  }

  await agendamento.update({ status });
  return res.json({ agendamento });
}
