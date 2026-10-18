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

function remetente() {
  return ambiente.email.remetenteEmail
    ? `"${ambiente.email.remetenteNome}" <${ambiente.email.remetenteEmail}>`
    : ambiente.email.usuario;
}

function layoutEmail({ nome, titulo, mensagem, botaoTexto, link, rodape }) {
  const nomeSeguro = escaparHtml(nome || 'usuário');
  const tituloSeguro = escaparHtml(titulo);
  const mensagemSegura = escaparHtml(mensagem).replaceAll('\n', '<br>');
  const linkSeguro = link ? escaparHtml(link) : '';
  const rodapeSeguro = escaparHtml(rodape || 'Esta é uma mensagem automática do ConectaTorres.');

  return `
    <div style="font-family:Arial,sans-serif;max-width:620px;margin:0 auto;color:#17211f;line-height:1.6">
      <div style="padding:22px 0;border-bottom:1px solid #e2ebe7;margin-bottom:22px">
        <strong style="font-size:24px;color:#1f6f5f">ConectaTorres</strong>
      </div>
      <p>Olá, <strong>${nomeSeguro}</strong>.</p>
      <h2 style="margin:18px 0 10px;color:#173f37">${tituloSeguro}</h2>
      <p>${mensagemSegura}</p>
      ${linkSeguro && botaoTexto ? `
        <p style="margin:28px 0">
          <a href="${linkSeguro}" style="display:inline-block;background:#1f6f5f;color:#fff;text-decoration:none;padding:12px 18px;border-radius:10px;font-weight:700">${escaparHtml(botaoTexto)}</a>
        </p>
        <p style="font-size:13px;color:#69746f;overflow-wrap:anywhere">Se o botão não funcionar, copie este endereço:<br>${linkSeguro}</p>
      ` : ''}
      <p style="font-size:13px;color:#69746f;margin-top:28px">${rodapeSeguro}</p>
    </div>
  `;
}

export function emailEstaConfigurado() {
  return ambiente.email.configurado;
}

export async function enviarEmailTransacional({ destinatario, nome, assunto, titulo, mensagem, botaoTexto = null, link = null, rodape = null }) {
  const cliente = obterTransportador();
  if (!cliente) {
    const erro = new Error('O serviço de e-mail ainda não está configurado.');
    erro.codigo = 'EMAIL_NAO_CONFIGURADO';
    throw erro;
  }

  const linhasTexto = [
    `Olá, ${nome || 'usuário'}.`,
    '',
    titulo,
    mensagem,
    link ? '' : null,
    link ? `${botaoTexto || 'Acessar'}: ${link}` : null,
    '',
    rodape || 'Esta é uma mensagem automática do ConectaTorres.'
  ].filter((linha) => linha !== null);

  await cliente.sendMail({
    from: remetente(),
    to: destinatario,
    subject: assunto,
    text: linhasTexto.join('\n'),
    html: layoutEmail({ nome, titulo, mensagem, botaoTexto, link, rodape })
  });
}

export async function enviarEmailRecuperacaoSenha({ destinatario, nome, link, minutos }) {
  return enviarEmailTransacional({
    destinatario,
    nome,
    assunto: 'Redefinição de senha - ConectaTorres',
    titulo: 'Redefinição de senha',
    mensagem: `Recebemos uma solicitação para redefinir a senha da sua conta. Este link é válido por ${Number(minutos)} minutos.`,
    botaoTexto: 'Redefinir minha senha',
    link,
    rodape: 'Se você não solicitou essa alteração, ignore esta mensagem.'
  });
}

export async function enviarEmailConfirmacaoConta({ destinatario, nome, link, horas }) {
  return enviarEmailTransacional({
    destinatario,
    nome,
    assunto: 'Confirme seu e-mail - ConectaTorres',
    titulo: 'Confirme seu endereço de e-mail',
    mensagem: `Para concluir a configuração da sua conta, confirme que este endereço de e-mail pertence a você. O link é válido por ${Number(horas)} horas.`,
    botaoTexto: 'Confirmar meu e-mail',
    link,
    rodape: 'Se você não criou uma conta no ConectaTorres, ignore esta mensagem.'
  });
}
