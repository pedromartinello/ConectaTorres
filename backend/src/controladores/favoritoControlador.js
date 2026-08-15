import { Favorito, Usuario, PerfilPrestador } from '../modelos/index.js';

export async function listarFavoritos(req, res) {
  const favoritos = await Favorito.findAll({
    where: { clienteId: req.usuario.id },
    include: [{
      model: Usuario,
      as: 'prestador',
      attributes: ['id', 'nome'],
      include: [{ model: PerfilPrestador, as: 'perfilPrestador' }]
    }],
    order: [['createdAt', 'DESC']]
  });
  return res.json({ favoritos });
}

export async function adicionarFavorito(req, res) {
  const prestador = await Usuario.findOne({ where: { id: req.params.prestadorId, tipo: 'prestador', ativo: true } });
  if (!prestador) return res.status(404).json({ mensagem: 'Prestador nao encontrado.' });

  const [favorito, criado] = await Favorito.findOrCreate({
    where: { clienteId: req.usuario.id, prestadorId: prestador.id }
  });
  return res.status(criado ? 201 : 200).json({ favorito });
}

export async function removerFavorito(req, res) {
  const favorito = await Favorito.findOne({
    where: { clienteId: req.usuario.id, prestadorId: req.params.prestadorId }
  });
  if (!favorito) return res.status(404).json({ mensagem: 'Favorito nao encontrado.' });
  await favorito.destroy();
  return res.status(204).send();
}
