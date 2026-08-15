import { Op } from 'sequelize';
import { Disponibilidade, Agendamento } from '../modelos/index.js';

export async function listarDisponibilidades(req, res) {
  const disponibilidades = await Disponibilidade.findAll({
    where: { prestadorId: req.params.prestadorId, fim: { [Op.gte]: new Date() } },
    order: [['inicio', 'ASC']]
  });
  return res.json({ disponibilidades });
}

export async function listarMinhasDisponibilidades(req, res) {
  const disponibilidades = await Disponibilidade.findAll({
    where: { prestadorId: req.usuario.id, fim: { [Op.gte]: new Date() } },
    order: [['inicio', 'ASC']]
  });
  return res.json({ disponibilidades });
}

export async function criarDisponibilidade(req, res) {
  const inicio = new Date(req.body.inicio);
  const fim = new Date(req.body.fim);
  if (fim <= inicio) return res.status(422).json({ mensagem: 'O horario final deve ser posterior ao horario inicial.' });

  const conflito = await Disponibilidade.findOne({
    where: { prestadorId: req.usuario.id, inicio: { [Op.lt]: fim }, fim: { [Op.gt]: inicio } }
  });
  if (conflito) return res.status(409).json({ mensagem: 'Ja existe uma disponibilidade sobreposta.' });

  const disponibilidade = await Disponibilidade.create({
    prestadorId: req.usuario.id,
    inicio,
    fim,
    observacao: req.body.observacao?.trim() || null
  });
  return res.status(201).json({ disponibilidade });
}

export async function removerDisponibilidade(req, res) {
  const item = await Disponibilidade.findOne({ where: { id: req.params.id, prestadorId: req.usuario.id } });
  if (!item) return res.status(404).json({ mensagem: 'Disponibilidade nao encontrada.' });

  const agendamento = await Agendamento.findOne({
    where: {
      prestadorId: req.usuario.id,
      status: { [Op.in]: ['pendente', 'aceito'] },
      inicio: { [Op.lt]: item.fim },
      fim: { [Op.gt]: item.inicio }
    }
  });
  if (agendamento) return res.status(409).json({ mensagem: 'Nao e possivel remover uma disponibilidade que possui agendamento ativo.' });

  await item.destroy();
  return res.status(204).send();
}
