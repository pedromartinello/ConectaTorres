import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../configuracao/banco.js';

export class Denuncia extends Model {}

Denuncia.init(
  {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    denuncianteId: { type: DataTypes.UUID, allowNull: false, field: 'denunciante_id' },
    prestadorId: { type: DataTypes.UUID, allowNull: true, field: 'prestador_id' },
    avaliacaoId: { type: DataTypes.UUID, allowNull: true, field: 'avaliacao_id' },
    motivo: { type: DataTypes.STRING(120), allowNull: false },
    descricao: { type: DataTypes.TEXT, allowNull: true },
    status: {
      type: DataTypes.ENUM('aberta', 'em_analise', 'resolvida', 'arquivada'),
      allowNull: false,
      defaultValue: 'aberta'
    },
    respostaAdmin: { type: DataTypes.TEXT, allowNull: true, field: 'resposta_admin' }
  },
  { sequelize, modelName: 'Denuncia', tableName: 'denuncias' }
);
