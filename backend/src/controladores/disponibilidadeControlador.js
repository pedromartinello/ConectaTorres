import { Op } from 'sequelize';
import { sequelize } from '../configuracao/banco.js';
import { Disponibilidade, Agendamento, HorarioSemanal, BloqueioAgenda, Usuario } from '../modelos/index.js';
import { diaSemanaDaData, horaParaMinutos, obterAgendaDia, partesLocais, validarHorarioPrestador, validarHorarioSolicitado } from '../servicos/disponibilidadeServico.js';

const REGEX_HORA = /^([01]\d|2[0-3]):[0-5]\d$/;
const REGEX_DATA = /^\d{4}-\d{2}-\d{2}$/;

function normalizarHora(valor) {
  return String(valor || '').slice(0, 5);
}

function validarDataTexto(data) {
  if (!REGEX_DATA.test(String(data || ''))) return false;
  return diaSemanaDaData(data) !== null;
}

export async function listarDisponibilidades(req, res) {
  const disponibilidades = await Disponibilidade.findAll({
    where: { prestadorId: req.params.prestadorId, fim: { [Op.gte]: new Date() } },
    order: [['inicio', 'ASC']]
  });
  return res.json({ disponibilidades });
}

export async function listarMinhasDisponibilidades(req, res) {
  const disponibilidades = await Disponibilidade.findAll({
    where: { prestadorId: req.usuario.id, fim: { [Op.gte]: new Date() } },
    order: [['inicio', 'ASC']]
  });
  return res.json({ disponibilidades });
}

// Mantido para compatibilidade com registros da v0.3/v0.4 inicial.
export async function criarDisponibilidade(req, res) {
  const inicio = new Date(req.body.inicio);
  const fim = new Date(req.body.fim);
  if (Number.isNaN(inicio.getTime()) || Number.isNaN(fim.getTime())) return res.status(422).json({ mensagem: 'Informe um período válido.' });
  if (inicio <= new Date()) return res.status(422).json({ mensagem: 'A disponibilidade deve iniciar no futuro.' });
  if (fim <= inicio) return res.status(422).json({ mensagem: 'O horário final deve ser posterior ao horário inicial.' });

  const conflito = await Disponibilidade.findOne({
    where: { prestadorId: req.usuario.id, inicio: { [Op.lt]: fim }, fim: { [Op.gt]: inicio } }
  });
  if (conflito) return res.status(409).json({ mensagem: 'Já existe uma disponibilidade sobreposta.' });

  const disponibilidade = await Disponibilidade.create({
    prestadorId: req.usuario.id,
    inicio,
    fim,
    observacao: req.body.observacao?.trim() || null
  });
  return res.status(201).json({ disponibilidade });
}

export async function removerDisponibilidade(req, res) {
  const item = await Disponibilidade.findOne({ where: { id: req.params.id, prestadorId: req.usuario.id } });
  if (!item) return res.status(404).json({ mensagem: 'Disponibilidade não encontrada.' });

  const agendamento = await Agendamento.findOne({
    where: {
      prestadorId: req.usuario.id,
      status: { [Op.in]: ['pendente', 'aceito'] },
      [Op.or]: [
        { inicio: { [Op.lt]: item.fim }, fim: { [Op.gt]: item.inicio } },
        { inicio: { [Op.gte]: item.inicio, [Op.lt]: item.fim }, fim: null }
      ]
    }
  });
  if (agendamento) return res.status(409).json({ mensagem: 'Não é possível remover uma disponibilidade que possui agendamento ativo.' });

  await item.destroy();
  return res.status(204).send();
}

export async function obterMinhaConfiguracao(req, res) {
  const [horariosSemanais, bloqueios, disponibilidadesLegadas] = await Promise.all([
    HorarioSemanal.findAll({ where: { prestadorId: req.usuario.id }, order: [['diaSemana', 'ASC']] }),
    BloqueioAgenda.findAll({
      where: { prestadorId: req.usuario.id, data: { [Op.gte]: partesLocais(new Date()).data } },
      order: [['data', 'ASC'], ['diaInteiro', 'DESC'], ['inicio', 'ASC']]
    }),
    Disponibilidade.count({ where: { prestadorId: req.usuario.id, fim: { [Op.gte]: new Date() } } })
  ]);

  return res.json({ horariosSemanais, bloqueios, disponibilidadesLegadas });
}

export async function salvarHorariosSemanais(req, res) {
  const horarios = Array.isArray(req.body.horarios) ? req.body.horarios : [];
  if (!horarios.length) return res.status(422).json({ mensagem: 'Informe os horários semanais.' });

  const dias = new Set();
  const normalizados = [];
  for (const item of horarios) {
    const diaSemana = Number(item.diaSemana);
    const ativo = Boolean(item.ativo);
    if (!Number.isInteger(diaSemana) || diaSemana < 0 || diaSemana > 6 || dias.has(diaSemana)) {
      return res.status(422).json({ mensagem: 'A agenda semanal possui dias inválidos ou repetidos.' });
    }
    dias.add(diaSemana);

    if (ativo) {
      const inicio = normalizarHora(item.inicio);
      const fim = normalizarHora(item.fim);
      if (!REGEX_HORA.test(inicio) || !REGEX_HORA.test(fim)) {
        return res.status(422).json({ mensagem: 'Informe horários válidos para os dias de atendimento.' });
      }
      if (horaParaMinutos(fim) <= horaParaMinutos(inicio)) {
        return res.status(422).json({ mensagem: 'Em cada dia, o horário final deve ser posterior ao inicial.' });
      }
      normalizados.push({ prestadorId: req.usuario.id, diaSemana, ativo: true, inicio, fim });
    } else {
      normalizados.push({ prestadorId: req.usuario.id, diaSemana, ativo: false, inicio: null, fim: null });
    }
  }

  await sequelize.transaction(async (transaction) => {
    await HorarioSemanal.destroy({ where: { prestadorId: req.usuario.id }, transaction });
    await HorarioSemanal.bulkCreate(normalizados, { transaction });
  });

  const horariosSemanais = await HorarioSemanal.findAll({
    where: { prestadorId: req.usuario.id },
    order: [['diaSemana', 'ASC']]
  });
  return res.json({ mensagem: 'Horários de atendimento salvos.', horariosSemanais });
}

