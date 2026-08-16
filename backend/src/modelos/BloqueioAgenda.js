import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../configuracao/banco.js';

export class BloqueioAgenda extends Model {}

BloqueioAgenda.init(
  {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    prestadorId: { type: DataTypes.UUID, allowNull: false, field: 'prestador_id' },
    data: { type: DataTypes.DATEONLY, allowNull: false },
    diaInteiro: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true, field: 'dia_inteiro' },
    inicio: { type: DataTypes.TIME, allowNull: true },
    fim: { type: DataTypes.TIME, allowNull: true },
    observacao: { type: DataTypes.STRING(255), allowNull: true }
  },
  {
    sequelize,
    modelName: 'BloqueioAgenda',
    tableName: 'bloqueios_agenda',
    indexes: [
      { fields: ['prestador_id', 'data'] }
    ]
  }
);
