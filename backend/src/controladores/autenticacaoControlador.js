import crypto from 'crypto';
import { Op } from 'sequelize';
import { Usuario, PerfilPrestador } from '../modelos/index.js';
import { gerarToken, opcoesCookieToken } from '../utilitarios/token.js';
import { ambiente } from '../configuracao/ambiente.js';
import { emailEstaConfigurado, enviarEmailRecuperacaoSenha } from '../servicos/emailServico.js';

async function carregarUsuario(id) {
  return Usuario.findByPk(id, {
    attributes: ['id', 'nome', 'email', 'telefone', 'fotoUrl', 'tipo', 'ativo', 'createdAt'],
    include: [{ model: PerfilPrestador, as: 'perfilPrestador', required: false }]
  });
}

export async function cadastrar(req, res) {
  const { nome, email, senha, tipo } = req.body;
  const emailNormalizado = email.trim().toLowerCase();

  const existente = await Usuario.findOne({ where: { email: emailNormalizado } });
  if (existente) return res.status(409).json({ mensagem: 'Este e-mail já está cadastrado.' });

  const tipoPermitido = tipo === 'prestador' ? 'prestador' : 'cliente';
  const usuarioCriado = await Usuario.create({
    nome: nome.trim(),
    email: emailNormalizado,
    senhaHash: senha,
    tipo: tipoPermitido
  });

  if (usuarioCriado.tipo === 'prestador') {
    await PerfilPrestador.create({ usuarioId: usuarioCriado.id });
  }

  const usuario = await carregarUsuario(usuarioCriado.id);
  const token = gerarToken(usuario);
  res.cookie('token', token, opcoesCookieToken());
  return res.status(201).json({ usuario });
}

export async function login(req, res) {
  const { email, senha } = req.body;
  const usuarioSenha = await Usuario.findOne({ where: { email: email.trim().toLowerCase() } });

  if (!usuarioSenha || !(await usuarioSenha.verificarSenha(senha))) {
    return res.status(401).json({ mensagem: 'E-mail ou senha incorretos.' });
  }
  if (!usuarioSenha.ativo) return res.status(403).json({ mensagem: 'Usuário desativado.' });

  const usuario = await carregarUsuario(usuarioSenha.id);
  const token = gerarToken(usuario);
  res.cookie('token', token, opcoesCookieToken());
  return res.json({ usuario });
}

export async function logout(req, res) {
  res.clearCookie('token', { path: '/' });
  return res.status(204).send();
}

export async function eu(req, res) {
  const usuario = await carregarUsuario(req.usuario.id);
  return res.json({ usuario });
}

export async function solicitarRedefinicaoSenha(req, res) {
  const email = req.body.email.trim().toLowerCase();
  const usuario = await Usuario.findOne({ where: { email, ativo: true } });
  const resposta = {
    mensagem: 'Se existir uma conta ativa com este e-mail, você receberá as instruções para redefinir a senha.'
  };

  if (!usuario) return res.json(resposta);

  const token = crypto.randomBytes(32).toString('hex');
  const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
  const expiraEm = new Date(Date.now() + ambiente.recuperacaoSenha.minutosExpiracao * 60 * 1000);
  const linkRedefinicao = `${ambiente.frontendUrl}/redefinir-senha?token=${token}`;
  await usuario.update({ tokenRedefinicaoSenha: tokenHash, tokenRedefinicaoExpiraEm: expiraEm });

  if (emailEstaConfigurado()) {
    try {
      await enviarEmailRecuperacaoSenha({
        destinatario: usuario.email,
        nome: usuario.nome,
        link: linkRedefinicao,
        minutos: ambiente.recuperacaoSenha.minutosExpiracao
      });
      return res.json(resposta);
    } catch (erro) {
      console.error('Falha ao enviar e-mail de recuperação:', erro.message);
      const podeExibirLink = ambiente.nodeEnv !== 'production' && ambiente.recuperacaoSenha.exibirLinkDesenvolvimento;
      if (!podeExibirLink) {
        await usuario.update({ tokenRedefinicaoSenha: null, tokenRedefinicaoExpiraEm: null });
        return res.json(resposta);
      }
      resposta.avisoDesenvolvimento = 'O SMTP está configurado, mas o envio falhou. Use o link local abaixo para continuar o teste.';
    }
  }

  if (ambiente.nodeEnv !== 'production' && ambiente.recuperacaoSenha.exibirLinkDesenvolvimento) {
    resposta.linkRedefinicao = linkRedefinicao;
    resposta.expiraEm = expiraEm;
  }

  return res.json(resposta);
}

export async function redefinirSenha(req, res) {
  const tokenHash = crypto.createHash('sha256').update(req.body.token).digest('hex');
  const usuario = await Usuario.findOne({
    where: {
      tokenRedefinicaoSenha: tokenHash,
      tokenRedefinicaoExpiraEm: { [Op.gt]: new Date() },
      ativo: true
    }
  });

  if (!usuario) {
    return res.status(400).json({ mensagem: 'O link de recuperação é inválido ou expirou.' });
  }

  await usuario.update({
    senhaHash: req.body.novaSenha,
    tokenRedefinicaoSenha: null,
    tokenRedefinicaoExpiraEm: null
  });

  res.clearCookie('token', { path: '/' });
  return res.json({ mensagem: 'Senha redefinida com sucesso. Você já pode entrar com a nova senha.' });
}
