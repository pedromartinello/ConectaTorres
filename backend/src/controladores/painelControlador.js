import { Op } from 'sequelize';
import { Agendamento, Avaliacao, Favorito, Notificacao, PerfilPrestador, Servico, Usuario } from '../modelos/index.js';

const inclusoesAgenda = [
  { model: Usuario, as: 'cliente', attributes: ['id', 'nome', 'fotoUrl'] },
  { model: Usuario, as: 'prestador', attributes: ['id', 'nome', 'fotoUrl'] },
  { model: Servico, as: 'servico', attributes: ['id', 'titulo'] }
];

export async function obterMeuResumo(req, res) {
  const agora = new Date();
  const whereAgenda = req.usuario.tipo === 'prestador'
    ? { prestadorId: req.usuario.id }
    : { clienteId: req.usuario.id };

  if (req.usuario.tipo === 'admin') {
    const notificacoesNaoLidas = await Notificacao.count({ where: { usuarioId: req.usuario.id, lidaEm: null } });
    return res.json({ resumo: { notificacoesNaoLidas } });
  }

  const [agendamentosAtivos, proximos, notificacoesNaoLidas] = await Promise.all([
    Agendamento.count({
      where: {
        ...whereAgenda,
        status: { [Op.in]: ['pendente', 'aceito'] },
        concluidoEm: null,
        [Op.or]: [
          { fim: { [Op.gte]: agora } },
          { fim: null, inicio: { [Op.gte]: agora } }
        ]
      }
    }),
    Agendamento.findAll({
      where: {
        ...whereAgenda,
        status: { [Op.in]: ['pendente', 'aceito'] },
        concluidoEm: null,
        [Op.or]: [
          { fim: { [Op.gte]: agora } },
          { fim: null, inicio: { [Op.gte]: agora } }
        ]
      },
      include: inclusoesAgenda,
      order: [['inicio', 'ASC']],
      limit: 5
    }),
    Notificacao.count({ where: { usuarioId: req.usuario.id, lidaEm: null } })
  ]);

  if (req.usuario.tipo === 'cliente') {
    const [favoritos, concluidos, avaliacoesFeitas] = await Promise.all([
      Favorito.count({ where: { clienteId: req.usuario.id } }),
      Agendamento.count({ where: { clienteId: req.usuario.id, concluidoEm: { [Op.ne]: null } } }),
      Avaliacao.count({ where: { clienteId: req.usuario.id } })
    ]);
    const avaliacoesPendentes = Math.max(0, concluidos - avaliacoesFeitas);
    return res.json({
      resumo: { agendamentosAtivos, favoritos, avaliacoesPendentes, notificacoesNaoLidas, proximos }
    });
  }

  const [servicosAtivos, solicitacoesPendentes, totalAvaliacoes, perfil] = await Promise.all([
    Servico.count({ where: { prestadorId: req.usuario.id, ativo: true } }),
    Agendamento.count({ where: { prestadorId: req.usuario.id, status: 'pendente', concluidoEm: null } }),
    Avaliacao.count({ where: { prestadorId: req.usuario.id, visivel: true } }),
    PerfilPrestador.findOne({ where: { usuarioId: req.usuario.id } })
  ]);

  return res.json({
    resumo: {
      agendamentosAtivos,
      servicosAtivos,
      solicitacoesPendentes,
      totalAvaliacoes,
      notificacoesNaoLidas,
      proximos,
      perfilCompleto: Boolean(perfil?.titulo && perfil?.descricao && perfil?.cidade && perfil?.whatsapp)
    }
  });
}
