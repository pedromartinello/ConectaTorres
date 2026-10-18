import { Usuario, PerfilPrestador } from '../modelos/index.js';
import { removerArquivoPorUrl } from '../configuracao/upload.js';
import { emailEstaConfigurado } from '../servicos/emailServico.js';
import { prepararConfirmacaoEmail } from '../servicos/confirmacaoEmailServico.js';

async function carregarUsuario(id) {
  return Usuario.findByPk(id, {
    attributes: ['id', 'nome', 'email', 'emailVerificado', 'telefone', 'fotoUrl', 'tipo', 'ativo', 'createdAt'],
    include: [{ model: PerfilPrestador, as: 'perfilPrestador', required: false }]
  });
}

export async function atualizarMeuPerfil(req, res) {
  const usuario = await Usuario.findByPk(req.usuario.id);
  const email = req.body.email?.trim().toLowerCase();
  const emailFoiAlterado = Boolean(email && email !== usuario.email);

  if (emailFoiAlterado) {
    const existente = await Usuario.findOne({ where: { email } });
    if (existente) return res.status(409).json({ mensagem: 'Este e-mail já está em uso.' });
  }

  await usuario.update({
    nome: req.body.nome?.trim() || usuario.nome,
    email: email || usuario.email,
    telefone: req.body.telefone?.trim() || null,
    ...(emailFoiAlterado && emailEstaConfigurado() ? { emailVerificado: false } : {})
  });

  let confirmacaoEnviada = false;
  if (emailFoiAlterado && emailEstaConfigurado()) {
    try {
      await prepararConfirmacaoEmail(usuario);
      confirmacaoEnviada = true;
    } catch (erro) {
      console.error('Falha ao enviar confirmação após alteração de e-mail:', erro.message);
    }
  }

  const atualizado = await carregarUsuario(usuario.id);
  return res.json({
    usuario: atualizado,
    mensagem: emailFoiAlterado && emailEstaConfigurado()
      ? (confirmacaoEnviada
        ? 'Dados atualizados. Enviamos um link para confirmar o novo e-mail.'
        : 'Dados atualizados, mas não foi possível enviar a confirmação do novo e-mail agora.')
      : 'Dados pessoais atualizados.'
  });
}

export async function alterarSenha(req, res) {
  const usuario = await Usuario.findByPk(req.usuario.id);
  const correta = await usuario.verificarSenha(req.body.senhaAtual);
  if (!correta) return res.status(401).json({ mensagem: 'A senha atual está incorreta.' });
  if (req.body.senhaAtual === req.body.novaSenha) {
    return res.status(422).json({ mensagem: 'A nova senha deve ser diferente da senha atual.' });
  }
  await usuario.update({ senhaHash: req.body.novaSenha });
  return res.status(204).send();
}

export async function enviarFotoPerfil(req, res) {
  if (!req.file) return res.status(422).json({ mensagem: 'Selecione uma imagem.' });
  const usuario = await Usuario.findByPk(req.usuario.id);
  removerArquivoPorUrl(usuario.fotoUrl);
  const fotoUrl = `/uploads/perfis/${req.file.filename}`;
  await usuario.update({ fotoUrl });
  return res.status(201).json({ fotoUrl });
}

export async function removerFotoPerfil(req, res) {
  const usuario = await Usuario.findByPk(req.usuario.id);
  removerArquivoPorUrl(usuario.fotoUrl);
  await usuario.update({ fotoUrl: null });
  return res.status(204).send();
}
