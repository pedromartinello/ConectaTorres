import { Op } from 'sequelize';
import { ambiente } from '../configuracao/ambiente.js';
import { Agendamento, BloqueioAgenda, Disponibilidade, HorarioSemanal } from '../modelos/index.js';

const formatadorLocal = new Intl.DateTimeFormat('en-CA', {
  timeZone: ambiente.fusoHorario,
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
  hourCycle: 'h23'
});

function mapaPartes(data) {
  return Object.fromEntries(
    formatadorLocal.formatToParts(data)
      .filter((parte) => parte.type !== 'literal')
      .map((parte) => [parte.type, parte.value])
  );
}

export function partesLocais(data) {
  const partes = mapaPartes(new Date(data));
  const dataTexto = `${partes.year}-${partes.month}-${partes.day}`;
  const hora = `${partes.hour}:${partes.minute}`;
  const diaSemana = new Date(Date.UTC(Number(partes.year), Number(partes.month) - 1, Number(partes.day))).getUTCDay();
  return { data: dataTexto, hora, diaSemana };
}

export function horaParaMinutos(hora) {
  if (!hora) return null;
  const [h, m] = String(hora).slice(0, 5).split(':').map(Number);
  if (!Number.isInteger(h) || !Number.isInteger(m)) return null;
  return (h * 60) + m;
}

function sobrepoe(inicioA, fimA, inicioB, fimB) {
  return inicioA < fimB && fimA > inicioB;
}

function dataValida(data) {
  return /^\d{4}-\d{2}-\d{2}$/.test(String(data || ''));
}

export function diaSemanaDaData(data) {
  if (!dataValida(data)) return null;
  const [ano, mes, dia] = data.split('-').map(Number);
  const teste = new Date(Date.UTC(ano, mes - 1, dia));
  if (teste.getUTCFullYear() !== ano || teste.getUTCMonth() !== mes - 1 || teste.getUTCDate() !== dia) return null;
  return teste.getUTCDay();
}

async function existeAgendaSemanal(prestadorId) {
  return (await HorarioSemanal.count({ where: { prestadorId } })) > 0;
}

async function validarPontoAgendaSemanal(prestadorId, inicio) {
  const ini = partesLocais(inicio);
  const horario = await HorarioSemanal.findOne({
    where: { prestadorId, diaSemana: ini.diaSemana, ativo: true }
  });

  if (!horario) return { erro: 'O prestador não atende neste dia da semana.' };

  const minuto = horaParaMinutos(ini.hora);
  const trabalhoIni = horaParaMinutos(horario.inicio);
  const trabalhoFim = horaParaMinutos(horario.fim);

  if (minuto < trabalhoIni || minuto >= trabalhoFim) {
    return { erro: `Neste dia, o prestador atende das ${String(horario.inicio).slice(0, 5)} às ${String(horario.fim).slice(0, 5)}.` };
  }

  const bloqueios = await BloqueioAgenda.findAll({ where: { prestadorId, data: ini.data } });
  for (const bloqueio of bloqueios) {
    if (bloqueio.diaInteiro) return { erro: 'O prestador marcou esta data como indisponível.' };
    const bloqueioIni = horaParaMinutos(bloqueio.inicio);
    const bloqueioFim = horaParaMinutos(bloqueio.fim);
    if (minuto >= bloqueioIni && minuto < bloqueioFim) {
      return { erro: `O prestador está indisponível das ${String(bloqueio.inicio).slice(0, 5)} às ${String(bloqueio.fim).slice(0, 5)} nesta data.` };
    }
  }

  return { horario };
}

