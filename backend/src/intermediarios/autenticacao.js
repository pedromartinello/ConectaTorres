import { Usuario } from '../modelos/index.js';
import { verificarToken } from '../utilitarios/token.js';

async function resolverUsuario(req) {
  const cabecalho = req.headers.authorization;
  const tokenBearer = cabecalho?.startsWith('Bearer ') ? cabecalho.slice(7) : null;
  const token = req.cookies?.token || tokenBearer;
  if (!token) return null;
  const payload = verificarToken(token);
  return Usuario.findByPk(payload.sub);
}

export async function exigirAutenticacao(req, res, next) {
  try {
    const usuario = await resolverUsuario(req);
    if (!usuario || !usuario.ativo) {
      return res.status(401).json({ mensagem: 'Usuário inválido, inativo ou não autenticado.' });
    }
    req.usuario = usuario;
    return next();
  } catch {
    return res.status(401).json({ mensagem: 'Sessão inválida ou expirada.' });
  }
}

export async function autenticacaoOpcional(req, res, next) {
  try {
    const usuario = await resolverUsuario(req);
    if (usuario?.ativo) req.usuario = usuario;
  } catch {
    req.usuario = null;
  }
  return next();
}
