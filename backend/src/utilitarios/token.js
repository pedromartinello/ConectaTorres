import jwt from 'jsonwebtoken';
import { ambiente } from '../configuracao/ambiente.js';

export function gerarToken(usuario) {
  return jwt.sign(
    { sub: usuario.id, tipo: usuario.tipo },
    ambiente.jwt.segredo,
    { expiresIn: ambiente.jwt.expiracao }
  );
}

export function verificarToken(token) {
  return jwt.verify(token, ambiente.jwt.segredo);
}

export function opcoesCookieToken() {
  return {
    httpOnly: true,
    secure: ambiente.nodeEnv === 'production',
    sameSite: 'lax',
    maxAge: 8 * 60 * 60 * 1000,
    path: '/'
  };
}
