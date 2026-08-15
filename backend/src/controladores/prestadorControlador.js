import { Op } from 'sequelize';
import { Usuario, PerfilPrestador, Servico, Categoria, Avaliacao, Disponibilidade } from '../modelos/index.js';

function calcularMedia(avaliacoes = []) {
  if (!avaliacoes.length) return 0;
  const soma = avaliacoes.reduce((total, item) => total + Number(item.nota), 0);
  return Number((soma / avaliacoes.length).toFixed(1));
}

export async function listarPrestadores(req, res) {
  const { busca, cidade, categoria, avaliacao_min: avaliacaoMin } = req.query;

  const usuarios = await Usuario.findAll({
    where: { tipo: 'prestador', ativo: true },
    attributes: ['id', 'nome', 'email', 'tipo'],
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
      { model: Avaliacao, as: 'avaliacoesRecebidas', required: false, attributes: ['nota'] }
    ],
    order: [['nome', 'ASC']]
  });

  let prestadores = usuarios.map((usuario) => {
    const json = usuario.toJSON();
    json.mediaAvaliacoes = calcularMedia(json.avaliacoesRecebidas);
    json.totalAvaliacoes = json.avaliacoesRecebidas.length;
    delete json.avaliacoesRecebidas;
    return json;
  });

  if (categoria) {
    const termo = categoria.toLowerCase();
    prestadores = prestadores.filter((item) =>
      item.servicos.some((servico) =>
        servico.categoria?.slug?.toLowerCase() === termo ||
        servico.categoria?.nome?.toLowerCase().includes(termo)
      )
    );
  }

  if (busca) {
    const termo = busca.toLowerCase();
    prestadores = prestadores.filter((item) => {
      const campos = [
        item.nome,
        item.perfilPrestador?.titulo,
        item.perfilPrestador?.descricao,
        ...item.servicos.flatMap((s) => [s.titulo, s.descricao, s.categoria?.nome])
      ].filter(Boolean).join(' ').toLowerCase();
      return campos.includes(termo);
    });
  }

  if (avaliacaoMin) {
    prestadores = prestadores.filter((item) => item.mediaAvaliacoes >= Number(avaliacaoMin));
  }

  return res.json({ prestadores });
}

export async function obterPrestador(req, res) {
  const prestador = await Usuario.findOne({
    where: { id: req.params.id, tipo: 'prestador', ativo: true },
    attributes: ['id', 'nome', 'email'],
    include: [
      { model: PerfilPrestador, as: 'perfilPrestador' },
      {
        model: Servico,
        as: 'servicos',
        where: { ativo: true },
        required: false,
        include: [{ model: Categoria, as: 'categoria' }]
      },
      { model: Avaliacao, as: 'avaliacoesRecebidas', required: false },
      {
        model: Disponibilidade,
        as: 'disponibilidades',
        required: false,
        where: { fim: { [Op.gte]: new Date() } }
      }
    ]
  });

  if (!prestador) {
    return res.status(404).json({ mensagem: 'Prestador nao encontrado.' });
  }

  const json = prestador.toJSON();
  json.mediaAvaliacoes = calcularMedia(json.avaliacoesRecebidas);
  json.totalAvaliacoes = json.avaliacoesRecebidas.length;
  return res.json({ prestador: json });
}

export async function atualizarMeuPerfil(req, res) {
  const camposPermitidos = [
    'titulo',
    'descricao',
    'whatsapp',
    'cidade',
    'estado',
    'regiaoAtendimento',
    'modalidadeOrcamento',
    'valorReferencia',
    'fotoUrl'
  ];

  const dados = Object.fromEntries(
    Object.entries(req.body).filter(([chave]) => camposPermitidos.includes(chave))
  );

  const [perfil] = await PerfilPrestador.findOrCreate({ where: { usuarioId: req.usuario.id } });
  await perfil.update(dados);
  return res.json({ perfil });
}
