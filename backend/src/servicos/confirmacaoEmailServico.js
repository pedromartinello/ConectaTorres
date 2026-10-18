import crypto from 'crypto';
import { Op } from 'sequelize';
import { Usuario } from '../modelos/index.js';
import { ambiente } from '../configuracao/ambiente.js';
import { emailEstaConfigurado, enviarEmailConfirmacaoConta } from './emailServico.js';

export async function prepararConfirmacaoEmail(usuario) {
  if (!emailEstaConfigurado()) return { enviada: false, motivo: 'email_nao_configurado' };

  const token = crypto.randomBytes(32).toString('hex');
  const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
  const expiraEm = new Date(Date.now() + ambiente.confirmacaoEmail.horasExpiracao * 60 * 60 * 1000);
  const link = `${ambiente.frontendUrl}/confirmar-email?token=${token}`;

  await usuario.update({
    emailVerificado: false,
    tokenConfirmacaoEmail: tokenHash,
    tokenConfirmacaoExpiraEm: expiraEm
  });

  await enviarEmailConfirmacaoConta({
    destinatario: usuario.email,
    nome: usuario.nome,
    link,
    horas: ambiente.confirmacaoEmail.horasExpiracao
  });

  return { enviada: true, expiraEm };
}

export async function confirmarEmailPorToken(token) {
  const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
  const usuario = await Usuario.findOne({
    where: {
      tokenConfirmacaoEmail: tokenHash,
      tokenConfirmacaoExpiraEm: { [Op.gt]: new Date() },
      ativo: true
    }
  });
  if (!usuario) return null;

  await usuario.update({
    emailVerificado: true,
    tokenConfirmacaoEmail: null,
    tokenConfirmacaoExpiraEm: null
  });
  return usuario;
}
