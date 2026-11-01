import nodemailer from 'nodemailer';
import { ambiente } from '../configuracao/ambiente.js';

let transportadorSmtp = null;

function escaparHtml(texto = '') {
  return String(texto)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function obterTransportadorSmtp() {
  if (!ambiente.email.smtp.configurado) return null;
  if (transportadorSmtp) return transportadorSmtp;

  transportadorSmtp = nodemailer.createTransport({
    host: ambiente.email.smtp.host,
    port: ambiente.email.smtp.porta,
    secure: ambiente.email.smtp.seguro,
    auth: {
      user: ambiente.email.smtp.usuario,
      pass: ambiente.email.smtp.senha
    }
  });

  return transportadorSmtp;
}

function remetenteTexto() {
  return ambiente.email.remetenteEmail
    ? `"${ambiente.email.remetenteNome}" <${ambiente.email.remetenteEmail}>`
    : ambiente.email.smtp.usuario;
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

function conteudoTexto({ nome, titulo, mensagem, botaoTexto, link, rodape }) {
  return [
    `Olá, ${nome || 'usuário'}.`,
    '',
    titulo,
    mensagem,
    link ? '' : null,
    link ? `${botaoTexto || 'Acessar'}: ${link}` : null,
    '',
    rodape || 'Esta é uma mensagem automática do ConectaTorres.'
  ].filter((linha) => linha !== null).join('\n');
}

async function enviarViaBrevo({ destinatario, assunto, texto, html }) {
  const controlador = new AbortController();
  const timeout = setTimeout(() => controlador.abort(), 12000);

  try {
    const resposta = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      signal: controlador.signal,
      headers: {
        accept: 'application/json',
        'api-key': ambiente.email.brevo.apiKey,
        'content-type': 'application/json'
      },
      body: JSON.stringify({
        sender: {
          name: ambiente.email.remetenteNome,
          email: ambiente.email.remetenteEmail
        },
        to: [{ email: destinatario }],
        ...(ambiente.email.replyTo ? { replyTo: { email: ambiente.email.replyTo } } : {}),
        subject: assunto,
        textContent: texto,
        htmlContent: html
      })
    });

    if (!resposta.ok) {
      const corpo = await resposta.text();
      const erro = new Error(`Brevo recusou o envio (${resposta.status}). ${corpo.slice(0, 500)}`);
      erro.codigo = 'EMAIL_BREVO_FALHOU';
      throw erro;
    }

    return resposta.json().catch(() => ({}));
  } catch (erro) {
    if (erro.name === 'AbortError') {
      const timeoutErro = new Error('Tempo limite excedido ao enviar e-mail pela Brevo.');
      timeoutErro.codigo = 'EMAIL_TIMEOUT';
      throw timeoutErro;
    }
    throw erro;
  } finally {
    clearTimeout(timeout);
  }
}

async function enviarViaSmtp({ destinatario, assunto, texto, html }) {
  const cliente = obterTransportadorSmtp();
  if (!cliente) {
    const erro = new Error('SMTP não está configurado.');
    erro.codigo = 'EMAIL_SMTP_NAO_CONFIGURADO';
    throw erro;
  }

  return cliente.sendMail({
    from: remetenteTexto(),
    to: destinatario,
    replyTo: ambiente.email.replyTo || undefined,
    subject: assunto,
    text: texto,
    html
  });
}

export function emailEstaConfigurado() {
  return ambiente.email.configurado;
}

export function provedorEmailAtivo() {
  return ambiente.email.provedor;
}

export async function enviarEmailTransacional({ destinatario, nome, assunto, titulo, mensagem, botaoTexto = null, link = null, rodape = null }) {
  if (!ambiente.email.configurado) {
    const erro = new Error('O serviço de e-mail ainda não está configurado.');
    erro.codigo = 'EMAIL_NAO_CONFIGURADO';
    throw erro;
  }

  const texto = conteudoTexto({ nome, titulo, mensagem, botaoTexto, link, rodape });
  const html = layoutEmail({ nome, titulo, mensagem, botaoTexto, link, rodape });

  if (ambiente.email.provedor === 'brevo') {
    return enviarViaBrevo({ destinatario, assunto, texto, html });
  }

  return enviarViaSmtp({ destinatario, assunto, texto, html });
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
