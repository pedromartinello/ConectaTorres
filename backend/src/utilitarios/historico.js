import { HistoricoAtendimento } from '../modelos/HistoricoAtendimento.js';

export async function registrarHistorico({ agendamentoId, usuarioId = null, tipo, titulo, descricao = null }) {
  if (!agendamentoId || !tipo || !titulo) return null;
  return HistoricoAtendimento.create({
    agendamentoId,
    usuarioId,
    tipo,
    titulo,
    descricao: descricao ? String(descricao).slice(0, 600) : null
  });
}
