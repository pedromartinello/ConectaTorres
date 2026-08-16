import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../configuracao/banco.js';

export class HorarioSemanal extends Model {}

HorarioSemanal.init(
  {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    prestadorId: { type: DataTypes.UUID, allowNull: false, field: 'prestador_id' },
    diaSemana: { type: DataTypes.INTEGER, allowNull: false, field: 'dia_semana', validate: { min: 0, max: 6 } },
    ativo: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
    inicio: { type: DataTypes.TIME, allowNull: true },
    fim: { type: DataTypes.TIME, allowNull: true }
  },
  {
    sequelize,
    modelName: 'HorarioSemanal',
    tableName: 'horarios_semanais',
    indexes: [
      { unique: true, fields: ['prestador_id', 'dia_semana'] }
    ]
  }
);
