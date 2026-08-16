import { Categoria, Servico } from '../modelos/index.js';
import { iaEstaConfigurada, interpretarNecessidadeComIA, sugerirDescricaoPerfilComIA } from '../servicos/iaServico.js';

export async function statusIA(req, res) {
  return res.json({ configurada: iaEstaConfigurada() });
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

  return res.json({
    interpretacao: {
      mensagem: resultado.mensagem,
      termos: resultado.termos,
      categorias: categoriasInterpretadas
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
