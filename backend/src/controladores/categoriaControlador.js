import { Categoria } from '../modelos/index.js';

function criarSlug(texto) {
  return texto.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim()
    .replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

export async function listarCategorias(req, res) {
  const categorias = await Categoria.findAll({ where: { ativa: true }, order: [['nome', 'ASC']] });
  return res.json({ categorias });
}

export async function criarCategoria(req, res) {
  const nome = req.body.nome.trim();
  const categoria = await Categoria.create({ nome, slug: criarSlug(nome) });
  return res.status(201).json({ categoria });
}
