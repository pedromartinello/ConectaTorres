import { fn, col } from 'sequelize';
import { Usuario, PerfilPrestador, Categoria, Denuncia, Avaliacao, Agendamento } from '../modelos/index.js';

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
  const usuarios = await Usuario.findAll({
    attributes: ['id', 'nome', 'email', 'telefone', 'fotoUrl', 'tipo', 'ativo', 'createdAt'],
    include: [{ model: PerfilPrestador, as: 'perfilPrestador', required: false }],
    order: [['createdAt', 'DESC']]
  });
  return res.json({ usuarios });
}

export async function alterarAtivo(req, res) {
  const usuario = await Usuario.findByPk(req.params.id);
  if (!usuario) return res.status(404).json({ mensagem: 'Usuario nao encontrado.' });
  if (usuario.id === req.usuario.id && req.body.ativo === false) {
    return res.status(409).json({ mensagem: 'Voce nao pode desativar a propria conta de administrador.' });
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
  if (!categoria) return res.status(404).json({ mensagem: 'Categoria nao encontrada.' });
  const dados = {};
  if (typeof req.body.ativa === 'boolean') dados.ativa = req.body.ativa;
  if (req.body.nome?.trim()) dados.nome = req.body.nome.trim();
  await categoria.update(dados);
  return res.json({ categoria });
}

export async function listarDenuncias(req, res) {
  const denuncias = await Denuncia.findAll({
    include: [
      { model: Usuario, as: 'denunciante', attributes: ['id', 'nome', 'email'] },
      { model: Usuario, as: 'prestador', attributes: ['id', 'nome'], required: false },
      { model: Avaliacao, as: 'avaliacao', required: false }
    ],
    order: [['createdAt', 'DESC']]
  });
  return res.json({ denuncias });
}

export async function atualizarDenuncia(req, res) {
  const denuncia = await Denuncia.findByPk(req.params.id);
  if (!denuncia) return res.status(404).json({ mensagem: 'Denuncia nao encontrada.' });
  await denuncia.update({
    status: req.body.status,
    respostaAdmin: req.body.respostaAdmin?.trim() || null
  });
  return res.json({ denuncia });
}

export async function listarAvaliacoesAdmin(req, res) {
  const avaliacoes = await Avaliacao.findAll({
    include: [
      { model: Usuario, as: 'cliente', attributes: ['id', 'nome'] },
      { model: Usuario, as: 'prestador', attributes: ['id', 'nome'] }
    ],
    order: [['createdAt', 'DESC']]
  });
  return res.json({ avaliacoes });
}

export async function alterarVisibilidadeAvaliacao(req, res) {
  const avaliacao = await Avaliacao.findByPk(req.params.id);
  if (!avaliacao) return res.status(404).json({ mensagem: 'Avaliacao nao encontrada.' });
  await avaliacao.update({ visivel: Boolean(req.body.visivel) });
  return res.json({ avaliacao });
}
