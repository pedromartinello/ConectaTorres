import { Denuncia, Usuario, Avaliacao } from '../modelos/index.js';

export async function criarDenuncia(req, res) {
  const { prestadorId, avaliacaoId, motivo, descricao } = req.body;
  if (!prestadorId && !avaliacaoId) {
    return res.status(422).json({ mensagem: 'Informe o prestador ou a avaliacao que deseja denunciar.' });
  }

  let prestadorAlvo = prestadorId || null;
  if (prestadorId) {
    const prestador = await Usuario.findOne({ where: { id: prestadorId, tipo: 'prestador', ativo: true } });
    if (!prestador) return res.status(404).json({ mensagem: 'Prestador nao encontrado.' });
  }
  if (avaliacaoId) {
    const avaliacao = await Avaliacao.findByPk(avaliacaoId);
    if (!avaliacao) return res.status(404).json({ mensagem: 'Avaliacao nao encontrada.' });
    prestadorAlvo = avaliacao.prestadorId;
  }

  const denuncia = await Denuncia.create({
    denuncianteId: req.usuario.id,
    prestadorId: prestadorAlvo,
    avaliacaoId: avaliacaoId || null,
    motivo: motivo.trim(),
    descricao: descricao?.trim() || null
  });
  return res.status(201).json({ denuncia });
}

export async function listarMinhasDenuncias(req, res) {
  const denuncias = await Denuncia.findAll({
    where: { denuncianteId: req.usuario.id },
    order: [['createdAt', 'DESC']]
  });
  return res.json({ denuncias });
}
