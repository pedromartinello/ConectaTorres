import { Op } from 'sequelize';
import { Categoria, Servico } from '../modelos/index.js';
import { iaEstaConfigurada, interpretarNecessidadeComIA, sugerirDescricaoPerfilComIA } from '../servicos/iaServico.js';

export async function statusIA(req, res) {
  return res.json({ configurada: iaEstaConfigurada() });
}

async function calcularFaixaValores(categoriasInterpretadas) {
  const ids = categoriasInterpretadas.map((categoria) => categoria.id);
  if (!ids.length) return null;
  const servicos = await Servico.findAll({
    where: {
      ativo: true,
      categoriaId: { [Op.in]: ids },
      precoBase: { [Op.ne]: null }
    },
    attributes: ['precoBase']
  });
  const valores = servicos.map((s) => Number(s.precoBase)).filter((v) => Number.isFinite(v) && v > 0);
  if (!valores.length) return null;
  return {
    minimo: Math.min(...valores),
    maximo: Math.max(...valores),
    amostra: valores.length,
    origem: 'valores de referência cadastrados pelos prestadores'
  };
}

export async function interpretarNecessidade(req, res) {
  const categorias = await Categoria.findAll({
    where: { ativa: true },
    attributes: ['id', 'nome', 'slug'],
    order: [['nome', 'ASC']]
  });

  const resultado = await interpretarNecessidadeComIA({
    descricao: req.body.descricao.trim(),
    categorias
  });

  const porSlug = new Map(categorias.map((categoria) => [categoria.slug, categoria]));
  const categoriasInterpretadas = resultado.categorias
    .map((slug) => porSlug.get(slug))
    .filter(Boolean)
    .map((categoria) => ({ id: categoria.id, nome: categoria.nome, slug: categoria.slug }));

  const faixaValores = await calcularFaixaValores(categoriasInterpretadas);

  return res.json({
    interpretacao: {
      orientacao: resultado.orientacao,
      passos: resultado.passos,
      termos: resultado.termos,
      categorias: categoriasInterpretadas,
      faixaValores
    },
    filtros: {
      categorias: categoriasInterpretadas.map((categoria) => categoria.slug)
    }
  });
}

export async function sugerirDescricaoPerfil(req, res) {
  const servicos = await Servico.findAll({
    where: { prestadorId: req.usuario.id, ativo: true },
    attributes: ['titulo'],
    order: [['titulo', 'ASC']]
  });

  const descricao = await sugerirDescricaoPerfilComIA({
    titulo: req.body.titulo?.trim(),
    descricao: req.body.descricao?.trim(),
    cidade: req.body.cidade?.trim(),
    regiaoAtendimento: req.body.regiaoAtendimento?.trim(),
    servicos
  });

  return res.json({ descricao });
}
