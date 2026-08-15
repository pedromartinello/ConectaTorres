import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../configuracao/banco.js';

export class Avaliacao extends Model {}

Avaliacao.init(
  {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    agendamentoId: { type: DataTypes.UUID, allowNull: false, unique: true, field: 'agendamento_id' },
    clienteId: { type: DataTypes.UUID, allowNull: false, field: 'cliente_id' },
    prestadorId: { type: DataTypes.UUID, allowNull: false, field: 'prestador_id' },
    nota: { type: DataTypes.INTEGER, allowNull: false, validate: { min: 1, max: 5 } },
    comentario: { type: DataTypes.TEXT, allowNull: true }
  },
  {
    sequelize,
    modelName: 'Avaliacao',
    tableName: 'avaliacoes'
  }
);
