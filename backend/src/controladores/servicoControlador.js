import { Op } from 'sequelize';
import { Servico, Categoria, Usuario, PerfilPrestador } from '../modelos/index.js';

export async function listarServicos(req, res) {
  const { categoria, prestador_id: prestadorId, busca } = req.query;
  const where = { ativo: true };
  if (prestadorId) where.prestadorId = prestadorId;
  if (busca) where.titulo = { [Op.iLike]: `%${busca}%` };

  const includeCategoria = {
    model: Categoria,
    as: 'categoria',
    ...(categoria ? { where: { slug: categoria } } : {})
  };

  const servicos = await Servico.findAll({
    where,
    include: [
      includeCategoria,
      {
        model: Usuario,
        as: 'prestador',
        attributes: ['id', 'nome'],
        include: [{ model: PerfilPrestador, as: 'perfilPrestador' }]
      }
    ],
    order: [['createdAt', 'DESC']]
  });

  return res.json({ servicos });
}

export async function obterServico(req, res) {
  const servico = await Servico.findByPk(req.params.id, {
    include: [
      { model: Categoria, as: 'categoria' },
      { model: Usuario, as: 'prestador', attributes: ['id', 'nome'] }
    ]
  });
  if (!servico) return res.status(404).json({ mensagem: 'Servico nao encontrado.' });
  return res.json({ servico });
}

export async function criarServico(req, res) {
  const servico = await Servico.create({
    prestadorId: req.usuario.id,
    categoriaId: req.body.categoriaId,
    titulo: req.body.titulo.trim(),
    descricao: req.body.descricao?.trim() || null,
    precoBase: req.body.precoBase || null
  });
  return res.status(201).json({ servico });
}

export async function atualizarServico(req, res) {
  const servico = await Servico.findOne({ where: { id: req.params.id, prestadorId: req.usuario.id } });
  if (!servico) return res.status(404).json({ mensagem: 'Servico nao encontrado.' });

  const campos = ['categoriaId', 'titulo', 'descricao', 'precoBase', 'ativo'];
  const dados = Object.fromEntries(Object.entries(req.body).filter(([chave]) => campos.includes(chave)));
  await servico.update(dados);
  return res.json({ servico });
}

export async function removerServico(req, res) {
  const servico = await Servico.findOne({ where: { id: req.params.id, prestadorId: req.usuario.id } });
  if (!servico) return res.status(404).json({ mensagem: 'Servico nao encontrado.' });
  await servico.destroy();
  return res.status(204).send();
}
