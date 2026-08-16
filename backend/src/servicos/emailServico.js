import nodemailer from 'nodemailer';
import { ambiente } from '../configuracao/ambiente.js';

let transportador = null;

function escaparHtml(texto = '') {
  return String(texto)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function obterTransportador() {
  if (!ambiente.email.configurado) return null;
  if (transportador) return transportador;

  transportador = nodemailer.createTransport({
    host: ambiente.email.host,
    port: ambiente.email.porta,
    secure: ambiente.email.seguro,
    auth: {
      user: ambiente.email.usuario,
      pass: ambiente.email.senha
    }
  });

  return transportador;
}

export function emailEstaConfigurado() {
  return ambiente.email.configurado;
}

export async function enviarEmailRecuperacaoSenha({ destinatario, nome, link, minutos }) {
  const cliente = obterTransportador();
  if (!cliente) {
    const erro = new Error('O serviço de e-mail ainda não está configurado.');
    erro.codigo = 'EMAIL_NAO_CONFIGURADO';
    throw erro;
  }

  const nomeSeguro = escaparHtml(nome || 'usuário');
  const linkSeguro = escaparHtml(link);
  const remetente = ambiente.email.remetenteEmail
    ? `"${ambiente.email.remetenteNome}" <${ambiente.email.remetenteEmail}>`
    : ambiente.email.usuario;

  await cliente.sendMail({
    from: remetente,
    to: destinatario,
    subject: 'Redefinição de senha - ConectaTorres',
    text: [
      `Olá, ${nome || 'usuário'}.`,
      '',
      'Recebemos uma solicitação para redefinir a senha da sua conta no ConectaTorres.',
      `O link abaixo é válido por ${minutos} minutos:`,
      link,
      '',
      'Se você não solicitou essa alteração, ignore esta mensagem.'
    ].join('\n'),
    html: `
      <div style="font-family:Arial,sans-serif;max-width:620px;margin:0 auto;color:#17211f;line-height:1.6">
        <h2 style="color:#1f6f5f">ConectaTorres</h2>
        <p>Olá, <strong>${nomeSeguro}</strong>.</p>
        <p>Recebemos uma solicitação para redefinir a senha da sua conta.</p>
        <p>O link é válido por <strong>${Number(minutos)} minutos</strong>.</p>
        <p style="margin:28px 0">
          <a href="${linkSeguro}" style="display:inline-block;background:#1f6f5f;color:#fff;text-decoration:none;padding:12px 18px;border-radius:10px;font-weight:700">Redefinir minha senha</a>
        </p>
        <p style="font-size:13px;color:#69746f;overflow-wrap:anywhere">Se o botão não funcionar, copie este endereço:<br>${linkSeguro}</p>
        <p style="font-size:13px;color:#69746f">Se você não solicitou essa alteração, ignore esta mensagem.</p>
      </div>
    `
  });
}
