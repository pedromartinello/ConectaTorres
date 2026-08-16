import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../configuracao/banco.js';

export class Agendamento extends Model {}

Agendamento.init(
  {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    clienteId: { type: DataTypes.UUID, allowNull: false, field: 'cliente_id' },
    prestadorId: { type: DataTypes.UUID, allowNull: false, field: 'prestador_id' },
    servicoId: { type: DataTypes.UUID, allowNull: true, field: 'servico_id' },
    horarioSolicitado: { type: DataTypes.DATE, allowNull: true, field: 'horario_solicitado' },
    inicio: { type: DataTypes.DATE, allowNull: false },
    fim: { type: DataTypes.DATE, allowNull: true },
    descricao: { type: DataTypes.TEXT, allowNull: true },
    status: {
      type: DataTypes.ENUM('pendente', 'aceito', 'recusado', 'cancelado'),
      allowNull: false,
      defaultValue: 'pendente'
    },
    concluidoEm: { type: DataTypes.DATE, allowNull: true, field: 'concluido_em' }
  },
  { sequelize, modelName: 'Agendamento', tableName: 'agendamentos' }
);
