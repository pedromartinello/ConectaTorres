import { Op } from 'sequelize';
import {
  Usuario,
  PerfilPrestador,
  Servico,
  Categoria,
  Avaliacao,
  Disponibilidade,
  PortfolioImagem,
  Favorito,
  HorarioSemanal,
  BloqueioAgenda
} from '../modelos/index.js';
import { removerArquivoPorUrl } from '../configuracao/upload.js';
import { obterPaginacao, montarPaginacao } from '../utilitarios/paginacao.js';
import { diaSemanaDaData } from '../servicos/disponibilidadeServico.js';

function calcularMedia(avaliacoes = []) {
  if (!avaliacoes.length) return 0;
  const soma = avaliacoes.reduce((total, item) => total + Number(item.nota), 0);
  return Number((soma / avaliacoes.length).toFixed(1));
}

function menorPreco(item) {
  const precos = item.servicos.map((s) => Number(s.precoBase)).filter((n) => Number.isFinite(n) && n >= 0);
  const referencia = Number(item.perfilPrestador?.valorReferencia);
  if (Number.isFinite(referencia) && referencia >= 0) precos.push(referencia);
  return precos.length ? Math.min(...precos) : null;
}

export async function listarPrestadores(req, res) {
  const {
    busca,
    cidade,
    categoria,
    categorias: categoriasCsv,
    avaliacao_min: avaliacaoMin,
    preco_max: precoMax,
    disponivel_em: disponivelEm,
    ordenar = 'relevancia'
  } = req.query;
  const { pagina, limite } = obterPaginacao(req.query, 12, 24);

  const usuarios = await Usuario.findAll({
    where: { tipo: 'prestador', ativo: true },
    attributes: ['id', 'nome', 'fotoUrl'],
    include: [
      {
        model: PerfilPrestador,
        as: 'perfilPrestador',
        required: true,
        where: cidade ? { cidade: { [Op.iLike]: `%${cidade}%` } } : undefined
      },
      {
        model: Servico,
        as: 'servicos',
        required: false,
        where: { ativo: true },
        include: [{ model: Categoria, as: 'categoria' }]
      },
      {
        model: Avaliacao,
        as: 'avaliacoesRecebidas',
        required: false,
        where: { visivel: true },
        attributes: ['nota']
      },
      {
        model: Disponibilidade,
        as: 'disponibilidades',
        required: false,
        where: { fim: { [Op.gte]: new Date() } }
      },
      {
        model: HorarioSemanal,
        as: 'horariosSemanais',
        required: false
      },
      {
        model: BloqueioAgenda,
        as: 'bloqueiosAgenda',
        required: false,
        where: disponivelEm ? { data: disponivelEm } : undefined
      }
    ],
    order: [['nome', 'ASC']]
  });

  let idsFavoritos = new Set();
  if (req.usuario?.tipo === 'cliente') {
    const favoritos = await Favorito.findAll({ where: { clienteId: req.usuario.id }, attributes: ['prestadorId'] });
    idsFavoritos = new Set(favoritos.map((f) => f.prestadorId));
  }

  let prestadores = usuarios.map((usuario) => {
    const json = usuario.toJSON();
    json.mediaAvaliacoes = calcularMedia(json.avaliacoesRecebidas);
    json.totalAvaliacoes = json.avaliacoesRecebidas.length;
    json.menorPreco = menorPreco(json);
    json.favoritado = idsFavoritos.has(json.id);
    delete json.avaliacoesRecebidas;
    return json;
  });

  const categoriasMultiplas = String(categoriasCsv || '')
    .split(',')
    .map((item) => item.trim().toLowerCase())
    .filter(Boolean)
    .slice(0, 6);

  if (categoriasMultiplas.length) {
    const aceitas = new Set(categoriasMultiplas);
    prestadores = prestadores.filter((item) => item.servicos.some((servico) =>
      aceitas.has(servico.categoria?.slug?.toLowerCase())
    ));
  } else if (categoria) {
    const termo = categoria.toLowerCase();
    prestadores = prestadores.filter((item) => item.servicos.some((servico) =>
      servico.categoria?.slug?.toLowerCase() === termo ||
      servico.categoria?.nome?.toLowerCase().includes(termo)
    ));
  }

  if (busca) {
    const termo = busca.toLowerCase();
    prestadores = prestadores.filter((item) => {
      const campos = [
        item.nome,
        item.perfilPrestador?.titulo,
        item.perfilPrestador?.descricao,
        item.perfilPrestador?.regiaoAtendimento,
        ...item.servicos.flatMap((s) => [s.titulo, s.descricao, s.categoria?.nome])
      ].filter(Boolean).join(' ').toLowerCase();
      return campos.includes(termo);
    });
  }

  if (avaliacaoMin) prestadores = prestadores.filter((item) => item.mediaAvaliacoes >= Number(avaliacaoMin));
  if (precoMax) prestadores = prestadores.filter((item) => item.menorPreco !== null && item.menorPreco <= Number(precoMax));

  if (disponivelEm) {
    const diaSemana = diaSemanaDaData(disponivelEm);
    const inicioDia = new Date(`${disponivelEm}T00:00:00`);
    const fimDia = new Date(`${disponivelEm}T23:59:59`);
    if (diaSemana !== null && !Number.isNaN(inicioDia.getTime())) {
      prestadores = prestadores.filter((item) => {
        if (item.horariosSemanais?.length) {
          const horario = item.horariosSemanais.find((h) => Number(h.diaSemana) === diaSemana && h.ativo);
          const bloqueado = item.bloqueiosAgenda?.some((b) => b.data === disponivelEm && b.diaInteiro);
          return Boolean(horario && !bloqueado);
        }
        return item.disponibilidades.some((d) => new Date(d.inicio) <= fimDia && new Date(d.fim) >= inicioDia);
      });
    }
  }

  const ordenadores = {
    avaliacao: (a, b) => b.mediaAvaliacoes - a.mediaAvaliacoes || a.nome.localeCompare(b.nome),
    menor_preco: (a, b) => (a.menorPreco ?? Infinity) - (b.menorPreco ?? Infinity) || a.nome.localeCompare(b.nome),
    nome: (a, b) => a.nome.localeCompare(b.nome)
  };
  if (ordenadores[ordenar]) prestadores.sort(ordenadores[ordenar]);

  prestadores.forEach((item) => {
    delete item.bloqueiosAgenda;
  });

  const total = prestadores.length;
  const inicio = (pagina - 1) * limite;
  const itens = prestadores.slice(inicio, inicio + limite);
  return res.json({ prestadores: itens, paginacao: montarPaginacao(total, pagina, limite) });
}

