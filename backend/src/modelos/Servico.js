import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../configuracao/banco.js';

export class Servico extends Model {}

Servico.init(
  {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    prestadorId: { type: DataTypes.UUID, allowNull: false, field: 'prestador_id' },
    categoriaId: { type: DataTypes.UUID, allowNull: false, field: 'categoria_id' },
    titulo: { type: DataTypes.STRING(160), allowNull: false },
    descricao: { type: DataTypes.TEXT, allowNull: true },
    precoBase: { type: DataTypes.DECIMAL(10, 2), allowNull: true, field: 'preco_base' },
    ativo: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true }
  },
  {
    sequelize,
    modelName: 'Servico',
    tableName: 'servicos'
  }
);
