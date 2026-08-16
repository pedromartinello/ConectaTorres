import { Op } from 'sequelize';
import { Usuario, PerfilPrestador, Categoria, Denuncia, Avaliacao, Agendamento } from '../modelos/index.js';
import { obterPaginacao, montarPaginacao } from '../utilitarios/paginacao.js';

export async function obterResumo(req, res) {
  const [usuarios, clientes, prestadores, agendamentos, denunciasAbertas, avaliacoes] = await Promise.all([
    Usuario.count(),
    Usuario.count({ where: { tipo: 'cliente', ativo: true } }),
    Usuario.count({ where: { tipo: 'prestador', ativo: true } }),
    Agendamento.count(),
    Denuncia.count({ where: { status: 'aberta' } }),
    Avaliacao.count({ where: { visivel: true } })
  ]);
  return res.json({ resumo: { usuarios, clientes, prestadores, agendamentos, denunciasAbertas, avaliacoes } });
}

export async function listarUsuarios(req, res) {
  const { pagina, limite } = obterPaginacao(req.query, 15, 50);
  const where = {};
  if (req.query.tipo && ['cliente', 'prestador', 'admin'].includes(req.query.tipo)) where.tipo = req.query.tipo;
  if (req.query.ativo === 'true') where.ativo = true;
  if (req.query.ativo === 'false') where.ativo = false;
  if (req.query.busca?.trim()) {
    const termo = `%${req.query.busca.trim()}%`;
    where[Op.or] = [{ nome: { [Op.iLike]: termo } }, { email: { [Op.iLike]: termo } }];
  }

  const { rows: usuarios, count: total } = await Usuario.findAndCountAll({
    where,
    attributes: ['id', 'nome', 'email', 'telefone', 'fotoUrl', 'tipo', 'ativo', 'createdAt'],
    include: [{ model: PerfilPrestador, as: 'perfilPrestador', required: false }],
    order: [['createdAt', 'DESC']],
    distinct: true,
    limit: limite,
    offset: (pagina - 1) * limite
  });
  return res.json({ usuarios, paginacao: montarPaginacao(total, pagina, limite) });
}

export async function alterarAtivo(req, res) {
  const usuario = await Usuario.findByPk(req.params.id);
  if (!usuario) return res.status(404).json({ mensagem: 'Usuário não encontrado.' });
  if (usuario.id === req.usuario.id && req.body.ativo === false) {
    return res.status(409).json({ mensagem: 'Você não pode desativar a própria conta de administrador.' });
  }
  await usuario.update({ ativo: Boolean(req.body.ativo) });
  return res.json({ usuario });
}

export async function listarCategoriasAdmin(req, res) {
  const categorias = await Categoria.findAll({ order: [['nome', 'ASC']] });
  return res.json({ categorias });
}

export async function atualizarCategoria(req, res) {
  const categoria = await Categoria.findByPk(req.params.id);
  if (!categoria) return res.status(404).json({ mensagem: 'Categoria não encontrada.' });
  const dados = {};
  if (typeof req.body.ativa === 'boolean') dados.ativa = req.body.ativa;
  if (req.body.nome?.trim()) dados.nome = req.body.nome.trim();
  await categoria.update(dados);
  return res.json({ categoria });
}

export async function listarDenuncias(req, res) {
  const { pagina, limite } = obterPaginacao(req.query, 10, 50);
  const where = {};
  if (req.query.status && ['aberta', 'em_analise', 'resolvida', 'arquivada'].includes(req.query.status)) {
    where.status = req.query.status;
  }
  const { rows: denuncias, count: total } = await Denuncia.findAndCountAll({
    where,
    include: [
      { model: Usuario, as: 'denunciante', attributes: ['id', 'nome', 'email'] },
      { model: Usuario, as: 'prestador', attributes: ['id', 'nome'], required: false },
      { model: Avaliacao, as: 'avaliacao', required: false }
    ],
    order: [['createdAt', 'DESC']],
    distinct: true,
    limit: limite,
    offset: (pagina - 1) * limite
  });
  return res.json({ denuncias, paginacao: montarPaginacao(total, pagina, limite) });
}

export async function atualizarDenuncia(req, res) {
  const denuncia = await Denuncia.findByPk(req.params.id);
  if (!denuncia) return res.status(404).json({ mensagem: 'Denúncia não encontrada.' });
  await denuncia.update({
    status: req.body.status,
    respostaAdmin: req.body.respostaAdmin?.trim() || null
  });
  return res.json({ denuncia });
}

export async function listarAvaliacoesAdmin(req, res) {
  const { pagina, limite } = obterPaginacao(req.query, 10, 50);
  const where = {};
  if (req.query.visivel === 'true') where.visivel = true;
  if (req.query.visivel === 'false') where.visivel = false;
  const { rows: avaliacoes, count: total } = await Avaliacao.findAndCountAll({
    where,
    include: [
      { model: Usuario, as: 'cliente', attributes: ['id', 'nome'] },
      { model: Usuario, as: 'prestador', attributes: ['id', 'nome'] }
    ],
    order: [['createdAt', 'DESC']],
    distinct: true,
    limit: limite,
    offset: (pagina - 1) * limite
  });
  return res.json({ avaliacoes, paginacao: montarPaginacao(total, pagina, limite) });
}

export async function alterarVisibilidadeAvaliacao(req, res) {
  const avaliacao = await Avaliacao.findByPk(req.params.id);
  if (!avaliacao) return res.status(404).json({ mensagem: 'Avaliação não encontrada.' });
  await avaliacao.update({ visivel: Boolean(req.body.visivel) });
  return res.json({ avaliacao });
}
