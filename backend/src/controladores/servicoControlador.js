import { Op } from 'sequelize';
import { Servico, Categoria, Usuario, PerfilPrestador } from '../modelos/index.js';

export async function listarServicos(req, res) {
  const { categoria, prestador_id: prestadorId, busca } = req.query;
  const where = { ativo: true };
  if (prestadorId) where.prestadorId = prestadorId;
  if (busca) where.titulo = { [Op.iLike]: `%${busca}%` };

  const servicos = await Servico.findAll({
    where,
    include: [
      { model: Categoria, as: 'categoria', ...(categoria ? { where: { slug: categoria } } : {}) },
      {
        model: Usuario,
        as: 'prestador',
        attributes: ['id', 'nome', 'fotoUrl'],
        include: [{ model: PerfilPrestador, as: 'perfilPrestador' }]
      }
    ],
    order: [['createdAt', 'DESC']]
  });
  return res.json({ servicos });
}

export async function listarMeusServicos(req, res) {
  const servicos = await Servico.findAll({
    where: { prestadorId: req.usuario.id },
    include: [{ model: Categoria, as: 'categoria' }],
    order: [['createdAt', 'DESC']]
  });
  return res.json({ servicos });
}

export async function obterServico(req, res) {
  const servico = await Servico.findByPk(req.params.id, {
    include: [
      { model: Categoria, as: 'categoria' },
      { model: Usuario, as: 'prestador', attributes: ['id', 'nome', 'fotoUrl'] }
    ]
  });
  if (!servico) return res.status(404).json({ mensagem: 'Serviço não encontrado.' });
  return res.json({ servico });
}

export async function criarServico(req, res) {
  const categoria = await Categoria.findOne({ where: { id: req.body.categoriaId, ativa: true } });
  if (!categoria) return res.status(422).json({ mensagem: 'Categoria inválida ou inativa.' });
  const servico = await Servico.create({
    prestadorId: req.usuario.id,
    categoriaId: req.body.categoriaId,
    titulo: req.body.titulo.trim(),
    descricao: req.body.descricao?.trim() || null,
    precoBase: req.body.precoBase ?? null
  });
  return res.status(201).json({ servico });
}

export async function atualizarServico(req, res) {
  const servico = await Servico.findOne({ where: { id: req.params.id, prestadorId: req.usuario.id } });
  if (!servico) return res.status(404).json({ mensagem: 'Serviço não encontrado.' });
  if (req.body.categoriaId) {
    const categoria = await Categoria.findOne({ where: { id: req.body.categoriaId, ativa: true } });
    if (!categoria) return res.status(422).json({ mensagem: 'Categoria inválida ou inativa.' });
  }
  const campos = ['categoriaId', 'titulo', 'descricao', 'precoBase', 'ativo'];
  const dados = Object.fromEntries(Object.entries(req.body).filter(([chave]) => campos.includes(chave)));
  if (dados.precoBase === '') dados.precoBase = null;
  await servico.update(dados);
  return res.json({ servico });
}

export async function removerServico(req, res) {
  const servico = await Servico.findOne({ where: { id: req.params.id, prestadorId: req.usuario.id } });
  if (!servico) return res.status(404).json({ mensagem: 'Serviço não encontrado.' });
  await servico.destroy();
  return res.status(204).send();
}