export async function obterPrestador(req, res) {
  const prestador = await Usuario.findOne({
    where: { id: req.params.id, tipo: 'prestador', ativo: true },
    attributes: ['id', 'nome', 'fotoUrl'],
    include: [
      { model: PerfilPrestador, as: 'perfilPrestador' },
      {
        model: Servico,
        as: 'servicos',
        where: { ativo: true },
        required: false,
        include: [{ model: Categoria, as: 'categoria' }]
      },
      {
        model: Avaliacao,
        as: 'avaliacoesRecebidas',
        required: false,
        where: { visivel: true },
        include: [{ model: Usuario, as: 'cliente', attributes: ['id', 'nome', 'fotoUrl'] }]
      },
      {
        model: Disponibilidade,
        as: 'disponibilidades',
        required: false,
        where: { fim: { [Op.gte]: new Date() } }
      },
      { model: HorarioSemanal, as: 'horariosSemanais', required: false },
      {
        model: BloqueioAgenda,
        as: 'bloqueiosAgenda',
        required: false,
        where: { data: { [Op.gte]: new Date().toISOString().slice(0, 10) } }
      },
      { model: PortfolioImagem, as: 'portfolio', required: false }
    ],
    order: [
      [{ model: HorarioSemanal, as: 'horariosSemanais' }, 'diaSemana', 'ASC'],
      [{ model: Disponibilidade, as: 'disponibilidades' }, 'inicio', 'ASC'],
      [{ model: PortfolioImagem, as: 'portfolio' }, 'ordem', 'ASC']
    ]
  });

  if (!prestador) return res.status(404).json({ mensagem: 'Prestador não encontrado.' });

  const json = prestador.toJSON();
  json.mediaAvaliacoes = calcularMedia(json.avaliacoesRecebidas);
  json.totalAvaliacoes = json.avaliacoesRecebidas.length;
  json.menorPreco = menorPreco(json);
  json.favoritado = false;
  if (req.usuario?.tipo === 'cliente') {
    json.favoritado = Boolean(await Favorito.findOne({ where: { clienteId: req.usuario.id, prestadorId: json.id } }));
  }
  return res.json({ prestador: json });
}

export async function atualizarMeuPerfil(req, res) {
  const camposPermitidos = [
    'titulo', 'descricao', 'whatsapp', 'cidade', 'estado', 'regiaoAtendimento',
    'modalidadeOrcamento', 'valorReferencia'
  ];
  const dados = Object.fromEntries(Object.entries(req.body).filter(([chave]) => camposPermitidos.includes(chave)));
  if (dados.estado) dados.estado = String(dados.estado).toUpperCase();
  if (dados.valorReferencia === '') dados.valorReferencia = null;

  const [perfil] = await PerfilPrestador.findOrCreate({ where: { usuarioId: req.usuario.id } });
  await perfil.update(dados);
  return res.json({ perfil });
}

export async function listarMeuPortfolio(req, res) {
  const portfolio = await PortfolioImagem.findAll({
    where: { prestadorId: req.usuario.id },
    order: [['ordem', 'ASC'], ['createdAt', 'DESC']]
  });
  return res.json({ portfolio });
}

export async function adicionarPortfolio(req, res) {
  if (!req.file) return res.status(422).json({ mensagem: 'Selecione uma imagem.' });
  const total = await PortfolioImagem.count({ where: { prestadorId: req.usuario.id } });
  if (total >= 12) {
    removerArquivoPorUrl(`/uploads/portfolio/${req.file.filename}`);
    return res.status(409).json({ mensagem: 'O portfólio permite no máximo 12 imagens.' });
  }
  const item = await PortfolioImagem.create({
    prestadorId: req.usuario.id,
    imagemUrl: `/uploads/portfolio/${req.file.filename}`,
    legenda: req.body.legenda?.trim() || null,
    ordem: total
  });
  return res.status(201).json({ item });
}

export async function atualizarPortfolio(req, res) {
  const item = await PortfolioImagem.findOne({ where: { id: req.params.id, prestadorId: req.usuario.id } });
  if (!item) return res.status(404).json({ mensagem: 'Imagem não encontrada.' });
  await item.update({
    legenda: req.body.legenda?.trim() || null,
    ordem: Number.isInteger(req.body.ordem) ? req.body.ordem : item.ordem
  });
  return res.json({ item });
}

export async function removerPortfolio(req, res) {
  const item = await PortfolioImagem.findOne({ where: { id: req.params.id, prestadorId: req.usuario.id } });
  if (!item) return res.status(404).json({ mensagem: 'Imagem não encontrada.' });
  removerArquivoPorUrl(item.imagemUrl);
  await item.destroy();
  return res.status(204).send();
}
