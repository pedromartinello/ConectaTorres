import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../configuracao/banco.js';

export class PortfolioImagem extends Model {}

PortfolioImagem.init(
  {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    prestadorId: { type: DataTypes.UUID, allowNull: false, field: 'prestador_id' },
    imagemUrl: { type: DataTypes.STRING(500), allowNull: false, field: 'imagem_url' },
    legenda: { type: DataTypes.STRING(200), allowNull: true },
    ordem: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 }
  },
  { sequelize, modelName: 'PortfolioImagem', tableName: 'portfolio_imagens' }
);