export async function criarBloqueio(req, res) {
  const data = String(req.body.data || '');
  const diaInteiro = req.body.diaInteiro !== false;
  const observacao = req.body.observacao?.trim() || null;

  if (!validarDataTexto(data)) return res.status(422).json({ mensagem: 'Informe uma data válida.' });
  const hoje = partesLocais(new Date()).data;
  if (data < hoje) return res.status(422).json({ mensagem: 'Não é possível bloquear uma data que já passou.' });

  if (diaInteiro) {
    let bloqueio;
    await sequelize.transaction(async (transaction) => {
      await BloqueioAgenda.destroy({ where: { prestadorId: req.usuario.id, data }, transaction });
      bloqueio = await BloqueioAgenda.create({
        prestadorId: req.usuario.id,
        data,
        diaInteiro: true,
        inicio: null,
        fim: null,
        observacao
      }, { transaction });
    });
    return res.status(201).json({ bloqueio });
  }

  const inicio = normalizarHora(req.body.inicio);
  const fim = normalizarHora(req.body.fim);
  if (!REGEX_HORA.test(inicio) || !REGEX_HORA.test(fim)) return res.status(422).json({ mensagem: 'Informe o início e o fim do bloqueio.' });
  if (horaParaMinutos(fim) <= horaParaMinutos(inicio)) return res.status(422).json({ mensagem: 'O fim do bloqueio deve ser posterior ao início.' });

  if (data === hoje) {
    const agora = partesLocais(new Date()).hora;
    if (horaParaMinutos(fim) <= horaParaMinutos(agora)) return res.status(422).json({ mensagem: 'Este período de bloqueio já passou.' });
  }

  const existentes = await BloqueioAgenda.findAll({ where: { prestadorId: req.usuario.id, data } });
  if (existentes.some((item) => item.diaInteiro)) return res.status(409).json({ mensagem: 'Esta data já está bloqueada por inteiro.' });
  const conflito = existentes.some((item) => {
    const existenteInicio = horaParaMinutos(item.inicio);
    const existenteFim = horaParaMinutos(item.fim);
    return horaParaMinutos(inicio) < existenteFim && horaParaMinutos(fim) > existenteInicio;
  });
  if (conflito) return res.status(409).json({ mensagem: 'Já existe um bloqueio que se sobrepõe a este horário.' });

  const bloqueio = await BloqueioAgenda.create({
    prestadorId: req.usuario.id,
    data,
    diaInteiro: false,
    inicio,
    fim,
    observacao
  });
  return res.status(201).json({ bloqueio });
}

export async function removerBloqueio(req, res) {
  const bloqueio = await BloqueioAgenda.findOne({ where: { id: req.params.id, prestadorId: req.usuario.id } });
  if (!bloqueio) return res.status(404).json({ mensagem: 'Bloqueio não encontrado.' });
  await bloqueio.destroy();
  return res.status(204).send();
}

export async function obterAgendaPublicaDia(req, res) {
  const prestador = await Usuario.findOne({ where: { id: req.params.prestadorId, tipo: 'prestador', ativo: true }, attributes: ['id'] });
  if (!prestador) return res.status(404).json({ mensagem: 'Prestador não encontrado.' });
  const agenda = await obterAgendaDia(prestador.id, String(req.query.data || ''));
  if (agenda.erro) return res.status(422).json({ mensagem: agenda.erro });
  return res.json({ agenda });
}

export async function verificarDisponibilidade(req, res) {
  const prestador = await Usuario.findOne({ where: { id: req.params.prestadorId, tipo: 'prestador', ativo: true }, attributes: ['id'] });
  if (!prestador) return res.status(404).json({ mensagem: 'Prestador não encontrado.' });

  const inicio = new Date(req.query.inicio);
  if (Number.isNaN(inicio.getTime())) return res.status(422).json({ mensagem: 'Informe um horário válido.' });
  if (inicio <= new Date()) return res.json({ disponivel: false, mensagem: 'Escolha um horário futuro.' });

  const possuiFim = Boolean(req.query.fim);
  if (!possuiFim) {
    const validacao = await validarHorarioSolicitado(prestador.id, inicio);
    if (validacao.erro) return res.json({ disponivel: false, mensagem: validacao.erro });
    return res.json({ disponivel: true, mensagem: 'Horário de referência disponível para solicitação.' });
  }

  const fim = new Date(req.query.fim);
  if (Number.isNaN(fim.getTime())) return res.status(422).json({ mensagem: 'Informe um horário final válido.' });
  if (fim <= inicio) return res.json({ disponivel: false, mensagem: 'O horário final deve ser posterior ao horário inicial.' });

  const validacao = await validarHorarioPrestador(prestador.id, inicio, fim);
  if (validacao.erro) return res.json({ disponivel: false, mensagem: validacao.erro });
  return res.json({ disponivel: true, mensagem: 'Período disponível.' });
}
