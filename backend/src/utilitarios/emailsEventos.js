import { Usuario } from '../modelos/index.js';
import { ambiente } from '../configuracao/ambiente.js';
import { emailEstaConfigurado, enviarEmailTransacional } from '../servicos/emailServico.js';

function urlCompleta(caminho) {
  if (!caminho) return null;
  if (/^https?:\/\//i.test(caminho)) return caminho;
  return `${ambiente.frontendUrl}${caminho.startsWith('/') ? caminho : `/${caminho}`}`;
}

export async function enviarEmailEventoSeguro({ usuarioId, assunto, titulo, mensagem, link = null, botaoTexto = 'Abrir no ConectaTorres' }) {
  if (!usuarioId || !emailEstaConfigurado()) return false;
  try {
    const usuario = await Usuario.findByPk(usuarioId, { attributes: ['id', 'nome', 'email', 'emailVerificado', 'ativo'] });
    if (!usuario?.ativo || !usuario.email || usuario.emailVerificado === false) return false;
    await enviarEmailTransacional({
      destinatario: usuario.email,
      nome: usuario.nome,
      assunto,
      titulo,
      mensagem,
      botaoTexto: link ? botaoTexto : null,
      link: urlCompleta(link)
    });
    return true;
  } catch (erro) {
    console.error(`Falha ao enviar e-mail de evento (${assunto}):`, erro.message);
    return false;
  }
}
