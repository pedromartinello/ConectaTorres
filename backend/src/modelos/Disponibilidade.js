import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../configuracao/banco.js';

export class Disponibilidade extends Model {}

Disponibilidade.init(
  {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    prestadorId: { type: DataTypes.UUID, allowNull: false, field: 'prestador_id' },
    inicio: { type: DataTypes.DATE, allowNull: false },
    fim: { type: DataTypes.DATE, allowNull: false },
    observacao: { type: DataTypes.STRING(255), allowNull: true }
  },
  {
    sequelize,
    modelName: 'Disponibilidade',
    tableName: 'disponibilidades'
  }
);
