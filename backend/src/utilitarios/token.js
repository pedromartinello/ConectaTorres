import jwt from 'jsonwebtoken';
import { ambiente } from '../configuracao/ambiente.js';

function duracaoEmMilissegundos(valor) {
  const correspondencia = String(valor || '').trim().toLowerCase().match(/^(\d+)([smhd])$/);
  if (!correspondencia) return 8 * 60 * 60 * 1000;

  const quantidade = Number(correspondencia[1]);
  const unidade = correspondencia[2];
  const multiplicadores = {
    s: 1000,
    m: 60 * 1000,
    h: 60 * 60 * 1000,
    d: 24 * 60 * 60 * 1000
  };

  return quantidade * multiplicadores[unidade];
}

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
    maxAge: duracaoEmMilissegundos(ambiente.jwt.expiracao)
  };
}

export function opcoesLimparCookieToken() {
  return baseCookie();
}
