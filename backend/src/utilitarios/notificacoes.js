import { Notificacao } from '../modelos/index.js';

export async function criarNotificacao({ usuarioId, tipo = 'geral', titulo, mensagem, link = null }) {
  if (!usuarioId) return null;
  return Notificacao.create({ usuarioId, tipo, titulo, mensagem, link });
}