async function validarAgendaSemanal(prestadorId, inicio, fim) {
  const ini = partesLocais(inicio);
  const final = partesLocais(fim);

  if (ini.data !== final.data) {
    return { erro: 'O atendimento deve começar e terminar no mesmo dia.' };
  }

  const horario = await HorarioSemanal.findOne({
    where: { prestadorId, diaSemana: ini.diaSemana, ativo: true }
  });

  if (!horario) return { erro: 'O prestador não atende neste dia da semana.' };

  const iniMin = horaParaMinutos(ini.hora);
  const fimMin = horaParaMinutos(final.hora);
  const trabalhoIni = horaParaMinutos(horario.inicio);
  const trabalhoFim = horaParaMinutos(horario.fim);

  if (iniMin < trabalhoIni || fimMin > trabalhoFim) {
    return { erro: `Neste dia, o prestador atende das ${String(horario.inicio).slice(0, 5)} às ${String(horario.fim).slice(0, 5)}.` };
  }

  const bloqueios = await BloqueioAgenda.findAll({ where: { prestadorId, data: ini.data } });
  for (const bloqueio of bloqueios) {
    if (bloqueio.diaInteiro) return { erro: 'O prestador marcou esta data como indisponível.' };
    const bloqueioIni = horaParaMinutos(bloqueio.inicio);
    const bloqueioFim = horaParaMinutos(bloqueio.fim);
    if (sobrepoe(iniMin, fimMin, bloqueioIni, bloqueioFim)) {
      return { erro: `O prestador está indisponível das ${String(bloqueio.inicio).slice(0, 5)} às ${String(bloqueio.fim).slice(0, 5)} nesta data.` };
    }
  }

  return { horario };
}

async function validarPontoDisponibilidadeLegada(prestadorId, inicio) {
  const disponibilidade = await Disponibilidade.findOne({
    where: { prestadorId, inicio: { [Op.lte]: inicio }, fim: { [Op.gt]: inicio } }
  });
  if (!disponibilidade) return { erro: 'O prestador não possui disponibilidade para este horário.' };
  return { disponibilidade };
}

async function validarDisponibilidadeLegada(prestadorId, inicio, fim) {
  const disponibilidade = await Disponibilidade.findOne({
    where: { prestadorId, inicio: { [Op.lte]: inicio }, fim: { [Op.gte]: fim } }
  });
  if (!disponibilidade) return { erro: 'O prestador não possui disponibilidade para todo esse período.' };
  return { disponibilidade };
}

async function obterAgendamentosAtivos(prestadorId, ignorarAgendamentoId = null) {
  const where = {
    prestadorId,
    status: { [Op.in]: ['pendente', 'aceito'] }
  };
  if (ignorarAgendamentoId) where.id = { [Op.ne]: ignorarAgendamentoId };
  return Agendamento.findAll({ where, attributes: ['id', 'inicio', 'fim', 'status'] });
}

function conflitaComPonto(item, ponto) {
  const inicioExistente = new Date(item.inicio);
  if (item.fim) {
    const fimExistente = new Date(item.fim);
    return ponto >= inicioExistente && ponto < fimExistente;
  }

  const pontoLocal = partesLocais(ponto);
  const existenteLocal = partesLocais(inicioExistente);
  return pontoLocal.data === existenteLocal.data && pontoLocal.hora === existenteLocal.hora;
}

function conflitaComPeriodo(item, inicio, fim) {
  const inicioExistente = new Date(item.inicio);
  if (item.fim) {
    const fimExistente = new Date(item.fim);
    return sobrepoe(inicio, fim, inicioExistente, fimExistente);
  }
  return inicioExistente >= inicio && inicioExistente < fim;
}

export async function validarHorarioSolicitado(prestadorId, inicio, ignorarAgendamentoId = null) {
  const usaAgendaSemanal = await existeAgendaSemanal(prestadorId);
  const validacaoBase = usaAgendaSemanal
    ? await validarPontoAgendaSemanal(prestadorId, inicio)
    : await validarPontoDisponibilidadeLegada(prestadorId, inicio);

  if (validacaoBase.erro) return validacaoBase;

  const ativos = await obterAgendamentosAtivos(prestadorId, ignorarAgendamentoId);
  if (ativos.some((item) => conflitaComPonto(item, inicio))) {
    return { erro: 'Este horário já está ocupado ou possui uma solicitação pendente.' };
  }

  return { ...validacaoBase, modo: usaAgendaSemanal ? 'semanal' : 'legado' };
}

