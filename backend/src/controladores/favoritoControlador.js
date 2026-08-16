import { Favorito, Usuario, PerfilPrestador, Avaliacao, Servico, Categoria } from '../modelos/index.js';

export async function listarFavoritos(req, res) {
  const favoritos = await Favorito.findAll({
    where: { clienteId: req.usuario.id },
    include: [{
      model: Usuario,
      as: 'prestador',
      attributes: ['id', 'nome', 'fotoUrl'],
      include: [
        { model: PerfilPrestador, as: 'perfilPrestador' },
        { model: Avaliacao, as: 'avaliacoesRecebidas', where: { visivel: true }, required: false, attributes: ['nota'] },
        { model: Servico, as: 'servicos', where: { ativo: true }, required: false, include: [{ model: Categoria, as: 'categoria' }] }
      ]
    }],
    order: [['createdAt', 'DESC']]
  });

  const resposta = favoritos.map((f) => {
    const json = f.toJSON();
    const notas = json.prestador.avaliacoesRecebidas || [];
    json.prestador.mediaAvaliacoes = notas.length
      ? Number((notas.reduce((s, a) => s + Number(a.nota), 0) / notas.length).toFixed(1))
      : 0;
    json.prestador.totalAvaliacoes = notas.length;
    delete json.prestador.avaliacoesRecebidas;
    json.prestador.favoritado = true;
    return json;
  });
  return res.json({ favoritos: resposta });
}

export async function adicionarFavorito(req, res) {
  const prestador = await Usuario.findOne({ where: { id: req.params.prestadorId, tipo: 'prestador', ativo: true } });
  if (!prestador) return res.status(404).json({ mensagem: 'Prestador não encontrado.' });
  const [favorito, criado] = await Favorito.findOrCreate({ where: { clienteId: req.usuario.id, prestadorId: prestador.id } });
  return res.status(criado ? 201 : 200).json({ favorito });
}

export async function removerFavorito(req, res) {
  const favorito = await Favorito.findOne({ where: { clienteId: req.usuario.id, prestadorId: req.params.prestadorId } });
  if (!favorito) return res.status(404).json({ mensagem: 'Favorito não encontrado.' });
  await favorito.destroy();
  return res.status(204).send();
}
