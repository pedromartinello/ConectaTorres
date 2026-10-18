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

function baseCookie() {
  return {
    httpOnly: true,
    secure: ambiente.producao,
    sameSite: ambiente.cookie.sameSite,
    path: '/',
    ...(ambiente.cookie.dominio ? { domain: ambiente.cookie.dominio } : {})
  };
}

export function opcoesCookieToken() {
  return {
    ...baseCookie(),
    maxAge: 8 * 60 * 60 * 1000
  };
}

export function opcoesLimparCookieToken() {
  return baseCookie();
}
