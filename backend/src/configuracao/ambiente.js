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
    throw new Error(`Variavel de ambiente ausente: ${chave}`);
  }
}

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
    exibirLinkDesenvolvimento: process.env.RECUPERACAO_EXIBIR_LINK !== 'false'
  },
  admin: {
    nome: process.env.ADMIN_NOME || '',
    email: process.env.ADMIN_EMAIL || '',
    senha: process.env.ADMIN_SENHA || ''
  }
};
