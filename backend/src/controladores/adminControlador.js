import { Usuario, PerfilPrestador } from '../modelos/index.js';

export async function listarUsuarios(req, res) {
  const usuarios = await Usuario.findAll({
    attributes: ['id', 'nome', 'email', 'tipo', 'ativo', 'createdAt'],
    include: [{ model: PerfilPrestador, as: 'perfilPrestador', required: false }],
    order: [['createdAt', 'DESC']]
  });
  return res.json({ usuarios });
}

export async function alterarAtivo(req, res) {
  const usuario = await Usuario.findByPk(req.params.id);
  if (!usuario) return res.status(404).json({ mensagem: 'Usuario nao encontrado.' });
  if (usuario.id === req.usuario.id && req.body.ativo === false) {
    return res.status(409).json({ mensagem: 'Voce nao pode desativar a propria conta de administrador por esta rota.' });
  }
  await usuario.update({ ativo: Boolean(req.body.ativo) });
  return res.json({ usuario });
}
