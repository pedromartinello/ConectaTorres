import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../configuracao/banco.js';

export class Favorito extends Model {}

Favorito.init(
  {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    clienteId: { type: DataTypes.UUID, allowNull: false, field: 'cliente_id' },
    prestadorId: { type: DataTypes.UUID, allowNull: false, field: 'prestador_id' }
  },
  {
    sequelize,
    modelName: 'Favorito',
    tableName: 'favoritos',
    indexes: [
      { unique: true, fields: ['cliente_id', 'prestador_id'] }
    ]
  }
);
