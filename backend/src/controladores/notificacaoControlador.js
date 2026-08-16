import { Notificacao } from '../modelos/index.js';

export async function listarNotificacoes(req, res) {
  const notificacoes = await Notificacao.findAll({
    where: { usuarioId: req.usuario.id },
    order: [['createdAt', 'DESC']],
    limit: 100
  });
  const naoLidas = await Notificacao.count({ where: { usuarioId: req.usuario.id, lidaEm: null } });
  return res.json({ notificacoes, naoLidas });
}

export async function marcarComoLida(req, res) {
  const notificacao = await Notificacao.findOne({ where: { id: req.params.id, usuarioId: req.usuario.id } });
  if (!notificacao) return res.status(404).json({ mensagem: 'Notificação não encontrada.' });
  if (!notificacao.lidaEm) await notificacao.update({ lidaEm: new Date() });
  return res.json({ notificacao });
}

export async function marcarTodasComoLidas(req, res) {
  await Notificacao.update(
    { lidaEm: new Date() },
    { where: { usuarioId: req.usuario.id, lidaEm: null } }
  );
  return res.status(204).send();
}
