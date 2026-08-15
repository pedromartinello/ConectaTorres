import { Usuario, PerfilPrestador } from '../modelos/index.js';
import { gerarToken, opcoesCookieToken } from '../utilitarios/token.js';

async function carregarUsuario(id) {
  return Usuario.findByPk(id, {
    attributes: ['id', 'nome', 'email', 'telefone', 'fotoUrl', 'tipo', 'ativo', 'createdAt'],
    include: [{ model: PerfilPrestador, as: 'perfilPrestador', required: false }]
  });
}

export async function cadastrar(req, res) {
  const { nome, email, senha, tipo } = req.body;
  const emailNormalizado = email.trim().toLowerCase();

  const existente = await Usuario.findOne({ where: { email: emailNormalizado } });
  if (existente) return res.status(409).json({ mensagem: 'Este e-mail ja esta cadastrado.' });

  const tipoPermitido = tipo === 'prestador' ? 'prestador' : 'cliente';
  const usuarioCriado = await Usuario.create({
    nome: nome.trim(),
    email: emailNormalizado,
    senhaHash: senha,
    tipo: tipoPermitido
  });

  if (usuarioCriado.tipo === 'prestador') {
    await PerfilPrestador.create({ usuarioId: usuarioCriado.id });
  }

  const usuario = await carregarUsuario(usuarioCriado.id);
  const token = gerarToken(usuario);
  res.cookie('token', token, opcoesCookieToken());
  return res.status(201).json({ usuario });
}

export async function login(req, res) {
  const { email, senha } = req.body;
  const usuarioSenha = await Usuario.findOne({ where: { email: email.trim().toLowerCase() } });

  if (!usuarioSenha || !(await usuarioSenha.verificarSenha(senha))) {
    return res.status(401).json({ mensagem: 'E-mail ou senha incorretos.' });
  }
  if (!usuarioSenha.ativo) return res.status(403).json({ mensagem: 'Usuario desativado.' });

  const usuario = await carregarUsuario(usuarioSenha.id);
  const token = gerarToken(usuario);
  res.cookie('token', token, opcoesCookieToken());
  return res.json({ usuario });
}

export async function logout(req, res) {
  res.clearCookie('token', { path: '/' });
  return res.status(204).send();
}

export async function eu(req, res) {
  const usuario = await carregarUsuario(req.usuario.id);
  return res.json({ usuario });
}