export async function validarHorarioPrestador(prestadorId, inicio, fim, ignorarAgendamentoId = null) {
  if (fim <= inicio) return { erro: 'O horário final deve ser posterior ao horário inicial.' };

  const usaAgendaSemanal = await existeAgendaSemanal(prestadorId);
  const validacaoBase = usaAgendaSemanal
    ? await validarAgendaSemanal(prestadorId, inicio, fim)
    : await validarDisponibilidadeLegada(prestadorId, inicio, fim);

  if (validacaoBase.erro) return validacaoBase;

  const ativos = await obterAgendamentosAtivos(prestadorId, ignorarAgendamentoId);
  if (ativos.some((item) => conflitaComPeriodo(item, inicio, fim))) {
    return { erro: 'Este período conflita com outra solicitação ou agendamento.' };
  }

  return { ...validacaoBase, modo: usaAgendaSemanal ? 'semanal' : 'legado' };
}

export async function obterAgendaDia(prestadorId, data) {
  const diaSemana = diaSemanaDaData(data);
  if (diaSemana === null) return { erro: 'Informe uma data válida.' };

  const usaAgendaSemanal = await existeAgendaSemanal(prestadorId);
  const agendamentosAtivos = await Agendamento.findAll({
    where: {
      prestadorId,
      status: { [Op.in]: ['pendente', 'aceito'] },
      inicio: { [Op.gte]: new Date(`${data}T00:00:00`) }
    },
    attributes: ['id', 'inicio', 'fim', 'status'],
    order: [['inicio', 'ASC']]
  });

  const ocupados = agendamentosAtivos
    .filter((item) => partesLocais(item.inicio).data === data)
    .map((item) => ({
      inicio: partesLocais(item.inicio).hora,
      fim: item.fim ? partesLocais(item.fim).hora : null,
      status: item.status,
      tipo: item.fim ? 'periodo' : 'solicitacao'
    }));

  if (!usaAgendaSemanal) {
    const legadas = await Disponibilidade.findAll({
      where: { prestadorId, fim: { [Op.gte]: new Date() } },
      order: [['inicio', 'ASC']]
    });
    const periodos = legadas
      .filter((item) => partesLocais(item.inicio).data === data)
      .map((item) => ({ inicio: partesLocais(item.inicio).hora, fim: partesLocais(item.fim).hora }));
    return {
      modo: 'legado',
      data,
      diaSemana,
      aberto: periodos.length > 0,
      horario: null,
      periodos,
      bloqueios: [],
      ocupados
    };
  }

  const horario = await HorarioSemanal.findOne({ where: { prestadorId, diaSemana } });
  const bloqueios = await BloqueioAgenda.findAll({
    where: { prestadorId, data },
    order: [['diaInteiro', 'DESC'], ['inicio', 'ASC']]
  });
  const bloqueadoDiaInteiro = bloqueios.some((item) => item.diaInteiro);

  return {
    modo: 'semanal',
    data,
    diaSemana,
    aberto: Boolean(horario?.ativo && !bloqueadoDiaInteiro),
    horario: horario?.ativo ? { inicio: String(horario.inicio).slice(0, 5), fim: String(horario.fim).slice(0, 5) } : null,
    periodos: [],
    bloqueios: bloqueios.map((item) => ({
      id: item.id,
      diaInteiro: item.diaInteiro,
      inicio: item.inicio ? String(item.inicio).slice(0, 5) : null,
      fim: item.fim ? String(item.fim).slice(0, 5) : null,
      observacao: item.observacao
    })),
    ocupados
  };
}
