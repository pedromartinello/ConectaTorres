import 'dotenv/config';

const obrigatorias = [
  'BANCO_HOST',
  'BANCO_PORTA',
  'BANCO_NOME',
  'BANCO_USUARIO',
  'BANCO_SENHA',
  'JWT_SEGREDO'
];

for (const chave of obrigatorias) {
  if (!process.env[chave]) {
    throw new Error(`Variável de ambiente ausente: ${chave}`);
  }
}

function booleano(valor, padrao = false) {
  if (valor === undefined || valor === '') return padrao;
  return ['1', 'true', 'sim', 'yes', 'on'].includes(String(valor).toLowerCase());
}

function valorReal(valor = '') {
  const texto = String(valor).trim();
  if (!texto) return false;
  return !/^(sua_|seu_|gere_|defina_|troque_)/i.test(texto);
}

const smtpUsuario = process.env.SMTP_USUARIO || '';
const smtpSenha = process.env.SMTP_SENHA || '';
const smtpHost = process.env.SMTP_HOST || '';

export const ambiente = {
  nodeEnv: process.env.NODE_ENV || 'development',
  porta: Number(process.env.PORTA || 3001),
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:5173',
  fusoHorario: process.env.FUSO_HORARIO || 'America/Sao_Paulo',
  banco: {
    host: process.env.BANCO_HOST,
    porta: Number(process.env.BANCO_PORTA),
    nome: process.env.BANCO_NOME,
    usuario: process.env.BANCO_USUARIO,
    senha: process.env.BANCO_SENHA
  },
  jwt: {
    segredo: process.env.JWT_SEGREDO,
    expiracao: process.env.JWT_EXPIRACAO || '8h'
  },
  recuperacaoSenha: {
    minutosExpiracao: Number(process.env.RECUPERACAO_SENHA_MINUTOS || 30),
    exibirLinkDesenvolvimento: booleano(process.env.RECUPERACAO_EXIBIR_LINK, true)
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
    modelo: process.env.OPENAI_MODELO || 'gpt-5.6-luna'
  },
  admin: {
    nome: process.env.ADMIN_NOME || '',
    email: process.env.ADMIN_EMAIL || '',
    senha: process.env.ADMIN_SENHA || ''
  }
};
