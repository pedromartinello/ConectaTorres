import 'dotenv/config';

function booleano(valor, padrao = false) {
  if (valor === undefined || valor === '') return padrao;
  return ['1', 'true', 'sim', 'yes', 'on'].includes(String(valor).toLowerCase());
}

function valorReal(valor = '') {
  const texto = String(valor).trim();
  if (!texto) return false;
  return !/^(sua_|seu_|gere_|defina_|troque_|cole_)/i.test(texto);
}

function listaUrls(valor = '') {
  return String(valor)
    .split(',')
    .map((item) => item.trim().replace(/\/$/, ''))
    .filter(Boolean);
}

const nodeEnv = process.env.NODE_ENV || 'development';
const databaseUrl = String(process.env.DATABASE_URL || '').trim();
const usaDatabaseUrl = Boolean(databaseUrl);

const obrigatoriasBanco = ['BANCO_HOST', 'BANCO_PORTA', 'BANCO_NOME', 'BANCO_USUARIO', 'BANCO_SENHA'];
if (!usaDatabaseUrl) {
  for (const chave of obrigatoriasBanco) {
    if (!process.env[chave]) throw new Error(`Variável de ambiente ausente: ${chave}`);
  }
}

if (!process.env.JWT_SEGREDO) {
  throw new Error('Variável de ambiente ausente: JWT_SEGREDO');
}

const frontendUrl = (process.env.FRONTEND_URL || 'http://localhost:5173').replace(/\/$/, '');
const urlsAdicionais = listaUrls(process.env.FRONTEND_URLS_ADICIONAIS || '');
const frontendUrlsPermitidas = [...new Set([frontendUrl, ...urlsAdicionais])];

const smtpUsuario = process.env.SMTP_USUARIO || '';
const smtpSenha = process.env.SMTP_SENHA || '';
const smtpHost = process.env.SMTP_HOST || '';

const cookieSameSitePadrao = nodeEnv === 'production' ? 'none' : 'lax';
const cookieSameSite = String(process.env.COOKIE_SAMESITE || cookieSameSitePadrao).toLowerCase();
const sameSitesPermitidos = ['lax', 'strict', 'none'];
if (!sameSitesPermitidos.includes(cookieSameSite)) {
  throw new Error('COOKIE_SAMESITE deve ser lax, strict ou none.');
}

export const ambiente = {
  nodeEnv,
  producao: nodeEnv === 'production',
  porta: Number(process.env.PORT || process.env.PORTA || 3001),
  frontendUrl,
  frontendUrlsPermitidas,
  fusoHorario: process.env.FUSO_HORARIO || 'America/Sao_Paulo',
  banco: {
    url: databaseUrl,
    usaUrl: usaDatabaseUrl,
    host: process.env.BANCO_HOST || '',
    porta: Number(process.env.BANCO_PORTA || 5432),
    nome: process.env.BANCO_NOME || '',
    usuario: process.env.BANCO_USUARIO || '',
    senha: process.env.BANCO_SENHA || '',
    ssl: booleano(process.env.BANCO_SSL, false)
  },
  cookie: {
    sameSite: cookieSameSite,
    dominio: String(process.env.COOKIE_DOMINIO || '').trim() || undefined
  },
  upload: {
    diretorio: String(process.env.UPLOAD_DIRETORIO || '').trim()
  },
  jwt: {
    segredo: process.env.JWT_SEGREDO,
    expiracao: process.env.JWT_EXPIRACAO || '8h'
  },
  recuperacaoSenha: {
    minutosExpiracao: Number(process.env.RECUPERACAO_SENHA_MINUTOS || 30),
    exibirLinkDesenvolvimento: booleano(process.env.RECUPERACAO_EXIBIR_LINK, true)
  },
  confirmacaoEmail: {
    horasExpiracao: Number(process.env.CONFIRMACAO_EMAIL_HORAS || 24)
  },
  email: {
    configurado: Boolean(valorReal(smtpHost) && valorReal(smtpUsuario) && valorReal(smtpSenha)),
    host: smtpHost,
    porta: Number(process.env.SMTP_PORTA || 465),
    seguro: booleano(process.env.SMTP_SEGURO, true),
    usuario: smtpUsuario,
    senha: smtpSenha,
    remetenteNome: process.env.EMAIL_REMETENTE_NOME || 'ConectaTorres',
    remetenteEmail: process.env.EMAIL_REMETENTE || smtpUsuario
  },
  ia: {
    habilitada: booleano(process.env.IA_HABILITADA, true),
    configurada: valorReal(process.env.OPENAI_API_KEY),
    apiKey: process.env.OPENAI_API_KEY || '',
    modelo: process.env.OPENAI_MODELO || 'gpt-5.6-terra'
  },
  admin: {
    nome: process.env.ADMIN_NOME || '',
    email: process.env.ADMIN_EMAIL || '',
    senha: process.env.ADMIN_SENHA || ''
  }
};
