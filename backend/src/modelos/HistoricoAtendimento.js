import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../configuracao/banco.js';

export class HistoricoAtendimento extends Model {}

HistoricoAtendimento.init(
  {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    agendamentoId: { type: DataTypes.UUID, allowNull: false, field: 'agendamento_id' },
    usuarioId: { type: DataTypes.UUID, allowNull: true, field: 'usuario_id' },
    tipo: { type: DataTypes.STRING(60), allowNull: false },
    titulo: { type: DataTypes.STRING(160), allowNull: false },
    descricao: { type: DataTypes.STRING(600), allowNull: true }
  },
  {
    sequelize,
    modelName: 'HistoricoAtendimento',
    tableName: 'historicos_atendimento',
    updatedAt: false
  }
);
