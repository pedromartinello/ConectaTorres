import { Usuario } from './Usuario.js';
import { PerfilPrestador } from './PerfilPrestador.js';
import { Categoria } from './Categoria.js';
import { Servico } from './Servico.js';
import { Disponibilidade } from './Disponibilidade.js';
import { Agendamento } from './Agendamento.js';
import { Avaliacao } from './Avaliacao.js';
import { Favorito } from './Favorito.js';
import { PortfolioImagem } from './PortfolioImagem.js';
import { Notificacao } from './Notificacao.js';
import { Denuncia } from './Denuncia.js';

Usuario.hasOne(PerfilPrestador, { foreignKey: 'usuarioId', as: 'perfilPrestador', onDelete: 'CASCADE' });
PerfilPrestador.belongsTo(Usuario, { foreignKey: 'usuarioId', as: 'usuario' });

Usuario.hasMany(Servico, { foreignKey: 'prestadorId', as: 'servicos', onDelete: 'CASCADE' });
Servico.belongsTo(Usuario, { foreignKey: 'prestadorId', as: 'prestador' });
Categoria.hasMany(Servico, { foreignKey: 'categoriaId', as: 'servicos' });
Servico.belongsTo(Categoria, { foreignKey: 'categoriaId', as: 'categoria' });

Usuario.hasMany(Disponibilidade, { foreignKey: 'prestadorId', as: 'disponibilidades', onDelete: 'CASCADE' });
Disponibilidade.belongsTo(Usuario, { foreignKey: 'prestadorId', as: 'prestador' });

Usuario.hasMany(Agendamento, { foreignKey: 'clienteId', as: 'agendamentosComoCliente' });
Usuario.hasMany(Agendamento, { foreignKey: 'prestadorId', as: 'agendamentosComoPrestador' });
Agendamento.belongsTo(Usuario, { foreignKey: 'clienteId', as: 'cliente' });
Agendamento.belongsTo(Usuario, { foreignKey: 'prestadorId', as: 'prestador' });
Agendamento.belongsTo(Servico, { foreignKey: 'servicoId', as: 'servico' });

Usuario.hasMany(Avaliacao, { foreignKey: 'clienteId', as: 'avaliacoesFeitas' });
Usuario.hasMany(Avaliacao, { foreignKey: 'prestadorId', as: 'avaliacoesRecebidas' });
Avaliacao.belongsTo(Usuario, { foreignKey: 'clienteId', as: 'cliente' });
Avaliacao.belongsTo(Usuario, { foreignKey: 'prestadorId', as: 'prestador' });
Avaliacao.belongsTo(Agendamento, { foreignKey: 'agendamentoId', as: 'agendamento' });
Agendamento.hasOne(Avaliacao, { foreignKey: 'agendamentoId', as: 'avaliacao' });

Usuario.hasMany(Favorito, { foreignKey: 'clienteId', as: 'favoritos' });
Favorito.belongsTo(Usuario, { foreignKey: 'clienteId', as: 'cliente' });
Favorito.belongsTo(Usuario, { foreignKey: 'prestadorId', as: 'prestador' });

Usuario.hasMany(PortfolioImagem, { foreignKey: 'prestadorId', as: 'portfolio', onDelete: 'CASCADE' });
PortfolioImagem.belongsTo(Usuario, { foreignKey: 'prestadorId', as: 'prestador' });

Usuario.hasMany(Notificacao, { foreignKey: 'usuarioId', as: 'notificacoes', onDelete: 'CASCADE' });
Notificacao.belongsTo(Usuario, { foreignKey: 'usuarioId', as: 'usuario' });

Usuario.hasMany(Denuncia, { foreignKey: 'denuncianteId', as: 'denunciasFeitas' });
Denuncia.belongsTo(Usuario, { foreignKey: 'denuncianteId', as: 'denunciante' });
Denuncia.belongsTo(Usuario, { foreignKey: 'prestadorId', as: 'prestador' });
Denuncia.belongsTo(Avaliacao, { foreignKey: 'avaliacaoId', as: 'avaliacao' });

export {
  Usuario,
  PerfilPrestador,
  Categoria,
  Servico,
  Disponibilidade,
  Agendamento,
  Avaliacao,
  Favorito,
  PortfolioImagem,
  Notificacao,
  Denuncia
};
