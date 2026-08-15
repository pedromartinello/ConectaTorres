import { Usuario } from '../modelos/index.js';
import { verificarToken } from '../utilitarios/token.js';

export async function exigirAutenticacao(req, res, next) {
  try {
    const cabecalho = req.headers.authorization;
    const tokenBearer = cabecalho?.startsWith('Bearer ') ? cabecalho.slice(7) : null;
    const token = req.cookies?.token || tokenBearer;

    if (!token) {
      return res.status(401).json({ mensagem: 'Autenticacao necessaria.' });
    }

    const payload = verificarToken(token);
    const usuario = await Usuario.findByPk(payload.sub);

    if (!usuario || !usuario.ativo) {
      return res.status(401).json({ mensagem: 'Usuario invalido ou inativo.' });
    }

    req.usuario = usuario;
    return next();
  } catch {
    return res.status(401).json({ mensagem: 'Sessao invalida ou expirada.' });
  }
}
